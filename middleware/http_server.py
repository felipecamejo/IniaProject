import os
import re
import tempfile
import shutil
import zipfile
import logging
import time
import asyncio
import signal
import sys
from typing import Dict, Any, Optional, List, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed, TimeoutError as FutureTimeoutError
from functools import wraps
from contextlib import asynccontextmanager

# Intentar importar módulo de instalación de dependencias
try:
    from InstallDependencies import verificar_e_instalar, instalar_dependencias_faltantes
    INSTALL_DEPS_AVAILABLE = True
except ImportError:
    INSTALL_DEPS_AVAILABLE = False

# Verificar e instalar dependencias FastAPI
if INSTALL_DEPS_AVAILABLE:
    deps_fastapi = ['fastapi', 'uvicorn', 'pydantic']
    for dep in deps_fastapi:
        if not verificar_e_instalar(dep, dep, silent=True):
            print(f"Intentando instalar {dep}...")
            verificar_e_instalar(dep, dep, silent=False)

# Importaciones FastAPI
try:
    from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form
    from fastapi.responses import JSONResponse, FileResponse, Response
    from pydantic import BaseModel
    import uvicorn
except ModuleNotFoundError:
    if INSTALL_DEPS_AVAILABLE:
        print("Instalando dependencias faltantes...")
        if instalar_dependencias_faltantes('http_server', silent=False):
            from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form
            from fastapi.responses import JSONResponse, FileResponse, Response
            from pydantic import BaseModel
            import uvicorn
        else:
            print("No se pudieron instalar las dependencias. Instálalas manualmente con: pip install -r requirements.txt")
            raise
    else:
        print("Faltan paquetes de FastAPI. Instálalos con: pip install fastapi uvicorn pydantic")
        raise

# Importar lógica existente
from MassiveInsertFiles import insertar_1000_registros_principales, create_engine, sessionmaker
from ExportExcel import export_selected_tables
from ImportExcel import (
    import_one_file as py_import_one_file,
    MODELS as IMPORT_MODELS, 
    inicializar_automap,
    obtener_nombre_tabla_seguro,
    build_connection_string,
    detect_format_from_path,
    asegurar_autoincrementos,
    detectar_tabla_por_columnas,
    detectar_tipo_analisis_por_contenido,
    read_rows_from_xlsx,
    read_rows_from_csv,
    normalize_header_names
)
from AnalizedExcel import analizar_excel, analizar_estructura_excel, generar_mapeo_datos
from sqlalchemy import text

# Configuración de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ================================
# CONFIGURACIÓN DE PROTECCIÓN DEL SERVIDOR
# ================================
# Límites de recursos para prevenir colapso
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", 100 * 1024 * 1024))  # 100 MB por defecto
MAX_TOTAL_FILES_SIZE = int(os.getenv("MAX_TOTAL_FILES_SIZE", 500 * 1024 * 1024))  # 500 MB total
MAX_REQUEST_TIMEOUT = int(os.getenv("MAX_REQUEST_TIMEOUT", 300))  # 5 minutos por defecto
MAX_CONCURRENT_REQUESTS = int(os.getenv("MAX_CONCURRENT_REQUESTS", 10))  # 10 solicitudes simultáneas
MAX_IMPORT_FILES = int(os.getenv("MAX_IMPORT_FILES", 50))  # Máximo 50 archivos por importación

# Circuit breaker para proteger contra fallos en cascada
class CircuitBreaker:
    def __init__(self, failure_threshold: int = 5, recovery_timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "closed"  # closed, open, half_open
    
    def call(self, func, *args, **kwargs):
        if self.state == "open":
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = "half_open"
                logger.info("Circuit breaker: Cambiando a estado half_open")
            else:
                raise RuntimeError("Circuit breaker está abierto. Servicio temporalmente no disponible.")
        
        try:
            result = func(*args, **kwargs)
            if self.state == "half_open":
                self.state = "closed"
                self.failure_count = 0
                logger.info("Circuit breaker: Recuperado, cambiando a estado closed")
            return result
        except Exception as e:
            self.failure_count += 1
            self.last_failure_time = time.time()
            
            if self.failure_count >= self.failure_threshold:
                self.state = "open"
                logger.error(f"Circuit breaker: Abierto después de {self.failure_count} fallos")
            
            raise

# Circuit breakers por tipo de operación
db_circuit_breaker = CircuitBreaker(failure_threshold=5, recovery_timeout=60)
import_circuit_breaker = CircuitBreaker(failure_threshold=3, recovery_timeout=120)

# Contador de solicitudes concurrentes
_concurrent_requests = 0
_concurrent_requests_lock = asyncio.Lock()

# ================================
# ESTRUCTURA DE RESPUESTAS ESTÁNDAR
# ================================
# Límites para mensajes de error (prevenir respuestas gigantes)
MAX_ERROR_MESSAGE_LENGTH = 500  # Máximo 500 caracteres para mensajes
MAX_ERROR_DETAILS_LENGTH = 1000  # Máximo 1000 caracteres para detalles

def sanitizar_mensaje_error(mensaje: str, max_length: int = MAX_ERROR_MESSAGE_LENGTH) -> str:
    """
    Sanitiza un mensaje de error para evitar respuestas gigantes.
    Limita el tamaño y remueve información sensible si es necesario.
    """
    if not mensaje:
        return "Error desconocido"
    
    # Convertir a string si no lo es
    mensaje_str = str(mensaje)
    
    # Limitar longitud
    if len(mensaje_str) > max_length:
        mensaje_str = mensaje_str[:max_length - 50] + "... [mensaje truncado por seguridad]"
    
    # Remover información sensible potencial (rutas completas, tokens, etc.)
    # Reemplazar rutas absolutas largas
    mensaje_str = re.sub(r'[A-Z]:\\[^\\]+\\[^\\]+\\[^\\]+', '[ruta]', mensaje_str)
    mensaje_str = re.sub(r'/home/[^/]+/[^/]+/[^/]+', '[ruta]', mensaje_str)
    
    # Remover posibles tokens o claves
    mensaje_str = re.sub(r'(?i)(password|token|key|secret|api_key)\s*[:=]\s*[^\s]+', r'\1=[oculto]', mensaje_str)
    
    return mensaje_str

def crear_respuesta_exito(mensaje: str, datos: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Crea una respuesta de éxito estructurada."""
    respuesta = {
        "exitoso": True,
        "mensaje": sanitizar_mensaje_error(mensaje, MAX_ERROR_MESSAGE_LENGTH),
        "codigo": 200
    }
    if datos:
        respuesta["datos"] = datos
    return respuesta


def crear_respuesta_error(mensaje: str, codigo: int = 500, detalles: Optional[str] = None) -> Dict[str, Any]:
    """
    Crea una respuesta de error estructurada.
    Sanitiza los mensajes para evitar respuestas gigantes que puedan colapsar el servidor.
    """
    respuesta = {
        "exitoso": False,
        "mensaje": sanitizar_mensaje_error(mensaje, MAX_ERROR_MESSAGE_LENGTH),
        "codigo": codigo
    }
    if detalles:
        respuesta["detalles"] = sanitizar_mensaje_error(detalles, MAX_ERROR_DETAILS_LENGTH)
    return respuesta

def obtener_mensaje_error_seguro(exc: Exception, contexto: str = "") -> str:
    """
    Obtiene un mensaje de error seguro que no colapsará el servidor.
    Limita el tamaño y proporciona información útil sin exponer detalles internos.
    """
    try:
        tipo_error = type(exc).__name__
        mensaje_error = str(exc)
        
        # Limitar longitud del mensaje
        if len(mensaje_error) > MAX_ERROR_DETAILS_LENGTH:
            mensaje_error = mensaje_error[:MAX_ERROR_DETAILS_LENGTH - 50] + "... [error truncado]"
        
        # Construir mensaje contextual
        if contexto:
            return f"{contexto}: {tipo_error} - {sanitizar_mensaje_error(mensaje_error, MAX_ERROR_DETAILS_LENGTH)}"
        else:
            return f"{tipo_error}: {sanitizar_mensaje_error(mensaje_error, MAX_ERROR_DETAILS_LENGTH)}"
    except Exception as e:
        # Si incluso obtener el mensaje falla, retornar algo genérico
        logger.error(f"Error obteniendo mensaje de error: {e}", exc_info=True)
        return f"Error procesando solicitud{': ' + contexto if contexto else ''}"

# Crear la aplicación FastAPI después de definir las funciones de respuesta
app = FastAPI(title="INIA Python Middleware", version="1.0.0")

# ================================
# MIDDLEWARE Y MANEJADORES DE PROTECCIÓN
# ================================
@app.middleware("http")
async def protection_middleware(request, call_next):
    """Middleware para proteger el servidor contra sobrecarga."""
    global _concurrent_requests
    
    # Verificar límite de solicitudes concurrentes
    async with _concurrent_requests_lock:
        if _concurrent_requests >= MAX_CONCURRENT_REQUESTS:
            logger.warning(f"Límite de solicitudes concurrentes alcanzado: {_concurrent_requests}/{MAX_CONCURRENT_REQUESTS}")
            respuesta_error = crear_respuesta_error(
                mensaje="Servidor sobrecargado",
                codigo=503,
                detalles=f"El servidor está procesando demasiadas solicitudes. Intente más tarde. Límite: {MAX_CONCURRENT_REQUESTS}"
            )
            return JSONResponse(status_code=503, content=respuesta_error)
        _concurrent_requests += 1
    
    try:
        # Aplicar timeout a la solicitud
        try:
            response = await asyncio.wait_for(call_next(request), timeout=MAX_REQUEST_TIMEOUT)
            return response
        except asyncio.TimeoutError:
            logger.error(f"Timeout en solicitud: {request.url.path} después de {MAX_REQUEST_TIMEOUT}s")
            respuesta_error = crear_respuesta_error(
                mensaje="Timeout en la solicitud",
                codigo=504,
                detalles=f"La solicitud excedió el tiempo máximo de {MAX_REQUEST_TIMEOUT} segundos"
            )
            return JSONResponse(status_code=504, content=respuesta_error)
    except Exception as e:
        logger.error(f"Error en middleware de protección: {e}", exc_info=True)
        respuesta_error = crear_respuesta_error(
            mensaje="Error interno del servidor",
            codigo=500,
            detalles="Ocurrió un error inesperado al procesar la solicitud"
        )
        return JSONResponse(status_code=500, content=respuesta_error)
    finally:
        async with _concurrent_requests_lock:
            _concurrent_requests -= 1

# Manejador global de excepciones no capturadas
@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    """
    Maneja cualquier excepción no capturada para evitar que el servidor colapse.
    Sanitiza el mensaje de error para evitar respuestas gigantes.
    """
    try:
        # Log completo del error (para debugging interno)
        logger.error(f"Excepción no capturada: {type(exc).__name__}: {exc}", exc_info=True)
        
        # Obtener mensaje seguro (limitado y sanitizado)
        mensaje_seguro = obtener_mensaje_error_seguro(exc, "Error interno del servidor")
        
        # Crear respuesta de error sanitizada
        respuesta_error = crear_respuesta_error(
            mensaje="Error interno del servidor",
            codigo=500,
            detalles=mensaje_seguro
        )
        
        return JSONResponse(status_code=500, content=respuesta_error)
    except Exception as fallback_error:
        # Si incluso el manejador de errores falla, retornar respuesta mínima
        logger.critical(f"Error crítico en manejador de excepciones: {fallback_error}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "exitoso": False,
                "mensaje": "Error interno del servidor",
                "codigo": 500,
                "detalles": "Ocurrió un error inesperado. Por favor, intente más tarde."
            }
        )


def safe_remove_file(file_path: str, max_retries: int = 3, delay: float = 0.1) -> bool:
    """Intenta eliminar un archivo de forma segura, manejando el caso donde está bloqueado."""
    if not file_path or not os.path.exists(file_path):
        return True
    
    for attempt in range(max_retries):
        try:
            os.remove(file_path)
            return True
        except PermissionError:
            if attempt < max_retries - 1:
                time.sleep(delay * (attempt + 1))  # Esperar progresivamente más tiempo
            else:
                logger.warning(f"No se pudo eliminar archivo temporal después de {max_retries} intentos: {file_path}")
                return False
        except Exception as e:
            logger.warning(f"Error eliminando archivo temporal {file_path}: {e}")
            return False
    return False


# ================================
# MANEJADOR DE EXCEPCIONES PERSONALIZADO
# ================================
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    """Maneja las excepciones HTTP y devuelve respuestas estructuradas."""
    # Si el detail es un diccionario (nuestra respuesta estructurada), devolverlo directamente
    if isinstance(exc.detail, dict):
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.detail
        )
    # Si el detail es un string, crear una respuesta estructurada
    respuesta_error = crear_respuesta_error(
        mensaje=str(exc.detail) if exc.detail else "Error HTTP",
        codigo=exc.status_code,
        detalles=str(exc.detail) if exc.detail else None
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=respuesta_error
    )

# ================================
# FUNCIONES DE VALIDACIÓN Y PROTECCIÓN
# ================================
def validar_tamaño_archivo(content: bytes, max_size: int = MAX_FILE_SIZE) -> bool:
    """Valida que el tamaño del archivo no exceda el límite."""
    if len(content) > max_size:
        raise ValueError(f"El archivo excede el tamaño máximo permitido de {max_size / (1024*1024):.1f} MB")
    return True

def validar_cantidad_archivos(cantidad: int, max_files: int = MAX_IMPORT_FILES) -> bool:
    """Valida que la cantidad de archivos no exceda el límite."""
    if cantidad > max_files:
        raise ValueError(f"La cantidad de archivos ({cantidad}) excede el límite máximo de {max_files}")
    return True

def obtener_nombre_tabla_seguro(model) -> str:
    """
    Obtiene el nombre de la tabla de un modelo de forma segura.
    Maneja diferentes formas en que SQLAlchemy puede exponer el nombre de la tabla.
    """
    try:
        # Método 1: Intentar __tablename__ directamente
        if hasattr(model, '__tablename__'):
            return model.__tablename__
    except (AttributeError, TypeError):
        pass
    
    try:
        # Método 2: Intentar __table__.name
        if hasattr(model, '__table__') and hasattr(model.__table__, 'name'):
            return model.__table__.name
    except (AttributeError, TypeError):
        pass
    
    try:
        # Método 3: Usar el nombre de la clase como fallback
        if hasattr(model, '__name__'):
            return model.__name__.lower()
    except (AttributeError, TypeError):
        pass
    
    # Si todo falla, intentar obtener el nombre desde el mapeo
    try:
        if hasattr(model, '__mapper__') and hasattr(model.__mapper__, 'tables'):
            tables = model.__mapper__.tables
            if tables:
                return list(tables)[0].name
    except (AttributeError, TypeError, IndexError):
        pass
    
    # Último recurso: usar el nombre de la clase como string
    return str(model).split('.')[-1].split("'")[0].lower()

# ================================
# MIDDLEWARE Y MANEJADORES DE PROTECCIÓN
# ================================
@app.middleware("http")
async def protection_middleware(request, call_next):
    """Middleware para proteger el servidor contra sobrecarga."""
    global _concurrent_requests
    
    # Verificar límite de solicitudes concurrentes
    async with _concurrent_requests_lock:
        if _concurrent_requests >= MAX_CONCURRENT_REQUESTS:
            logger.warning(f"Límite de solicitudes concurrentes alcanzado: {_concurrent_requests}/{MAX_CONCURRENT_REQUESTS}")
            respuesta_error = crear_respuesta_error(
                mensaje="Servidor sobrecargado",
                codigo=503,
                detalles=f"El servidor está procesando demasiadas solicitudes. Intente más tarde. Límite: {MAX_CONCURRENT_REQUESTS}"
            )
            return JSONResponse(status_code=503, content=respuesta_error)
        _concurrent_requests += 1
    
    try:
        # Aplicar timeout a la solicitud
        try:
            response = await asyncio.wait_for(call_next(request), timeout=MAX_REQUEST_TIMEOUT)
            return response
        except asyncio.TimeoutError:
            logger.error(f"Timeout en solicitud: {request.url.path} después de {MAX_REQUEST_TIMEOUT}s")
            respuesta_error = crear_respuesta_error(
                mensaje="Timeout en la solicitud",
                codigo=504,
                detalles=f"La solicitud excedió el tiempo máximo de {MAX_REQUEST_TIMEOUT} segundos"
            )
            return JSONResponse(status_code=504, content=respuesta_error)
    except Exception as e:
        logger.error(f"Error en middleware de protección: {e}", exc_info=True)
        respuesta_error = crear_respuesta_error(
            mensaje="Error interno del servidor",
            codigo=500,
            detalles="Ocurrió un error inesperado al procesar la solicitud"
        )
        return JSONResponse(status_code=500, content=respuesta_error)
    finally:
        async with _concurrent_requests_lock:
            _concurrent_requests -= 1

# Manejador de señales para shutdown graceful
def signal_handler(signum, frame):
    """Maneja señales de terminación para shutdown graceful."""
    logger.info(f"Señal {signum} recibida. Iniciando shutdown graceful...")
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


class InsertRequest(BaseModel):
    # Por ahora solo gatillar la inserción masiva según lógica existente
    # Se puede extender con parámetros más adelante
    pass


@app.post("/insertar")
def insertar():
    """Endpoint para insertar datos masivos. Retorna respuesta estructurada con validaciones."""
    try:
        logger.info("Iniciando inserción masiva de datos...")
        
        # Validar conexión a base de datos antes de proceder con circuit breaker
        try:
            def test_db_connection():
                conn_str = build_connection_string()
                engine = create_engine(conn_str)
                with engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
            
            db_circuit_breaker.call(test_db_connection)
            logger.info("Conexión a base de datos validada correctamente")
        except RuntimeError as cb_error:
            logger.error(f"Circuit breaker bloqueando conexión a BD: {cb_error}")
            respuesta_error = crear_respuesta_error(
                mensaje="Servicio de base de datos temporalmente no disponible",
                codigo=503,
                detalles="El servicio de base de datos está temporalmente no disponible. Intente más tarde."
            )
            raise HTTPException(status_code=503, detail=respuesta_error)
        except Exception as db_error:
            logger.error(f"Error validando conexión a base de datos: {db_error}", exc_info=True)
            respuesta_error = crear_respuesta_error(
                mensaje="No se pudo conectar a la base de datos",
                codigo=500,
                detalles=obtener_mensaje_error_seguro(db_error, "Error de conexión")
            )
            raise HTTPException(status_code=500, detail=respuesta_error)
        
        # Ejecutar inserción masiva
        try:
            insertar_1000_registros_principales()
            ok = True
        except Exception as insert_error:
            logger.error(f"Error durante inserción masiva: {insert_error}", exc_info=True)
            ok = False
        
        if not ok:
            logger.error("La inserción masiva falló (retornó False)")
            respuesta_error = crear_respuesta_error(
                mensaje="La inserción masiva de datos falló",
                codigo=500,
                detalles="El proceso de inserción retornó False. Revisa los logs para más detalles."
            )
            raise HTTPException(status_code=500, detail=respuesta_error)
        
        logger.info("Inserción masiva completada exitosamente")
        respuesta_exito = crear_respuesta_exito(
            mensaje="Inserción masiva de datos completada exitosamente",
            datos={"proceso": "insertar_datos_masivos", "estado": "completado"}
        )
        return JSONResponse(content=respuesta_exito, status_code=200)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error inesperado en inserción masiva: {e}", exc_info=True)
        respuesta_error = crear_respuesta_error(
            mensaje="Error inesperado durante la inserción masiva",
            codigo=500,
            detalles=obtener_mensaje_error_seguro(e, "Error inesperado")
        )
        raise HTTPException(status_code=500, detail=respuesta_error)


@app.post("/exportar")
def exportar(
    tablas: str = Query(default="", description="Lista separada por comas de tablas a exportar"),
    formato: str = Query(default="xlsx", pattern="^(xlsx|csv)$"),
    incluir_sin_pk: bool = Query(default=True, description="Incluir tablas sin Primary Key"),
):
    """Endpoint para exportar tablas a Excel. Retorna archivo ZIP con validaciones y mensajes estructurados."""
    tmp_dir = None
    try:
        logger.info(f"Iniciando exportación de tablas. Formato: {formato}, Incluir sin PK: {incluir_sin_pk}")
        
        # Validar formato
        if formato not in ("xlsx", "csv"):
            respuesta_error = crear_respuesta_error(
                mensaje="Formato no válido",
                codigo=400,
                detalles=f"El formato '{formato}' no es válido. Solo se acepta 'xlsx' o 'csv'"
            )
            raise HTTPException(status_code=400, detail=respuesta_error)
        
        # Validar conexión a base de datos con circuit breaker
        try:
            def test_db_connection():
                conn_str = build_connection_string()
                engine = create_engine(conn_str)
                with engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
            
            db_circuit_breaker.call(test_db_connection)
            logger.info("Conexión a base de datos validada correctamente")
        except RuntimeError as cb_error:
            logger.error(f"Circuit breaker bloqueando conexión a BD: {cb_error}")
            respuesta_error = crear_respuesta_error(
                mensaje="Servicio de base de datos temporalmente no disponible",
                codigo=503,
                detalles="El servicio de base de datos está temporalmente no disponible. Intente más tarde."
            )
            shutil.rmtree(tmp_dir, ignore_errors=True)
            raise HTTPException(status_code=503, detail=respuesta_error)
        except Exception as db_error:
            logger.error(f"Error validando conexión a base de datos: {db_error}", exc_info=True)
            respuesta_error = crear_respuesta_error(
                mensaje="No se pudo conectar a la base de datos",
                codigo=500,
                detalles=obtener_mensaje_error_seguro(db_error, "Error de conexión")
            )
            shutil.rmtree(tmp_dir, ignore_errors=True)
            raise HTTPException(status_code=500, detail=respuesta_error)
        
        # Procesar lista de tablas
        tablas_list = [t.strip() for t in tablas.split(",") if t.strip()] if tablas else []
        if not tablas_list:
            # por defecto exportar todas las tablas definidas en ExportExcel.MODELS
            from ExportExcel import MODELS
            tablas_list = list(MODELS.keys())
            logger.info(f"No se especificaron tablas, exportando todas las disponibles: {len(tablas_list)} tablas")
        else:
            logger.info(f"Exportando {len(tablas_list)} tabla(s) especificada(s): {', '.join(tablas_list)}")

        # Crear directorio temporal
        try:
            tmp_dir = tempfile.mkdtemp(prefix="inia_export_")
            logger.info(f"Directorio temporal creado: {tmp_dir}")
        except Exception as dir_error:
            respuesta_error = crear_respuesta_error(
                mensaje="No se pudo crear directorio temporal",
                codigo=500,
                detalles=f"Error al crear directorio temporal: {str(dir_error)}"
            )
            raise HTTPException(status_code=500, detail=respuesta_error)
        
        # Ejecutar exportación (incluyendo tablas sin PK por defecto)
        try:
            export_selected_tables(tablas_list, tmp_dir, formato, incluir_sin_pk=incluir_sin_pk)
        except Exception as export_error:
            logger.error(f"Error durante la exportación: {export_error}", exc_info=True)
            respuesta_error = crear_respuesta_error(
                mensaje="Error durante la exportación de tablas",
                codigo=500,
                detalles=obtener_mensaje_error_seguro(export_error, "Error durante la exportación")
            )
            shutil.rmtree(tmp_dir, ignore_errors=True)
            raise HTTPException(status_code=500, detail=respuesta_error)

        # Verificar que se generaron archivos
        files_generated = [f for f in os.listdir(tmp_dir) if f.endswith(('.xlsx', '.csv'))]
        if not files_generated:
            respuesta_error = crear_respuesta_error(
                mensaje="No se generaron archivos de exportación",
                codigo=500,
                detalles=f"No se generaron archivos en el directorio temporal. Tablas solicitadas: {', '.join(tablas_list)}"
            )
            shutil.rmtree(tmp_dir, ignore_errors=True)
            raise HTTPException(status_code=500, detail=respuesta_error)
        
        logger.info(f"Se generaron {len(files_generated)} archivo(s) de exportación")

        # Empaquetar en zip
        zip_path = os.path.join(tmp_dir, "export.zip")
        try:
            with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
                for root, _, files in os.walk(tmp_dir):
                    for f in files:
                        if f == "export.zip":
                            continue
                        full = os.path.join(root, f)
                        arcname = os.path.relpath(full, tmp_dir)
                        zf.write(full, arcname)
        except Exception as zip_error:
            logger.error(f"Error creando archivo ZIP: {zip_error}")
            respuesta_error = crear_respuesta_error(
                mensaje="No se pudo crear archivo ZIP",
                codigo=500,
                detalles=str(zip_error)
            )
            shutil.rmtree(tmp_dir, ignore_errors=True)
            raise HTTPException(status_code=500, detail=respuesta_error)

        # Verificar que el zip se creó
        if not os.path.exists(zip_path):
            respuesta_error = crear_respuesta_error(
                mensaje="No se pudo crear archivo ZIP",
                codigo=500,
                detalles="El archivo ZIP no se generó correctamente"
            )
            shutil.rmtree(tmp_dir, ignore_errors=True)
            raise HTTPException(status_code=500, detail=respuesta_error)

        # Leer el archivo zip como bytes
        try:
            with open(zip_path, "rb") as f:
                zip_bytes = f.read()
        except Exception as read_error:
            logger.error(f"Error leyendo archivo ZIP: {read_error}")
            respuesta_error = crear_respuesta_error(
                mensaje="Error leyendo archivo ZIP generado",
                codigo=500,
                detalles=str(read_error)
            )
            shutil.rmtree(tmp_dir, ignore_errors=True)
            raise HTTPException(status_code=500, detail=respuesta_error)
        
        # Verificar que el ZIP no esté vacío
        if len(zip_bytes) == 0:
            respuesta_error = crear_respuesta_error(
                mensaje="Archivo ZIP generado está vacío",
                codigo=500,
                detalles="El archivo ZIP se creó pero no contiene datos"
            )
            shutil.rmtree(tmp_dir, ignore_errors=True)
            raise HTTPException(status_code=500, detail=respuesta_error)
        
        logger.info(f"Exportación completada exitosamente. Tamaño del ZIP: {len(zip_bytes)} bytes, {len(files_generated)} archivo(s)")
        
        # Limpiar archivos temporales
        shutil.rmtree(tmp_dir, ignore_errors=True)
        
        # Devolver el archivo ZIP como respuesta binaria
        return Response(
            content=zip_bytes,
            media_type="application/zip",
            headers={"Content-Disposition": "attachment; filename=export.zip"}
        )
        
    except HTTPException:
        if tmp_dir:
            shutil.rmtree(tmp_dir, ignore_errors=True)
        raise
    except Exception as e:
        logger.error(f"Error inesperado durante exportación: {e}", exc_info=True)
        if tmp_dir:
            shutil.rmtree(tmp_dir, ignore_errors=True)
        respuesta_error = crear_respuesta_error(
            mensaje="Error inesperado durante la exportación",
            codigo=500,
            detalles=str(e)
        )
        raise HTTPException(status_code=500, detail=respuesta_error)


async def procesar_un_archivo(
    file: UploadFile,
    table: Optional[str],
    upsert: bool,
    keep_ids: bool
) -> Dict[str, Any]:
    """
    Procesa un archivo individual: lo guarda temporalmente, detecta la tabla automáticamente
    si es necesario, y lo importa a la base de datos.
    
    Retorna un diccionario con el resultado del procesamiento:
    - exito: bool
    - tabla: str (nombre de la tabla)
    - archivo: str (nombre del archivo)
    - formato: str
    - insertados: int
    - actualizados: int
    - error: Optional[str] (mensaje de error si falló)
    """
    tmp_path = None
    resultado = {
        "exito": False,
        "tabla": None,
        "archivo": file.filename if file.filename else "desconocido",
        "formato": None,
        "insertados": 0,
        "actualizados": 0,
        "error": None
    }
    
    try:
        # Inicializar modelos si no están inicializados
        if not IMPORT_MODELS:
            logger.info("Inicializando modelos de la base de datos...")
            try:
                conn_str = build_connection_string()
                engine_init = create_engine(conn_str)
                inicializar_automap(engine_init)
                if not IMPORT_MODELS:
                    raise RuntimeError("IMPORT_MODELS está vacío después de inicializar_automap()")
                logger.info(f"Modelos inicializados exitosamente: {len(IMPORT_MODELS)} tablas disponibles")
            except Exception as init_error:
                logger.error(f"Error inicializando modelos: {init_error}", exc_info=True)
                resultado["error"] = obtener_mensaje_error_seguro(init_error, "Error inicializando modelos")
                return resultado
        else:
            logger.info(f"Modelos ya inicializados: {len(IMPORT_MODELS)} tablas disponibles")

        # Guardar archivo temporalmente
        suffix = ""
        if file.filename:
            _, ext = os.path.splitext(file.filename)
            suffix = ext
        
        tmp_fd, tmp_path = tempfile.mkstemp(prefix="inia_import_", suffix=suffix)
        os.close(tmp_fd)
        
        # Leer y guardar contenido del archivo con validación de tamaño
        try:
            content = await file.read()
            if not content or len(content) == 0:
                resultado["error"] = "El archivo proporcionado está vacío"
                safe_remove_file(tmp_path)
                return resultado
            
            # Validar tamaño del archivo
            try:
                validar_tamaño_archivo(content, MAX_FILE_SIZE)
            except ValueError as size_error:
                resultado["error"] = str(size_error)
                safe_remove_file(tmp_path)
                return resultado
            
            with open(tmp_path, "wb") as out:
                out.write(content)
            logger.info(f"Archivo guardado temporalmente: {tmp_path}, Tamaño: {len(content)} bytes")
            
            await file.seek(0)
        except Exception as file_error:
            logger.error(f"Error guardando archivo temporal: {file_error}", exc_info=True)
            if tmp_path:
                safe_remove_file(tmp_path)
            resultado["error"] = obtener_mensaje_error_seguro(file_error, "Error guardando archivo temporal")
            return resultado
        
        # Validar tabla - si no existe o el nombre es numérico, intentar detectar automáticamente
        table_key = (table or "").strip().lower()
        model = None
        
        if not IMPORT_MODELS:
            resultado["error"] = "IMPORT_MODELS está vacío"
            safe_remove_file(tmp_path)
            return resultado
        
        # Si la tabla está especificada y existe, usarla
        if table_key:
            model = IMPORT_MODELS.get(table_key)
            if model:
                try:
                    tabla_nombre = obtener_nombre_tabla_seguro(model)
                    logger.info(f"Tabla '{table_key}' encontrada en IMPORT_MODELS: {tabla_nombre}")
                except Exception as name_error:
                    logger.warning(f"Error obteniendo nombre de tabla: {name_error}, usando clave: {table_key}")
        
        # Validar condiciones para detección automática
        filename_base = os.path.splitext(file.filename)[0] if file.filename else None
        is_numeric_filename = filename_base and filename_base.isdigit()
        should_auto_detect = not model or is_numeric_filename
        
        # Si la tabla no existe o el nombre del archivo es numérico, intentar detección automática
        if should_auto_detect:
            logger.info(f"Intentando detección automática por columnas para {file.filename}...")
            
            try:
                # Detectar formato del archivo
                fmt_temp = detect_format_from_path(tmp_path)
                
                if fmt_temp not in ("csv", "xlsx"):
                    resultado["error"] = f"Formato de archivo no válido: {fmt_temp or 'desconocido'}"
                    safe_remove_file(tmp_path)
                    return resultado
                
                # Leer headers del archivo
                try:
                    if fmt_temp == "csv":
                        headers, _ = read_rows_from_csv(tmp_path)
                    else:
                        headers, _ = read_rows_from_xlsx(tmp_path)
                except Exception as read_error:
                    logger.error(f"Error leyendo headers del archivo: {read_error}", exc_info=True)
                    resultado["error"] = obtener_mensaje_error_seguro(read_error, "Error leyendo encabezados del archivo")
                    safe_remove_file(tmp_path)
                    return resultado
                
                # Normalizar headers
                headers = normalize_header_names(headers)
                
                # Verificar que hay headers válidos (no vacíos)
                headers_validos = [h for h in headers if h and h.strip()]
                if not headers or not headers_validos or len(headers_validos) < 3:
                    # Proporcionar mensaje de error más descriptivo
                    mensaje_error = (
                        f"No se pudieron leer encabezados válidos del archivo '{file.filename}'. "
                        f"Headers totales encontrados: {len(headers)}, Headers válidos: {len(headers_validos)}. "
                        f"El archivo debe contener una fila de encabezados con nombres de columnas válidos. "
                        f"Verifique que el archivo tenga el formato correcto y que los encabezados no estén mezclados con metadatos o títulos de documento."
                    )
                    logger.error(mensaje_error)
                    resultado["error"] = mensaje_error
                    safe_remove_file(tmp_path)
                    return resultado
                
                # Preparar conexión para detectar tabla
                try:
                    conn_str = build_connection_string()
                    engine_temp = create_engine(conn_str)
                    Session_temp = sessionmaker(bind=engine_temp)
                    session_temp = Session_temp()
                except Exception as conn_error:
                    logger.error(f"Error preparando conexión para detección: {conn_error}", exc_info=True)
                    resultado["error"] = obtener_mensaje_error_seguro(conn_error, "Error preparando conexión para detección automática")
                    safe_remove_file(tmp_path)
                    return resultado
                
                try:
                    # Estrategia de detección en cascada:
                    # 1. Intentar detectar tipo de análisis por contenido
                    tipo_analisis = None
                    try:
                        tipo_analisis = detectar_tipo_analisis_por_contenido(tmp_path)
                        if tipo_analisis:
                            logger.info(f"Tipo de análisis detectado por contenido: {tipo_analisis}")
                    except Exception as tipo_error:
                        logger.warning(f"Error detectando tipo de análisis por contenido: {tipo_error}")
                    
                    # 2. Detectar tabla por columnas (con prioridad según tipo de análisis)
                    detected_table = detectar_tabla_por_columnas(session_temp, headers, tipo_analisis=tipo_analisis)
                    
                    if detected_table:
                        table_key = detected_table.lower()
                        model = IMPORT_MODELS.get(table_key)
                        
                        if model:
                            coincidencias = len(set(h.lower() for h in headers) & set([c.name.lower() for c in model.__table__.columns]))
                            mensaje_deteccion = f"Tabla detectada automáticamente por columnas: {detected_table} (coinciden {coincidencias} columnas)"
                            if tipo_analisis:
                                mensaje_deteccion += f" [Tipo de análisis: {tipo_analisis}]"
                            logger.info(mensaje_deteccion)
                        else:
                            resultado["error"] = f"Tabla detectada '{detected_table}' pero no está disponible en IMPORT_MODELS"
                            session_temp.close()
                            safe_remove_file(tmp_path)
                            return resultado
                    else:
                        # Si no se detectó tabla, proporcionar sugerencias basadas en tipo de análisis
                        sugerencias = []
                        if tipo_analisis:
                            from metadata_config import ANALYSIS_TYPE_TO_TABLES
                            if tipo_analisis in ANALYSIS_TYPE_TO_TABLES:
                                sugerencias = ANALYSIS_TYPE_TO_TABLES[tipo_analisis]
                        
                        mensaje_error = f"No se pudo detectar la tabla automáticamente. Columnas encontradas: {', '.join(headers[:15])}"
                        if sugerencias:
                            mensaje_error += f" Tablas sugeridas basadas en tipo de análisis '{tipo_analisis}': {', '.join(sugerencias)}"
                        
                        resultado["error"] = mensaje_error
                        session_temp.close()
                        safe_remove_file(tmp_path)
                        return resultado
                finally:
                    session_temp.close()
                    
            except Exception as detect_error:
                logger.error(f"Error detectando tabla automáticamente: {detect_error}", exc_info=True)
                resultado["error"] = obtener_mensaje_error_seguro(detect_error, "Error detectando tabla automáticamente")
                safe_remove_file(tmp_path)
                return resultado
        
        # Validar que tenemos un modelo válido
        if not model:
            resultado["error"] = f"Tabla desconocida: {table_key or table}"
            safe_remove_file(tmp_path)
            return resultado
        
        # Validar que el modelo tiene la estructura esperada
        try:
            tabla_nombre = obtener_nombre_tabla_seguro(model)
            logger.info(f"Modelo válido confirmado: {tabla_nombre}")
        except Exception as model_error:
            logger.error(f"Error obteniendo nombre de tabla del modelo: {model_error}", exc_info=True)
            resultado["error"] = obtener_mensaje_error_seguro(model_error, "Error validando modelo de tabla")
            safe_remove_file(tmp_path)
            return resultado
        
        try:
            # Validar formato del archivo
            fmt = detect_format_from_path(tmp_path)
            if fmt not in ("csv", "xlsx"):
                resultado["error"] = f"Formato no soportado: {fmt or 'desconocido'}"
                safe_remove_file(tmp_path)
                return resultado
            
            logger.info(f"Formato de archivo validado: {fmt}")

            # Validar conexión a base de datos con circuit breaker
            engine = None
            try:
                def test_db_connection():
                    nonlocal engine
                    conn_str = build_connection_string()
                    engine = create_engine(conn_str)
                    with engine.connect() as conn:
                        conn.execute(text("SELECT 1"))
                
                db_circuit_breaker.call(test_db_connection)
                logger.info("Conexión a base de datos validada correctamente")
            except RuntimeError as cb_error:
                logger.error(f"Circuit breaker bloqueando conexión a BD: {cb_error}")
                resultado["error"] = "El servicio de base de datos está temporalmente no disponible. Intente más tarde."
                safe_remove_file(tmp_path)
                return resultado
            except Exception as db_error:
                logger.error(f"Error validando conexión a base de datos: {db_error}", exc_info=True)
                resultado["error"] = obtener_mensaje_error_seguro(db_error, "No se pudo conectar a la base de datos")
                safe_remove_file(tmp_path)
                return resultado

            # Verificar que engine fue creado
            if engine is None:
                logger.error("Engine no fue creado durante la validación")
                resultado["error"] = "Error creando conexión a la base de datos"
                safe_remove_file(tmp_path)
                return resultado

            # Preparar conexión SQLAlchemy
            Session = sessionmaker(bind=engine)
            session = Session()
            try:
                # Asegurar autoincrementos antes de importar
                try:
                    asegurar_autoincrementos(engine)
                    logger.info("Secuencias sincronizadas antes de importar")
                except Exception as seq_error:
                    logger.warning(f"Advertencia: No se pudieron sincronizar secuencias antes de importar: {seq_error}")

                # Ejecutar importación
                try:
                    tabla_nombre = obtener_nombre_tabla_seguro(model)
                    logger.info(f"Iniciando importación de {file.filename} a tabla {tabla_nombre}...")
                    inserted, updated = py_import_one_file(session, model, tmp_path, fmt, upsert, keep_ids)
                except AttributeError as attr_error:
                    logger.error(f"Error accediendo a atributos del modelo: {attr_error}", exc_info=True)
                    resultado["error"] = obtener_mensaje_error_seguro(attr_error, "Error en la estructura del modelo")
                    return resultado
                except Exception as import_inner_error:
                    logger.error(f"Error durante la importación: {import_inner_error}", exc_info=True)
                    resultado["error"] = obtener_mensaje_error_seguro(import_inner_error, "Error durante la importación de datos")
                    return resultado

                logger.info(f"Importación completada. Insertados: {inserted}, Actualizados: {updated}")

                # Asegurar autoincrementos después de importar
                try:
                    asegurar_autoincrementos(engine)
                    logger.info("Secuencias sincronizadas después de importar")
                except Exception as seq_error:
                    logger.warning(f"Advertencia: No se pudieron sincronizar secuencias después de importar: {seq_error}")

                # Retornar resultado exitoso
                resultado["exito"] = True
                try:
                    resultado["tabla"] = obtener_nombre_tabla_seguro(model)
                except Exception as name_error:
                    logger.warning(f"Error obteniendo nombre de tabla, usando fallback: {name_error}")
                    resultado["tabla"] = table_key or "desconocida"
                resultado["formato"] = fmt
                resultado["insertados"] = inserted
                resultado["actualizados"] = updated
                
            except Exception as import_error:
                logger.error(f"Error durante la importación: {import_error}", exc_info=True)
                resultado["error"] = obtener_mensaje_error_seguro(import_error, "Error durante la importación de datos")
            finally:
                session.close()
                
        finally:
            # Limpiar archivo temporal
            try:
                if tmp_path:
                    safe_remove_file(tmp_path)
                    logger.info(f"Archivo temporal eliminado: {tmp_path}")
            except Exception as cleanup_error:
                logger.warning(f"Advertencia: No se pudo eliminar archivo temporal {tmp_path}: {cleanup_error}")
                
    except Exception as e:
        logger.error(f"Error inesperado durante procesamiento de archivo: {e}", exc_info=True)
        resultado["error"] = obtener_mensaje_error_seguro(e, "Error inesperado durante el procesamiento")
        if tmp_path:
            try:
                safe_remove_file(tmp_path)
            except Exception:
                pass
    
    return resultado


@app.post("/importar")
async def importar(
    table: Optional[str] = Form(None, description="Tabla destino (opcional, se detecta automáticamente)"),
    upsert: bool = Form(False),
    keep_ids: bool = Form(False),
    file: Optional[UploadFile] = File(None, description="Archivo CSV/XLSX (opcional)"),
    files: Optional[List[UploadFile]] = File(None, description="Archivos CSV/XLSX (opcional)"),
):
    """Endpoint para importar archivos Excel/CSV a la base de datos. Acepta un archivo o múltiples archivos. Retorna respuesta estructurada con validaciones."""
    try:
        logger.info(f"Iniciando importación. Tabla: {table}, Upsert: {upsert}, Keep IDs: {keep_ids}")
        
        # Normalizar entrada: convertir file a lista si se proporciona
        archivos_lista: List[UploadFile] = []
        if file:
            archivos_lista.append(file)
        if files:
            archivos_lista.extend(files)
        
        # Validar que se proporcionó al menos un archivo
        if not archivos_lista:
            respuesta_error = crear_respuesta_error(
                mensaje="Archivo no proporcionado",
                codigo=400,
                detalles="Debe proporcionar al menos un archivo para importar (usar 'file' o 'files')"
            )
            raise HTTPException(status_code=400, detail=respuesta_error)
        
        # Validar cantidad de archivos
        try:
            validar_cantidad_archivos(len(archivos_lista), MAX_IMPORT_FILES)
        except ValueError as count_error:
            respuesta_error = crear_respuesta_error(
                mensaje="Demasiados archivos",
                codigo=400,
                detalles=str(count_error)
            )
            raise HTTPException(status_code=400, detail=respuesta_error)
        
        # Validar nombres de archivos y tamaños
        total_size = 0
        for archivo in archivos_lista:
            if not archivo.filename:
                respuesta_error = crear_respuesta_error(
                    mensaje="Nombre de archivo no válido",
                    codigo=400,
                    detalles="Uno o más archivos proporcionados no tienen un nombre válido"
                )
                raise HTTPException(status_code=400, detail=respuesta_error)
            
            # Validar tamaño del archivo (leer solo el tamaño sin cargar todo el contenido)
            if hasattr(archivo, 'size') and archivo.size:
                if archivo.size > MAX_FILE_SIZE:
                    respuesta_error = crear_respuesta_error(
                        mensaje="Archivo demasiado grande",
                        codigo=400,
                        detalles=f"El archivo '{archivo.filename}' excede el tamaño máximo de {MAX_FILE_SIZE / (1024*1024):.1f} MB"
                    )
                    raise HTTPException(status_code=400, detail=respuesta_error)
                total_size += archivo.size
        
        # Validar tamaño total de archivos
        if total_size > MAX_TOTAL_FILES_SIZE:
            respuesta_error = crear_respuesta_error(
                mensaje="Tamaño total de archivos excedido",
                codigo=400,
                detalles=f"El tamaño total de los archivos ({total_size / (1024*1024):.1f} MB) excede el límite máximo de {MAX_TOTAL_FILES_SIZE / (1024*1024):.1f} MB"
            )
            raise HTTPException(status_code=400, detail=respuesta_error)
        
        logger.info(f"Archivos recibidos: {len(archivos_lista)} archivo(s)")
        for i, archivo in enumerate(archivos_lista, 1):
            logger.info(f"  {i}. {archivo.filename}, Tamaño: {archivo.size if hasattr(archivo, 'size') else 'desconocido'}")
        
        # Inicializar modelos si no están inicializados (una sola vez)
        if not IMPORT_MODELS:
            logger.info("Inicializando modelos de la base de datos...")
            try:
                conn_str = build_connection_string()
                engine_init = create_engine(conn_str)
                inicializar_automap(engine_init)
                if not IMPORT_MODELS:
                    respuesta_error = crear_respuesta_error(
                        mensaje="Error: No se cargaron modelos de la base de datos",
                        codigo=500,
                        detalles="La inicialización de automap se completó pero no se encontraron modelos en IMPORT_MODELS."
                    )
                    raise HTTPException(status_code=500, detail=respuesta_error)
                logger.info(f"Modelos inicializados exitosamente: {len(IMPORT_MODELS)} tablas disponibles")
            except HTTPException:
                raise
            except Exception as init_error:
                logger.error(f"Error inicializando modelos: {init_error}", exc_info=True)
                respuesta_error = crear_respuesta_error(
                    mensaje="Error inicializando modelos de la base de datos",
                    codigo=500,
                    detalles=obtener_mensaje_error_seguro(init_error, "Error inicializando modelos")
                )
                raise HTTPException(status_code=500, detail=respuesta_error)
        else:
            logger.info(f"Modelos ya inicializados: {len(IMPORT_MODELS)} tablas disponibles")

        # Si es un solo archivo, procesar directamente y retornar formato actual (compatibilidad)
        if len(archivos_lista) == 1:
            logger.info("Procesando un solo archivo...")
            resultado = await procesar_un_archivo(archivos_lista[0], table, upsert, keep_ids)
            
            if resultado["exito"]:
                respuesta_exito = crear_respuesta_exito(
                    mensaje="Importación completada exitosamente",
                    datos={
                        "tabla": resultado["tabla"],
                        "archivo": resultado["archivo"],
                        "formato": resultado["formato"],
                        "insertados": resultado["insertados"],
                        "actualizados": resultado["actualizados"],
                        "upsert": upsert,
                        "keep_ids": keep_ids
                    }
                )
                return JSONResponse(content=respuesta_exito, status_code=200)
            else:
                respuesta_error = crear_respuesta_error(
                    mensaje="Error durante la importación",
                    codigo=500,
                    detalles=resultado["error"] or "Error desconocido durante la importación"
                )
                raise HTTPException(status_code=500, detail=respuesta_error)
        
        # Si son múltiples archivos, procesar en paralelo en lotes de 25
        logger.info(f"Procesando {len(archivos_lista)} archivos en paralelo (lotes de 25)...")
        
        resultados: List[Dict[str, Any]] = []
        errores: List[Dict[str, Any]] = []
        resumen_por_tabla: Dict[str, Dict[str, Any]] = {}
        
        # Procesar archivos en lotes de 25
        lote_size = 25
        for i in range(0, len(archivos_lista), lote_size):
            lote = archivos_lista[i:i + lote_size]
            logger.info(f"Procesando lote {i // lote_size + 1} ({len(lote)} archivos)...")
            
            # Procesar lote en paralelo (usar asyncio para funciones async)
            # Crear tareas async para el lote
            tareas = [procesar_un_archivo(archivo, table, upsert, keep_ids) for archivo in lote]
            
            # Ejecutar lote async
            try:
                resultados_lote = await asyncio.gather(*tareas, return_exceptions=True)
            except Exception as lote_error:
                logger.error(f"Error procesando lote: {lote_error}", exc_info=True)
                resultados_lote = []
            
            # Procesar resultados del lote
            for i, resultado in enumerate(resultados_lote):
                archivo = lote[i]
                try:
                    if isinstance(resultado, Exception):
                        logger.error(f"Error procesando archivo {archivo.filename}: {resultado}", exc_info=True)
                        errores.append({
                            "archivo": archivo.filename if archivo.filename else "desconocido",
                            "error": f"Error inesperado: {str(resultado)}"
                        })
                    else:
                        resultados.append(resultado)
                        
                        if resultado["exito"]:
                            # Agregar a resumen por tabla
                            tabla_nombre = resultado["tabla"]
                            if tabla_nombre not in resumen_por_tabla:
                                resumen_por_tabla[tabla_nombre] = {
                                    "archivos": 0,
                                    "filas_insertadas": 0,
                                    "filas_actualizadas": 0
                                }
                            
                            resumen_por_tabla[tabla_nombre]["archivos"] += 1
                            resumen_por_tabla[tabla_nombre]["filas_insertadas"] += resultado["insertados"]
                            resumen_por_tabla[tabla_nombre]["filas_actualizadas"] += resultado["actualizados"]
                        else:
                            errores.append({
                                "archivo": resultado["archivo"],
                                "error": resultado["error"] or "Error desconocido"
                            })
                except Exception as e:
                    logger.error(f"Error procesando archivo {archivo.filename}: {e}", exc_info=True)
                    errores.append({
                        "archivo": archivo.filename if archivo.filename else "desconocido",
                        "error": f"Error inesperado: {str(e)}"
                    })
        
        # Calcular totales
        total_archivos = len(archivos_lista)
        archivos_procesados = len(resultados)
        archivos_exitosos = sum(1 for r in resultados if r["exito"])
        archivos_con_errores = len(errores)
        total_filas_insertadas = sum(r["insertados"] for r in resultados if r["exito"])
        total_filas_actualizadas = sum(r["actualizados"] for r in resultados if r["exito"])
        
        # Retornar respuesta consolidada
        respuesta_exito = crear_respuesta_exito(
            mensaje="Importación masiva completada",
            datos={
                "total_archivos": total_archivos,
                "archivos_procesados": archivos_procesados,
                "archivos_exitosos": archivos_exitosos,
                "archivos_con_errores": archivos_con_errores,
                "total_filas_insertadas": total_filas_insertadas,
                "total_filas_actualizadas": total_filas_actualizadas,
                "resumen_por_tabla": resumen_por_tabla,
                "errores": errores if errores else None
            }
        )
        
        # Si hay errores pero también éxitos, retornar 200 con advertencia
        # Si todos fallaron, retornar 500
        if archivos_exitosos == 0:
            respuesta_error = crear_respuesta_error(
                mensaje="Importación masiva falló",
                codigo=500,
                detalles=f"Todos los archivos fallaron durante la importación. Total de errores: {archivos_con_errores}"
            )
            raise HTTPException(status_code=500, detail=respuesta_error)
        
        return JSONResponse(content=respuesta_exito, status_code=200)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error inesperado durante importación: {e}", exc_info=True)
        respuesta_error = crear_respuesta_error(
            mensaje="Error inesperado durante la importación",
            codigo=500,
            detalles=obtener_mensaje_error_seguro(e, "Error inesperado")
        )
        raise HTTPException(status_code=500, detail=respuesta_error)


@app.post("/analizar", tags=["Análisis"], summary="Analizar archivo Excel", 
          description="Analiza un archivo Excel y genera un mapeo de datos que muestra qué datos contiene y a qué entidades pertenecen. Identifica automáticamente las columnas y las asocia con entidades del sistema (recibo, lote, dosn, pureza, etc.).",
          response_description="Mapeo de datos del Excel analizado")
async def analizar(
    file: UploadFile = File(..., description="Archivo Excel (.xlsx o .xls) a analizar. El archivo será analizado para identificar su estructura y mapear los datos a entidades del sistema."),
    formato: str = Query(default="json", pattern="^(texto|json)$", description="Formato de salida: 'json' para respuesta completa en JSON, 'texto' para formato simplificado legible")
):
    """
    Analiza un archivo Excel y genera un mapeo de datos.
    
    **Funcionalidad:**
    - Analiza la estructura del Excel (hojas, columnas, tipos de datos)
    - Identifica a qué entidades pertenecen las columnas (recibo, lote, dosn, pureza, etc.)
    - Genera estadísticas por columna (valores nulos, tipos de datos, valores únicos)
    - Retorna un mapeo completo de los datos y su pertenencia a entidades
    
    **Parámetros:**
    - **file**: Archivo Excel (.xlsx o .xls) a analizar
    - **formato**: Formato de salida ('json' o 'texto')
    
    **Respuesta:**
    - Mapeo completo con información de hojas, columnas y entidades identificadas
    - Estadísticas por columna (tipos de datos, valores nulos, etc.)
    - Logs detallados del proceso de análisis
    """
    tmp_path = None
    try:
        logger.info(f"Iniciando análisis de Excel: {file.filename}")
        
        # Validar que se proporcionó un archivo
        if not file.filename:
            respuesta_error = crear_respuesta_error(
                mensaje="Archivo no proporcionado",
                codigo=400,
                detalles="Debe proporcionar un archivo Excel para analizar"
            )
            raise HTTPException(status_code=400, detail=respuesta_error)
        
        # Validar extensión del archivo
        _, ext = os.path.splitext(file.filename)
        if ext.lower() not in ('.xlsx', '.xls'):
            respuesta_error = crear_respuesta_error(
                mensaje="Formato de archivo no válido",
                codigo=400,
                detalles=f"El archivo debe ser un Excel (.xlsx o .xls). Formato recibido: {ext}"
            )
            raise HTTPException(status_code=400, detail=respuesta_error)
        
        # Validar formato de salida
        if formato not in ("texto", "json"):
            respuesta_error = crear_respuesta_error(
                mensaje="Formato de salida no válido",
                codigo=400,
                detalles=f"El formato '{formato}' no es válido. Solo se acepta 'texto' o 'json'"
            )
            raise HTTPException(status_code=400, detail=respuesta_error)
        
        # Guardar archivo temporalmente
        try:
            tmp_fd, tmp_path = tempfile.mkstemp(prefix="inia_analizar_", suffix=ext)
            os.close(tmp_fd)
            
            # Leer y guardar contenido del archivo con validación de tamaño
            content = await file.read()
            if not content or len(content) == 0:
                respuesta_error = crear_respuesta_error(
                    mensaje="El archivo proporcionado está vacío",
                    codigo=400,
                    detalles="El archivo Excel no contiene datos"
                )
                safe_remove_file(tmp_path)
                raise HTTPException(status_code=400, detail=respuesta_error)
            
            # Validar tamaño del archivo
            try:
                validar_tamaño_archivo(content, MAX_FILE_SIZE)
            except ValueError as size_error:
                respuesta_error = crear_respuesta_error(
                    mensaje="Archivo demasiado grande",
                    codigo=400,
                    detalles=str(size_error)
                )
                safe_remove_file(tmp_path)
                raise HTTPException(status_code=400, detail=respuesta_error)
            
            with open(tmp_path, "wb") as out:
                out.write(content)
            
            logger.info(f"Archivo guardado temporalmente: {tmp_path}, Tamaño: {len(content)} bytes")
            
        except HTTPException:
            raise
        except Exception as file_error:
            logger.error(f"Error guardando archivo temporal: {file_error}", exc_info=True)
            if tmp_path:
                safe_remove_file(tmp_path)
            respuesta_error = crear_respuesta_error(
                mensaje="Error guardando archivo temporal",
                codigo=500,
                detalles=obtener_mensaje_error_seguro(file_error, "Error guardando archivo")
            )
            raise HTTPException(status_code=500, detail=respuesta_error)
        
        # Analizar el archivo Excel
        try:
            logger.info(f"Iniciando análisis de estructura del Excel: {file.filename}")
            
            # Analizar estructura del Excel
            estructura = analizar_estructura_excel(tmp_path)
            logger.info(f"Estructura analizada: {len(estructura['hojas'])} hojas encontradas")
            
            for hoja in estructura['hojas']:
                logger.info(f"  - Hoja '{hoja['nombre']}': {hoja['total_columnas']} columnas, {hoja['total_filas']} filas")
            
            # Generar mapeo de datos
            logger.info("Generando mapeo de datos...")
            mapeo = generar_mapeo_datos(estructura)
            logger.info(f"Mapeo generado: {len(mapeo['hojas'])} hojas mapeadas")
            
            # Log detallado del mapeo
            for hoja in mapeo['hojas']:
                logger.info(f"  Hoja '{hoja['nombre']}':")
                for entidad_nombre, entidad_info in hoja['entidades'].items():
                    logger.info(f"    - Entidad '{entidad_nombre}': {entidad_info['total_columnas']} columnas")
                    for col in entidad_info['columnas'][:5]:  # Solo primeras 5 columnas en log
                        logger.info(f"      * {col['nombre']}: {', '.join(col['tipo_datos'])} ({col['valores_nulos']} nulos)")
            
            # Preparar respuesta según formato
            if formato == "texto":
                # Para formato texto, crear una representación legible
                respuesta_texto = {
                    "archivo": mapeo['archivo'],
                    "ruta": mapeo['ruta'],
                    "resumen": mapeo['resumen'],
                    "hojas": []
                }
                
                for hoja in mapeo['hojas']:
                    hoja_texto = {
                        "nombre": hoja['nombre'],
                        "resumen": hoja['resumen'],
                        "entidades": {}
                    }
                    
                    for entidad_nombre, entidad_info in hoja['entidades'].items():
                        entidad_texto = {
                            "nombre": entidad_info['nombre'],
                            "total_columnas": entidad_info['total_columnas'],
                            "tipos_datos": entidad_info['tipos_datos'],
                            "columnas": []
                        }
                        
                        for col in entidad_info['columnas']:
                            col_texto = {
                                "nombre": col['nombre'],
                                "tipo_datos": col['tipo_datos'],
                                "valores_nulos": col['valores_nulos'],
                                "porcentaje_nulos": col['porcentaje_nulos'],
                                "total_valores": col['total_valores']
                            }
                            entidad_texto["columnas"].append(col_texto)
                        
                        hoja_texto["entidades"][entidad_nombre] = entidad_texto
                    respuesta_texto["hojas"].append(hoja_texto)
                
                respuesta_exito = crear_respuesta_exito(
                    mensaje="Análisis de Excel completado exitosamente",
                    datos=respuesta_texto
                )
            else:
                # Formato JSON completo
                respuesta_exito = crear_respuesta_exito(
                    mensaje="Análisis de Excel completado exitosamente",
                    datos=mapeo
                )
            
            logger.info(f"Análisis completado exitosamente para {file.filename}")
            return JSONResponse(content=respuesta_exito, status_code=200)
            
        except FileNotFoundError as fnf_error:
            logger.error(f"Archivo no encontrado: {fnf_error}", exc_info=True)
            respuesta_error = crear_respuesta_error(
                mensaje="Archivo no encontrado",
                codigo=404,
                detalles=f"El archivo temporal no se encontró: {str(fnf_error)}"
            )
            if tmp_path:
                safe_remove_file(tmp_path)
            raise HTTPException(status_code=404, detail=respuesta_error)
        except Exception as analisis_error:
            logger.error(f"Error durante el análisis: {analisis_error}", exc_info=True)
            respuesta_error = crear_respuesta_error(
                mensaje="Error durante el análisis del Excel",
                codigo=500,
                detalles=obtener_mensaje_error_seguro(analisis_error, "Error durante el análisis")
            )
            if tmp_path:
                safe_remove_file(tmp_path)
            raise HTTPException(status_code=500, detail=respuesta_error)
        finally:
            # Limpiar archivo temporal
            if tmp_path:
                try:
                    safe_remove_file(tmp_path)
                    logger.info(f"Archivo temporal eliminado: {tmp_path}")
                except Exception as cleanup_error:
                    logger.warning(f"Advertencia: No se pudo eliminar archivo temporal {tmp_path}: {cleanup_error}")
        
    except HTTPException:
        if tmp_path:
            safe_remove_file(tmp_path)
        raise
    except Exception as e:
        logger.error(f"Error inesperado durante análisis: {e}", exc_info=True)
        if tmp_path:
            safe_remove_file(tmp_path)
        respuesta_error = crear_respuesta_error(
            mensaje="Error inesperado durante el análisis",
            codigo=500,
            detalles=obtener_mensaje_error_seguro(e, "Error inesperado")
        )
        raise HTTPException(status_code=500, detail=respuesta_error)


if __name__ == "__main__":
    # Configurar uvicorn con límites de protección
    config = uvicorn.Config(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PY_MIDDLEWARE_PORT", "9099")),
        timeout_keep_alive=30,
        limit_concurrency=MAX_CONCURRENT_REQUESTS,
        log_level="info"
    )
    server = uvicorn.Server(config)
    logger.info(f"Servidor iniciado con protecciones: Max archivo={MAX_FILE_SIZE/(1024*1024):.1f}MB, Max total={MAX_TOTAL_FILES_SIZE/(1024*1024):.1f}MB, Timeout={MAX_REQUEST_TIMEOUT}s, Concurrentes={MAX_CONCURRENT_REQUESTS}")
    server.run()



import os
import csv
import argparse
import logging
import re
import unicodedata
import traceback
from typing import Any, Dict, Iterable, List, Optional, Tuple
from datetime import datetime, date
from urllib.parse import quote_plus

# Importar configuración de metadatos
try:
    from metadata_config import (
        METADATA_KEYWORDS,
        METADATA_PATTERNS,
        VALID_HEADER_KEYWORDS,
        VALIDATION_CONFIG,
        ANALYSIS_TYPE_TO_TABLES,
        ANALYSIS_KEYWORDS,
        HEADER_SYNONYMS,
    )
except ImportError:
    # Fallback si no se puede importar
    METADATA_KEYWORDS = []
    METADATA_PATTERNS = []
    VALID_HEADER_KEYWORDS = []
    VALIDATION_CONFIG = {
        "min_headers_validos": 3,
        "max_header_length": 50,
        "min_header_length": 1,
        "max_numeric_percentage": 0.3,
        "max_metadata_percentage": 0.3,
        "min_valid_percentage": 0.5,
        "confidence_threshold": 0.4,
        "max_title_length": 30,
    }
    ANALYSIS_TYPE_TO_TABLES = {}
    ANALYSIS_KEYWORDS = {}
    HEADER_SYNONYMS = {}

# Intentar importar módulo de instalación de dependencias
try:
    from InstallDependencies import verificar_e_instalar, instalar_dependencias_faltantes
    INSTALL_DEPS_AVAILABLE = True
except ImportError:
    INSTALL_DEPS_AVAILABLE = False

# Verificar e instalar dependencias SQLAlchemy
if INSTALL_DEPS_AVAILABLE:
    if not verificar_e_instalar('sqlalchemy', 'SQLAlchemy', silent=True):
        print("Intentando instalar SQLAlchemy...")
        verificar_e_instalar('sqlalchemy', 'SQLAlchemy', silent=False)

# Importaciones SQLAlchemy
try:
    from sqlalchemy import create_engine, text, Table, inspect
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.ext.automap import automap_base
except ModuleNotFoundError:
    if INSTALL_DEPS_AVAILABLE:
        print("Instalando dependencias faltantes...")
        if instalar_dependencias_faltantes('ImportExcel', silent=False):
            from sqlalchemy import create_engine, text, Table, inspect
            from sqlalchemy.orm import sessionmaker
            from sqlalchemy.ext.automap import automap_base
        else:
            print("No se pudieron instalar las dependencias. Instálalas manualmente con: pip install -r requirements.txt")
            raise
    else:
        print("Falta el paquete 'sqlalchemy'. Instálalo con: pip install SQLAlchemy")
        raise

# Dependencias opcionales para Excel
try:
    from openpyxl import load_workbook
    OPENPYXL_AVAILABLE = True
except Exception:
    OPENPYXL_AVAILABLE = False
    # Intentar instalar openpyxl si el módulo de instalación está disponible
    if INSTALL_DEPS_AVAILABLE:
        if verificar_e_instalar('openpyxl', 'openpyxl', silent=False):
            try:
                from openpyxl import load_workbook
                OPENPYXL_AVAILABLE = True
            except Exception:
                OPENPYXL_AVAILABLE = False

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Importar configuración centralizada de base de datos
from database_config import build_connection_string

def obtener_engine():
    """Obtiene un engine de SQLAlchemy configurado."""
    connection_string = build_connection_string()
    return create_engine(connection_string)

# ================================
# MÓDULO: AUTOMAPEO DE MODELOS
# ================================
Base = None
_engine = None
_models_initialized = False
MODELS = {}
# Caché de tablas para evitar acceder al mapper repetidamente
_TABLES_CACHE = {}

def _intentar_reflejar_tablas_selectivas(engine, tablas_criticas=None):
    """
    Intenta reflejar tablas de forma selectiva para evitar problemas de codificación.
    
    Args:
        engine: Engine de SQLAlchemy
        tablas_criticas: Lista de nombres de tablas críticas a reflejar primero
    
    Returns:
        Base preparado o None si falla
    """
    if tablas_criticas is None:
        tablas_criticas = ['lote', 'recibo']  # Tablas críticas para importación
    
    try:
        from sqlalchemy import inspect as sql_inspect
        inspector = sql_inspect(engine)
        
        # Obtener esquemas disponibles
        schemas = inspector.get_schema_names()
        tablas_disponibles = []
        
        for schema in schemas:
            if schema in ['pg_catalog', 'information_schema']:
                continue
            try:
                tablas = inspector.get_table_names(schema=schema)
                for tabla in tablas:
                    tablas_disponibles.append((schema, tabla))
            except Exception as e:
                logger.warning(f"Error obteniendo tablas del esquema {schema}: {e}")
                continue
        
        # Intentar reflejar solo tablas críticas primero
        tablas_a_reflejar = []
        for schema, tabla in tablas_disponibles:
            tabla_lower = tabla.lower()
            if any(critica.lower() in tabla_lower for critica in tablas_criticas):
                tablas_a_reflejar.append((schema, tabla))
        
        if tablas_a_reflejar:
            logger.info(f"Intentando reflejar {len(tablas_a_reflejar)} tablas críticas...")
            Base = automap_base()
            metadata = Base.metadata
            
            # Reflejar solo las tablas críticas
            nombres_tablas = [tabla for _, tabla in tablas_a_reflejar]
            metadata.reflect(engine, only=nombres_tablas)
            Base.prepare()
            logger.info(f"✓ Tablas críticas reflejadas exitosamente: {len(Base.classes)} tablas")
            return Base
        
        # Si no hay tablas críticas, intentar reflejar todas
        logger.info("No se encontraron tablas críticas, intentando reflejar todas...")
        Base = automap_base()
        Base.prepare(autoload_with=engine, generate_relationship=None)
        return Base
        
    except Exception as e:
        logger.error(f"Error en reflejo selectivo: {e}")
        return None


def inicializar_automap(engine=None):
    """Inicializa automap_base y genera modelos automáticamente desde la BD."""
    global Base, _engine, _models_initialized, MODELS
    
    if _models_initialized and Base is not None:
        return Base
    
    if engine is None:
        # Usar función centralizada para crear engine con codificación UTF-8
        try:
            from app.services.database_service import create_engine_with_pool
            _engine = create_engine_with_pool()
            logger.info("Engine creado usando create_engine_with_pool() con codificación UTF-8")
        except Exception as e:
            logger.error(f"Error creando engine con create_engine_with_pool(): {e}")
            logger.error(traceback.format_exc())
            raise
    else:
        _engine = engine
    
    Base = automap_base()
    
    logger.info("Iniciando preparación de automap_base...")
    logger.debug(f"Engine configurado: {_engine.url if hasattr(_engine, 'url') else 'N/A'}")
    
    try:
        # Deshabilitar generación automática de relaciones para evitar conflictos de backref
        # Solo necesitamos las columnas para la importación, no las relaciones
        logger.info("Ejecutando Base.prepare() para reflejar todas las tablas...")
        Base.prepare(
            autoload_with=_engine,
            generate_relationship=None  # No generar relaciones automáticamente
            # Nota: reflect=True está deprecado cuando se usa autoload_with (reflexión automática)
        )
        logger.info(f"Modelos generados automáticamente: {len(Base.classes)} tablas")
    except (UnicodeDecodeError, UnicodeError) as e:
        logger.error("=" * 80)
        logger.error("ERROR DE CODIFICACIÓN DETECTADO DURANTE Base.prepare()")
        logger.error("=" * 80)
        logger.error(f"Tipo de error: {type(e).__name__}")
        logger.error(f"Mensaje: {e}")
        if hasattr(e, 'start') and hasattr(e, 'end'):
            logger.error(f"Posición del error: bytes {e.start}-{e.end}")
        if hasattr(e, 'object') and hasattr(e, 'start'):
            try:
                byte_problematico = e.object[e.start] if e.start < len(e.object) else None
                logger.error(f"Byte problemático: {hex(byte_problematico) if byte_problematico is not None else 'N/A'}")
                # Intentar mostrar contexto alrededor del byte problemático
                inicio = max(0, e.start - 10)
                fin = min(len(e.object), e.end + 10)
                contexto = e.object[inicio:fin]
                logger.error(f"Contexto (bytes): {contexto}")
            except Exception:
                pass
        logger.error("Stack trace completo:")
        logger.error(traceback.format_exc())
        logger.warning("Esto puede deberse a nombres de tablas/columnas con caracteres especiales.")
        logger.warning("Intentando continuar con manejo de errores de codificación...")
        # Verificar si se cargaron algunas clases a pesar del error
        if not hasattr(Base, 'classes') or len(Base.classes) == 0:
            # Si no se cargaron clases, intentar con configuración de codificación diferente
            logger.warning("No se cargaron clases. Intentando con configuración alternativa...")
            try:
                # Intentar con encoding explícito en la conexión
                Base = automap_base()
                logger.info("Reintentando Base.prepare() con configuración alternativa...")
                Base.prepare(autoload_with=_engine, generate_relationship=None)
                logger.info(f"Modelos generados automáticamente (con encoding alternativo): {len(Base.classes)} tablas")
            except Exception as e2:
                logger.error(f"Error en intento alternativo: {e2}")
                logger.error("Stack trace del intento alternativo:")
                logger.error(traceback.format_exc())
                
                # Intentar reflejo selectivo como último recurso
                logger.warning("Intentando reflejo selectivo de tablas críticas...")
                Base_selectivo = _intentar_reflejar_tablas_selectivas(_engine)
                if Base_selectivo and hasattr(Base_selectivo, 'classes') and len(Base_selectivo.classes) > 0:
                    Base = Base_selectivo
                    logger.info(f"✓ Reflejo selectivo exitoso: {len(Base.classes)} tablas cargadas")
                else:
                    raise RuntimeError(f"No se pudieron cargar modelos debido a error de codificación: {e}. Error alternativo: {e2}")
    except Exception as e:
        logger.error("=" * 80)
        logger.error("ERROR INESPERADO DURANTE Base.prepare()")
        logger.error("=" * 80)
        logger.error(f"Tipo de error: {type(e).__name__}")
        logger.error(f"Mensaje: {e}")
        logger.error("Stack trace completo:")
        logger.error(traceback.format_exc())
        # Si falla, intentar sin reflect=True como fallback
        try:
            logger.warning("Intentando inicializar automap sin reflect=True...")
            Base = automap_base()
            Base.prepare(autoload_with=_engine, generate_relationship=None)
            logger.info(f"Modelos generados automáticamente (fallback): {len(Base.classes)} tablas")
        except (UnicodeDecodeError, UnicodeError) as e2:
            logger.error(f"Error de codificación en fallback de automap: {e2}")
            logger.error("Stack trace del fallback:")
            logger.error(traceback.format_exc())
            logger.warning("Continuando con manejo de errores de codificación...")
            pass
        except Exception as e2:
            logger.error(f"Error en fallback de automap: {e2}")
            logger.error("Stack trace del fallback:")
            logger.error(traceback.format_exc())
            
            # Intentar reflejo selectivo como último recurso
            logger.warning("Intentando reflejo selectivo de tablas críticas como último recurso...")
            Base_selectivo = _intentar_reflejar_tablas_selectivas(_engine)
            if Base_selectivo and hasattr(Base_selectivo, 'classes') and len(Base_selectivo.classes) > 0:
                Base = Base_selectivo
                logger.info(f"✓ Reflejo selectivo exitoso: {len(Base.classes)} tablas cargadas")
            else:
                raise
    
    # Verificar que se cargaron clases
    if not hasattr(Base, 'classes') or len(Base.classes) == 0:
        raise RuntimeError("No se cargaron modelos de la base de datos. Base.classes está vacío.")
    
    MODELS.clear()
    modelos_procesados = 0
    modelos_con_error = 0
    
    for class_name in dir(Base.classes):
        if not class_name.startswith('_'):
            try:
                cls = getattr(Base.classes, class_name)
                # Intentar obtener el nombre de la tabla de diferentes formas
                tabla_nombre = None
                
                # Método 1: Intentar __tablename__
                try:
                    if hasattr(cls, '__tablename__'):
                        tabla_nombre_raw = cls.__tablename__
                        # Manejar posibles problemas de codificación
                        if isinstance(tabla_nombre_raw, bytes):
                            tabla_nombre = tabla_nombre_raw.decode('utf-8', errors='replace').lower()
                        else:
                            tabla_nombre = str(tabla_nombre_raw).lower()
                except (UnicodeDecodeError, UnicodeError) as e:
                    logger.warning(f"Error de codificación obteniendo __tablename__ de {class_name}: {e}")
                    try:
                        # Intentar con diferentes codificaciones
                        if isinstance(cls.__tablename__, bytes):
                            tabla_nombre = cls.__tablename__.decode('latin-1', errors='replace').lower()
                    except:
                        pass
                except Exception:
                    pass
                
                # Método 2: Intentar __table__.name
                if tabla_nombre is None:
                    try:
                        if hasattr(cls, '__table__') and hasattr(cls.__table__, 'name'):
                            tabla_nombre_raw = cls.__table__.name
                            # Manejar posibles problemas de codificación
                            if isinstance(tabla_nombre_raw, bytes):
                                tabla_nombre = tabla_nombre_raw.decode('utf-8', errors='replace').lower()
                            else:
                                tabla_nombre = str(tabla_nombre_raw).lower()
                    except (UnicodeDecodeError, UnicodeError) as e:
                        logger.warning(f"Error de codificación obteniendo __table__.name de {class_name}: {e}")
                        try:
                            if hasattr(cls, '__table__') and hasattr(cls.__table__, 'name'):
                                if isinstance(cls.__table__.name, bytes):
                                    tabla_nombre = cls.__table__.name.decode('latin-1', errors='replace').lower()
                        except:
                            pass
                    except Exception:
                        pass
                
                # Método 3: Usar el nombre de la clase directamente (en automap suelen coincidir)
                if tabla_nombre is None:
                    try:
                        tabla_nombre = str(class_name).lower()
                    except Exception:
                        logger.warning(f"Error convirtiendo class_name a string: {class_name}")
                        continue
                
                # Mapear la clase
                if tabla_nombre:
                    MODELS[tabla_nombre] = cls
                    MODELS[class_name.lower()] = cls
                    modelos_procesados += 1
                    logger.debug(f"Mapeado: {tabla_nombre} -> {class_name}")
            except (UnicodeDecodeError, UnicodeError) as e:
                modelos_con_error += 1
                logger.warning(f"Error de codificación procesando clase {class_name}: {e}. Omitiendo esta clase.")
                continue
            except Exception as e:
                modelos_con_error += 1
                logger.warning(f"Error procesando clase {class_name}: {e}")
                continue
    
    logger.info(f"Total de modelos mapeados: {len(MODELS)} (procesados: {modelos_procesados}, con errores: {modelos_con_error})")
    
    # Verificar que se mapearon al menos algunos modelos
    if len(MODELS) == 0:
        raise RuntimeError("No se pudieron mapear modelos. MODELS está vacío después del procesamiento.")
    _models_initialized = True
    return Base

def obtener_modelo(nombre_tabla):
    """Obtiene un modelo por nombre de tabla."""
    if not _models_initialized or Base is None:
        inicializar_automap()
    
    nombre_tabla_lower = nombre_tabla.lower()
    if nombre_tabla_lower in MODELS:
        return MODELS[nombre_tabla_lower]
    
    if Base is not None:
        for class_name in dir(Base.classes):
            if not class_name.startswith('_'):
                try:
                    cls = getattr(Base.classes, class_name)
                    if hasattr(cls, '__tablename__') and cls.__tablename__.lower() == nombre_tabla_lower:
                        MODELS[nombre_tabla_lower] = cls
                        return cls
                except Exception:
                    continue
    
    raise AttributeError(f"Tabla '{nombre_tabla}' no encontrada en modelos reflejados")

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
    
    try:
        # Método 4: Intentar obtener desde el mapeo
        if hasattr(model, '__mapper__') and hasattr(model.__mapper__, 'tables'):
            tables = model.__mapper__.tables
            if tables:
                return list(tables)[0].name
    except (AttributeError, TypeError, IndexError):
        pass
    
    # Último recurso: usar el nombre de la clase como string
    return str(model).split('.')[-1].split("'")[0].lower()

# ================================
# MÓDULO: UTILIDADES DE ARCHIVOS
# ================================
def detect_format_from_path(ruta_archivo: str) -> Optional[str]:
    """Detecta el formato de un archivo basándose en su extensión."""
    if not ruta_archivo:
        return None
    
    _, ext = os.path.splitext(ruta_archivo.lower())
    if ext == '.xlsx' or ext == '.xls':
        return 'xlsx'
    elif ext == '.csv':
        return 'csv'
    return None

def read_rows_from_xlsx(ruta_archivo: str, max_rows: Optional[int] = None) -> Tuple[List[str], List[List[Any]]]:
    """Lee las filas de un archivo Excel. Retorna (headers, rows)."""
    if not OPENPYXL_AVAILABLE:
        raise RuntimeError("openpyxl no está instalado")
    
    headers = []
    rows = []
    
    try:
        wb = load_workbook(ruta_archivo, data_only=True)
        ws = wb.active
        
        # Leer encabezados (primera fila)
        if ws.max_row > 0:
            for col in range(1, ws.max_column + 1):
                celda = ws.cell(row=1, column=col)
                valor = celda.value
                headers.append(str(valor).strip() if valor is not None else f"Columna_{col}")
        
        # Leer filas de datos
        start_row = 2
        end_row = ws.max_row + 1
        if max_rows:
            end_row = min(start_row + max_rows, end_row)
        
        for row_num in range(start_row, end_row):
            fila = []
            for col in range(1, ws.max_column + 1):
                celda = ws.cell(row=row_num, column=col)
                fila.append(celda.value)
            rows.append(fila)
        
        wb.close()
    except Exception as e:
        logger.error(f"Error leyendo archivo Excel: {e}")
        raise
    
    return headers, rows

def read_rows_from_csv(ruta_archivo: str, max_rows: Optional[int] = None) -> Tuple[List[str], List[List[Any]]]:
    """Lee las filas de un archivo CSV. Retorna (headers, rows)."""
    headers = []
    rows = []
    
    try:
        with open(ruta_archivo, 'r', encoding='utf-8-sig') as f:
            reader = csv.reader(f)
            
            # Leer encabezados (primera fila)
            try:
                headers = next(reader)
                headers = [h.strip() if h else f"Columna_{i+1}" for i, h in enumerate(headers)]
            except StopIteration:
                pass
            
            # Leer filas de datos
            for i, fila in enumerate(reader):
                if max_rows and i >= max_rows:
                    break
                rows.append(fila)
    except Exception as e:
        logger.error(f"Error leyendo archivo CSV: {e}")
        raise
    
    return headers, rows

def normalize_header_names(headers: List[str]) -> List[str]:
    """Normaliza los nombres de los encabezados."""
    normalized = []
    for header in headers:
        if header:
            # Normalizar unicode
            header = unicodedata.normalize('NFKD', str(header))
            # Convertir a minúsculas y reemplazar espacios/guiones con guiones bajos
            header = header.lower().strip()
            header = re.sub(r'[\s\-]+', '_', header)
            # Remover caracteres especiales
            header = re.sub(r'[^a-z0-9_]', '', header)
            # Remover guiones bajos múltiples
            header = re.sub(r'_+', '_', header)
            # Remover guiones bajos al inicio y final
            header = header.strip('_')
            if not header:
                header = f"columna_{len(normalized)+1}"
        else:
            header = f"columna_{len(normalized)+1}"
        normalized.append(header)
    return normalized

# ================================
# MÓDULO: DETECCIÓN DE TABLAS
# ================================
def detectar_tipo_analisis_por_contenido(ruta_archivo: str) -> Optional[str]:
    """Detecta el tipo de análisis basándose en el contenido del archivo."""
    try:
        fmt = detect_format_from_path(ruta_archivo)
        if not fmt:
            return None
        
        # Leer primera fila para detectar tipo
        if fmt == 'xlsx':
            headers, _ = read_rows_from_xlsx(ruta_archivo, max_rows=1)
        else:
            headers, _ = read_rows_from_csv(ruta_archivo, max_rows=1)
        
        headers_lower = [h.lower() for h in headers if h]
        
        # Detectar tipo de análisis basándose en keywords
        if any('dosn' in h for h in headers_lower):
            return 'dosn'
        elif any('pureza' in h for h in headers_lower):
            return 'pureza'
        elif any('germinacion' in h for h in headers_lower):
            return 'germinacion'
        elif any('tetrazolio' in h for h in headers_lower):
            return 'tetrazolio'
        elif any('sanitario' in h for h in headers_lower):
            return 'sanitario'
        elif any('pms' in h for h in headers_lower):
            return 'pms'
        
        return None
    except Exception as e:
        logger.warning(f"Error detectando tipo de análisis: {e}")
        return None

def detectar_tabla_por_columnas(session, headers: List[str], tipo_analisis: Optional[str] = None) -> Optional[str]:
    """Detecta la tabla basándose en las columnas del archivo."""
    if not headers or len(headers) < 3:
        return None
    
    headers_lower = [h.lower() for h in headers if h]
    
    # Buscar en los modelos disponibles
    mejor_coincidencia = None
    mejor_puntuacion = 0
    
    for tabla_nombre, model in MODELS.items():
        try:
            # Obtener columnas del modelo
            columnas_modelo = [c.name.lower() for c in model.__table__.columns]
            
            # Calcular coincidencias
            coincidencias = sum(1 for h in headers_lower if h in columnas_modelo)
            puntuacion = coincidencias / len(headers_lower) if headers_lower else 0
            
            if puntuacion > mejor_puntuacion and puntuacion >= 0.3:  # Al menos 30% de coincidencia
                mejor_puntuacion = puntuacion
                mejor_coincidencia = tabla_nombre
        except Exception as e:
            logger.debug(f"Error verificando tabla {tabla_nombre}: {e}")
            continue
    
    return mejor_coincidencia

# ================================
# MÓDULO: SINCRONIZACIÓN DE SECUENCIAS
# ================================
def asegurar_autoincrementos(engine):
    """Asegura que las secuencias de autoincremento estén sincronizadas."""
    try:
        with engine.connect() as conn:
            # Obtener todas las tablas con columnas serial/bigserial
            query = text("""
                SELECT 
                    t.table_name,
                    c.column_name,
                    c.data_type
                FROM information_schema.tables t
                JOIN information_schema.columns c ON t.table_name = c.table_name
                WHERE t.table_schema = 'public'
                    AND t.table_type = 'BASE TABLE'
                    AND c.data_type IN ('integer', 'bigint')
                    AND c.column_default LIKE 'nextval%'
                ORDER BY t.table_name, c.column_name
            """)
            
            result = conn.execute(query)
            for row in result:
                tabla = row[0]
                columna = row[1]
                
                # Obtener el valor máximo actual
                query_max = text(f"SELECT COALESCE(MAX({columna}), 0) FROM {tabla}")
                max_val = conn.execute(query_max).scalar()
                
                # Obtener el nombre de la secuencia
                query_seq = text(f"""
                    SELECT pg_get_serial_sequence('{tabla}', '{columna}')
                """)
                seq_name = conn.execute(query_seq).scalar()
                
                if seq_name:
                    # Sincronizar la secuencia
                    query_sync = text(f"SELECT setval('{seq_name}', {max_val}, true)")
                    conn.execute(query_sync)
                    conn.commit()
                    logger.debug(f"Secuencia {seq_name} sincronizada a {max_val}")
    except Exception as e:
        logger.warning(f"Error sincronizando secuencias: {e}")

# ================================
# MÓDULO: IMPORTACIÓN DE ARCHIVOS
# ================================
def convertir_valor_segun_tipo(valor: Any, tipo_columna) -> Any:
    """
    Convierte un valor según el tipo de columna de la base de datos.
    
    Args:
        valor: Valor a convertir
        tipo_columna: Tipo de columna de SQLAlchemy
    
    Returns:
        Valor convertido al tipo correcto
    """
    if valor is None:
        return None
    
    # Obtener el tipo Python del tipo SQLAlchemy
    tipo_python = tipo_columna.python_type if hasattr(tipo_columna, 'python_type') else type(valor)
    
    # Verificar también el nombre del tipo SQLAlchemy para detectar booleanos
    tipo_nombre = None
    if hasattr(tipo_columna, '__class__'):
        tipo_nombre = tipo_columna.__class__.__name__.lower()
    elif hasattr(tipo_columna, 'name'):
        tipo_nombre = str(tipo_columna.name).lower()
    
    # Verificar si es un tipo Boolean de SQLAlchemy
    es_booleano_sqlalchemy = False
    try:
        from sqlalchemy import Boolean
        if isinstance(tipo_columna, Boolean):
            es_booleano_sqlalchemy = True
    except:
        pass
    
    # Si ya es del tipo correcto, retornarlo
    if isinstance(valor, tipo_python):
        return valor
    
    # Convertir según el tipo
    try:
        # Booleanos: convertir strings 'true', 'false', '1', '0', etc.
        # Verificar tanto el tipo Python como el nombre del tipo SQLAlchemy
        es_booleano = (tipo_python == bool or 
                      es_booleano_sqlalchemy or
                      (tipo_nombre and 'bool' in tipo_nombre) or
                      (hasattr(tipo_columna, 'python_type') and tipo_columna.python_type == bool))
        
        if es_booleano:
            if isinstance(valor, bool):
                return valor
            if isinstance(valor, str):
                valor_str = valor.lower().strip()
                if valor_str in ('true', '1', 'yes', 'si', 'sí', 't', 'y', 'verdadero', 'v'):
                    return True
                elif valor_str in ('false', '0', 'no', 'n', 'f', 'falso'):
                    return False
                else:
                    # Si no se puede convertir, retornar False por defecto
                    logger.warning(f"No se pudo convertir '{valor}' a booleano, usando False")
                    return False
            if isinstance(valor, (int, float)):
                return bool(valor)
            # Si es None o vacío, retornar False por defecto para booleanos
            return False
        
        # Enteros
        elif tipo_python == int:
            if isinstance(valor, str):
                # Intentar convertir string a int
                try:
                    # Remover espacios y caracteres no numéricos
                    valor_limpio = valor.strip()
                    if valor_limpio:
                        return int(float(valor_limpio))  # Usar float primero para manejar "1.0"
                except (ValueError, TypeError):
                    logger.warning(f"No se pudo convertir '{valor}' a entero")
                    return None
            return int(valor)
        
        # Flotantes
        elif tipo_python == float:
            if isinstance(valor, str):
                try:
                    valor_limpio = valor.strip()
                    if valor_limpio:
                        return float(valor_limpio)
                except (ValueError, TypeError):
                    logger.warning(f"No se pudo convertir '{valor}' a flotante")
                    return None
            return float(valor)
        
        # Strings: asegurar que sea string
        elif tipo_python == str:
            return str(valor)
        
        # Fechas y timestamps
        elif hasattr(tipo_python, '__name__') and 'date' in tipo_python.__name__.lower():
            if isinstance(valor, str):
                # Intentar parsear fecha
                try:
                    from datetime import datetime
                    # Intentar varios formatos comunes
                    formatos = ['%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%Y-%m-%d %H:%M:%S']
                    for fmt in formatos:
                        try:
                            return datetime.strptime(valor.strip(), fmt)
                        except ValueError:
                            continue
                    logger.warning(f"No se pudo parsear fecha '{valor}'")
                    return None
                except Exception as e:
                    logger.warning(f"Error parseando fecha '{valor}': {e}")
                    return None
            return valor
        
        # Por defecto, retornar el valor tal cual
        return valor
        
    except Exception as e:
        logger.warning(f"Error convirtiendo valor '{valor}' a tipo {tipo_python}: {e}")
        return valor

def import_one_file(session, model, ruta_archivo: str, formato: str, upsert: bool = False, keep_ids: bool = False) -> Tuple[int, int]:
    """
    Importa un archivo Excel/CSV a una tabla.
    
    Args:
        session: Sesión de SQLAlchemy
        model: Modelo de la tabla destino
        ruta_archivo: Ruta al archivo a importar
        formato: Formato del archivo ('xlsx' o 'csv')
        upsert: Si es True, actualiza registros existentes
        keep_ids: Si es True, mantiene los IDs del archivo
    
    Returns:
        Tuple[int, int]: (insertados, actualizados)
    """
    inserted = 0
    updated = 0
    
    try:
        # Leer archivo
        if formato == 'xlsx':
            headers, rows = read_rows_from_xlsx(ruta_archivo)
        else:
            headers, rows = read_rows_from_csv(ruta_archivo)
        
        if not headers or not rows:
            logger.warning("Archivo vacío o sin datos")
            return 0, 0
        
        # Normalizar headers
        headers = normalize_header_names(headers)
        
        # Obtener columnas del modelo con sus tipos
        columnas_modelo = {c.name.lower(): c for c in model.__table__.columns}
        
        # Mapear headers a columnas del modelo (incluyendo el tipo)
        mapeo_columnas = {}
        tipos_columnas = {}  # Almacenar tipos de columnas
        for header in headers:
            if header.lower() in columnas_modelo:
                columna_modelo = columnas_modelo[header.lower()]
                nombre_columna = columna_modelo.name
                mapeo_columnas[header] = nombre_columna
                tipos_columnas[nombre_columna] = columna_modelo.type  # Guardar el tipo
                # Log de depuración para columnas booleanas
                tipo_col = columna_modelo.type
                es_booleano = False
                if hasattr(tipo_col, 'python_type') and tipo_col.python_type == bool:
                    es_booleano = True
                    logger.debug(f"Columna booleana detectada: '{nombre_columna}' (tipo: {tipo_col})")
                elif hasattr(tipo_col, '__class__'):
                    tipo_nombre = tipo_col.__class__.__name__.lower()
                    if 'bool' in tipo_nombre:
                        es_booleano = True
                        logger.debug(f"Columna booleana detectada por nombre: '{nombre_columna}' (tipo: {tipo_nombre})")
                # Verificar también el tipo de datos de PostgreSQL
                if hasattr(tipo_col, 'type_affinity'):
                    try:
                        from sqlalchemy import Boolean
                        if isinstance(tipo_col, Boolean):
                            es_booleano = True
                            logger.debug(f"Columna booleana detectada por tipo SQLAlchemy: '{nombre_columna}'")
                    except:
                        pass
        
        if not mapeo_columnas:
            logger.error("No se encontraron columnas coincidentes")
            return 0, 0
        
        # Procesar filas y preparar datos para bulk insert
        filas_datos = []
        for fila in rows:
            try:
                datos = {}
                for i, valor in enumerate(fila):
                    if i < len(headers) and headers[i] in mapeo_columnas:
                        columna = mapeo_columnas[headers[i]]
                        # Convertir valor según el tipo de columna
                        tipo_columna = tipos_columnas.get(columna)
                        if tipo_columna:
                            try:
                                valor_convertido = convertir_valor_segun_tipo(valor, tipo_columna)
                                # Log de depuración para booleanos
                                if hasattr(tipo_columna, 'python_type') and tipo_columna.python_type == bool:
                                    logger.debug(f"Columna '{columna}': '{valor}' ({type(valor).__name__}) -> {valor_convertido} ({type(valor_convertido).__name__})")
                            except Exception as e:
                                logger.warning(f"Error convirtiendo valor '{valor}' para columna '{columna}': {e}")
                                valor_convertido = valor
                        else:
                            valor_convertido = valor
                        datos[columna] = valor_convertido
                
                if datos:
                    filas_datos.append(datos)
            except Exception as e:
                logger.warning(f"Error procesando fila: {e}")
                continue
        
        # Usar SQLAlchemy Core directamente pero con el mapper
        # Obtener la tabla de forma segura usando caché para evitar configurar relaciones
        from sqlalchemy import insert, select, update, MetaData
        
        if filas_datos:
            try:
                # Obtener nombre de tabla sin acceder al mapper
                tabla_nombre = obtener_nombre_tabla_seguro(model)
                
                # Usar caché para obtener la tabla sin disparar configuración del mapper
                if tabla_nombre not in _TABLES_CACHE:
                    # Obtener tabla directamente desde la metadata reflejada
                    # Esto evita acceder al mapper que puede disparar configuración de relaciones
                    metadata = MetaData()
                    metadata.reflect(bind=session.bind, only=[tabla_nombre])
                    _TABLES_CACHE[tabla_nombre] = metadata.tables[tabla_nombre]
                
                table = _TABLES_CACHE[tabla_nombre]
                
                if upsert:
                    # Para upsert, necesitamos procesar individualmente
                    for datos in filas_datos:
                        try:
                            # Buscar clave primaria
                            pk_column = None
                            for col in table.primary_key.columns:
                                if col.name in datos:
                                    pk_column = col.name
                                    break
                            
                            if pk_column and datos.get(pk_column):
                                # Verificar si existe usando select directo (Core, no ORM)
                                stmt_select = select(table).where(
                                    table.columns[pk_column] == datos[pk_column]
                                )
                                result = session.execute(stmt_select).first()
                                
                                if result:
                                    # Actualizar usando update directo (Core, no ORM)
                                    stmt_update = update(table).where(
                                        table.columns[pk_column] == datos[pk_column]
                                    ).values(**datos)
                                    session.execute(stmt_update)
                                    updated += 1
                                else:
                                    # Insertar usando insert directo (Core, no ORM)
                                    stmt_insert = insert(table).values(**datos)
                                    session.execute(stmt_insert)
                                    inserted += 1
                            else:
                                # No hay PK, insertar directamente
                                stmt_insert = insert(table).values(**datos)
                                session.execute(stmt_insert)
                                inserted += 1
                        except Exception as e:
                            logger.warning(f"Error procesando fila (upsert): {e}")
                            continue
                else:
                    # Usar insert() statements directamente (Core, no ORM)
                    # Insertar en lotes para mejor rendimiento
                    batch_size = 1000
                    for i in range(0, len(filas_datos), batch_size):
                        batch = filas_datos[i:i + batch_size]
                        # Filtrar None de las claves primarias para evitar SAWarning
                        # Si la PK tiene autoincrement en la BD, no necesita valor explícito
                        batch_clean = []
                        for row in batch:
                            row_clean = row.copy()
                            # Remover valores None de columnas PK que puedan tener autoincrement
                            for pk_col in table.primary_key.columns:
                                if pk_col.name in row_clean and row_clean[pk_col.name] is None:
                                    # Si la columna PK es None y puede tener autoincrement, removerla
                                    # La BD generará el valor automáticamente
                                    if pk_col.autoincrement or pk_col.server_default is not None:
                                        del row_clean[pk_col.name]
                            batch_clean.append(row_clean)
                        
                        stmt = insert(table).values(batch_clean)
                        result = session.execute(stmt)
                        inserted += len(batch_clean)
                
                session.commit()
                logger.info(f"Importación completada: {inserted} insertados, {updated} actualizados")
            except Exception as e:
                logger.error(f"Error en insert: {e}")
                session.rollback()
                raise
        else:
            logger.warning("No hay datos para importar")
        
    except Exception as e:
        logger.error(f"Error importando archivo: {e}")
        session.rollback()
        raise
    
    return inserted, updated


def _detectar_modelo_para_archivo(ruta_archivo: str, formato: str, tabla_cli: Optional[str]) -> Tuple[str, Any]:
    """
    Determina el modelo de destino para un archivo dado.

    Args:
        ruta_archivo: Ruta del archivo a importar.
        formato: Formato detectado del archivo (csv/xlsx).
        tabla_cli: Tabla proporcionada explícitamente por CLI.

    Returns:
        Tuple con (nombre_tabla, modelo_sqlalchemy).

    Raises:
        ValueError: Si no se puede determinar la tabla destino.
    """
    if tabla_cli:
        try:
            modelo = obtener_modelo(tabla_cli)
            return tabla_cli, modelo
        except Exception as exc:
            raise ValueError(f"No se pudo obtener el modelo para la tabla '{tabla_cli}': {exc}") from exc

    try:
        tipo_analisis = detectar_tipo_analisis_por_contenido(ruta_archivo)
    except Exception:
        tipo_analisis = None

    try:
        if formato == 'xlsx':
            headers, _ = read_rows_from_xlsx(ruta_archivo, max_rows=1)
        else:
            headers, _ = read_rows_from_csv(ruta_archivo, max_rows=1)
    except Exception as exc:
        raise ValueError(f"No se pudieron leer encabezados del archivo: {exc}") from exc

    if not headers:
        raise ValueError("El archivo no contiene encabezados para detectar la tabla destino")

    tabla_detectada = detectar_tabla_por_columnas(None, headers, tipo_analisis)
    if not tabla_detectada:
        raise ValueError("No se pudo detectar automáticamente la tabla destino. Especifica una con '--table'.")

    try:
        modelo = obtener_modelo(tabla_detectada)
    except Exception as exc:
        raise ValueError(f"No se pudo obtener el modelo para la tabla detectada '{tabla_detectada}': {exc}") from exc

    return tabla_detectada, modelo


def _procesar_archivo_cli(
    SessionFactory,
    ruta_archivo: str,
    tabla_cli: Optional[str],
    upsert: bool,
    keep_ids: bool,
) -> Dict[str, Any]:
    """Procesa un archivo desde CLI y retorna el resultado."""
    resultado = {
        "archivo": ruta_archivo,
        "tabla": None,
        "formato": None,
        "insertados": 0,
        "actualizados": 0,
        "upsert": upsert,
        "keep_ids": keep_ids,
        "exito": False,
        "mensaje": "",
    }

    if not os.path.exists(ruta_archivo):
        resultado["mensaje"] = "El archivo no existe"
        return resultado

    formato = detect_format_from_path(ruta_archivo)
    if not formato:
        resultado["mensaje"] = "Formato de archivo no soportado (use .csv, .xlsx o .xls)"
        return resultado

    resultado["formato"] = formato

    try:
        tabla_destino, modelo = _detectar_modelo_para_archivo(ruta_archivo, formato, tabla_cli)
        resultado["tabla"] = tabla_destino
    except ValueError as exc:
        resultado["mensaje"] = str(exc)
        return resultado

    session = SessionFactory()
    try:
        inserted, updated = import_one_file(session, modelo, ruta_archivo, formato, upsert=upsert, keep_ids=keep_ids)
        resultado["insertados"] = inserted
        resultado["actualizados"] = updated
        resultado["exito"] = True
        resultado["mensaje"] = "Importación completada"
    except Exception as exc:
        logger.error(f"Error importando '{ruta_archivo}': {exc}", exc_info=True)
        resultado["mensaje"] = f"Error importando archivo: {exc}"
    finally:
        session.close()

    return resultado


def main():
    """Entrada CLI para importar uno o varios archivos."""
    parser = argparse.ArgumentParser(
        description="Importa uno o varios archivos CSV/XLSX a la base de datos del proyecto INIA."
    )
    parser.add_argument(
        "files",
        nargs="+",
        help="Ruta(s) de archivos a importar (.csv, .xlsx, .xls).",
    )
    parser.add_argument(
        "--table",
        help="Nombre de la tabla destino. Si no se especifica se intentará detectar automáticamente.",
    )
    parser.add_argument(
        "--upsert",
        action="store_true",
        help="Actualiza los registros existentes coincidencia por clave primaria.",
    )
    parser.add_argument(
        "--keep-ids",
        action="store_true",
        help="Mantiene los IDs provistos en el archivo en lugar de generar nuevos.",
    )
    args = parser.parse_args()

    try:
        engine = obtener_engine()
        inicializar_automap(engine)
    except Exception as exc:
        logger.error(f"No se pudo inicializar la conexión a la base de datos: {exc}", exc_info=True)
        raise SystemExit(1) from exc

    SessionFactory = sessionmaker(bind=engine)

    resultados: List[Dict[str, Any]] = []
    for ruta in args.files:
        logger.info(f"Procesando archivo '{ruta}'...")
        resultado = _procesar_archivo_cli(SessionFactory, ruta, args.table, args.upsert, args.keep_ids)
        resultados.append(resultado)
        if resultado["exito"]:
            logger.info(
                f"  -> Tabla: {resultado['tabla']} | Insertados: {resultado['insertados']} | Actualizados: {resultado['actualizados']}"
            )
        else:
            logger.warning(f"  -> Falló: {resultado['mensaje']}")

    exitosos = [r for r in resultados if r["exito"]]
    fallidos = [r for r in resultados if not r["exito"]]

    print("\nResumen importación:")
    for res in resultados:
        estado = "OK" if res["exito"] else "ERROR"
        detalle = (
            f"{res['insertados']} insertados / {res['actualizados']} actualizados"
            if res["exito"]
            else res["mensaje"]
        )
        tabla = res["tabla"] or "desconocida"
        print(f" - [{estado}] {res['archivo']} -> tabla '{tabla}' ({detalle})")

    print(
        f"\nArchivos procesados: {len(resultados)} | Exitosos: {len(exitosos)} | Con error: {len(fallidos)}"
    )

    if fallidos:
        raise SystemExit(1)


if __name__ == "__main__":
    main()

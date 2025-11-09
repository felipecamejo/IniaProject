import os
import tempfile
import shutil
import zipfile
import logging
from typing import Dict, Any, Optional

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
from MassiveInsertFiles import insertar_1000_registros_principales, build_connection_string, create_engine, sessionmaker
from ExportExcel import export_selected_tables
from ImportExcel import import_one_file as py_import_one_file, MODELS as IMPORT_MODELS, detect_format_from_path, asegurar_autoincrementos
from sqlalchemy import text

# Configuración de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="INIA Python Middleware", version="1.0.0")


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
# ESTRUCTURA DE RESPUESTAS ESTÁNDAR
# ================================
def crear_respuesta_exito(mensaje: str, datos: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Crea una respuesta de éxito estructurada."""
    respuesta = {
        "exitoso": True,
        "mensaje": mensaje,
        "codigo": 200
    }
    if datos:
        respuesta["datos"] = datos
    return respuesta


def crear_respuesta_error(mensaje: str, codigo: int = 500, detalles: Optional[str] = None) -> Dict[str, Any]:
    """Crea una respuesta de error estructurada."""
    respuesta = {
        "exitoso": False,
        "mensaje": mensaje,
        "codigo": codigo
    }
    if detalles:
        respuesta["detalles"] = detalles
    return respuesta


class InsertRequest(BaseModel):
    # Por ahora solo gatillar la inserción masiva según lógica existente
    # Se puede extender con parámetros más adelante
    pass


@app.post("/insertar")
def insertar():
    """Endpoint para insertar datos masivos. Retorna respuesta estructurada con validaciones."""
    try:
        logger.info("Iniciando inserción masiva de datos...")
        
        # Validar conexión a base de datos antes de proceder
        try:
            conn_str = build_connection_string()
            engine = create_engine(conn_str)
            # Probar conexión
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Conexión a base de datos validada correctamente")
        except Exception as db_error:
            logger.error(f"Error validando conexión a base de datos: {db_error}")
            respuesta_error = crear_respuesta_error(
                mensaje="No se pudo conectar a la base de datos",
                codigo=500,
                detalles=str(db_error)
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
            detalles=str(e)
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
        
        # Validar conexión a base de datos
        try:
            conn_str = build_connection_string()
            engine = create_engine(conn_str)
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Conexión a base de datos validada correctamente")
        except Exception as db_error:
            logger.error(f"Error validando conexión a base de datos: {db_error}")
            respuesta_error = crear_respuesta_error(
                mensaje="No se pudo conectar a la base de datos",
                codigo=500,
                detalles=str(db_error)
            )
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
        tmp_dir = tempfile.mkdtemp(prefix="inia_export_")
        if not os.path.exists(tmp_dir):
            respuesta_error = crear_respuesta_error(
                mensaje="No se pudo crear directorio temporal",
                codigo=500,
                detalles="El sistema no pudo crear un directorio temporal para la exportación"
            )
            raise HTTPException(status_code=500, detail=respuesta_error)
        
        logger.info(f"Directorio temporal creado: {tmp_dir}")
        
        # Ejecutar exportación (incluyendo tablas sin PK por defecto)
        try:
            export_selected_tables(tablas_list, tmp_dir, formato, incluir_sin_pk=incluir_sin_pk)
        except Exception as export_error:
            logger.error(f"Error durante la exportación: {export_error}", exc_info=True)
            respuesta_error = crear_respuesta_error(
                mensaje="Error durante la exportación de tablas",
                codigo=500,
                detalles=str(export_error)
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


@app.post("/importar")
async def importar(
    table: str = Form(..., description="Tabla destino"),
    upsert: bool = Form(False),
    keep_ids: bool = Form(False),
    file: UploadFile = File(..., description="Archivo CSV/XLSX"),
):
    """Endpoint para importar archivos Excel/CSV a la base de datos. Retorna respuesta estructurada con validaciones."""
    tmp_path = None
    try:
        logger.info(f"Iniciando importación. Tabla: {table}, Upsert: {upsert}, Keep IDs: {keep_ids}")
        
        # Validar que se proporcionó el archivo
        if file is None:
            respuesta_error = crear_respuesta_error(
                mensaje="Archivo no proporcionado",
                codigo=400,
                detalles="Debe proporcionar un archivo para importar"
            )
            raise HTTPException(status_code=400, detail=respuesta_error)
        
        # Validar nombre de archivo
        if not file.filename:
            respuesta_error = crear_respuesta_error(
                mensaje="Nombre de archivo no válido",
                codigo=400,
                detalles="El archivo proporcionado no tiene un nombre válido"
            )
            raise HTTPException(status_code=400, detail=respuesta_error)
        
        logger.info(f"Archivo recibido: {file.filename}, Tamaño: {file.size if hasattr(file, 'size') else 'desconocido'}")
        
        # Validar tabla
        table_key = (table or "").strip().lower()
        if not table_key:
            respuesta_error = crear_respuesta_error(
                mensaje="Tabla no especificada",
                codigo=400,
                detalles="Debe especificar el nombre de la tabla destino"
            )
            raise HTTPException(status_code=400, detail=respuesta_error)
        
        model = IMPORT_MODELS.get(table_key)
        if not model:
            tablas_disponibles = list(IMPORT_MODELS.keys())
            respuesta_error = crear_respuesta_error(
                mensaje=f"Tabla desconocida: {table}",
                codigo=400,
                detalles=f"La tabla '{table}' no existe. Tablas disponibles: {', '.join(tablas_disponibles[:10])}{'...' if len(tablas_disponibles) > 10 else ''}"
            )
            raise HTTPException(status_code=400, detail=respuesta_error)
        
        logger.info(f"Tabla validada: {model.__tablename__}")
        
        # Guardar archivo temporalmente
        suffix = ""
        if file.filename:
            _, ext = os.path.splitext(file.filename)
            suffix = ext
        
        tmp_fd, tmp_path = tempfile.mkstemp(prefix="inia_import_", suffix=suffix)
        os.close(tmp_fd)
        
        try:
            # Leer y guardar contenido del archivo
            try:
                content = await file.read()
                if not content or len(content) == 0:
                    respuesta_error = crear_respuesta_error(
                        mensaje="Archivo vacío",
                        codigo=400,
                        detalles="El archivo proporcionado está vacío"
                    )
                    raise HTTPException(status_code=400, detail=respuesta_error)
                
                with open(tmp_path, "wb") as out:
                    out.write(content)
                logger.info(f"Archivo guardado temporalmente: {tmp_path}, Tamaño: {len(content)} bytes")
            except Exception as file_error:
                logger.error(f"Error guardando archivo temporal: {file_error}")
                respuesta_error = crear_respuesta_error(
                    mensaje="Error guardando archivo temporal",
                    codigo=500,
                    detalles=str(file_error)
                )
                raise HTTPException(status_code=500, detail=respuesta_error)

            # Validar formato del archivo
            fmt = detect_format_from_path(tmp_path)
            if fmt not in ("csv", "xlsx"):
                respuesta_error = crear_respuesta_error(
                    mensaje="Formato no soportado",
                    codigo=400,
                    detalles=f"El formato del archivo no es válido. Solo se aceptan archivos CSV o XLSX. Formato detectado: {fmt or 'desconocido'}"
                )
                raise HTTPException(status_code=400, detail=respuesta_error)
            
            logger.info(f"Formato de archivo validado: {fmt}")

            # Validar conexión a base de datos
            try:
                conn_str = build_connection_string()
                engine = create_engine(conn_str)
                with engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
                logger.info("Conexión a base de datos validada correctamente")
            except Exception as db_error:
                logger.error(f"Error validando conexión a base de datos: {db_error}")
                respuesta_error = crear_respuesta_error(
                    mensaje="No se pudo conectar a la base de datos",
                    codigo=500,
                    detalles=str(db_error)
                )
                raise HTTPException(status_code=500, detail=respuesta_error)

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
                    # Continuar aunque falle (no crítico para todas las tablas)

                # Ejecutar importación
                logger.info(f"Iniciando importación de {file.filename} a tabla {model.__tablename__}...")
                inserted, updated = py_import_one_file(session, model, tmp_path, fmt, upsert, keep_ids)
                
                logger.info(f"Importación completada. Insertados: {inserted}, Actualizados: {updated}")

                # Asegurar autoincrementos después de importar
                try:
                    asegurar_autoincrementos(engine)
                    logger.info("Secuencias sincronizadas después de importar")
                except Exception as seq_error:
                    logger.warning(f"Advertencia: No se pudieron sincronizar secuencias después de importar: {seq_error}")
                    # Continuar aunque falle

                # Retornar respuesta exitosa estructurada
                respuesta_exito = crear_respuesta_exito(
                    mensaje="Importación completada exitosamente",
                    datos={
                        "tabla": model.__tablename__,
                        "archivo": file.filename,
                        "formato": fmt,
                        "insertados": inserted,
                        "actualizados": updated,
                        "upsert": upsert,
                        "keep_ids": keep_ids
                    }
                )
                return JSONResponse(content=respuesta_exito, status_code=200)
                
            except Exception as import_error:
                logger.error(f"Error durante la importación: {import_error}", exc_info=True)
                respuesta_error = crear_respuesta_error(
                    mensaje="Error durante la importación de datos",
                    codigo=500,
                    detalles=str(import_error)
                )
                raise HTTPException(status_code=500, detail=respuesta_error)
            finally:
                session.close()
                
        finally:
            # Limpiar archivo temporal
            try:
                if tmp_path and os.path.exists(tmp_path):
                    os.remove(tmp_path)
                    logger.info(f"Archivo temporal eliminado: {tmp_path}")
            except Exception as cleanup_error:
                logger.warning(f"Advertencia: No se pudo eliminar archivo temporal {tmp_path}: {cleanup_error}")
                
    except HTTPException:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass
        raise
    except Exception as e:
        logger.error(f"Error inesperado durante importación: {e}", exc_info=True)
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass
        respuesta_error = crear_respuesta_error(
            mensaje="Error inesperado durante la importación",
            codigo=500,
            detalles=str(e)
        )
        raise HTTPException(status_code=500, detail=respuesta_error)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PY_MIDDLEWARE_PORT", "9099")))



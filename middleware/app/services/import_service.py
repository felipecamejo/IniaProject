"""
Servicio de importación de datos.
Maneja la lógica de importación de archivos CSV/XLSX a la base de datos.
"""
import os
import tempfile
import logging
from typing import Dict, Any, Optional
from fastapi import UploadFile
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from database_config import build_connection_string
from ImportExcel import (
    import_one_file as py_import_one_file,
    MODELS as IMPORT_MODELS,
    inicializar_automap,
    detect_format_from_path,
    asegurar_autoincrementos,
    detectar_tabla_por_columnas,
    detectar_tipo_analisis_por_contenido,
    read_rows_from_xlsx,
    read_rows_from_csv,
    normalize_header_names
)
from app.core.responses import obtener_mensaje_error_seguro
from app.core.security import db_circuit_breaker
from app.services.database_service import obtener_nombre_tabla_seguro
from app.services.file_service import safe_remove_file, validar_tamaño_archivo
from app.config import MAX_FILE_SIZE

logger = logging.getLogger(__name__)


async def procesar_un_archivo(
    file: UploadFile,
    table: Optional[str],
    upsert: bool,
    keep_ids: bool
) -> Dict[str, Any]:
    """
    Procesa un archivo individual: lo guarda temporalmente, detecta la tabla automáticamente
    si es necesario, y lo importa a la base de datos.
    
    Retorna un diccionario con el resultado del procesamiento.
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
                    mensaje_error = (
                        f"No se pudieron leer encabezados válidos del archivo '{file.filename}'. "
                        f"Headers totales encontrados: {len(headers)}, Headers válidos: {len(headers_validos)}. "
                        f"El archivo debe contener una fila de encabezados con nombres de columnas válidos."
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
                    # Estrategia de detección en cascada
                    tipo_analisis = None
                    try:
                        tipo_analisis = detectar_tipo_analisis_por_contenido(tmp_path)
                        if tipo_analisis:
                            logger.info(f"Tipo de análisis detectado por contenido: {tipo_analisis}")
                    except Exception as tipo_error:
                        logger.warning(f"Error detectando tipo de análisis por contenido: {tipo_error}")
                    
                    # Detectar tabla por columnas
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
                        sugerencias = []
                        if tipo_analisis:
                            try:
                                from metadata_config import ANALYSIS_TYPE_TO_TABLES
                                if tipo_analisis in ANALYSIS_TYPE_TO_TABLES:
                                    sugerencias = ANALYSIS_TYPE_TO_TABLES[tipo_analisis]
                            except ImportError:
                                pass
                        
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


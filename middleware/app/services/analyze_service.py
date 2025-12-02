"""
Servicio de análisis de archivos Excel.
Maneja la lógica de análisis y mapeo de datos de archivos Excel.
"""
import os
import tempfile
import logging
from typing import Dict, Any
from fastapi import UploadFile, HTTPException
from AnalizedExcel import analizar_estructura_excel, generar_mapeo_datos
from ContrastDatabase import contrastar_mapeo_con_bd
from app.core.responses import crear_respuesta_error, crear_respuesta_exito, obtener_mensaje_error_seguro
from app.services.file_service import safe_remove_file, validar_tamaño_archivo
from app.config import MAX_FILE_SIZE

logger = logging.getLogger(__name__)


async def analizar_archivo_excel(
    file: UploadFile,
    formato: str,
    contrastar_bd: bool,
    umbral_coincidencia: float,
    request_id: str
) -> Dict[str, Any]:
    """
    Analiza un archivo Excel y genera un mapeo de datos contrastado con la base de datos.
    
    Retorna un diccionario con el mapeo completo.
    """
    tmp_path = None
    try:
        # Validar que el archivo tiene nombre
        if not file.filename:
            respuesta_error = crear_respuesta_error(
                mensaje="Nombre de archivo no proporcionado",
                codigo=400,
                detalles="El archivo debe tener un nombre válido"
            )
            raise HTTPException(status_code=400, detail=respuesta_error)
        
        logger.info(f"[{request_id}] Iniciando análisis de Excel: {file.filename}")
        
        # Validar extensión del archivo
        _, ext = os.path.splitext(file.filename)
        if ext.lower() not in ('.xlsx', '.xls'):
            respuesta_error = crear_respuesta_error(
                mensaje="Formato de archivo no válido",
                codigo=400,
                detalles=f"El archivo debe ser un Excel (.xlsx o .xls). Formato recibido: {ext}"
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
            logger.info(f"[{request_id}] Iniciando análisis de estructura del Excel: {file.filename}")
            
            # Analizar estructura del Excel
            estructura = analizar_estructura_excel(tmp_path)
            logger.info(f"[{request_id}] Estructura analizada: {len(estructura['hojas'])} hojas encontradas")
            
            for hoja in estructura['hojas']:
                logger.info(f"  - Hoja '{hoja['nombre']}': {hoja['total_columnas']} columnas, {hoja['total_filas']} filas")
            
            # Generar mapeo de datos
            logger.info(f"[{request_id}] Generando mapeo de datos...")
            mapeo = generar_mapeo_datos(estructura)
            logger.info(f"[{request_id}] Mapeo generado: {len(mapeo['hojas'])} hojas mapeadas")
            
            # Log detallado del mapeo
            for hoja in mapeo['hojas']:
                logger.info(f"  Hoja '{hoja['nombre']}':")
                for entidad_nombre, entidad_info in hoja['entidades'].items():
                    logger.info(f"    - Entidad '{entidad_nombre}': {entidad_info['total_columnas']} columnas")
                    for col in entidad_info['columnas'][:5]:  # Solo primeras 5 columnas en log
                        logger.info(f"      * {col['nombre']}: {', '.join(col['tipo_datos'])} ({col['valores_nulos']} nulos)")
            
            # Contrastar con base de datos si está habilitado
            if contrastar_bd:
                try:
                    logger.info(f"[{request_id}] Contrastando mapeo con base de datos...")
                    mapeo_contrastado = contrastar_mapeo_con_bd(mapeo, umbral_minimo=umbral_coincidencia)
                    logger.info(f"[{request_id}] Contraste completado: {mapeo_contrastado['resumen'].get('entidades_con_tabla_bd', 0)}/{mapeo_contrastado['resumen'].get('total_entidades', 0)} entidades mapeadas a tablas BD")
                    
                    # Log detallado del contraste
                    for hoja in mapeo_contrastado['hojas']:
                        logger.info(f"  Hoja '{hoja['nombre']}':")
                        for entidad_nombre, entidad_info in hoja['entidades'].items():
                            tabla_bd = entidad_info.get('tabla_bd')
                            porcentaje = entidad_info.get('porcentaje_coincidencia', 0.0)
                            if tabla_bd:
                                logger.info(f"    - Entidad '{entidad_nombre}' -> Tabla BD: {tabla_bd} ({porcentaje}% coincidencia)")
                            else:
                                logger.warning(f"    - Entidad '{entidad_nombre}' -> No se encontró tabla BD con coincidencia suficiente")
                    
                    # Usar mapeo contrastado
                    mapeo = mapeo_contrastado
                except Exception as contraste_error:
                    logger.warning(f"Error contrastando con BD: {contraste_error}. Continuando con mapeo sin contraste...")
                    # Continuar con el mapeo original si falla el contraste
                    mapeo['resumen']['contraste_bd'] = False
                    mapeo['resumen']['error_contraste'] = str(contraste_error)
            else:
                logger.info("Contraste con BD deshabilitado")
                mapeo['resumen']['contraste_bd'] = False
            
            # Preparar respuesta según formato
            if formato == "texto":
                # Para formato texto, crear una representación legible
                respuesta_texto = {
                    "archivo": mapeo['archivo'],
                    "ruta": mapeo['ruta'],
                    "resumen": mapeo['resumen'],
                    "hojas": []
                }
                
                # Agregar información de contraste si está disponible
                if 'contraste_bd' in mapeo['resumen']:
                    respuesta_texto['resumen']['contraste_bd'] = mapeo['resumen'].get('contraste_bd', False)
                    if mapeo['resumen'].get('contraste_bd', False):
                        respuesta_texto['resumen']['entidades_con_tabla_bd'] = mapeo['resumen'].get('entidades_con_tabla_bd', 0)
                        respuesta_texto['resumen']['entidades_sin_tabla_bd'] = mapeo['resumen'].get('entidades_sin_tabla_bd', 0)
                        respuesta_texto['resumen']['porcentaje_mapeo_exitoso'] = mapeo['resumen'].get('porcentaje_mapeo_exitoso', 0.0)
                        respuesta_texto['resumen']['tablas_bd_disponibles'] = mapeo['resumen'].get('tablas_bd_disponibles', 0)
                
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
                        
                        # Agregar información de contraste con BD si está disponible
                        if 'tabla_bd' in entidad_info:
                            entidad_texto['tabla_bd'] = entidad_info.get('tabla_bd')
                            entidad_texto['porcentaje_coincidencia'] = entidad_info.get('porcentaje_coincidencia', 0.0)
                            entidad_texto['coincidencia_encontrada'] = entidad_info.get('coincidencia_encontrada', False)
                            if entidad_info.get('detalles_coincidencia'):
                                detalles = entidad_info['detalles_coincidencia']
                                entidad_texto['detalles_coincidencia'] = {
                                    'columnas_coincidentes': detalles.get('columnas_coincidentes', []),
                                    'columnas_no_coincidentes': detalles.get('columnas_no_coincidentes', []),
                                    'total_coincidencias': detalles.get('total_coincidencias', 0)
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
                
                mensaje = "Análisis de Excel completado exitosamente"
                if mapeo['resumen'].get('contraste_bd', False):
                    entidades_con_tabla = mapeo['resumen'].get('entidades_con_tabla_bd', 0)
                    total_entidades = mapeo['resumen'].get('total_entidades', 0)
                    mensaje += f". {entidades_con_tabla}/{total_entidades} entidades mapeadas a tablas BD"
                
                return crear_respuesta_exito(mensaje=mensaje, datos=respuesta_texto)
            else:
                # Formato JSON completo
                mensaje = "Análisis de Excel completado exitosamente"
                if mapeo['resumen'].get('contraste_bd', False):
                    entidades_con_tabla = mapeo['resumen'].get('entidades_con_tabla_bd', 0)
                    total_entidades = mapeo['resumen'].get('total_entidades', 0)
                    mensaje += f". {entidades_con_tabla}/{total_entidades} entidades mapeadas a tablas BD"
                
                return crear_respuesta_exito(mensaje=mensaje, datos=mapeo)
            
        except FileNotFoundError as fnf_error:
            logger.error(f"[{request_id}] Archivo no encontrado: {fnf_error}", exc_info=True)
            respuesta_error = crear_respuesta_error(
                mensaje="Archivo no encontrado",
                codigo=404,
                detalles=f"El archivo temporal no se encontró: {str(fnf_error)}"
            )
            if tmp_path:
                safe_remove_file(tmp_path)
            raise HTTPException(status_code=404, detail=respuesta_error)
        except Exception as analisis_error:
            logger.error(f"[{request_id}] Error durante el análisis: {analisis_error}", exc_info=True)
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
        logger.error(f"[{request_id}] Error inesperado durante análisis: {e}", exc_info=True)
        if tmp_path:
            safe_remove_file(tmp_path)
        respuesta_error = crear_respuesta_error(
            mensaje="Error inesperado durante el análisis",
            codigo=500,
            detalles=obtener_mensaje_error_seguro(e, "Error inesperado")
        )
        raise HTTPException(status_code=500, detail=respuesta_error)


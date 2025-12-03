"""
Endpoint de importación de datos.
"""
import asyncio
import logging
from typing import List, Dict, Any
from fastapi import Request, APIRouter, Form, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
from app.core.responses import crear_respuesta_exito, crear_respuesta_error, obtener_mensaje_error_seguro
from app.services.import_service import procesar_un_archivo
from app.services.file_service import validar_cantidad_archivos
from app.config import MAX_FILE_SIZE, MAX_TOTAL_FILES_SIZE, MAX_IMPORT_FILES
from ImportExcel import MODELS as IMPORT_MODELS, inicializar_automap
from app.services.database_service import create_engine_with_pool

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/importar", tags=["Importación"], summary="Importar archivos",
         description="Endpoint para importar archivos Excel/CSV a la base de datos")
async def importar(
    request: Request,
    table: Optional[str] = Form(None, description="Tabla destino (opcional, se detecta automáticamente)"),
    upsert: bool = Form(False),
    keep_ids: bool = Form(False),
    file: Optional[UploadFile] = File(None, description="Archivo CSV/XLSX (opcional)"),
    files: Optional[List[UploadFile]] = File(None, description="Archivos CSV/XLSX (opcional)"),
):
    """Endpoint para importar archivos Excel/CSV a la base de datos. Acepta un archivo o múltiples archivos."""
    request_id = getattr(request.state, "request_id", "unknown")
    try:
        logger.info(f"[{request_id}] Iniciando importación. Tabla: {table}, Upsert: {upsert}, Keep IDs: {keep_ids}")
        
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
            
            # Validar tamaño del archivo
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
        
        logger.info(f"[{request_id}] Archivos recibidos: {len(archivos_lista)} archivo(s)")
        for i, archivo in enumerate(archivos_lista, 1):
            logger.info(f"[{request_id}]   {i}. {archivo.filename}, Tamaño: {archivo.size if hasattr(archivo, 'size') else 'desconocido'}")
        
        # Inicializar modelos si no están inicializados (una sola vez)
        if not IMPORT_MODELS:
            logger.info(f"[{request_id}] Inicializando modelos de la base de datos...")
            try:
                engine_init = create_engine_with_pool()
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
            logger.info(f"[{request_id}] Procesando un solo archivo...")
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
        logger.info(f"[{request_id}] Procesando {len(archivos_lista)} archivos en paralelo (lotes de 25)...")
        
        resultados: List[Dict[str, Any]] = []
        errores: List[Dict[str, Any]] = []
        resumen_por_tabla: Dict[str, Dict[str, Any]] = {}
        
        # Procesar archivos en lotes de 25
        lote_size = 25
        for i in range(0, len(archivos_lista), lote_size):
            lote = archivos_lista[i:i + lote_size]
            logger.info(f"[{request_id}] Procesando lote {i // lote_size + 1} ({len(lote)} archivos)...")
            
            # Procesar lote en paralelo
            tareas = [procesar_un_archivo(archivo, table, upsert, keep_ids) for archivo in lote]
            
            # Ejecutar lote async
            try:
                resultados_lote = await asyncio.gather(*tareas, return_exceptions=True)
            except Exception as lote_error:
                logger.error(f"Error procesando lote: {lote_error}", exc_info=True)
                resultados_lote = []
            
            # Procesar resultados del lote
            for idx, resultado in enumerate(resultados_lote):
                archivo = lote[idx]
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
        request_id = getattr(request.state, "request_id", "unknown")
        logger.error(f"[{request_id}] Error inesperado durante importación: {e}", exc_info=True)
        respuesta_error = crear_respuesta_error(
            mensaje="Error inesperado durante la importación",
            codigo=500,
            detalles=obtener_mensaje_error_seguro(e, "Error inesperado")
        )
        raise HTTPException(status_code=500, detail=respuesta_error)


"""
Endpoint de exportación de datos.
"""
import os
import shutil
import tempfile
import logging
from fastapi import Request, APIRouter, Query, HTTPException
from fastapi.responses import Response
from typing import Optional
from app.core.responses import crear_respuesta_error
from app.services.export_service import (
    validar_fechas,
    validar_conexion_bd,
    exportar_con_filtros,
    exportar_tradicional,
    exportar_por_lote,
    crear_zip_exportacion
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/exportar", tags=["Exportación"], summary="Exportar tablas",
         description="Endpoint para exportar tablas a Excel. Retorna archivo ZIP")
async def exportar(
    request: Request,
    tablas: str = Query(default="", description="Lista separada por comas de tablas a exportar"),
    formato: str = Query(default="xlsx", pattern="^(xlsx|csv)$"),
    incluir_sin_pk: bool = Query(default=True, description="Incluir tablas sin Primary Key"),
    analisis_ids: Optional[str] = Query(
        default=None,
        description="IDs de análisis a exportar. Formato: 'tipo:id1,id2;tipo2:id3,id4'"
    ),
    fecha_desde: Optional[str] = Query(
        default=None,
        description="Fecha de inicio del rango (formato: YYYY-MM-DD)"
    ),
    fecha_hasta: Optional[str] = Query(
        default=None,
        description="Fecha de fin del rango (formato: YYYY-MM-DD)"
    ),
    campo_fecha: Optional[str] = Query(
        default="auto",
        description="Campo de fecha a usar para filtrado"
    ),
):
    """Endpoint para exportar tablas a Excel. Retorna archivo ZIP con validaciones y mensajes estructurados."""
    request_id = getattr(request.state, "request_id", "unknown")
    tmp_dir = None
    try:
        logger.info(f"[{request_id}] Iniciando exportación de tablas. Formato: {formato}, Incluir sin PK: {incluir_sin_pk}")
        
        # Validar parámetros de fecha ANTES de conectar a BD (validación rápida)
        if fecha_desde or fecha_hasta:
            try:
                validar_fechas(fecha_desde, fecha_hasta)
            except HTTPException:
                raise
        
        # Validar conexión a base de datos con circuit breaker
        validar_conexion_bd(request_id)
        
        # Crear directorio temporal
        try:
            tmp_dir = tempfile.mkdtemp(prefix="inia_export_")
            logger.info(f"[{request_id}] Directorio temporal creado: {tmp_dir}")
        except Exception as dir_error:
            respuesta_error = crear_respuesta_error(
                mensaje="No se pudo crear directorio temporal",
                codigo=500,
                detalles=f"Error al crear directorio temporal: {str(dir_error)}"
            )
            raise HTTPException(status_code=500, detail=respuesta_error)
        
        # Determinar si usar exportación con filtros o exportación tradicional
        usar_filtros = analisis_ids or fecha_desde or fecha_hasta
        
        if usar_filtros:
            # Exportación con filtros (análisis individuales)
            try:
                files_generated = exportar_con_filtros(
                    request_id=request_id,
                    tmp_dir=tmp_dir,
                    analisis_ids=analisis_ids,
                    fecha_desde=fecha_desde,
                    fecha_hasta=fecha_hasta,
                    campo_fecha=campo_fecha,
                    formato=formato,
                    tablas=tablas
                )
                logger.info(f"[{request_id}] Se generaron {len(files_generated)} archivo(s) con filtros")
            except HTTPException:
                if tmp_dir:
                    shutil.rmtree(tmp_dir, ignore_errors=True)
                raise
        else:
            # Exportación tradicional (sin filtros)
            try:
                files_generated = exportar_tradicional(
                    request_id=request_id,
                    tmp_dir=tmp_dir,
                    tablas=tablas,
                    formato=formato,
                    incluir_sin_pk=incluir_sin_pk
                )
                logger.info(f"[{request_id}] Se generaron {len(files_generated)} archivo(s) de exportación")
            except HTTPException:
                if tmp_dir:
                    shutil.rmtree(tmp_dir, ignore_errors=True)
                raise
        
        # Verificar que se generaron archivos
        files_generated = [f for f in os.listdir(tmp_dir) if f.endswith(('.xlsx', '.csv'))]
        if not files_generated:
            respuesta_error = crear_respuesta_error(
                mensaje="No se generaron archivos de exportación",
                codigo=500,
                detalles=f"No se generaron archivos en el directorio temporal"
            )
            shutil.rmtree(tmp_dir, ignore_errors=True)
            raise HTTPException(status_code=500, detail=respuesta_error)
        
        # Crear ZIP y obtener bytes
        zip_bytes = crear_zip_exportacion(tmp_dir, request_id)
        
        logger.info(f"[{request_id}] Exportación completada exitosamente. Tamaño del ZIP: {len(zip_bytes)} bytes, {len(files_generated)} archivo(s)")
        
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
        request_id = getattr(request.state, "request_id", "unknown")
        logger.error(f"[{request_id}] Error inesperado durante exportación: {e}", exc_info=True)
        if tmp_dir:
            shutil.rmtree(tmp_dir, ignore_errors=True)
        respuesta_error = crear_respuesta_error(
            mensaje="Error inesperado durante la exportación",
            codigo=500,
            detalles=str(e)
        )
        raise HTTPException(status_code=500, detail=respuesta_error)


@router.post("/exportar-lote/{lote_id}", tags=["Exportación"], summary="Quick Export por Lote",
         description="Endpoint para exportar rápidamente todos los análisis asociados a un lote. Retorna archivo ZIP")
async def exportar_por_lote_id(
    request: Request,
    lote_id: int,
    formato: str = Query(default="xlsx", pattern="^(xlsx|csv)$"),
):
    """Endpoint para exportar todos los análisis asociados a un lote específico. Retorna archivo ZIP."""
    request_id = getattr(request.state, "request_id", "unknown")
    tmp_dir = None
    try:
        logger.info(f"[{request_id}] Iniciando quick export para lote {lote_id}. Formato: {formato}")
        
        # Validar conexión a base de datos con circuit breaker
        validar_conexion_bd(request_id)
        
        # Crear directorio temporal
        try:
            tmp_dir = tempfile.mkdtemp(prefix="inia_export_lote_")
            logger.info(f"[{request_id}] Directorio temporal creado: {tmp_dir}")
        except Exception as dir_error:
            respuesta_error = crear_respuesta_error(
                mensaje="No se pudo crear directorio temporal",
                codigo=500,
                detalles=f"Error al crear directorio temporal: {str(dir_error)}"
            )
            raise HTTPException(status_code=500, detail=respuesta_error)
        
        # Exportar análisis del lote
        try:
            files_generated = exportar_por_lote(
                request_id=request_id,
                tmp_dir=tmp_dir,
                lote_id=lote_id,
                formato=formato
            )
            logger.info(f"[{request_id}] Se generaron {len(files_generated)} archivo(s) para lote {lote_id}")
        except HTTPException:
            if tmp_dir:
                shutil.rmtree(tmp_dir, ignore_errors=True)
            raise
        
        # Verificar que se generaron archivos
        files_generated = [f for f in os.listdir(tmp_dir) if f.endswith(('.xlsx', '.csv'))]
        if not files_generated:
            respuesta_error = crear_respuesta_error(
                mensaje="No se generaron archivos de exportación",
                codigo=404,
                detalles=f"No se encontraron análisis asociados al lote {lote_id}"
            )
            shutil.rmtree(tmp_dir, ignore_errors=True)
            raise HTTPException(status_code=404, detail=respuesta_error)
        
        # Crear ZIP y obtener bytes
        zip_bytes = crear_zip_exportacion(tmp_dir, request_id)
        
        logger.info(f"[{request_id}] Quick export completado exitosamente para lote {lote_id}. Tamaño del ZIP: {len(zip_bytes)} bytes, {len(files_generated)} archivo(s)")
        
        # Limpiar archivos temporales
        shutil.rmtree(tmp_dir, ignore_errors=True)
        
        # Devolver el archivo ZIP como respuesta binaria
        return Response(
            content=zip_bytes,
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename=lote_{lote_id}_export.zip"}
        )
        
    except HTTPException:
        if tmp_dir:
            shutil.rmtree(tmp_dir, ignore_errors=True)
        raise
    except Exception as e:
        request_id = getattr(request.state, "request_id", "unknown")
        logger.error(f"[{request_id}] Error inesperado durante quick export: {e}", exc_info=True)
        if tmp_dir:
            shutil.rmtree(tmp_dir, ignore_errors=True)
        respuesta_error = crear_respuesta_error(
            mensaje="Error inesperado durante la exportación",
            codigo=500,
            detalles=str(e)
        )
        raise HTTPException(status_code=500, detail=respuesta_error)


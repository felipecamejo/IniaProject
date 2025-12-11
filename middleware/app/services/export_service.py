"""
Servicio de exportación de datos.
Maneja la lógica de exportación de tablas y análisis filtrados.
"""
import os
import shutil
import tempfile
import zipfile
import logging
from datetime import datetime as dt
from typing import Optional, List
from fastapi import HTTPException
from sqlalchemy.orm import sessionmaker
from ExportExcel import (
    export_selected_tables,
    export_analisis_filtrados,
    export_analisis_por_lote,
    parsear_analisis_ids,
    obtener_engine,
    inicializar_automap,
    MODELS
)
from app.core.responses import crear_respuesta_error, obtener_mensaje_error_seguro
from app.core.security import db_circuit_breaker
from database_config import build_connection_string
from sqlalchemy import create_engine, text

logger = logging.getLogger(__name__)


def validar_fechas(fecha_desde: Optional[str], fecha_hasta: Optional[str]) -> tuple:
    """
    Valida y parsea fechas de exportación.
    Retorna tupla (fecha_desde_obj, fecha_hasta_obj) o lanza HTTPException.
    """
    fecha_desde_obj = None
    fecha_hasta_obj = None
    
    if fecha_desde:
        try:
            fecha_desde_obj = dt.strptime(fecha_desde, "%Y-%m-%d").date()
        except ValueError:
            respuesta_error = crear_respuesta_error(
                mensaje="Formato de fecha inválido",
                codigo=400,
                detalles=f"fecha_desde debe estar en formato YYYY-MM-DD. Valor recibido: {fecha_desde}"
            )
            raise HTTPException(status_code=400, detail=respuesta_error)
    
    if fecha_hasta:
        try:
            fecha_hasta_obj = dt.strptime(fecha_hasta, "%Y-%m-%d").date()
        except ValueError:
            respuesta_error = crear_respuesta_error(
                mensaje="Formato de fecha inválido",
                codigo=400,
                detalles=f"fecha_hasta debe estar en formato YYYY-MM-DD. Valor recibido: {fecha_hasta}"
            )
            raise HTTPException(status_code=400, detail=respuesta_error)
    
    # Validar rango de fechas
    if fecha_desde_obj and fecha_hasta_obj and fecha_desde_obj > fecha_hasta_obj:
        respuesta_error = crear_respuesta_error(
            mensaje="Rango de fechas inválido",
            codigo=400,
            detalles="fecha_desde debe ser anterior o igual a fecha_hasta"
        )
        raise HTTPException(status_code=400, detail=respuesta_error)
    
    return fecha_desde_obj, fecha_hasta_obj


def validar_conexion_bd(request_id: str):
    """Valida la conexión a la base de datos usando circuit breaker."""
    try:
        def test_db_connection():
            conn_str = build_connection_string()
            engine = create_engine(conn_str)
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
        
        db_circuit_breaker.call(test_db_connection)
        logger.info(f"[{request_id}] Conexión a base de datos validada correctamente")
    except RuntimeError as cb_error:
        logger.error(f"[{request_id}] Circuit breaker bloqueando conexión a BD: {cb_error}")
        respuesta_error = crear_respuesta_error(
            mensaje="Servicio de base de datos temporalmente no disponible",
            codigo=503,
            detalles="El servicio de base de datos está temporalmente no disponible. Intente más tarde."
        )
        raise HTTPException(status_code=503, detail=respuesta_error)
    except Exception as db_error:
        logger.error(f"[{request_id}] Error validando conexión a base de datos: {db_error}", exc_info=True)
        respuesta_error = crear_respuesta_error(
            mensaje="No se pudo conectar a la base de datos",
            codigo=500,
            detalles=obtener_mensaje_error_seguro(db_error, "Error de conexión")
        )
        raise HTTPException(status_code=500, detail=respuesta_error)


def exportar_con_filtros(
    request_id: str,
    tmp_dir: str,
    analisis_ids: Optional[str],
    fecha_desde: Optional[str],
    fecha_hasta: Optional[str],
    campo_fecha: str,
    formato: str,
    tablas: str
) -> List[str]:
    """
    Exporta análisis con filtros (IDs y/o fechas).
    Retorna lista de archivos generados.
    """
    # Parsear IDs de análisis si se proporcionan
    analisis_ids_dict = None
    if analisis_ids:
        analisis_ids_dict = parsear_analisis_ids(analisis_ids)
        logger.info(f"[{request_id}] IDs de análisis parseados: {analisis_ids_dict}")
    
    # Parsear fechas (ya validadas)
    fecha_desde_obj, fecha_hasta_obj = validar_fechas(fecha_desde, fecha_hasta)
    
    # Determinar tipos de análisis a exportar
    if analisis_ids_dict:
        tipos_analisis = list(analisis_ids_dict.keys())
    elif tablas:
        tipos_analisis = [t.strip().lower() for t in tablas.split(",") if t.strip()]
    else:
        # Si no se especifica, usar todos los tipos disponibles
        tipos_analisis = ['dosn', 'pureza', 'germinacion', 'pms', 'sanitario', 'tetrazolio', 'pureza_pnotatum']
        # Filtrar solo los que existen en MODELS
        tipos_analisis = [t for t in tipos_analisis if t in MODELS or f"{t}_id" in str(MODELS)]
    
    logger.info(f"[{request_id}] Exportando análisis con filtros. Tipos: {tipos_analisis}")
    
    # Inicializar engine y sesión
    engine = obtener_engine()
    inicializar_automap(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Ejecutar exportación con filtros
        archivos_generados = export_analisis_filtrados(
            session=session,
            tipos_analisis=tipos_analisis,
            analisis_ids=analisis_ids_dict,
            fecha_desde=fecha_desde_obj,
            fecha_hasta=fecha_hasta_obj,
            campo_fecha=campo_fecha if campo_fecha != "auto" else None,
            output_dir=tmp_dir,
            fmt=formato
        )
        
        if not archivos_generados:
            respuesta_error = crear_respuesta_error(
                mensaje="No se generaron archivos de exportación",
                codigo=500,
                detalles="No se encontraron análisis que cumplan los criterios especificados"
            )
            raise HTTPException(status_code=500, detail=respuesta_error)
        
        return [os.path.basename(f) for f in archivos_generados]
    finally:
        session.close()


def exportar_tradicional(
    request_id: str,
    tmp_dir: str,
    tablas: str,
    formato: str,
    incluir_sin_pk: bool
) -> List[str]:
    """
    Exporta tablas de forma tradicional (sin filtros).
    Por defecto exporta todos los análisis, lote y recibos asociados (excluyendo certificado).
    Retorna lista de nombres de archivos generados.
    """
    # Procesar lista de tablas
    tablas_list = [t.strip() for t in tablas.split(",") if t.strip()] if tablas else []
    if not tablas_list:
        # Inicializar MODELS primero para poder verificar qué tablas están disponibles
        engine = obtener_engine()
        inicializar_automap(engine)
        
        # Por defecto exportar todos los análisis, lote y recibos (excluyendo certificado)
        tablas_analisis = ['dosn', 'pureza', 'germinacion', 'pms', 'sanitario', 'tetrazolio', 'pureza_pnotatum']
        tablas_principales = ['lote', 'recibo']
        
        # Filtrar solo las tablas que existen en MODELS y excluir certificado
        tablas_disponibles = set(MODELS.keys())
        tablas_a_exportar = []
        
        # Agregar análisis disponibles
        for tabla in tablas_analisis:
            if tabla in tablas_disponibles:
                tablas_a_exportar.append(tabla)
        
        # Agregar lote y recibo si están disponibles
        for tabla in tablas_principales:
            if tabla in tablas_disponibles:
                tablas_a_exportar.append(tabla)
        
        # Excluir certificado explícitamente
        tablas_a_exportar = [t for t in tablas_a_exportar if t.lower() != 'certificado']
        
        tablas_list = tablas_a_exportar
        logger.info(f"[{request_id}] No se especificaron tablas, exportando análisis, lote y recibos (excluyendo certificado): {len(tablas_list)} tablas")
        logger.info(f"[{request_id}] Tablas a exportar: {', '.join(tablas_list)}")
    else:
        # Si se especifican tablas, excluir certificado explícitamente
        tablas_list = [t for t in tablas_list if t.lower() != 'certificado']
        logger.info(f"[{request_id}] Exportando {len(tablas_list)} tabla(s) especificada(s): {', '.join(tablas_list)}")
    
    # Ejecutar exportación (incluyendo tablas sin PK por defecto)
    try:
        export_selected_tables(tablas_list, tmp_dir, formato, incluir_sin_pk=incluir_sin_pk)
    except Exception as export_error:
        logger.error(f"[{request_id}] Error durante la exportación: {export_error}", exc_info=True)
        respuesta_error = crear_respuesta_error(
            mensaje="Error durante la exportación de tablas",
            codigo=500,
            detalles=obtener_mensaje_error_seguro(export_error, "Error durante la exportación")
        )
        raise HTTPException(status_code=500, detail=respuesta_error)
    
    # Verificar que se generaron archivos
    files_generated = [f for f in os.listdir(tmp_dir) if f.endswith(('.xlsx', '.csv'))]
    if not files_generated:
        respuesta_error = crear_respuesta_error(
            mensaje="No se generaron archivos de exportación",
            codigo=500,
            detalles=f"No se generaron archivos en el directorio temporal. Tablas solicitadas: {', '.join(tablas_list)}"
        )
        raise HTTPException(status_code=500, detail=respuesta_error)
    
    return files_generated


def crear_zip_exportacion(tmp_dir: str, request_id: str) -> bytes:
    """
    Crea un archivo ZIP con los archivos de exportación.
    Retorna los bytes del archivo ZIP.
    """
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
        logger.error(f"[{request_id}] Error creando archivo ZIP: {zip_error}")
        respuesta_error = crear_respuesta_error(
            mensaje="No se pudo crear archivo ZIP",
            codigo=500,
            detalles=str(zip_error)
        )
        raise HTTPException(status_code=500, detail=respuesta_error)
    
    # Verificar que el zip se creó
    if not os.path.exists(zip_path):
        respuesta_error = crear_respuesta_error(
            mensaje="No se pudo crear archivo ZIP",
            codigo=500,
            detalles="El archivo ZIP no se generó correctamente"
        )
        raise HTTPException(status_code=500, detail=respuesta_error)
    
    # Leer el archivo zip como bytes
    try:
        with open(zip_path, "rb") as f:
            zip_bytes = f.read()
    except Exception as read_error:
        logger.error(f"[{request_id}] Error leyendo archivo ZIP: {read_error}")
        respuesta_error = crear_respuesta_error(
            mensaje="Error leyendo archivo ZIP generado",
            codigo=500,
            detalles=str(read_error)
        )
        raise HTTPException(status_code=500, detail=respuesta_error)
    
    # Verificar que el ZIP no esté vacío
    if len(zip_bytes) == 0:
        respuesta_error = crear_respuesta_error(
            mensaje="Archivo ZIP generado está vacío",
            codigo=500,
            detalles="El archivo ZIP se creó pero no contiene datos"
        )
        raise HTTPException(status_code=500, detail=respuesta_error)
    
    return zip_bytes


def exportar_por_lote(
    request_id: str,
    tmp_dir: str,
    lote_id: int,
    formato: str
) -> List[str]:
    """
    Exporta todos los análisis asociados a un lote específico.
    Retorna lista de archivos generados.
    """
    logger.info(f"[{request_id}] Exportando análisis para lote {lote_id}")
    
    # Inicializar engine y sesión
    engine = obtener_engine()
    inicializar_automap(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Ejecutar exportación por lote
        archivos_generados = export_analisis_por_lote(
            session=session,
            lote_id=lote_id,
            output_dir=tmp_dir,
            fmt=formato
        )
        
        if not archivos_generados:
            respuesta_error = crear_respuesta_error(
                mensaje="No se generaron archivos de exportación",
                codigo=404,
                detalles=f"No se encontraron análisis asociados al lote {lote_id}"
            )
            raise HTTPException(status_code=404, detail=respuesta_error)
        
        return [os.path.basename(f) for f in archivos_generados]
    finally:
        session.close()


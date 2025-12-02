"""
Endpoint de inserción masiva.
"""
import logging
import asyncio
from fastapi import Request, APIRouter, HTTPException
from fastapi.responses import JSONResponse
from MassiveInsertFiles import insertar_1000_registros_principales
from app.core.responses import crear_respuesta_exito, crear_respuesta_error, obtener_mensaje_error_seguro
from app.core.security import db_circuit_breaker
from app.dependencies import GLOBAL_THREAD_POOL
from app.config import MAX_REQUEST_TIMEOUT
from database_config import build_connection_string
from sqlalchemy import create_engine, text

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/insertar", tags=["Inserción"], summary="Inserción masiva",
         description="Endpoint para insertar datos masivos")
async def insertar(request: Request):
    """Endpoint para insertar datos masivos. Retorna respuesta estructurada con validaciones."""
    request_id = getattr(request.state, "request_id", "unknown")
    try:
        logger.info(f"[{request_id}] Iniciando inserción masiva de datos...")
        
        # Validar conexión a base de datos antes de proceder con circuit breaker
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
        
        # Ejecutar inserción masiva en thread pool global para no bloquear el event loop
        try:
            # Ejecutar en thread pool executor global para operaciones bloqueantes
            loop = asyncio.get_event_loop()
            try:
                # Ejecutar con timeout para evitar que se quede colgado
                await asyncio.wait_for(
                    loop.run_in_executor(GLOBAL_THREAD_POOL, insertar_1000_registros_principales),
                    timeout=MAX_REQUEST_TIMEOUT - 10  # Dejar 10 segundos de margen
                )
                ok = True
            except asyncio.TimeoutError:
                logger.error(f"[{request_id}] Timeout durante inserción masiva (excedió {MAX_REQUEST_TIMEOUT - 10}s)")
                ok = False
                respuesta_error = crear_respuesta_error(
                    mensaje="Timeout durante inserción masiva",
                    codigo=504,
                    detalles=f"La inserción masiva excedió el tiempo máximo permitido de {MAX_REQUEST_TIMEOUT - 10} segundos"
                )
                raise HTTPException(status_code=504, detail=respuesta_error)
        except HTTPException:
            raise
        except Exception as insert_error:
            logger.error(f"[{request_id}] Error durante inserción masiva: {insert_error}", exc_info=True)
            ok = False
        
        if not ok:
            logger.error(f"[{request_id}] La inserción masiva falló")
            respuesta_error = crear_respuesta_error(
                mensaje="La inserción masiva de datos falló",
                codigo=500,
                detalles="El proceso de inserción falló. Revisa los logs para más detalles."
            )
            raise HTTPException(status_code=500, detail=respuesta_error)
        
        logger.info(f"[{request_id}] Inserción masiva completada exitosamente")
        respuesta_exito = crear_respuesta_exito(
            mensaje="Inserción masiva de datos completada exitosamente",
            datos={"proceso": "insertar_datos_masivos", "estado": "completado"}
        )
        return JSONResponse(content=respuesta_exito, status_code=200)
        
    except HTTPException:
        raise
    except Exception as e:
        request_id = getattr(request.state, "request_id", "unknown")
        logger.error(f"[{request_id}] Error inesperado en inserción masiva: {e}", exc_info=True)
        respuesta_error = crear_respuesta_error(
            mensaje="Error inesperado durante la inserción masiva",
            codigo=500,
            detalles=obtener_mensaje_error_seguro(e, "Error inesperado")
        )
        raise HTTPException(status_code=500, detail=respuesta_error)


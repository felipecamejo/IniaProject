"""
Endpoint de health check.
"""
import logging
from fastapi import Request, APIRouter
from fastapi.responses import JSONResponse
from database_config import build_connection_string
from sqlalchemy import create_engine, text
from app.core.middleware import get_concurrent_requests
from app.config import MAX_CONCURRENT_REQUESTS

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health", tags=["Health"], summary="Health Check",
         description="Endpoint para verificar el estado del middleware")
async def health_check(request: Request):
    """Endpoint de health check para monitoreo del servicio."""
    request_id = getattr(request.state, "request_id", "unknown")
    try:
        # Verificar conexión a base de datos
        try:
            conn_str = build_connection_string()
            engine = create_engine(conn_str)
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            db_status = "ok"
        except Exception as db_error:
            logger.warning(f"[{request_id}] Error en health check de BD: {db_error}")
            db_status = "error"
        
        status = {
            "status": "healthy" if db_status == "ok" else "degraded",
            "service": "INIA Python Middleware",
            "version": "1.0.0",
            "database": db_status,
            "concurrent_requests": get_concurrent_requests(),
            "max_concurrent_requests": MAX_CONCURRENT_REQUESTS,
            "request_id": request_id
        }
        
        status_code = 200 if db_status == "ok" else 503
        return JSONResponse(content=status, status_code=status_code)
    except Exception as e:
        logger.error(f"[{request_id}] Error en health check: {e}", exc_info=True)
        status = {
            "status": "unhealthy",
            "service": "INIA Python Middleware",
            "version": "1.0.0",
            "error": str(e),
            "request_id": request_id
        }
        return JSONResponse(content=status, status_code=503)


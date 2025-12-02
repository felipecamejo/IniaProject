"""
Punto de entrada principal de la aplicación FastAPI.
Configura la aplicación, middlewares y routers.
"""
import logging
import signal
import sys
import multiprocessing
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from app.config import CORS_ORIGINS
from app.core.middleware import (
    request_id_middleware,
    timing_middleware,
    logging_middleware,
    security_headers_middleware,
    rate_limit_middleware,
    protection_middleware
)
from app.core.exceptions import global_exception_handler, http_exception_handler
from app.api.v1.router import api_router
from fastapi import HTTPException

# Configuración de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Crear la aplicación FastAPI
app = FastAPI(
    title="INIA Python Middleware",
    version="1.0.0",
    description="Middleware Python/FastAPI para operaciones de importación, exportación y análisis de datos",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Router con prefijo /middleware para compatibilidad con ALB (reglas de path)
from fastapi import APIRouter
middleware_router = APIRouter(prefix="/middleware")

# Configurar middlewares
# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Process-Time"]
)

# Middleware de compresión GZip
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Middlewares personalizados (en orden de ejecución)
app.middleware("http")(request_id_middleware)
app.middleware("http")(timing_middleware)
app.middleware("http")(logging_middleware)
app.middleware("http")(security_headers_middleware)
app.middleware("http")(rate_limit_middleware)
app.middleware("http")(protection_middleware)

# Exception handlers
app.add_exception_handler(Exception, global_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)

# Incluir routers
# Router principal sin prefijo (para compatibilidad con endpoints directos)
app.include_router(api_router)

# Router con prefijo /middleware para compatibilidad con ALB
# Incluir el mismo router en middleware_router para mantener compatibilidad
middleware_router.include_router(api_router)
app.include_router(middleware_router)

# Manejador de señales para shutdown graceful
def signal_handler(signum, frame):
    """Maneja señales de terminación para shutdown graceful."""
    logger.info(f"Señal {signum} recibida. Iniciando shutdown graceful...")
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


if __name__ == "__main__":
    import uvicorn
    from app.config import (
        MAX_FILE_SIZE,
        MAX_TOTAL_FILES_SIZE,
        MAX_REQUEST_TIMEOUT,
        MAX_CONCURRENT_REQUESTS,
        RATE_LIMIT_REQUESTS,
        RATE_LIMIT_WINDOW,
        THREAD_POOL_WORKERS,
        DB_POOL_SIZE,
        DB_MAX_OVERFLOW
    )
    
    # Detectar número de CPUs disponibles
    num_cpus = multiprocessing.cpu_count()
    num_workers = int(os.getenv("UVICORN_WORKERS", 1))
    
    # Solo usar workers si se especifica explícitamente y es > 1
    use_workers = num_workers > 1
    
    # Configurar uvicorn con límites de protección y optimizaciones
    config = uvicorn.Config(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PY_MIDDLEWARE_PORT", "9099")),
        timeout_keep_alive=30,
        limit_concurrency=MAX_CONCURRENT_REQUESTS,
        log_level="info",
        workers=num_workers if use_workers else None,
        loop="asyncio",
        access_log=True
    )
    server = uvicorn.Server(config)
    
    logger.info("=" * 80)
    logger.info("Servidor FastAPI iniciado con optimizaciones:")
    logger.info(f"  - Max archivo: {MAX_FILE_SIZE/(1024*1024):.1f}MB")
    logger.info(f"  - Max total archivos: {MAX_TOTAL_FILES_SIZE/(1024*1024):.1f}MB")
    logger.info(f"  - Timeout por request: {MAX_REQUEST_TIMEOUT}s")
    logger.info(f"  - Requests concurrentes: {MAX_CONCURRENT_REQUESTS}")
    logger.info(f"  - Rate limit: {RATE_LIMIT_REQUESTS} req/{RATE_LIMIT_WINDOW}s por IP")
    logger.info(f"  - Thread pool workers: {THREAD_POOL_WORKERS}")
    logger.info(f"  - DB pool size: {DB_POOL_SIZE} (max overflow: {DB_MAX_OVERFLOW})")
    if use_workers:
        logger.info(f"  - Uvicorn workers: {num_workers} (CPUs disponibles: {num_cpus})")
    else:
        logger.info(f"  - Uvicorn workers: 1 (modo desarrollo, CPUs disponibles: {num_cpus})")
    logger.info("=" * 80)
    
    server.run()


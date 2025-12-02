"""
Middlewares personalizados para FastAPI.
Incluye request ID, timing, logging, security headers, rate limiting y protección.
"""
import uuid
import time
import asyncio
import logging
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Dict, List
from fastapi import Request
from fastapi.responses import JSONResponse
from app.config import (
    MAX_CONCURRENT_REQUESTS,
    MAX_REQUEST_TIMEOUT,
    RATE_LIMIT_REQUESTS,
    RATE_LIMIT_WINDOW
)
from app.core.responses import crear_respuesta_error

logger = logging.getLogger(__name__)

# Contador de solicitudes concurrentes
_concurrent_requests = 0
_concurrent_requests_lock = asyncio.Lock()

# Rate limiting por IP
rate_limits: Dict[str, List[datetime]] = defaultdict(list)
_rate_limit_lock = asyncio.Lock()


async def request_id_middleware(request: Request, call_next):
    """Agrega un ID único a cada request."""
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    
    # Agregar request ID a los headers de respuesta
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


async def timing_middleware(request: Request, call_next):
    """Mide el tiempo de procesamiento de cada request."""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}"
    return response


async def logging_middleware(request: Request, call_next):
    """Registra información detallada de cada request."""
    request_id = getattr(request.state, "request_id", "unknown")
    client_ip = request.client.host if request.client else "unknown"
    method = request.method
    path = request.url.path
    query_params = str(request.query_params) if request.query_params else ""
    
    logger.info(f"[{request_id}] {method} {path}{'?' + query_params if query_params else ''} - IP: {client_ip}")
    
    try:
        response = await call_next(request)
        status_code = response.status_code
        logger.info(f"[{request_id}] {method} {path} - Status: {status_code}")
        return response
    except Exception as e:
        logger.error(f"[{request_id}] {method} {path} - Error: {str(e)}", exc_info=True)
        raise


async def security_headers_middleware(request: Request, call_next):
    """Agrega headers de seguridad a las respuestas."""
    response = await call_next(request)
    
    # Headers de seguridad
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # Solo agregar CSP si no es una respuesta de archivo
    if "application/zip" not in response.headers.get("content-type", ""):
        response.headers["Content-Security-Policy"] = "default-src 'self'"
    
    return response


async def rate_limit_middleware(request: Request, call_next):
    """Middleware para limitar el número de requests por IP."""
    # Excluir endpoints de health check y docs del rate limiting
    if request.url.path in ["/health", "/docs", "/redoc", "/openapi.json"]:
        return await call_next(request)
    
    client_ip = request.client.host if request.client else "unknown"
    now = datetime.now()
    
    # Limpiar requests antiguos de forma asíncrona
    async with _rate_limit_lock:
        # Limpiar requests fuera de la ventana de tiempo
        rate_limits[client_ip] = [
            req_time for req_time in rate_limits[client_ip]
            if now - req_time < timedelta(seconds=RATE_LIMIT_WINDOW)
        ]
        
        # Verificar límite
        if len(rate_limits[client_ip]) >= RATE_LIMIT_REQUESTS:
            request_id = getattr(request.state, "request_id", "unknown")
            logger.warning(f"[{request_id}] Rate limit excedido para IP {client_ip}: {len(rate_limits[client_ip])}/{RATE_LIMIT_REQUESTS}")
            respuesta_error = crear_respuesta_error(
                mensaje="Demasiadas solicitudes",
                codigo=429,
                detalles=f"Límite de {RATE_LIMIT_REQUESTS} solicitudes por {RATE_LIMIT_WINDOW} segundos excedido. Intente más tarde."
            )
            response = JSONResponse(status_code=429, content=respuesta_error)
            response.headers["Retry-After"] = str(RATE_LIMIT_WINDOW)
            return response
        
        # Registrar request
        rate_limits[client_ip].append(now)
    
    return await call_next(request)


async def protection_middleware(request: Request, call_next):
    """Middleware para proteger el servidor contra sobrecarga."""
    global _concurrent_requests
    request_id = getattr(request.state, "request_id", "unknown")
    
    # Verificar límite de solicitudes concurrentes
    async with _concurrent_requests_lock:
        if _concurrent_requests >= MAX_CONCURRENT_REQUESTS:
            logger.warning(f"[{request_id}] Límite de solicitudes concurrentes alcanzado: {_concurrent_requests}/{MAX_CONCURRENT_REQUESTS}")
            respuesta_error = crear_respuesta_error(
                mensaje="Servidor sobrecargado",
                codigo=503,
                detalles=f"El servidor está procesando demasiadas solicitudes. Intente más tarde. Límite: {MAX_CONCURRENT_REQUESTS}"
            )
            return JSONResponse(status_code=503, content=respuesta_error)
        _concurrent_requests += 1
    
    try:
        # Aplicar timeout a la solicitud
        try:
            response = await asyncio.wait_for(call_next(request), timeout=MAX_REQUEST_TIMEOUT)
            return response
        except asyncio.TimeoutError:
            logger.error(f"[{request_id}] Timeout en solicitud: {request.url.path} después de {MAX_REQUEST_TIMEOUT}s")
            respuesta_error = crear_respuesta_error(
                mensaje="Timeout en la solicitud",
                codigo=504,
                detalles=f"La solicitud excedió el tiempo máximo de {MAX_REQUEST_TIMEOUT} segundos"
            )
            return JSONResponse(status_code=504, content=respuesta_error)
    except Exception as e:
        logger.error(f"[{request_id}] Error en middleware de protección: {e}", exc_info=True)
        respuesta_error = crear_respuesta_error(
            mensaje="Error interno del servidor",
            codigo=500,
            detalles="Ocurrió un error inesperado al procesar la solicitud"
        )
        return JSONResponse(status_code=500, content=respuesta_error)
    finally:
        async with _concurrent_requests_lock:
            _concurrent_requests -= 1


def get_concurrent_requests() -> int:
    """Obtiene el número actual de solicitudes concurrentes."""
    return _concurrent_requests


"""
Manejadores de excepciones globales.
Proporciona manejo centralizado de errores con respuestas estructuradas.
"""
import logging
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from app.core.responses import crear_respuesta_error, obtener_mensaje_error_seguro

logger = logging.getLogger(__name__)


async def global_exception_handler(request: Request, exc: Exception):
    """
    Maneja cualquier excepción no capturada para evitar que el servidor colapse.
    Sanitiza el mensaje de error para evitar respuestas gigantes.
    """
    try:
        # Log completo del error (para debugging interno)
        logger.error(f"Excepción no capturada: {type(exc).__name__}: {exc}", exc_info=True)
        
        # Obtener mensaje seguro (limitado y sanitizado)
        mensaje_seguro = obtener_mensaje_error_seguro(exc, "Error interno del servidor")
        
        # Crear respuesta de error sanitizada
        respuesta_error = crear_respuesta_error(
            mensaje="Error interno del servidor",
            codigo=500,
            detalles=mensaje_seguro
        )
        
        return JSONResponse(status_code=500, content=respuesta_error)
    except Exception as fallback_error:
        # Si incluso el manejador de errores falla, retornar respuesta mínima
        logger.critical(f"Error crítico en manejador de excepciones: {fallback_error}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "exitoso": False,
                "mensaje": "Error interno del servidor",
                "codigo": 500,
                "detalles": "Ocurrió un error inesperado. Por favor, intente más tarde."
            }
        )


async def http_exception_handler(request: Request, exc: HTTPException):
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


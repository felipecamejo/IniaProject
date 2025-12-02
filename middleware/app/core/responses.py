"""
Funciones para crear respuestas estructuradas.
Maneja sanitización de mensajes de error y creación de respuestas estándar.
"""
import re
from typing import Dict, Any, Optional
from app.config import MAX_ERROR_MESSAGE_LENGTH, MAX_ERROR_DETAILS_LENGTH


def sanitizar_mensaje_error(mensaje: str, max_length: int = MAX_ERROR_MESSAGE_LENGTH) -> str:
    """
    Sanitiza un mensaje de error para evitar respuestas gigantes.
    Limita el tamaño y remueve información sensible si es necesario.
    """
    if not mensaje:
        return "Error desconocido"
    
    # Convertir a string si no lo es
    mensaje_str = str(mensaje)
    
    # Limitar longitud
    if len(mensaje_str) > max_length:
        mensaje_str = mensaje_str[:max_length - 50] + "... [mensaje truncado por seguridad]"
    
    # Remover información sensible potencial (rutas completas, tokens, etc.)
    # Reemplazar rutas absolutas largas
    mensaje_str = re.sub(r'[A-Z]:\\[^\\]+\\[^\\]+\\[^\\]+', '[ruta]', mensaje_str)
    mensaje_str = re.sub(r'/home/[^/]+/[^/]+/[^/]+', '[ruta]', mensaje_str)
    
    # Remover posibles tokens o claves
    mensaje_str = re.sub(r'(?i)(password|token|key|secret|api_key)\s*[:=]\s*[^\s]+', r'\1=[oculto]', mensaje_str)
    
    return mensaje_str


def crear_respuesta_exito(mensaje: str, datos: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Crea una respuesta de éxito estructurada."""
    respuesta = {
        "exitoso": True,
        "mensaje": sanitizar_mensaje_error(mensaje, MAX_ERROR_MESSAGE_LENGTH),
        "codigo": 200
    }
    if datos:
        respuesta["datos"] = datos
    return respuesta


def crear_respuesta_error(mensaje: str, codigo: int = 500, detalles: Optional[str] = None) -> Dict[str, Any]:
    """
    Crea una respuesta de error estructurada.
    Sanitiza los mensajes para evitar respuestas gigantes que puedan colapsar el servidor.
    """
    respuesta = {
        "exitoso": False,
        "mensaje": sanitizar_mensaje_error(mensaje, MAX_ERROR_MESSAGE_LENGTH),
        "codigo": codigo
    }
    if detalles:
        respuesta["detalles"] = sanitizar_mensaje_error(detalles, MAX_ERROR_DETAILS_LENGTH)
    return respuesta


def obtener_mensaje_error_seguro(exc: Exception, contexto: str = "") -> str:
    """
    Obtiene un mensaje de error seguro que no colapsará el servidor.
    Limita el tamaño y proporciona información útil sin exponer detalles internos.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        tipo_error = type(exc).__name__
        mensaje_error = str(exc)
        
        # Limitar longitud del mensaje
        if len(mensaje_error) > MAX_ERROR_DETAILS_LENGTH:
            mensaje_error = mensaje_error[:MAX_ERROR_DETAILS_LENGTH - 50] + "... [error truncado]"
        
        # Construir mensaje contextual
        if contexto:
            return f"{contexto}: {tipo_error} - {sanitizar_mensaje_error(mensaje_error, MAX_ERROR_DETAILS_LENGTH)}"
        else:
            return f"{tipo_error}: {sanitizar_mensaje_error(mensaje_error, MAX_ERROR_DETAILS_LENGTH)}"
    except Exception as e:
        # Si incluso obtener el mensaje falla, retornar algo genérico
        logger.error(f"Error obteniendo mensaje de error: {e}", exc_info=True)
        return f"Error procesando solicitud{': ' + contexto if contexto else ''}"


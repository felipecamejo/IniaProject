"""
Servicio de gestión de conexiones a base de datos.
Proporciona funciones para crear engines optimizados y obtener nombres de tablas.
"""
import logging
from typing import Optional
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool
from database_config import build_connection_string
from app.config import DB_POOL_SIZE, DB_MAX_OVERFLOW, DB_POOL_RECYCLE

logger = logging.getLogger(__name__)


def normalize_string_for_url(value: str) -> str:
    """
    Normaliza un string para uso en URL, asegurando codificación UTF-8 válida.
    
    Args:
        value: String a normalizar
        
    Returns:
        String normalizado en UTF-8 válido
    """
    if not value:
        return ''
    
    try:
        # Intentar codificar/decodificar como UTF-8
        normalized = str(value).encode('utf-8', errors='replace').decode('utf-8', errors='replace')
        return normalized
    except Exception as e:
        logger.warning(f"Error normalizando string para URL: {e}. Usando valor original.")
        return str(value)


def normalize_connection_string(connection_string: str) -> str:
    """
    Normaliza la cadena de conexión asegurando que es UTF-8 válida.
    
    Args:
        connection_string: Cadena de conexión a normalizar
        
    Returns:
        Cadena de conexión normalizada
    """
    try:
        # Verificar que la cadena es UTF-8 válida
        connection_string.encode('utf-8').decode('utf-8')
        return connection_string
    except (UnicodeDecodeError, UnicodeError) as e:
        logger.warning(f"Problema de codificación en cadena de conexión: {e}. Normalizando...")
        # Intentar normalizar
        try:
            normalized = connection_string.encode('utf-8', errors='replace').decode('utf-8', errors='replace')
            return normalized
        except Exception as e2:
            logger.error(f"Error normalizando cadena de conexión: {e2}")
            raise


def create_engine_safe(connection_string: Optional[str] = None, **kwargs):
    """
    Crea un engine de SQLAlchemy con configuración segura de codificación UTF-8.
    Esta función asegura que todos los parámetros estén correctamente codificados.
    
    Args:
        connection_string: Cadena de conexión (opcional, se construye si no se proporciona)
        **kwargs: Argumentos adicionales para create_engine
        
    Returns:
        Engine de SQLAlchemy configurado con codificación UTF-8
    """
    if connection_string is None:
        connection_string = build_connection_string()
    
    # Normalizar la cadena de conexión
    try:
        connection_string = normalize_connection_string(connection_string)
    except Exception as e:
        logger.warning(f"Error normalizando cadena de conexión: {e}. Continuando...")
    
    # Asegurar que connect_args incluye client_encoding
    connect_args = kwargs.get('connect_args', {})
    if 'client_encoding' not in connect_args:
        connect_args['client_encoding'] = 'UTF8'
    if 'options' not in connect_args:
        connect_args['options'] = '-c client_encoding=UTF8'
    kwargs['connect_args'] = connect_args
    
    # Asegurar pool_pre_ping está habilitado
    if 'pool_pre_ping' not in kwargs:
        kwargs['pool_pre_ping'] = True
    
    try:
        # Intentar crear el engine
        engine = create_engine(connection_string, **kwargs)
        logger.debug(f"Engine creado exitosamente con codificación UTF-8")
        return engine
    except (UnicodeDecodeError, UnicodeError) as e:
        logger.error(f"Error de codificación al crear engine: {e}")
        # Intentar construir la cadena de conexión de nuevo con normalización más agresiva
        try:
            from database_config import DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME
            from urllib.parse import quote_plus
            
            # Normalizar cada componente individualmente
            user_norm = normalize_string_for_url(DB_USER or '')
            pass_norm = normalize_string_for_url(DB_PASSWORD or '')
            host_norm = normalize_string_for_url(DB_HOST or 'localhost')
            port_norm = str(DB_PORT or '5432')
            db_norm = normalize_string_for_url(DB_NAME or '')
            
            user_esc = quote_plus(user_norm)
            pass_esc = quote_plus(pass_norm)
            
            # Construir nueva cadena de conexión
            connection_string = f'postgresql+psycopg2://{user_esc}:{pass_esc}@{host_norm}:{port_norm}/{db_norm}'
            
            logger.info("Reintentando creación de engine con cadena de conexión reconstruida...")
            engine = create_engine(connection_string, **kwargs)
            logger.info("Engine creado exitosamente después de reconstruir cadena de conexión")
            return engine
        except Exception as e2:
            logger.error(f"Error en intento de reconstrucción: {e2}")
            logger.error(f"Cadena de conexión (sin contraseña): {connection_string.split('@')[0] if '@' in connection_string else 'N/A'}@...")
            raise
    except Exception as e:
        logger.error(f"Error inesperado al crear engine: {e}")
        raise


def create_engine_with_pool(connection_string: Optional[str] = None):
    """
    Crea un engine de SQLAlchemy con pool de conexiones optimizado y codificación UTF-8.
    Reutiliza conexiones para mejorar el rendimiento.
    
    Args:
        connection_string: Cadena de conexión (opcional, se construye si no se proporciona)
        
    Returns:
        Engine de SQLAlchemy con pool optimizado y codificación UTF-8
    """
    return create_engine_safe(
        connection_string=connection_string,
        poolclass=QueuePool,
        pool_size=DB_POOL_SIZE,
        max_overflow=DB_MAX_OVERFLOW,
        pool_recycle=DB_POOL_RECYCLE,
        echo=False  # No mostrar SQL en logs (cambiar a True para debugging)
    )


def obtener_nombre_tabla_seguro(model) -> str:
    """
    Obtiene el nombre de la tabla de un modelo de forma segura.
    Maneja diferentes formas en que SQLAlchemy puede exponer el nombre de la tabla.
    """
    try:
        # Método 1: Intentar __tablename__ directamente
        if hasattr(model, '__tablename__'):
            return model.__tablename__
    except (AttributeError, TypeError):
        pass
    
    try:
        # Método 2: Intentar __table__.name
        if hasattr(model, '__table__') and hasattr(model.__table__, 'name'):
            return model.__table__.name
    except (AttributeError, TypeError):
        pass
    
    try:
        # Método 3: Usar el nombre de la clase como fallback
        if hasattr(model, '__name__'):
            return model.__name__.lower()
    except (AttributeError, TypeError):
        pass
    
    # Si todo falla, intentar obtener el nombre desde el mapeo
    try:
        if hasattr(model, '__mapper__') and hasattr(model.__mapper__, 'tables'):
            tables = model.__mapper__.tables
            if tables:
                return list(tables)[0].name
    except (AttributeError, TypeError, IndexError):
        pass
    
    # Último recurso: usar el nombre de la clase como string
    return str(model).split('.')[-1].split("'")[0].lower()


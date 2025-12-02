"""
Servicio de gestión de conexiones a base de datos.
Proporciona funciones para crear engines optimizados y obtener nombres de tablas.
"""
from typing import Optional
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool
from database_config import build_connection_string
from app.config import DB_POOL_SIZE, DB_MAX_OVERFLOW, DB_POOL_RECYCLE


def create_engine_with_pool(connection_string: Optional[str] = None):
    """
    Crea un engine de SQLAlchemy con pool de conexiones optimizado.
    Reutiliza conexiones para mejorar el rendimiento.
    """
    if connection_string is None:
        connection_string = build_connection_string()
    
    return create_engine(
        connection_string,
        poolclass=QueuePool,
        pool_size=DB_POOL_SIZE,
        max_overflow=DB_MAX_OVERFLOW,
        pool_pre_ping=True,  # Verificar conexiones antes de usar
        pool_recycle=DB_POOL_RECYCLE,  # Reciclar conexiones periódicamente
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


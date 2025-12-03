"""
Módulo centralizado de configuración de base de datos.
Contiene toda la configuración y funciones compartidas para conexión a BD.
"""
import os
import logging
from urllib.parse import quote_plus

logger = logging.getLogger(__name__)

# Configuración de conexión a la base de datos
DEFAULT_CONFIG = {
    'DB_USER': 'postgres',
    'DB_HOST': 'localhost',
    'DB_PORT': '5432',
    'DB_NAME': 'Inia',
}

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
        # Asegurar que es un string
        str_value = str(value)
        # Intentar codificar/decodificar como UTF-8
        normalized = str_value.encode('utf-8', errors='replace').decode('utf-8', errors='replace')
        return normalized
    except Exception as e:
        logger.warning(f"Error normalizando string para URL: {e}. Usando valor original.")
        return str(value)


def get_env_var_safe(key: str, default: str = None) -> str:
    """
    Obtiene una variable de entorno de forma segura, normalizando a UTF-8.
    
    Args:
        key: Nombre de la variable de entorno
        default: Valor por defecto si no existe
        
    Returns:
        Valor de la variable de entorno normalizado a UTF-8
    """
    value = os.getenv(key, default)
    if value is None:
        return None
    return normalize_string_for_url(value)


# Obtener configuración de variables de entorno con normalización UTF-8
DB_USER = get_env_var_safe('DB_USER') or get_env_var_safe('POSTGRES_USER') or DEFAULT_CONFIG['DB_USER']
DB_PASSWORD = get_env_var_safe('DB_PASSWORD') or get_env_var_safe('POSTGRES_PASSWORD')
if not DB_PASSWORD:
    raise ValueError("DB_PASSWORD debe estar configurado como variable de entorno. Configure DB_PASSWORD o POSTGRES_PASSWORD.")
DB_HOST = get_env_var_safe('DB_HOST') or get_env_var_safe('POSTGRES_HOST') or DEFAULT_CONFIG['DB_HOST']
DB_PORT = get_env_var_safe('DB_PORT') or get_env_var_safe('POSTGRES_PORT') or DEFAULT_CONFIG['DB_PORT']
DB_NAME = get_env_var_safe('DB_NAME') or get_env_var_safe('POSTGRES_DB') or DEFAULT_CONFIG['DB_NAME']


def validate_connection_string_encoding(connection_string: str) -> bool:
    """
    Valida que la cadena de conexión es UTF-8 válida.
    
    Args:
        connection_string: Cadena de conexión a validar
        
    Returns:
        True si es válida, False en caso contrario
    """
    try:
        connection_string.encode('utf-8').decode('utf-8')
        return True
    except (UnicodeDecodeError, UnicodeError):
        return False


def build_connection_string() -> str:
    """
    Construye la cadena de conexión escapando credenciales y asegurando codificación UTF-8.
    
    Returns:
        Cadena de conexión a PostgreSQL en formato SQLAlchemy con codificación UTF-8 válida
    """
    database_url = get_env_var_safe('DATABASE_URL')
    if database_url:
        # Si DATABASE_URL está configurada, verificar que esté correctamente codificada
        if validate_connection_string_encoding(database_url):
            if database_url.startswith('postgresql://'):
                return database_url.replace('postgresql://', 'postgresql+psycopg2://', 1)
            elif database_url.startswith('postgres://'):
                return database_url.replace('postgres://', 'postgresql+psycopg2://', 1)
            return database_url
        else:
            # Si DATABASE_URL tiene problemas de codificación, construir desde variables individuales
            logger.warning("DATABASE_URL tiene problemas de codificación. Construyendo desde variables individuales.")
    
    # Construir desde variables individuales, asegurando codificación UTF-8
    # Todos los valores ya están normalizados por get_env_var_safe
    user_esc = quote_plus(DB_USER or '')
    pass_esc = quote_plus(DB_PASSWORD or '')
    host = DB_HOST or 'localhost'
    port = DB_PORT or '5432'
    db = DB_NAME or ''
    
    connection_string = f'postgresql+psycopg2://{user_esc}:{pass_esc}@{host}:{port}/{db}'
    
    # Validar la cadena final
    if not validate_connection_string_encoding(connection_string):
        logger.error("La cadena de conexión construida tiene problemas de codificación")
        raise ValueError("No se pudo construir una cadena de conexión válida en UTF-8")
    
    return connection_string


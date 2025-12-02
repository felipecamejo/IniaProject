"""
Módulo centralizado de configuración de base de datos.
Contiene toda la configuración y funciones compartidas para conexión a BD.
"""
import os
from urllib.parse import quote_plus

# Configuración de conexión a la base de datos
DEFAULT_CONFIG = {
    'DB_USER': 'postgres',
    'DB_HOST': 'localhost',
    'DB_PORT': '5432',
    'DB_NAME': 'Inia',
}

# Obtener configuración de variables de entorno
DB_USER = os.getenv('DB_USER', os.getenv('POSTGRES_USER', DEFAULT_CONFIG['DB_USER']))
DB_PASSWORD = os.getenv('DB_PASSWORD') or os.getenv('POSTGRES_PASSWORD')
if not DB_PASSWORD:
    raise ValueError("DB_PASSWORD debe estar configurado como variable de entorno. Configure DB_PASSWORD o POSTGRES_PASSWORD.")
DB_HOST = os.getenv('DB_HOST', os.getenv('POSTGRES_HOST', DEFAULT_CONFIG['DB_HOST']))
DB_PORT = os.getenv('DB_PORT', os.getenv('POSTGRES_PORT', DEFAULT_CONFIG['DB_PORT']))
DB_NAME = os.getenv('DB_NAME', os.getenv('POSTGRES_DB', DEFAULT_CONFIG['DB_NAME']))


def build_connection_string() -> str:
    """
    Construye la cadena de conexión escapando credenciales.
    
    Returns:
        Cadena de conexión a PostgreSQL en formato SQLAlchemy
    """
    database_url = os.getenv('DATABASE_URL')
    if database_url:
        if database_url.startswith('postgresql://'):
            return database_url.replace('postgresql://', 'postgresql+psycopg2://', 1)
        elif database_url.startswith('postgres://'):
            return database_url.replace('postgres://', 'postgresql+psycopg2://', 1)
        return database_url
    
    user_esc = quote_plus(DB_USER or '')
    pass_esc = quote_plus(DB_PASSWORD or '')
    host = DB_HOST or 'localhost'
    port = DB_PORT or '5432'
    db = DB_NAME or ''
    return f'postgresql+psycopg2://{user_esc}:{pass_esc}@{host}:{port}/{db}'


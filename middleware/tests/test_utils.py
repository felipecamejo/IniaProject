"""
Utilidades para tests del middleware.
Contiene funciones para normalizar variables de entorno y configurar tests.
"""
import os
import sys
from pathlib import Path


def normalize_env_var(value: str) -> str:
    """
    Normaliza una variable de entorno asegurando codificación UTF-8 válida.
    
    Args:
        value: Valor de la variable de entorno a normalizar
        
    Returns:
        Valor normalizado en UTF-8 válido
    """
    if not value:
        return ''
    
    try:
        # Asegurar que es un string
        str_value = str(value)
        # Intentar codificar/decodificar como UTF-8
        normalized = str_value.encode('utf-8', errors='replace').decode('utf-8', errors='replace')
        return normalized
    except Exception:
        # Si falla, retornar como string
        return str(value)


def normalize_env_vars():
    """
    Normaliza todas las variables de entorno relacionadas con la base de datos.
    Asegura que todas estén en UTF-8 válido.
    """
    db_vars = ['DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT', 'DB_NAME', 
               'POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_HOST', 
               'POSTGRES_PORT', 'POSTGRES_DB', 'DATABASE_URL']
    
    for var_name in db_vars:
        value = os.getenv(var_name)
        if value:
            normalized = normalize_env_var(value)
            os.environ[var_name] = normalized


def setup_test_db_config():
    """
    Configura las variables de entorno para tests con valores por defecto.
    Normaliza todas las variables a UTF-8 válido.
    """
    # Normalizar variables existentes primero
    normalize_env_vars()
    
    # Establecer valores por defecto si no existen
    defaults = {
        'DB_USER': 'postgres',
        'DB_PASSWORD': 'Inia2024SecurePass!',
        'DB_HOST': 'localhost',
        'DB_PORT': '5432',
        'DB_NAME': 'Inia'
    }
    
    for key, default_value in defaults.items():
        if not os.getenv(key):
            os.environ[key] = normalize_env_var(default_value)
    
    # Asegurar que todas las variables están normalizadas
    normalize_env_vars()


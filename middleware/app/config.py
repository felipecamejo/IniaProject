"""
Configuración centralizada del middleware.
Contiene todas las constantes y configuraciones del servidor.
"""
import os

# Límites de recursos para prevenir colapso
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", 100 * 1024 * 1024))  # 100 MB por defecto
MAX_TOTAL_FILES_SIZE = int(os.getenv("MAX_TOTAL_FILES_SIZE", 500 * 1024 * 1024))  # 500 MB total
MAX_REQUEST_TIMEOUT = int(os.getenv("MAX_REQUEST_TIMEOUT", 600))  # 10 minutos por defecto
MAX_CONCURRENT_REQUESTS = int(os.getenv("MAX_CONCURRENT_REQUESTS", 50))  # 50 solicitudes simultáneas
MAX_IMPORT_FILES = int(os.getenv("MAX_IMPORT_FILES", 50))  # Máximo 50 archivos por importación

# Configuración de rate limiting
RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", 100))  # 100 requests por minuto
RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", 60))  # Ventana de 60 segundos

# Configuración de pool de threads para operaciones pesadas
THREAD_POOL_WORKERS = int(os.getenv("THREAD_POOL_WORKERS", 10))  # 10 workers en el pool de threads

# Configuración de pool de conexiones a BD
DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", 10))  # 10 conexiones en el pool
DB_MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", 20))  # 20 conexiones adicionales si se necesitan
DB_POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", 3600))  # Reciclar conexiones cada hora

# Límites para mensajes de error (prevenir respuestas gigantes)
MAX_ERROR_MESSAGE_LENGTH = 500  # Máximo 500 caracteres para mensajes
MAX_ERROR_DETAILS_LENGTH = 1000  # Máximo 1000 caracteres para detalles

# Configuración de CORS
CORS_ORIGINS = [
    "http://localhost:4200",  # Angular dev server
    "http://localhost:80",     # Nginx local
    "http://localhost:8080",   # Backend Spring Boot
    "https://solfuentes-prueba.netlify.app"  # Producción Netlify
]

# Agregar orígenes desde variable de entorno si existe
cors_env_origins = os.getenv("CORS_ORIGINS", "")
if cors_env_origins:
    CORS_ORIGINS.extend([origin.strip() for origin in cors_env_origins.split(",") if origin.strip()])


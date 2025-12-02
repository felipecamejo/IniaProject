"""
Wrapper de compatibilidad para mantener compatibilidad hacia atrás.
Este archivo importa la aplicación desde app.main para mantener
compatibilidad con tests y scripts existentes.
"""
# Intentar importar módulo de instalación de dependencias
try:
    from InstallDependencies import verificar_e_instalar, instalar_dependencias_faltantes
    INSTALL_DEPS_AVAILABLE = True
except ImportError:
    INSTALL_DEPS_AVAILABLE = False

# Verificar e instalar dependencias FastAPI
if INSTALL_DEPS_AVAILABLE:
    deps_fastapi = ['fastapi', 'uvicorn', 'pydantic']
    for dep in deps_fastapi:
        if not verificar_e_instalar(dep, dep, silent=True):
            print(f"Intentando instalar {dep}...")
            verificar_e_instalar(dep, dep, silent=False)

# Importar la aplicación desde el módulo refactorizado
try:
    from app.main import app
    from app.main import middleware_router
    from app.dependencies import GLOBAL_THREAD_POOL
    from app.config import (
        MAX_FILE_SIZE,
        MAX_TOTAL_FILES_SIZE,
        MAX_REQUEST_TIMEOUT,
        MAX_CONCURRENT_REQUESTS,
        MAX_IMPORT_FILES,
        RATE_LIMIT_REQUESTS,
        RATE_LIMIT_WINDOW,
        THREAD_POOL_WORKERS,
        DB_POOL_SIZE,
        DB_MAX_OVERFLOW,
        DB_POOL_RECYCLE,
        MAX_ERROR_MESSAGE_LENGTH,
        MAX_ERROR_DETAILS_LENGTH
    )
    from app.core.responses import (
        crear_respuesta_exito,
        crear_respuesta_error,
        sanitizar_mensaje_error,
        obtener_mensaje_error_seguro
    )
    from app.core.security import (
        CircuitBreaker,
        db_circuit_breaker,
        import_circuit_breaker
    )
    from app.core.middleware import (
        get_concurrent_requests
    )
    from app.services.database_service import (
        create_engine_with_pool,
        obtener_nombre_tabla_seguro
    )
    from app.services.file_service import (
        safe_remove_file,
        validar_tamaño_archivo,
        validar_cantidad_archivos
    )
except ImportError as e:
    if INSTALL_DEPS_AVAILABLE:
        print("Instalando dependencias faltantes...")
        if instalar_dependencias_faltantes('http_server', silent=False):
            from app.main import app
            from app.main import middleware_router
            from app.dependencies import GLOBAL_THREAD_POOL
            from app.config import (
                MAX_FILE_SIZE,
                MAX_TOTAL_FILES_SIZE,
                MAX_REQUEST_TIMEOUT,
                MAX_CONCURRENT_REQUESTS,
                MAX_IMPORT_FILES,
                RATE_LIMIT_REQUESTS,
                RATE_LIMIT_WINDOW,
                THREAD_POOL_WORKERS,
                DB_POOL_SIZE,
                DB_MAX_OVERFLOW,
                DB_POOL_RECYCLE,
                MAX_ERROR_MESSAGE_LENGTH,
                MAX_ERROR_DETAILS_LENGTH
            )
            from app.core.responses import (
                crear_respuesta_exito,
                crear_respuesta_error,
                sanitizar_mensaje_error,
                obtener_mensaje_error_seguro
            )
            from app.core.security import (
                CircuitBreaker,
                db_circuit_breaker,
                import_circuit_breaker
            )
            from app.core.middleware import (
                get_concurrent_requests
            )
            from app.services.database_service import (
                create_engine_with_pool,
                obtener_nombre_tabla_seguro
            )
            from app.services.file_service import (
                safe_remove_file,
                validar_tamaño_archivo,
                validar_cantidad_archivos
            )
        else:
            print("No se pudieron instalar las dependencias. Instálalas manualmente con: pip install -r requirements.txt")
            raise
    else:
        print(f"Error importando módulos refactorizados: {e}")
        print("Asegúrate de que todos los módulos estén correctamente instalados.")
        raise

# Exportar app y otras constantes/funciones para compatibilidad
__all__ = [
    'app',
    'middleware_router',
    'GLOBAL_THREAD_POOL',
    'MAX_FILE_SIZE',
    'MAX_TOTAL_FILES_SIZE',
    'MAX_REQUEST_TIMEOUT',
    'MAX_CONCURRENT_REQUESTS',
    'MAX_IMPORT_FILES',
    'RATE_LIMIT_REQUESTS',
    'RATE_LIMIT_WINDOW',
    'THREAD_POOL_WORKERS',
    'DB_POOL_SIZE',
    'DB_MAX_OVERFLOW',
    'DB_POOL_RECYCLE',
    'MAX_ERROR_MESSAGE_LENGTH',
    'MAX_ERROR_DETAILS_LENGTH',
    'crear_respuesta_exito',
    'crear_respuesta_error',
    'sanitizar_mensaje_error',
    'obtener_mensaje_error_seguro',
    'CircuitBreaker',
    'db_circuit_breaker',
    'import_circuit_breaker',
    'get_concurrent_requests',
    'create_engine_with_pool',
    'obtener_nombre_tabla_seguro',
    'safe_remove_file',
    'validar_tamaño_archivo',
    'validar_cantidad_archivos'
]

if __name__ == "__main__":
    # Si se ejecuta directamente, iniciar el servidor
    import uvicorn
    import multiprocessing
    import os
    
    num_cpus = multiprocessing.cpu_count()
    num_workers = int(os.getenv("UVICORN_WORKERS", 1))
    use_workers = num_workers > 1
    
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
    server.run()

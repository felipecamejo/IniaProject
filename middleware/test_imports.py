"""
Script de prueba para verificar que todos los imports funcionan correctamente.
"""
import os
import sys

# Configurar variables de entorno de prueba antes de importar
os.environ.setdefault('DB_PASSWORD', 'test_password')
os.environ.setdefault('DB_USER', 'test_user')
os.environ.setdefault('DB_HOST', 'localhost')
os.environ.setdefault('DB_PORT', '5432')
os.environ.setdefault('DB_NAME', 'test_db')

print("=" * 80)
print("PRUEBA DE IMPORTS Y ESTRUCTURA MODULAR")
print("=" * 80)

try:
    print("\n1. Probando importación de configuración...")
    from app.config import (
        MAX_FILE_SIZE, MAX_TOTAL_FILES_SIZE, MAX_REQUEST_TIMEOUT,
        MAX_CONCURRENT_REQUESTS, MAX_IMPORT_FILES, RATE_LIMIT_REQUESTS,
        RATE_LIMIT_WINDOW, THREAD_POOL_WORKERS, DB_POOL_SIZE,
        DB_MAX_OVERFLOW, DB_POOL_RECYCLE
    )
    print("   ✓ Configuración importada correctamente")
    print(f"   - MAX_FILE_SIZE: {MAX_FILE_SIZE / (1024*1024):.1f} MB")
    print(f"   - MAX_CONCURRENT_REQUESTS: {MAX_CONCURRENT_REQUESTS}")
    
    print("\n2. Probando importación de utilidades core...")
    from app.core.responses import (
        crear_respuesta_exito, crear_respuesta_error,
        sanitizar_mensaje_error, obtener_mensaje_error_seguro
    )
    from app.core.security import CircuitBreaker, db_circuit_breaker, import_circuit_breaker
    from app.core.middleware import get_concurrent_requests
    print("   ✓ Utilidades core importadas correctamente")
    
    print("\n3. Probando importación de servicios...")
    from app.services.database_service import create_engine_with_pool, obtener_nombre_tabla_seguro
    from app.services.file_service import safe_remove_file, validar_tamaño_archivo, validar_cantidad_archivos
    print("   ✓ Servicios importados correctamente")
    
    print("\n4. Probando importación de dependencias...")
    from app.dependencies import GLOBAL_THREAD_POOL
    print("   ✓ Dependencias importadas correctamente")
    
    print("\n5. Probando importación de routers individuales...")
    from app.api.v1 import health, insert, export, analyze
    import importlib
    import_module = importlib.import_module('app.api.v1.import')
    print("   ✓ Routers individuales importados correctamente")
    
    print("\n6. Probando importación del router principal...")
    from app.api.v1.router import api_router
    print(f"   ✓ Router principal importado correctamente")
    print(f"   - Endpoints en api_router: {len(api_router.routes)}")
    
    print("\n7. Probando importación de app principal...")
    from app.main import app, middleware_router
    print("   ✓ App principal importada correctamente")
    print(f"   - Total rutas en app: {len(app.routes)}")
    print(f"   - Rutas en middleware_router: {len(middleware_router.routes)}")
    
    # Listar endpoints registrados
    print("\n8. Endpoints registrados:")
    for route in app.routes:
        if hasattr(route, 'path') and hasattr(route, 'methods'):
            methods = ', '.join(route.methods)
            print(f"   - {methods:6} {route.path}")
    
    print("\n9. Probando importación desde http_server (compatibilidad)...")
    from http_server import (
        app as app_wrapper,
        MAX_FILE_SIZE as MAX_FILE_SIZE_wrapper,
        crear_respuesta_exito as crear_respuesta_exito_wrapper,
        GLOBAL_THREAD_POOL as GLOBAL_THREAD_POOL_wrapper
    )
    print("   ✓ Wrapper de compatibilidad funciona correctamente")
    print(f"   - App desde wrapper: {app_wrapper is app}")
    print(f"   - MAX_FILE_SIZE desde wrapper: {MAX_FILE_SIZE_wrapper == MAX_FILE_SIZE}")
    
    print("\n" + "=" * 80)
    print("✓ TODAS LAS PRUEBAS PASARON EXITOSAMENTE")
    print("=" * 80)
    print("\nResumen:")
    print(f"  - Endpoints registrados: {len(app.routes)}")
    print(f"  - Estructura modular: ✓")
    print(f"  - Compatibilidad hacia atrás: ✓")
    print(f"  - Sin errores de importación: ✓")
    
except ImportError as e:
    print(f"\n✗ ERROR DE IMPORTACIÓN: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
except Exception as e:
    print(f"\n✗ ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)


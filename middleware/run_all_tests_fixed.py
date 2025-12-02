"""
Script para ejecutar todas las pruebas disponibles.
"""
import os
import sys

# Configurar variables de entorno de prueba
os.environ.setdefault('DB_PASSWORD', 'test_password')
os.environ.setdefault('DB_USER', 'test_user')
os.environ.setdefault('DB_HOST', 'localhost')
os.environ.setdefault('DB_PORT', '5432')
os.environ.setdefault('DB_NAME', 'test_db')

print("=" * 80)
print("EJECUTANDO TODAS LAS PRUEBAS")
print("=" * 80)

results = {
    'passed': [],
    'failed': [],
    'skipped': []
}

# Test 1: Imports básicos
print("\n" + "=" * 80)
print("PRUEBA 1: Imports básicos y estructura modular")
print("=" * 80)
try:
    from app.config import (
        MAX_FILE_SIZE, MAX_TOTAL_FILES_SIZE, MAX_REQUEST_TIMEOUT,
        MAX_CONCURRENT_REQUESTS, MAX_IMPORT_FILES, RATE_LIMIT_REQUESTS,
        RATE_LIMIT_WINDOW, THREAD_POOL_WORKERS, DB_POOL_SIZE,
        DB_MAX_OVERFLOW, DB_POOL_RECYCLE
    )
    from app.core.responses import (
        crear_respuesta_exito, crear_respuesta_error,
        sanitizar_mensaje_error, obtener_mensaje_error_seguro
    )
    from app.core.security import CircuitBreaker, db_circuit_breaker, import_circuit_breaker
    from app.core.middleware import get_concurrent_requests
    from app.services.database_service import create_engine_with_pool, obtener_nombre_tabla_seguro
    from app.services.file_service import safe_remove_file, validar_tamaño_archivo, validar_cantidad_archivos
    from app.dependencies import GLOBAL_THREAD_POOL
    from app.api.v1.router import api_router
    from app.main import app, middleware_router
    from http_server import app as app_wrapper
    
    assert app is not None
    assert app_wrapper is app
    assert len(app.routes) == 14
    assert len(api_router.routes) == 5
    
    results['passed'].append("Imports básicos")
    print("✓ PASÓ - Todos los imports funcionan correctamente")
except Exception as e:
    results['failed'].append(f"Imports básicos: {str(e)[:100]}")
    print(f"✗ FALLÓ: {str(e)[:100]}")
    import traceback
    traceback.print_exc()

# Test 2: Endpoints
print("\n" + "=" * 80)
print("PRUEBA 2: Verificación de endpoints")
print("=" * 80)
try:
    from app.main import app, middleware_router
    from app.api.v1.router import api_router
    
    paths = [r.path for r in app.routes if hasattr(r, 'path')]
    expected_endpoints = ['/health', '/insertar', '/exportar', '/importar', '/analizar']
    middleware_endpoints = [f'/middleware{e}' for e in expected_endpoints]
    
    all_found = True
    for endpoint in expected_endpoints + middleware_endpoints:
        if endpoint not in paths:
            print(f"  ✗ Falta endpoint: {endpoint}")
            all_found = False
    
    if all_found:
        results['passed'].append("Verificación de endpoints")
        print("✓ PASÓ - Todos los endpoints están registrados")
        print(f"  - Total rutas: {len(app.routes)}")
        print(f"  - Endpoints API: {len(expected_endpoints)}")
        print(f"  - Endpoints con prefijo /middleware: {len(middleware_endpoints)}")
    else:
        results['failed'].append("Verificación de endpoints: algunos endpoints faltan")
        print("✗ FALLÓ")
except Exception as e:
    results['failed'].append(f"Verificación de endpoints: {str(e)[:100]}")
    print(f"✗ FALLÓ: {str(e)[:100]}")

# Test 3: Funciones de exportación
print("\n" + "=" * 80)
print("PRUEBA 3: Funciones de exportación con filtros")
print("=" * 80)
try:
    from ExportExcel import parsear_analisis_ids, obtener_campo_fecha_analisis
    
    # Test parsear_analisis_ids
    test_cases = [
        ('dosn:1,2,3', {'dosn': [1, 2, 3]}),
        ('dosn:1,2,3;pureza:5,6', {'dosn': [1, 2, 3], 'pureza': [5, 6]}),
        ('', {}),
        (None, {}),
    ]
    
    all_passed = True
    for input_val, expected in test_cases:
        result = parsear_analisis_ids(input_val)
        if result != expected:
            print(f"  ✗ parsear_analisis_ids('{input_val}') = {result}, esperado {expected}")
            all_passed = False
        else:
            print(f"  ✓ parsear_analisis_ids('{input_val}') = {result}")
    
    # Test obtener_campo_fecha_analisis
    test_cases_fecha = [
        ('dosn', 'auto', 'dosn_fecha_analisis'),
        ('pureza', None, 'fecha_inia'),
        ('germinacion', 'auto', 'fecha_germinacion'),
    ]
    
    for tipo, campo, expected in test_cases_fecha:
        result = obtener_campo_fecha_analisis(tipo, campo)
        if result != expected:
            print(f"  ✗ obtener_campo_fecha_analisis('{tipo}', '{campo}') = {result}, esperado {expected}")
            all_passed = False
        else:
            print(f"  ✓ obtener_campo_fecha_analisis('{tipo}', '{campo}') = {result}")
    
    if all_passed:
        results['passed'].append("Funciones de exportación")
        print("✓ PASÓ")
    else:
        results['failed'].append("Funciones de exportación: algunos tests fallaron")
        print("✗ FALLÓ")
except Exception as e:
    results['failed'].append(f"Funciones de exportación: {str(e)[:100]}")
    print(f"✗ FALLÓ: {str(e)[:100]}")
    import traceback
    traceback.print_exc()

# Test 4: Compatibilidad hacia atrás
print("\n" + "=" * 80)
print("PRUEBA 4: Compatibilidad hacia atrás (http_server.py)")
print("=" * 80)
try:
    from http_server import (
        app as app_wrapper,
        MAX_FILE_SIZE as MAX_FILE_SIZE_wrapper,
        MAX_CONCURRENT_REQUESTS as MAX_CONCURRENT_REQUESTS_wrapper,
        crear_respuesta_exito as crear_respuesta_exito_wrapper,
        crear_respuesta_error as crear_respuesta_error_wrapper,
        GLOBAL_THREAD_POOL as GLOBAL_THREAD_POOL_wrapper,
        db_circuit_breaker as db_circuit_breaker_wrapper,
        get_concurrent_requests as get_concurrent_requests_wrapper,
        create_engine_with_pool as create_engine_with_pool_wrapper
    )
    
    # Verificar que todo está disponible
    assert app_wrapper is not None
    assert MAX_FILE_SIZE_wrapper > 0
    assert MAX_CONCURRENT_REQUESTS_wrapper > 0
    assert callable(crear_respuesta_exito_wrapper)
    assert callable(crear_respuesta_error_wrapper)
    assert GLOBAL_THREAD_POOL_wrapper is not None
    assert db_circuit_breaker_wrapper is not None
    assert callable(get_concurrent_requests_wrapper)
    assert callable(create_engine_with_pool_wrapper)
    
    results['passed'].append("Compatibilidad hacia atrás")
    print("✓ PASÓ - Todas las exportaciones desde http_server funcionan")
except Exception as e:
    results['failed'].append(f"Compatibilidad hacia atrás: {str(e)[:100]}")
    print(f"✗ FALLÓ: {str(e)[:100]}")
    import traceback
    traceback.print_exc()

# Test 5: Estructura de routers
print("\n" + "=" * 80)
print("PRUEBA 5: Estructura de routers y endpoints")
print("=" * 80)
try:
    from app.main import app, middleware_router
    from app.api.v1.router import api_router
    
    # Verificar que los routers tienen rutas
    assert len(app.routes) > 0, "App debe tener rutas"
    assert len(api_router.routes) > 0, "api_router debe tener rutas"
    assert len(middleware_router.routes) > 0, "middleware_router debe tener rutas"
    
    # Verificar endpoints duplicados
    paths = [r.path for r in app.routes if hasattr(r, 'path')]
    expected_endpoints = ['/health', '/insertar', '/exportar', '/importar', '/analizar']
    middleware_endpoints = [f'/middleware{e}' for e in expected_endpoints]
    
    all_found = True
    for endpoint in expected_endpoints:
        if endpoint not in paths:
            print(f"  ✗ Falta endpoint: {endpoint}")
            all_found = False
        else:
            print(f"  ✓ Endpoint encontrado: {endpoint}")
    
    for endpoint in middleware_endpoints:
        if endpoint not in paths:
            print(f"  ✗ Falta endpoint: {endpoint}")
            all_found = False
        else:
            print(f"  ✓ Endpoint encontrado: {endpoint}")
    
    if all_found:
        results['passed'].append("Estructura de routers")
        print("✓ PASÓ")
    else:
        results['failed'].append("Estructura de routers: algunos endpoints faltan")
        print("✗ FALLÓ")
except Exception as e:
    results['failed'].append(f"Estructura de routers: {str(e)[:100]}")
    print(f"✗ FALLÓ: {str(e)[:100]}")
    import traceback
    traceback.print_exc()

# Resumen final
print("\n" + "=" * 80)
print("RESUMEN DE PRUEBAS")
print("=" * 80)
print(f"\n✓ Pruebas pasadas: {len(results['passed'])}")
for test in results['passed']:
    print(f"  - {test}")

if results['failed']:
    print(f"\n✗ Pruebas fallidas: {len(results['failed'])}")
    for test in results['failed']:
        print(f"  - {test}")
else:
    print("\n✗ Pruebas fallidas: 0")

if results['skipped']:
    print(f"\n⚠ Pruebas omitidas: {len(results['skipped'])}")
    for test in results['skipped']:
        print(f"  - {test}")

print("\n" + "=" * 80)
if not results['failed']:
    print("🎉 TODAS LAS PRUEBAS PASARON EXITOSAMENTE")
else:
    print(f"⚠️  {len(results['failed'])} PRUEBA(S) FALLARON")
print("=" * 80)

sys.exit(0 if not results['failed'] else 1)


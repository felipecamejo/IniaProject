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
    exec(open('test_imports.py').read())
    results['passed'].append("Imports básicos")
    print("✓ PASÓ")
except Exception as e:
    results['failed'].append(f"Imports básicos: {str(e)[:100]}")
    print(f"✗ FALLÓ: {str(e)[:100]}")

# Test 2: Endpoints
print("\n" + "=" * 80)
print("PRUEBA 2: Verificación de endpoints")
print("=" * 80)
try:
    exec(open('test_endpoints_simple.py').read())
    results['passed'].append("Verificación de endpoints")
    print("✓ PASÓ")
except Exception as e:
    results['failed'].append(f"Verificación de endpoints: {str(e)[:100]}")
    print(f"✗ FALLÓ: {str(e)[:100]}")

# Test 3: Funciones de exportación
print("\n" + "=" * 80)
print("PRUEBA 3: Funciones de exportación con filtros")
print("=" * 80)
try:
    sys.path.insert(0, 'tests')
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

# Test 4: Compatibilidad hacia atrás
print("\n" + "=" * 80)
print("PRUEBA 4: Compatibilidad hacia atrás (http_server.py)")
print("=" * 80)
try:
    from http_server import (
        app, MAX_FILE_SIZE, MAX_CONCURRENT_REQUESTS,
        crear_respuesta_exito, crear_respuesta_error,
        GLOBAL_THREAD_POOL, db_circuit_breaker,
        get_concurrent_requests, create_engine_with_pool
    )
    
    # Verificar que todo está disponible
    assert app is not None
    assert MAX_FILE_SIZE > 0
    assert MAX_CONCURRENT_REQUESTS > 0
    assert callable(crear_respuesta_exito)
    assert callable(crear_respuesta_error)
    assert GLOBAL_THREAD_POOL is not None
    assert db_circuit_breaker is not None
    assert callable(get_concurrent_requests)
    assert callable(create_engine_with_pool)
    
    results['passed'].append("Compatibilidad hacia atrás")
    print("✓ PASÓ - Todas las exportaciones desde http_server funcionan")
except Exception as e:
    results['failed'].append(f"Compatibilidad hacia atrás: {str(e)[:100]}")
    print(f"✗ FALLÓ: {str(e)[:100]}")

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


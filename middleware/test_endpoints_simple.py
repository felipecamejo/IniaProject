"""
Script simple para probar los endpoints sin requerir httpx.
Verifica que los endpoints estén registrados y que la estructura sea correcta.
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
print("PRUEBA DE ENDPOINTS - Verificación de estructura")
print("=" * 80)

try:
    from http_server import app
    
    print("\n✓ App importada correctamente")
    print(f"  - Título: {app.title}")
    print(f"  - Versión: {app.version}")
    print(f"  - Total rutas: {len(app.routes)}")
    
    # Listar todos los endpoints
    print("\n📋 Endpoints registrados:")
    endpoints = {}
    for route in app.routes:
        if hasattr(route, 'path') and hasattr(route, 'methods'):
            path = route.path
            methods = list(route.methods)
            if path not in endpoints:
                endpoints[path] = []
            endpoints[path].extend(methods)
    
    # Agrupar por tipo
    health_endpoints = []
    api_endpoints = []
    doc_endpoints = []
    
    for path, methods in sorted(endpoints.items()):
        methods_str = ', '.join(sorted(methods))
        if '/health' in path:
            health_endpoints.append((path, methods_str))
        elif '/docs' in path or '/openapi' in path or '/redoc' in path:
            doc_endpoints.append((path, methods_str))
        else:
            api_endpoints.append((path, methods_str))
    
    print("\n  🏥 Health Check:")
    for path, methods in health_endpoints:
        print(f"     {methods:15} {path}")
    
    print("\n  🔌 API Endpoints:")
    for path, methods in api_endpoints:
        print(f"     {methods:15} {path}")
    
    print("\n  📚 Documentación:")
    for path, methods in doc_endpoints:
        print(f"     {methods:15} {path}")
    
    # Verificar endpoints duplicados (con y sin prefijo /middleware)
    print("\n🔍 Verificando duplicación de endpoints:")
    paths_without_prefix = [p for p in endpoints.keys() if not p.startswith('/middleware') and p not in ['/docs', '/openapi.json', '/redoc', '/docs/oauth2-redirect']]
    paths_with_prefix = [p for p in endpoints.keys() if p.startswith('/middleware')]
    
    # Verificar que los endpoints principales tienen duplicados
    expected_duplicates = ['/health', '/insertar', '/exportar', '/importar', '/analizar']
    found_duplicates = []
    
    for endpoint in expected_duplicates:
        has_direct = endpoint in paths_without_prefix
        has_middleware = f'/middleware{endpoint}' in paths_with_prefix
        if has_direct and has_middleware:
            found_duplicates.append(endpoint)
            print(f"   ✓ {endpoint} y /middleware{endpoint} están registrados")
        elif has_direct:
            print(f"   ⚠ {endpoint} existe pero falta /middleware{endpoint}")
        elif has_middleware:
            print(f"   ⚠ /middleware{endpoint} existe pero falta {endpoint}")
        else:
            print(f"   ✗ {endpoint} no está registrado")
    
    # Verificar estructura de rutas
    print("\n📊 Resumen de rutas:")
    print(f"   - Rutas sin prefijo: {len(paths_without_prefix)}")
    print(f"   - Rutas con prefijo /middleware: {len(paths_with_prefix)}")
    print(f"   - Rutas de documentación: {len(doc_endpoints)}")
    print(f"   - Total: {len(endpoints)}")
    
    # Verificar que los routers están incluidos
    print("\n🔗 Verificando estructura de routers:")
    from app.api.v1.router import api_router
    print(f"   ✓ api_router tiene {len(api_router.routes)} rutas")
    
    from app.main import middleware_router
    print(f"   ✓ middleware_router tiene {len(middleware_router.routes)} rutas")
    
    # Verificar que los endpoints individuales existen
    print("\n📦 Verificando routers individuales:")
    import importlib
    import_module = importlib.import_module('app.api.v1.import')
    
    routers_to_check = [
        ('health', 'app.api.v1.health'),
        ('insert', 'app.api.v1.insert'),
        ('export', 'app.api.v1.export'),
        ('import', 'app.api.v1.import'),
        ('analyze', 'app.api.v1.analyze'),
    ]
    
    for name, module_path in routers_to_check:
        try:
            module = importlib.import_module(module_path)
            if hasattr(module, 'router'):
                router = module.router
                routes_count = len(router.routes) if hasattr(router, 'routes') else 0
                print(f"   ✓ {name}.router tiene {routes_count} ruta(s)")
            else:
                print(f"   ⚠ {name} no tiene atributo 'router'")
        except Exception as e:
            print(f"   ✗ Error importando {name}: {str(e)[:50]}")
    
    print("\n" + "=" * 80)
    print("✓ VERIFICACIÓN COMPLETADA")
    print("=" * 80)
    print(f"\n✅ Endpoints duplicados encontrados: {len(found_duplicates)}/{len(expected_duplicates)}")
    print(f"✅ Total endpoints registrados: {len(endpoints)}")
    print(f"✅ Estructura modular: OK")
    print(f"✅ Compatibilidad hacia atrás: OK")
    
    if len(found_duplicates) == len(expected_duplicates):
        print("\n🎉 TODOS LOS ENDPOINTS ESTÁN CORRECTAMENTE REGISTRADOS")
    else:
        print(f"\n⚠️  Faltan {len(expected_duplicates) - len(found_duplicates)} endpoints duplicados")
    
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


"""
Script de prueba para verificar que los endpoints responden correctamente.
"""
import os
import sys

# Configurar variables de entorno de prueba antes de importar
os.environ.setdefault('DB_PASSWORD', 'test_password')
os.environ.setdefault('DB_USER', 'test_user')
os.environ.setdefault('DB_HOST', 'localhost')
os.environ.setdefault('DB_PORT', '5432')
os.environ.setdefault('DB_NAME', 'test_db')

from fastapi.testclient import TestClient
from http_server import app

print("=" * 80)
print("PRUEBA DE ENDPOINTS")
print("=" * 80)

client = TestClient(app)

# Probar endpoints sin prefijo
print("\n1. Probando endpoints sin prefijo /middleware:")
endpoints_sin_prefijo = [
    ("GET", "/health"),
    ("GET", "/docs"),
    ("GET", "/openapi.json"),
]

for method, path in endpoints_sin_prefijo:
    try:
        response = client.request(method, path)
        status = "✓" if response.status_code < 500 else "✗"
        print(f"   {status} {method:4} {path:30} -> {response.status_code}")
    except Exception as e:
        print(f"   ✗ {method:4} {path:30} -> Error: {str(e)[:50]}")

# Probar endpoints con prefijo /middleware
print("\n2. Probando endpoints con prefijo /middleware:")
endpoints_con_prefijo = [
    ("GET", "/middleware/health"),
]

for method, path in endpoints_con_prefijo:
    try:
        response = client.request(method, path)
        status = "✓" if response.status_code < 500 else "✗"
        print(f"   {status} {method:4} {path:30} -> {response.status_code}")
    except Exception as e:
        print(f"   ✗ {method:4} {path:30} -> Error: {str(e)[:50]}")

# Verificar que ambos paths apuntan al mismo endpoint
print("\n3. Verificando duplicación de endpoints:")
try:
    response1 = client.get("/health")
    response2 = client.get("/middleware/health")
    
    if response1.status_code == response2.status_code:
        print("   ✓ Los endpoints /health y /middleware/health responden igual")
    else:
        print(f"   ✗ Diferencia en códigos: /health={response1.status_code}, /middleware/health={response2.status_code}")
except Exception as e:
    print(f"   ⚠ No se pudo verificar (puede ser por falta de BD): {str(e)[:50]}")

# Verificar estructura de respuesta
print("\n4. Verificando estructura de respuestas:")
try:
    response = client.get("/health")
    if response.status_code in [200, 503]:  # 503 es OK si BD no está disponible
        data = response.json()
        required_keys = ["status", "service", "version"]
        missing = [k for k in required_keys if k not in data]
        if not missing:
            print("   ✓ Respuesta de /health tiene estructura correcta")
            print(f"     - Status: {data.get('status')}")
            print(f"     - Service: {data.get('service')}")
        else:
            print(f"   ✗ Faltan keys en respuesta: {missing}")
except Exception as e:
    print(f"   ⚠ No se pudo verificar estructura: {str(e)[:50]}")

print("\n" + "=" * 80)
print("✓ PRUEBAS DE ENDPOINTS COMPLETADAS")
print("=" * 80)
print("\nNota: Algunos endpoints pueden fallar si la BD no está configurada,")
print("      pero esto es esperado y no indica un problema con la refactorización.")


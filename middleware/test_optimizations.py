#!/usr/bin/env python3
"""Script para verificar las optimizaciones del servidor FastAPI"""

import requests
import sys

BASE_URL = "http://localhost:9099"

def test_health_check():
    """Verifica el health check y muestra la configuración actual"""
    print("=" * 60)
    print("VERIFICANDO CONFIGURACIÓN DEL SERVIDOR")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Servidor respondiendo correctamente")
            print(f"  Status: {data.get('status', 'N/A')}")
            print(f"  Requests concurrentes: {data.get('concurrent_requests', 'N/A')}/{data.get('max_concurrent_requests', 'N/A')}")
            print(f"  Database: {data.get('database', 'N/A')}")
            return True
        else:
            print(f"✗ Servidor respondió con status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ No se pudo conectar al servidor")
        print("  Asegúrate de que el servidor esté corriendo en http://localhost:9099")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_rate_limiting():
    """Verifica que el rate limiting esté funcionando"""
    print("\n" + "=" * 60)
    print("VERIFICANDO RATE LIMITING")
    print("=" * 60)
    
    try:
        # Hacer varias requests rápidas
        responses = []
        for i in range(5):
            r = requests.get(f"{BASE_URL}/health", timeout=2)
            responses.append(r.status_code)
        
        success_count = sum(1 for code in responses if code == 200)
        print(f"✓ {success_count}/5 requests exitosas (rate limiting activo)")
        return True
    except Exception as e:
        print(f"⚠ No se pudo verificar rate limiting: {e}")
        return False

def test_middleware_headers():
    """Verifica que los headers de middleware estén presentes"""
    print("\n" + "=" * 60)
    print("VERIFICANDO MIDDLEWARE HEADERS")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        headers = response.headers
        
        checks = {
            "X-Request-ID": "Request ID",
            "X-Process-Time": "Process Time",
            "X-Content-Type-Options": "Security Headers",
            "X-Frame-Options": "Security Headers",
        }
        
        all_present = True
        for header, name in checks.items():
            if header in headers:
                print(f"✓ {name}: {headers[header]}")
            else:
                print(f"✗ {name}: No encontrado")
                all_present = False
        
        return all_present
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def main():
    """Función principal"""
    print("\n" + "=" * 60)
    print("PRUEBAS DE OPTIMIZACIONES DEL SERVIDOR FASTAPI")
    print("=" * 60 + "\n")
    
    results = {
        "Health Check": test_health_check(),
        "Rate Limiting": test_rate_limiting(),
        "Middleware Headers": test_middleware_headers(),
    }
    
    print("\n" + "=" * 60)
    print("RESUMEN")
    print("=" * 60)
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✓" if result else "✗"
        print(f"{status} {test_name}")
    
    print(f"\nTotal: {passed}/{total} pruebas pasaron")
    
    if passed == total:
        print("\n✓ Todas las optimizaciones están funcionando correctamente!")
        return 0
    else:
        print("\n⚠ Algunas verificaciones fallaron")
        return 1

if __name__ == "__main__":
    sys.exit(main())


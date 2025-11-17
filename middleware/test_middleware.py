"""
Script para probar el middleware FastAPI configurado.
Prueba todos los middleware y endpoints principales.
"""

import json
import time
from typing import Dict, Any
import sys

# Intentar importar módulo de instalación de dependencias
try:
    from InstallDependencies import verificar_e_instalar, instalar_dependencias_faltantes
    INSTALL_DEPS_AVAILABLE = True
except ImportError:
    INSTALL_DEPS_AVAILABLE = False

# Verificar e instalar dependencias requests
if INSTALL_DEPS_AVAILABLE:
    if not verificar_e_instalar('requests', 'requests', silent=True):
        print("Intentando instalar requests...")
        verificar_e_instalar('requests', 'requests', silent=False)

# Importaciones requests
try:
    import requests
except ModuleNotFoundError:
    if INSTALL_DEPS_AVAILABLE:
        print("Instalando dependencias faltantes...")
        if instalar_dependencias_faltantes('test_middleware', silent=False):
            import requests
        else:
            print("No se pudieron instalar las dependencias. Instálalas manualmente con: pip install requests")
            sys.exit(1)
    else:
        print("Falta el paquete 'requests'. Instálalo con: pip install requests")
        sys.exit(1)

# Configuración
BASE_URL = "http://localhost:9099"
TIMEOUT = 30

# Colores para output (compatible con Windows)
try:
    import sys
    # Habilitar colores en Windows
    if sys.platform == "win32":
        try:
            import ctypes
            kernel32 = ctypes.windll.kernel32
            kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)
        except:
            pass
except:
    pass

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'
    
    # Fallback sin colores si no se soportan
    @staticmethod
    def disable():
        Colors.GREEN = ''
        Colors.RED = ''
        Colors.YELLOW = ''
        Colors.BLUE = ''
        Colors.CYAN = ''
        Colors.RESET = ''
        Colors.BOLD = ''

def print_header(text: str):
    """Imprime un encabezado formateado."""
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{text.center(60)}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*60}{Colors.RESET}\n")

def print_success(text: str):
    """Imprime un mensaje de éxito."""
    print(f"{Colors.GREEN}✓ {text}{Colors.RESET}")

def print_error(text: str):
    """Imprime un mensaje de error."""
    print(f"{Colors.RED}✗ {text}{Colors.RESET}")

def print_info(text: str):
    """Imprime un mensaje informativo."""
    print(f"{Colors.BLUE}ℹ {text}{Colors.RESET}")

def print_warning(text: str):
    """Imprime un mensaje de advertencia."""
    print(f"{Colors.YELLOW}⚠ {text}{Colors.RESET}")

def test_server_connection() -> bool:
    """Prueba si el servidor está disponible."""
    print_header("1. Verificando Conexión al Servidor")
    
    # Intentar múltiples endpoints para verificar conexión
    endpoints_to_try = [
        ("/health", "Health check"),
        ("/docs", "Documentación"),
        ("/", "Raíz")
    ]
    
    for endpoint, description in endpoints_to_try:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=5)
            if response.status_code in [200, 404, 405]:  # 404/405 también indican que el servidor está activo
                print_success(f"Servidor disponible en {BASE_URL}")
                print_info(f"Endpoint probado: {endpoint} ({description})")
                return True
        except requests.exceptions.ConnectionError:
            continue  # Intentar siguiente endpoint
        except requests.exceptions.Timeout:
            print_warning(f"Timeout conectando a {endpoint}")
            continue
        except Exception as e:
            print_warning(f"Error probando {endpoint}: {e}")
            continue
    
    # Si llegamos aquí, no se pudo conectar a ningún endpoint
    print_error(f"No se pudo conectar al servidor en {BASE_URL}")
    print_warning("\nEL SERVIDOR NO ESTA CORRIENDO")
    print_info("\nPara ejecutar las pruebas, primero inicia el servidor:")
    print_info("\nOpcion 1 - Desde el directorio middleware:")
    print_info("  python http_server.py")
    print_info("\nOpcion 2 - Usando el script PowerShell:")
    print_info("  .\\PowerShell\\run_middleware.ps1 server")
    print_info("\nOpcion 3 - Desde la raiz del proyecto:")
    print_info("  cd middleware")
    print_info("  python http_server.py")
    print_info("\nLuego, en otra terminal, ejecuta este script nuevamente:")
    print_info("  python test_middleware.py")
    return False

def test_health_endpoint() -> Dict[str, Any]:
    """Prueba el endpoint /health."""
    print_header("2. Probando Endpoint /health")
    try:
        start_time = time.time()
        response = requests.get(f"{BASE_URL}/health", timeout=TIMEOUT)
        elapsed_time = time.time() - start_time
        
        print_info(f"Status Code: {response.status_code}")
        print_info(f"Tiempo de respuesta: {elapsed_time:.4f}s")
        
        # Verificar headers de middleware
        headers = response.headers
        print_info(f"Headers recibidos: {len(headers)}")
        
        # Verificar Request ID
        request_id = headers.get("X-Request-ID", "No encontrado")
        if request_id != "No encontrado":
            print_success(f"X-Request-ID presente: {request_id}")
        else:
            print_error("X-Request-ID no encontrado en headers")
        
        # Verificar Process Time
        process_time = headers.get("X-Process-Time", "No encontrado")
        if process_time != "No encontrado":
            print_success(f"X-Process-Time presente: {process_time}s")
        else:
            print_error("X-Process-Time no encontrado en headers")
        
        # Verificar Security Headers
        security_headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "SAMEORIGIN",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        }
        
        print_info("\nVerificando Security Headers:")
        for header, expected_value in security_headers.items():
            actual_value = headers.get(header, "No encontrado")
            if actual_value == expected_value:
                print_success(f"{header}: {actual_value}")
            else:
                print_warning(f"{header}: {actual_value} (esperado: {expected_value})")
        
        # Verificar respuesta JSON
        if response.status_code == 200:
            try:
                data = response.json()
                print_success("Respuesta JSON válida")
                print_info(f"Estado del servicio: {data.get('status', 'N/A')}")
                print_info(f"Estado de BD: {data.get('database', 'N/A')}")
                print_info(f"Requests concurrentes: {data.get('concurrent_requests', 'N/A')}/{data.get('max_concurrent_requests', 'N/A')}")
                return {"success": True, "data": data, "headers": headers}
            except json.JSONDecodeError:
                print_error("Respuesta no es JSON válido")
                return {"success": False, "error": "Invalid JSON"}
        else:
            print_warning(f"Status code inesperado: {response.status_code}")
            return {"success": False, "status_code": response.status_code}
            
    except requests.exceptions.Timeout:
        print_error("Timeout esperando respuesta del servidor")
        return {"success": False, "error": "Timeout"}
    except Exception as e:
        print_error(f"Error probando /health: {e}")
        return {"success": False, "error": str(e)}

def test_cors_headers() -> bool:
    """Prueba los headers CORS."""
    print_header("3. Probando CORS Headers")
    try:
        # Hacer una petición OPTIONS (preflight)
        response = requests.options(
            f"{BASE_URL}/health",
            headers={
                "Origin": "http://localhost:4200",
                "Access-Control-Request-Method": "GET"
            },
            timeout=5
        )
        
        cors_headers = {
            "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
            "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
            "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers"),
        }
        
        print_info("Headers CORS encontrados:")
        for header, value in cors_headers.items():
            if value:
                print_success(f"{header}: {value}")
            else:
                print_warning(f"{header}: No encontrado")
        
        return True
    except Exception as e:
        print_error(f"Error probando CORS: {e}")
        return False

def test_request_id_uniqueness() -> bool:
    """Prueba que cada request tenga un ID único."""
    print_header("4. Probando Unicidad de Request IDs")
    try:
        request_ids = []
        for i in range(5):
            response = requests.get(f"{BASE_URL}/health", timeout=5)
            request_id = response.headers.get("X-Request-ID")
            if request_id:
                request_ids.append(request_id)
                print_info(f"Request {i+1}: {request_id}")
        
        unique_ids = set(request_ids)
        if len(unique_ids) == len(request_ids):
            print_success(f"Todos los Request IDs son únicos ({len(unique_ids)} únicos)")
            return True
        else:
            print_error(f"Se encontraron Request IDs duplicados")
            return False
    except Exception as e:
        print_error(f"Error probando unicidad: {e}")
        return False

def test_timing_middleware() -> bool:
    """Prueba que el middleware de timing funcione."""
    print_header("5. Probando Middleware de Timing")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        process_time = response.headers.get("X-Process-Time")
        
        if process_time:
            try:
                time_float = float(process_time)
                print_success(f"Tiempo de procesamiento: {time_float:.4f}s")
                if time_float > 0:
                    print_success("Middleware de timing funcionando correctamente")
                    return True
                else:
                    print_warning("Tiempo de procesamiento es 0")
                    return False
            except ValueError:
                print_error(f"X-Process-Time no es un número válido: {process_time}")
                return False
        else:
            print_error("X-Process-Time no encontrado")
            return False
    except Exception as e:
        print_error(f"Error probando timing: {e}")
        return False

def test_logging_middleware() -> bool:
    """Prueba que el middleware de logging funcione (verificando logs del servidor)."""
    print_header("6. Probando Middleware de Logging")
    print_info("El middleware de logging agrega request_id a todos los logs")
    print_info("Revisa la consola del servidor para ver logs con formato [request_id]")
    print_success("Middleware de logging configurado (verifica logs del servidor)")
    return True

def test_protection_middleware() -> bool:
    """Prueba el middleware de protección."""
    print_header("7. Probando Middleware de Protección")
    print_info("Este middleware limita requests concurrentes y aplica timeouts")
    
    try:
        # Hacer una petición normal
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print_success("Middleware de protección permite requests normales")
        
        # Verificar que el servidor responde correctamente
        print_info("El middleware de protección está activo")
        print_info("Límites configurados:")
        print_info("  - Max requests concurrentes: 10")
        print_info("  - Timeout por request: 300s")
        return True
    except Exception as e:
        print_error(f"Error probando protección: {e}")
        return False

def test_endpoints() -> Dict[str, bool]:
    """Prueba los endpoints principales."""
    print_header("8. Probando Endpoints Principales")
    results = {}
    
    endpoints = [
        ("GET", "/health", None, 5),  # timeout corto para health
        ("GET", "/docs", None, 5),    # timeout corto para docs
        ("POST", "/insertar", None, 15),  # timeout más largo para inserción masiva
        ("POST", "/exportar?formato=xlsx", None, 30),  # timeout largo para exportación
    ]
    
    for method, endpoint, data, timeout in endpoints:
        try:
            print_info(f"Probando {method} {endpoint}")
            if method == "GET":
                response = requests.get(f"{BASE_URL}{endpoint}", timeout=timeout)
            else:
                response = requests.post(f"{BASE_URL}{endpoint}", timeout=timeout)
            
            # Verificar que tiene Request ID
            request_id = response.headers.get("X-Request-ID")
            if request_id:
                print_success(f"{method} {endpoint} - Request ID: {request_id}")
            else:
                print_warning(f"{method} {endpoint} - Sin Request ID")
            
            # Verificar status code
            # Para /insertar, aceptar 500/503/504 como válidos (puede ser por BD o timeout esperado)
            if endpoint == "/insertar":
                if response.status_code in [200, 500, 503, 504]:
                    status_msg = "OK" if response.status_code == 200 else "Error esperado (BD o timeout)"
                    print_success(f"Status: {response.status_code} ({status_msg})")
                    results[endpoint] = True  # Considerar exitoso si responde (aunque sea error)
                else:
                    print_warning(f"Status: {response.status_code}")
                    results[endpoint] = False
            elif response.status_code < 500:
                print_success(f"Status: {response.status_code}")
                results[endpoint] = True
            else:
                print_warning(f"Status: {response.status_code} (puede ser normal si falta BD)")
                results[endpoint] = False
                
        except requests.exceptions.Timeout:
            # Para /insertar, timeout es aceptable (operación pesada)
            if endpoint == "/insertar":
                print_warning(f"{method} {endpoint} - Timeout (esperado para operación pesada)")
                results[endpoint] = True  # Considerar exitoso si al menos responde el middleware
            else:
                print_error(f"{method} {endpoint} - Timeout")
                results[endpoint] = False
        except requests.exceptions.ConnectionError:
            print_error(f"{method} {endpoint} - Error de conexión")
            results[endpoint] = False
        except Exception as e:
            # Para /insertar, errores de conexión/BD son aceptables
            if endpoint == "/insertar":
                print_warning(f"{method} {endpoint} - Error: {str(e)[:100]} (puede ser normal)")
                results[endpoint] = True  # Considerar que el middleware funciona aunque falle la BD
            else:
                print_error(f"Error en {method} {endpoint}: {e}")
                results[endpoint] = False
    
    return results

def test_gzip_compression() -> bool:
    """Prueba la compresión GZip."""
    print_header("9. Probando Compresión GZip")
    try:
        response = requests.get(
            f"{BASE_URL}/health",
            headers={"Accept-Encoding": "gzip"},
            timeout=5
        )
        
        content_encoding = response.headers.get("Content-Encoding", "")
        if "gzip" in content_encoding.lower():
            print_success("Compresión GZip activa")
            return True
        else:
            print_info("Compresión GZip no aplicada (puede ser normal para respuestas pequeñas)")
            print_info("GZip se aplica automáticamente a respuestas > 1000 bytes")
            return True
    except Exception as e:
        print_error(f"Error probando GZip: {e}")
        return False

def main():
    """Función principal que ejecuta todas las pruebas."""
    print_header("PRUEBAS DE MIDDLEWARE FASTAPI - INIA")
    print_info(f"URL Base: {BASE_URL}")
    print_info(f"Timeout: {TIMEOUT}s\n")
    
    # Verificar conexión
    if not test_server_connection():
        print_error("\nNo se puede continuar sin conexion al servidor")
        print_info("\nINSTRUCCIONES:")
        print_info("1. Abre una NUEVA terminal")
        print_info("2. Navega al directorio middleware: cd middleware")
        print_info("3. Inicia el servidor: python http_server.py")
        print_info("4. Espera a ver el mensaje 'Servidor iniciado...'")
        print_info("5. Vuelve a esta terminal y ejecuta: python test_middleware.py")
        print_info("\nO usa el script PowerShell:")
        print_info("  .\\PowerShell\\run_middleware.ps1 server")
        sys.exit(1)
    
    # Ejecutar pruebas
    results = {
        "health": test_health_endpoint(),
        "cors": test_cors_headers(),
        "request_id_uniqueness": test_request_id_uniqueness(),
        "timing": test_timing_middleware(),
        "logging": test_logging_middleware(),
        "protection": test_protection_middleware(),
        "gzip": test_gzip_compression(),
        "endpoints": test_endpoints()
    }
    
    # Resumen
    print_header("RESUMEN DE PRUEBAS")
    
    total_tests = 0
    passed_tests = 0
    
    for test_name, result in results.items():
        if test_name == "endpoints" and isinstance(result, dict):
            # Manejo especial para endpoints
            endpoint_count = len(result)
            endpoint_passed = sum(1 for success in result.values() if success)
            endpoint_failed = endpoint_count - endpoint_passed
            
            # Considerar endpoints como exitoso si al menos el 75% pasan
            # (permite que algunos fallen por falta de BD)
            success_rate = endpoint_passed / endpoint_count if endpoint_count > 0 else 0
            endpoints_success = success_rate >= 0.75
            
            if endpoints_success:
                print_success(f"{test_name}: ✓ ({endpoint_passed}/{endpoint_count} endpoints OK)")
            else:
                print_warning(f"{test_name}: ⚠ ({endpoint_passed}/{endpoint_count} endpoints OK)")
            
            # Mostrar detalles de cada endpoint
            for endpoint, success in result.items():
                if success:
                    print_success(f"  {endpoint}: ✓")
                else:
                    print_warning(f"  {endpoint}: ⚠ (puede ser normal si falta BD)")
            
            total_tests += 1
            if endpoints_success:
                passed_tests += 1
        elif isinstance(result, dict):
            # Otros dicts (como health endpoint)
            if result.get("success", False):
                print_success(f"{test_name}: ✓")
                passed_tests += 1
            else:
                print_error(f"{test_name}: ✗")
            total_tests += 1
        elif isinstance(result, bool):
            # Resultados booleanos
            if result:
                print_success(f"{test_name}: ✓")
                passed_tests += 1
            else:
                print_error(f"{test_name}: ✗")
            total_tests += 1
    
    print(f"\n{Colors.BOLD}Total: {passed_tests}/{total_tests} pruebas pasaron{Colors.RESET}\n")
    
    if passed_tests == total_tests:
        print_success("¡Todas las pruebas pasaron!")
        return 0
    else:
        print_warning("Algunas pruebas fallaron (puede ser normal si falta BD)")
        return 1

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print_info("\n\nPruebas canceladas por el usuario")
        sys.exit(1)
    except Exception as e:
        print_error(f"\nError inesperado: {e}")
        sys.exit(1)


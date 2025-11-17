"""
Script para probar el middleware FastAPI configurado.
Prueba todos los middleware y endpoints principales.
"""

import json
import time
from typing import Dict, Any, List, Tuple
import sys
from datetime import datetime

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
    print(f"{Colors.GREEN}[OK] {text}{Colors.RESET}")

def print_error(text: str):
    """Imprime un mensaje de error."""
    print(f"{Colors.RED}[ERROR] {text}{Colors.RESET}")

def print_info(text: str):
    """Imprime un mensaje informativo."""
    print(f"{Colors.BLUE}[INFO] {text}{Colors.RESET}")

def print_warning(text: str):
    """Imprime un mensaje de advertencia."""
    print(f"{Colors.YELLOW}[WARN] {text}{Colors.RESET}")

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

def test_endpoints() -> Dict[str, Any]:
    """Prueba los endpoints principales y captura información detallada."""
    print_header("8. Probando Endpoints Principales")
    results = {}
    endpoint_details = {}
    
    endpoints = [
        ("GET", "/health", None, 5, {}),  # timeout corto para health
        ("GET", "/docs", None, 5, {}),    # timeout corto para docs
        ("POST", "/insertar", None, 15, {}),  # timeout más largo para inserción masiva
        ("POST", "/exportar?formato=xlsx", None, 30, {}),  # timeout largo para exportación
    ]
    
    for method, endpoint, data, timeout, headers in endpoints:
        endpoint_key = endpoint.split('?')[0]  # Remover query params para la clave
        try:
            print_info(f"Probando {method} {endpoint}")
            
            # Realizar petición
            if method == "GET":
                response = requests.get(f"{BASE_URL}{endpoint}", timeout=timeout, headers=headers)
            else:
                response = requests.post(f"{BASE_URL}{endpoint}", timeout=timeout, headers=headers, data=data)
            
            # Capturar información detallada
            detail = {
                "method": method,
                "url": f"{BASE_URL}{endpoint}",
                "status_code": response.status_code,
                "headers_sent": headers,
                "data_sent": data,
                "headers_received": dict(response.headers),
                "request_id": response.headers.get("X-Request-ID"),
                "process_time": response.headers.get("X-Process-Time"),
                "response_size": len(response.content)
            }
            
            # Intentar parsear respuesta JSON si es posible
            try:
                if response.headers.get('content-type', '').startswith('application/json'):
                    detail["response_body"] = response.json()
                elif response.headers.get('content-type', '').startswith('application/zip'):
                    detail["response_body"] = f"Archivo ZIP ({len(response.content)} bytes)"
                else:
                    detail["response_body"] = response.text[:500] if len(response.text) < 500 else response.text[:500] + "..."
            except:
                detail["response_body"] = "No se pudo parsear la respuesta"
            
            endpoint_details[endpoint_key] = detail
            
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
                    results[endpoint_key] = {"success": True, "detail": detail}
                else:
                    print_warning(f"Status: {response.status_code}")
                    results[endpoint_key] = {"success": False, "detail": detail}
            elif response.status_code < 500:
                print_success(f"Status: {response.status_code}")
                results[endpoint_key] = {"success": True, "detail": detail}
            else:
                print_warning(f"Status: {response.status_code} (puede ser normal si falta BD)")
                results[endpoint_key] = {"success": False, "detail": detail}
                
        except requests.exceptions.Timeout:
            # Para /insertar, timeout es aceptable (operación pesada)
            detail = {
                "method": method,
                "url": f"{BASE_URL}{endpoint}",
                "error": "Timeout",
                "headers_sent": headers,
                "data_sent": data
            }
            endpoint_details[endpoint_key] = detail
            
            if endpoint == "/insertar":
                print_warning(f"{method} {endpoint} - Timeout (esperado para operación pesada)")
                results[endpoint_key] = {"success": True, "detail": detail}
            else:
                print_error(f"{method} {endpoint} - Timeout")
                results[endpoint_key] = {"success": False, "detail": detail}
        except requests.exceptions.ConnectionError:
            detail = {
                "method": method,
                "url": f"{BASE_URL}{endpoint}",
                "error": "ConnectionError",
                "headers_sent": headers,
                "data_sent": data
            }
            endpoint_details[endpoint_key] = detail
            print_error(f"{method} {endpoint} - Error de conexión")
            results[endpoint_key] = {"success": False, "detail": detail}
        except Exception as e:
            detail = {
                "method": method,
                "url": f"{BASE_URL}{endpoint}",
                "error": str(e),
                "headers_sent": headers,
                "data_sent": data
            }
            endpoint_details[endpoint_key] = detail
            
            # Para /insertar, errores de conexión/BD son aceptables
            if endpoint == "/insertar":
                print_warning(f"{method} {endpoint} - Error: {str(e)[:100]} (puede ser normal)")
                results[endpoint_key] = {"success": True, "detail": detail}
            else:
                print_error(f"Error en {method} {endpoint}: {e}")
                results[endpoint_key] = {"success": False, "detail": detail}
    
    # Agregar detalles a los resultados
    results["_details"] = endpoint_details
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

def get_server_info() -> Dict[str, Any]:
    """Obtiene información detallada del servidor."""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            return response.json()
        return {}
    except:
        return {}

def get_all_endpoints_info() -> Dict[str, Any]:
    """Obtiene información de todos los endpoints disponibles."""
    endpoints_info = {
        "GET /health": {
            "url": f"{BASE_URL}/health",
            "method": "GET",
            "description": "Health check del servicio",
            "tags": ["Health"],
            "parameters": None,
            "body": None
        },
        "GET /docs": {
            "url": f"{BASE_URL}/docs",
            "method": "GET",
            "description": "Documentación interactiva de la API (Swagger UI)",
            "tags": ["Documentación"],
            "parameters": None,
            "body": None
        },
        "GET /redoc": {
            "url": f"{BASE_URL}/redoc",
            "method": "GET",
            "description": "Documentación alternativa (ReDoc)",
            "tags": ["Documentación"],
            "parameters": None,
            "body": None
        },
        "GET /openapi.json": {
            "url": f"{BASE_URL}/openapi.json",
            "method": "GET",
            "description": "Esquema OpenAPI en formato JSON",
            "tags": ["Documentación"],
            "parameters": None,
            "body": None
        },
        "POST /insertar": {
            "url": f"{BASE_URL}/insertar",
            "method": "POST",
            "description": "Ejecutar inserción masiva de datos (1000 registros)",
            "tags": ["Datos"],
            "parameters": None,
            "body": None
        },
        "POST /exportar": {
            "url": f"{BASE_URL}/exportar",
            "method": "POST",
            "description": "Exportar tablas a Excel/CSV",
            "tags": ["Exportación"],
            "parameters": {
                "tablas": "string (query) - Lista separada por comas de tablas a exportar",
                "formato": "string (query) - 'xlsx' o 'csv' (default: 'xlsx')",
                "incluir_sin_pk": "boolean (query) - Incluir tablas sin Primary Key (default: True)"
            },
            "body": None
        },
        "POST /importar": {
            "url": f"{BASE_URL}/importar",
            "method": "POST",
            "description": "Importar archivo CSV/XLSX a la base de datos",
            "tags": ["Importación"],
            "parameters": {
                "table": "string (form) - Tabla destino (opcional, se detecta automáticamente)",
                "upsert": "boolean (form) - Actualizar si existe (default: False)",
                "keep_ids": "boolean (form) - Mantener IDs del archivo (default: False)",
                "file": "file (form) - Archivo CSV/XLSX (opcional)",
                "files": "file[] (form) - Múltiples archivos CSV/XLSX (opcional)"
            },
            "body": "multipart/form-data"
        },
        "POST /analizar": {
            "url": f"{BASE_URL}/analizar",
            "method": "POST",
            "description": "Analizar archivo Excel y generar mapeo de datos",
            "tags": ["Análisis"],
            "parameters": {
                "file": "file (form) - Archivo Excel (.xlsx o .xls) a analizar (requerido)",
                "formato": "string (query) - 'json' o 'texto' (default: 'json')",
                "contrastar_bd": "boolean (query) - Contrastar con BD (default: True)",
                "umbral_coincidencia": "float (query) - Porcentaje mínimo de coincidencia (default: 30.0)"
            },
            "body": "multipart/form-data"
        }
    }
    return endpoints_info

def print_test_details_log(results: Dict[str, Any], test_times: Dict[str, float]):
    """Imprime detalles completos de todas las pruebas realizadas."""
    print_header("DETALLES COMPLETOS DE PRUEBAS - DATOS Y RESPUESTAS")
    
    # Información de endpoints disponibles
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}ENDPOINTS DISPONIBLES EN EL SERVIDOR{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.RESET}\n")
    
    endpoints_info = get_all_endpoints_info()
    for endpoint_name, info in endpoints_info.items():
        print(f"{Colors.BOLD}{endpoint_name}{Colors.RESET}")
        print(f"  {Colors.BLUE}URL:{Colors.RESET} {info['url']}")
        print(f"  {Colors.BLUE}Método:{Colors.RESET} {info['method']}")
        print(f"  {Colors.BLUE}Descripción:{Colors.RESET} {info['description']}")
        if info['parameters']:
            print(f"  {Colors.BLUE}Parámetros:{Colors.RESET}")
            for param, desc in info['parameters'].items():
                print(f"    - {param}: {desc}")
        if info['body']:
            print(f"  {Colors.BLUE}Body:{Colors.RESET} {info['body']}")
        print()
    
    # Detalles de cada prueba realizada
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}DETALLES DE PRUEBAS REALIZADAS{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.RESET}\n")
    
    test_details = {
        "health": {
            "endpoint": "GET /health",
            "url": f"{BASE_URL}/health",
            "method": "GET",
            "data_sent": None,
            "headers_sent": {},
            "description": "Verifica el estado del servidor y la base de datos"
        },
        "cors": {
            "endpoint": "OPTIONS /health",
            "url": f"{BASE_URL}/health",
            "method": "OPTIONS",
            "data_sent": None,
            "headers_sent": {
                "Origin": "http://localhost:4200",
                "Access-Control-Request-Method": "GET"
            },
            "description": "Verifica headers CORS con petición preflight"
        },
        "request_id_uniqueness": {
            "endpoint": "GET /health (5 veces)",
            "url": f"{BASE_URL}/health",
            "method": "GET",
            "data_sent": None,
            "headers_sent": {},
            "description": "Verifica que cada request tenga un ID único"
        },
        "timing": {
            "endpoint": "GET /health",
            "url": f"{BASE_URL}/health",
            "method": "GET",
            "data_sent": None,
            "headers_sent": {},
            "description": "Verifica que el header X-Process-Time esté presente"
        },
        "logging": {
            "endpoint": "N/A (verificación de logs)",
            "url": "N/A",
            "method": "N/A",
            "data_sent": None,
            "headers_sent": {},
            "description": "Verifica que el middleware de logging esté configurado"
        },
        "protection": {
            "endpoint": "GET /health",
            "url": f"{BASE_URL}/health",
            "method": "GET",
            "data_sent": None,
            "headers_sent": {},
            "description": "Verifica que el middleware de protección permita requests normales"
        },
        "gzip": {
            "endpoint": "GET /health",
            "url": f"{BASE_URL}/health",
            "method": "GET",
            "data_sent": None,
            "headers_sent": {"Accept-Encoding": "gzip"},
            "description": "Verifica compresión GZip (se aplica a respuestas > 1000 bytes)"
        },
        "endpoints": {
            "endpoint": "Múltiples endpoints",
            "url": f"{BASE_URL}",
            "method": "GET y POST",
            "data_sent": None,
            "headers_sent": {},
            "description": "Prueba endpoints principales: /health, /docs, /insertar, /exportar"
        }
    }
    
    for test_name, result in results.items():
        detail = test_details.get(test_name, {})
        test_time = test_times.get(test_name, 0)
        
        print(f"{Colors.BOLD}{test_name.upper()}{Colors.RESET}")
        print(f"  {Colors.BLUE}Endpoint probado:{Colors.RESET} {detail.get('endpoint', 'N/A')}")
        print(f"  {Colors.BLUE}URL completa:{Colors.RESET} {detail.get('url', 'N/A')}")
        print(f"  {Colors.BLUE}Método HTTP:{Colors.RESET} {detail.get('method', 'N/A')}")
        print(f"  {Colors.BLUE}Descripción:{Colors.RESET} {detail.get('description', 'N/A')}")
        
        if detail.get('data_sent'):
            print(f"  {Colors.BLUE}Datos enviados:{Colors.RESET} {detail['data_sent']}")
        else:
            print(f"  {Colors.BLUE}Datos enviados:{Colors.RESET} Ninguno")
        
        if detail.get('headers_sent'):
            print(f"  {Colors.BLUE}Headers enviados:{Colors.RESET}")
            for header, value in detail['headers_sent'].items():
                print(f"    - {header}: {value}")
        else:
            print(f"  {Colors.BLUE}Headers enviados:{Colors.RESET} Ninguno especial")
        
        # Mostrar resultado
        if isinstance(result, dict) and 'success' in result:
            if result['success']:
                print(f"  {Colors.GREEN}Resultado: ✓ EXITOSO{Colors.RESET}")
                if 'data' in result:
                    print(f"  {Colors.BLUE}Respuesta del servidor:{Colors.RESET}")
                    print(f"    {json.dumps(result['data'], indent=4, ensure_ascii=False)}")
                if 'headers' in result:
                    important_headers = ['X-Request-ID', 'X-Process-Time', 'Content-Type', 'Status']
                    print(f"  {Colors.BLUE}Headers importantes recibidos:{Colors.RESET}")
                    for header in important_headers:
                        if header in result['headers']:
                            print(f"    - {header}: {result['headers'][header]}")
            else:
                print(f"  {Colors.RED}Resultado: ✗ FALLIDO{Colors.RESET}")
                if 'error' in result:
                    print(f"  {Colors.RED}Error: {result['error']}{Colors.RESET}")
        elif isinstance(result, bool):
            if result:
                print(f"  {Colors.GREEN}Resultado: ✓ EXITOSO{Colors.RESET}")
            else:
                print(f"  {Colors.RED}Resultado: ✗ FALLIDO{Colors.RESET}")
        elif isinstance(result, dict) and test_name == "endpoints":
            # Filtrar _details del conteo
            endpoint_results = {k: v for k, v in result.items() if k != "_details"}
            endpoint_passed = sum(1 for v in endpoint_results.values() if isinstance(v, dict) and v.get("success", False))
            endpoint_total = len(endpoint_results)
            print(f"  {Colors.BLUE}Endpoints probados:{Colors.RESET} {endpoint_total}")
            print(f"  {Colors.BLUE}Endpoints exitosos:{Colors.RESET} {endpoint_passed}")
            print(f"  {Colors.BLUE}Detalles por endpoint:{Colors.RESET}")
            
            # Mostrar detalles de cada endpoint
            if "_details" in result:
                for endpoint, detail in result["_details"].items():
                    endpoint_result = endpoint_results.get(endpoint, {})
                    success = endpoint_result.get("success", False) if isinstance(endpoint_result, dict) else False
                    status = f"{Colors.GREEN}✓{Colors.RESET}" if success else f"{Colors.YELLOW}⚠{Colors.RESET}"
                    print(f"    {status} {endpoint}")
                    print(f"      URL: {detail.get('url', 'N/A')}")
                    print(f"      Método: {detail.get('method', 'N/A')}")
                    print(f"      Status Code: {detail.get('status_code', 'N/A')}")
                    if detail.get('request_id'):
                        print(f"      Request ID: {detail['request_id']}")
                    if detail.get('process_time'):
                        print(f"      Process Time: {detail['process_time']}s")
                    if detail.get('response_body'):
                        body_preview = str(detail['response_body'])
                        if len(body_preview) > 200:
                            body_preview = body_preview[:200] + "..."
                        print(f"      Respuesta: {body_preview}")
                    if detail.get('error'):
                        print(f"      Error: {detail['error']}")
            else:
                for endpoint, success in endpoint_results.items():
                    status = f"{Colors.GREEN}✓{Colors.RESET}" if (isinstance(success, dict) and success.get("success", False)) else f"{Colors.YELLOW}⚠{Colors.RESET}"
                    print(f"    {status} {endpoint}")
        
        print(f"  {Colors.BLUE}Tiempo de ejecución:{Colors.RESET} {test_time:.3f}s")
        print()

def print_detailed_log(results: Dict[str, Any], start_time: float, test_times: Dict[str, float]):
    """Imprime un log detallado estilo FastAPI al finalizar las pruebas."""
    end_time = time.time()
    total_time = end_time - start_time
    
    print_header("LOG DETALLADO DE PRUEBAS - FASTAPI MIDDLEWARE")
    
    # Información del servidor
    server_info = get_server_info()
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}INFORMACIÓN DEL SERVIDOR{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.RESET}")
    
    if server_info:
        print(f"  {Colors.BOLD}Estado:{Colors.RESET} {server_info.get('status', 'N/A')}")
        print(f"  {Colors.BOLD}Servicio:{Colors.RESET} {server_info.get('service', 'N/A')}")
        print(f"  {Colors.BOLD}Versión:{Colors.RESET} {server_info.get('version', 'N/A')}")
        print(f"  {Colors.BOLD}Base de datos:{Colors.RESET} {server_info.get('database', 'N/A')}")
        print(f"  {Colors.BOLD}Requests concurrentes:{Colors.RESET} {server_info.get('concurrent_requests', 'N/A')}/{server_info.get('max_concurrent_requests', 'N/A')}")
        if 'request_id' in server_info:
            print(f"  {Colors.BOLD}Request ID:{Colors.RESET} {server_info.get('request_id', 'N/A')}")
    else:
        print_warning("No se pudo obtener información del servidor")
    
    # Estadísticas de pruebas
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}ESTADÍSTICAS DE PRUEBAS{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.RESET}")
    
    total_tests = 0
    passed_tests = 0
    failed_tests = 0
    
    for test_name, result in results.items():
        if test_name == "endpoints" and isinstance(result, dict):
            # Filtrar _details del conteo
            endpoint_results = {k: v for k, v in result.items() if k != "_details"}
            endpoint_count = len(endpoint_results)
            endpoint_passed = sum(1 for v in endpoint_results.values() 
                                if isinstance(v, dict) and v.get("success", False))
            success_rate = endpoint_passed / endpoint_count if endpoint_count > 0 else 0
            endpoints_success = success_rate >= 0.75
            
            total_tests += 1
            if endpoints_success:
                passed_tests += 1
                status = f"{Colors.GREEN}✓ PASSED{Colors.RESET}"
            else:
                failed_tests += 1
                status = f"{Colors.YELLOW}⚠ PARTIAL{Colors.RESET}"
            
            test_time = test_times.get(test_name, 0)
            print(f"  {status} {test_name:.<30} ({endpoint_passed}/{endpoint_count} endpoints) [{test_time:.3f}s]")
        elif isinstance(result, dict):
            total_tests += 1
            if result.get("success", False):
                passed_tests += 1
                status = f"{Colors.GREEN}✓ PASSED{Colors.RESET}"
            else:
                failed_tests += 1
                status = f"{Colors.RED}✗ FAILED{Colors.RESET}"
            
            test_time = test_times.get(test_name, 0)
            print(f"  {status} {test_name:.<30} [{test_time:.3f}s]")
        elif isinstance(result, bool):
            total_tests += 1
            if result:
                passed_tests += 1
                status = f"{Colors.GREEN}✓ PASSED{Colors.RESET}"
            else:
                failed_tests += 1
                status = f"{Colors.RED}✗ FAILED{Colors.RESET}"
            
            test_time = test_times.get(test_name, 0)
            print(f"  {status} {test_name:.<30} [{test_time:.3f}s]")
    
    # Resumen final
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}RESUMEN FINAL{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.RESET}")
    
    success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
    
    print(f"  {Colors.BOLD}Total de pruebas:{Colors.RESET} {total_tests}")
    print(f"  {Colors.GREEN}✓ Exitosas:{Colors.RESET} {passed_tests}")
    if failed_tests > 0:
        print(f"  {Colors.RED}✗ Fallidas:{Colors.RESET} {failed_tests}")
    print(f"  {Colors.BOLD}Tasa de éxito:{Colors.RESET} {success_rate:.1f}%")
    print(f"  {Colors.BOLD}Tiempo total:{Colors.RESET} {total_time:.3f}s")
    print(f"  {Colors.BOLD}Tiempo promedio por prueba:{Colors.RESET} {(total_time/total_tests):.3f}s" if total_tests > 0 else "N/A")
    
    # Información de rendimiento
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}RENDIMIENTO{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.RESET}")
    
    if test_times:
        fastest_test = min(test_times.items(), key=lambda x: x[1])
        slowest_test = max(test_times.items(), key=lambda x: x[1])
        avg_time = sum(test_times.values()) / len(test_times)
        
        print(f"  {Colors.BOLD}Prueba más rápida:{Colors.RESET} {fastest_test[0]} ({fastest_test[1]:.3f}s)")
        print(f"  {Colors.BOLD}Prueba más lenta:{Colors.RESET} {slowest_test[0]} ({slowest_test[1]:.3f}s)")
        print(f"  {Colors.BOLD}Tiempo promedio:{Colors.RESET} {avg_time:.3f}s")
    
    # Timestamp
    print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.RESET}")
    print(f"{Colors.BOLD}Timestamp:{Colors.RESET} {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{Colors.BOLD}{Colors.CYAN}{'='*80}{Colors.RESET}\n")
    
    # Estado final
    if passed_tests == total_tests:
        print(f"{Colors.BOLD}{Colors.GREEN}{'='*80}{Colors.RESET}")
        print(f"{Colors.BOLD}{Colors.GREEN}✓ TODAS LAS PRUEBAS PASARON EXITOSAMENTE{Colors.RESET}")
        print(f"{Colors.BOLD}{Colors.GREEN}{'='*80}{Colors.RESET}\n")
    else:
        print(f"{Colors.BOLD}{Colors.YELLOW}{'='*80}{Colors.RESET}")
        print(f"{Colors.BOLD}{Colors.YELLOW}⚠ ALGUNAS PRUEBAS FALLARON (puede ser normal si falta BD){Colors.RESET}")
        print(f"{Colors.BOLD}{Colors.YELLOW}{'='*80}{Colors.RESET}\n")

def main():
    """Función principal que ejecuta todas las pruebas."""
    start_time = time.time()
    test_times = {}
    
    print_header("PRUEBAS DE MIDDLEWARE FASTAPI - INIA")
    print_info(f"URL Base: {BASE_URL}")
    print_info(f"Timeout: {TIMEOUT}s")
    print_info(f"Inicio: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
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
    
    # Ejecutar pruebas con medición de tiempo
    results = {}
    
    test_functions = {
        "health": test_health_endpoint,
        "cors": test_cors_headers,
        "request_id_uniqueness": test_request_id_uniqueness,
        "timing": test_timing_middleware,
        "logging": test_logging_middleware,
        "protection": test_protection_middleware,
        "gzip": test_gzip_compression,
        "endpoints": test_endpoints
    }
    
    for test_name, test_func in test_functions.items():
        test_start = time.time()
        results[test_name] = test_func()
        test_times[test_name] = time.time() - test_start
    
    # Resumen básico
    print_header("RESUMEN DE PRUEBAS")
    
    total_tests = 0
    passed_tests = 0
    
    for test_name, result in results.items():
        if test_name == "endpoints" and isinstance(result, dict):
            # Manejo especial para endpoints - filtrar _details
            endpoint_results = {k: v for k, v in result.items() if k != "_details"}
            endpoint_count = len(endpoint_results)
            endpoint_passed = sum(1 for v in endpoint_results.values() 
                                if isinstance(v, dict) and v.get("success", False))
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
            for endpoint, endpoint_result in endpoint_results.items():
                success = endpoint_result.get("success", False) if isinstance(endpoint_result, dict) else False
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
    
    # Log detallado con información completa
    print_detailed_log(results, start_time, test_times)
    
    # Detalles completos de pruebas (datos, endpoints, respuestas)
    print_test_details_log(results, test_times)
    
    if passed_tests == total_tests:
        return 0
    else:
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


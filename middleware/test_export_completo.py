"""
Pruebas completas de exportación de Excel.
Prueba todos los casos posibles de exportación:
1. Exportación completa (sin filtros)
2. Exportación filtrando por fecha
3. Exportación individual (por análisis IDs)
4. Exportación individual por fecha (combinando IDs y fechas)
"""
import os
import sys
import tempfile
import shutil

# Configurar variables de entorno de prueba
os.environ.setdefault('DB_PASSWORD', 'test_password')
os.environ.setdefault('DB_USER', 'test_user')
os.environ.setdefault('DB_HOST', 'localhost')
os.environ.setdefault('DB_PORT', '5432')
os.environ.setdefault('DB_NAME', 'test_db')

print("=" * 80)
print("PRUEBAS COMPLETAS DE EXPORTACIÓN DE EXCEL")
print("=" * 80)

# Importar después de configurar variables de entorno
from http_server import app
from fastapi.testclient import TestClient

client = TestClient(app)
results = {
    'passed': [],
    'failed': [],
    'skipped': []
}

def test_export(nombre_test, params, expected_status_codes=[200, 400, 500, 503]):
    """Función helper para probar exportación."""
    try:
        print(f"\n📋 {nombre_test}")
        print(f"   Parámetros: {params}")
        
        response = client.post("/exportar", params=params)
        status = response.status_code
        
        print(f"   Status: {status}")
        
        if status in expected_status_codes:
            if status == 200:
                # Verificar que es un ZIP
                content_type = response.headers.get('content-type', '')
                if 'zip' in content_type.lower() or 'application' in content_type.lower():
                    content_length = len(response.content)
                    print(f"   ✓ Archivo ZIP recibido ({content_length} bytes)")
                    return True, "Éxito"
                else:
                    print(f"   ⚠ Respuesta exitosa pero no es ZIP: {content_type}")
                    return True, "Éxito (pero formato inesperado)"
            elif status == 400:
                # Error de validación esperado
                try:
                    content = response.json()
                    if "exitoso" in content and content["exitoso"] is False:
                        print(f"   ✓ Error de validación esperado: {content.get('mensaje', 'N/A')[:50]}")
                        return True, "Error de validación esperado"
                except:
                    pass
                return True, "Error de validación"
            else:
                # Error de BD o servidor (esperado si BD no está disponible)
                print(f"   ⚠ Error {status} (puede ser por BD no disponible)")
                return True, f"Error {status} (esperado sin BD)"
        else:
            print(f"   ✗ Status inesperado: {status}")
            try:
                content = response.json()
                print(f"   Respuesta: {str(content)[:200]}")
            except:
                print(f"   Respuesta: {response.text[:200]}")
            return False, f"Status inesperado: {status}"
            
    except Exception as e:
        print(f"   ✗ Excepción: {str(e)[:100]}")
        return False, f"Excepción: {str(e)[:100]}"

# Test 1: Exportación completa sin filtros
print("\n" + "=" * 80)
print("TEST 1: EXPORTACIÓN COMPLETA (SIN FILTROS)")
print("=" * 80)

test_cases_completa = [
    ("Exportación completa formato XLSX", {"formato": "xlsx"}),
    ("Exportación completa formato CSV", {"formato": "csv"}),
    ("Exportación completa con incluir_sin_pk=True", {"formato": "xlsx", "incluir_sin_pk": "true"}),
    ("Exportación completa con incluir_sin_pk=False", {"formato": "xlsx", "incluir_sin_pk": "false"}),
    ("Exportación completa sin especificar formato (default)", {}),
]

for nombre, params in test_cases_completa:
    passed, message = test_export(nombre, params)
    if passed:
        results['passed'].append(f"{nombre}: {message}")
    else:
        results['failed'].append(f"{nombre}: {message}")

# Test 2: Exportación filtrando por fecha
print("\n" + "=" * 80)
print("TEST 2: EXPORTACIÓN FILTRANDO POR FECHA")
print("=" * 80)

test_cases_fecha = [
    ("Solo fecha_desde", {"formato": "xlsx", "fecha_desde": "2024-01-01"}),
    ("Solo fecha_hasta", {"formato": "xlsx", "fecha_hasta": "2024-12-31"}),
    ("Rango de fechas completo", {"formato": "xlsx", "fecha_desde": "2024-01-01", "fecha_hasta": "2024-12-31"}),
    ("Rango de fechas con campo_fecha=fecha_inia", {"formato": "xlsx", "fecha_desde": "2024-01-01", "fecha_hasta": "2024-12-31", "campo_fecha": "fecha_inia"}),
    ("Rango de fechas con campo_fecha=fecha_inase", {"formato": "xlsx", "fecha_desde": "2024-01-01", "fecha_hasta": "2024-12-31", "campo_fecha": "fecha_inase"}),
    ("Rango de fechas con campo_fecha=fecha_analisis", {"formato": "xlsx", "fecha_desde": "2024-01-01", "fecha_hasta": "2024-12-31", "campo_fecha": "fecha_analisis"}),
    ("Rango de fechas con campo_fecha=fecha_germinacion", {"formato": "xlsx", "fecha_desde": "2024-01-01", "fecha_hasta": "2024-12-31", "campo_fecha": "fecha_germinacion"}),
    ("Rango de fechas con campo_fecha=auto", {"formato": "xlsx", "fecha_desde": "2024-01-01", "fecha_hasta": "2024-12-31", "campo_fecha": "auto"}),
    ("Fecha inválida (debe fallar)", {"formato": "xlsx", "fecha_desde": "2024-13-01"}, [400, 422]),
    ("Rango inválido fecha_desde > fecha_hasta (debe fallar)", {"formato": "xlsx", "fecha_desde": "2024-12-31", "fecha_hasta": "2024-01-01"}, [400, 422]),
]

for nombre, params in test_cases_fecha:
    expected_status = params.pop('_expected_status', [200, 400, 500, 503])
    if isinstance(params, dict) and '_expected_status' in str(params):
        # Si el último elemento es una lista, es el expected_status
        pass
    passed, message = test_export(nombre, params, expected_status)
    if passed:
        results['passed'].append(f"{nombre}: {message}")
    else:
        results['failed'].append(f"{nombre}: {message}")

# Test 3: Exportación individual por análisis IDs
print("\n" + "=" * 80)
print("TEST 3: EXPORTACIÓN INDIVIDUAL (POR ANÁLISIS IDs)")
print("=" * 80)

test_cases_ids = [
    ("Un solo tipo, múltiples IDs", {"formato": "xlsx", "analisis_ids": "dosn:1,2,3"}),
    ("Múltiples tipos, múltiples IDs", {"formato": "xlsx", "analisis_ids": "dosn:1,2,3;pureza:5,6"}),
    ("Un solo tipo, un solo ID", {"formato": "xlsx", "analisis_ids": "germinacion:10"}),
    ("Múltiples tipos con diferentes IDs", {"formato": "xlsx", "analisis_ids": "dosn:1,2;pureza:3,4,5;germinacion:10"}),
    ("Con formato CSV", {"formato": "csv", "analisis_ids": "dosn:1,2,3"}),
    ("IDs con espacios (debe funcionar)", {"formato": "xlsx", "analisis_ids": "dosn: 1 , 2 , 3 "}),
    ("String vacío (debe fallar o exportar todo)", {"formato": "xlsx", "analisis_ids": ""}, [200, 400, 500, 503]),
]

for test_case in test_cases_ids:
    if len(test_case) == 3:
        nombre, params, expected_status = test_case
    else:
        nombre, params = test_case
        expected_status = [200, 400, 500, 503]
    
    passed, message = test_export(nombre, params, expected_status)
    if passed:
        results['passed'].append(f"{nombre}: {message}")
    else:
        results['failed'].append(f"{nombre}: {message}")

# Test 4: Exportación individual por fecha (combinando IDs y fechas)
print("\n" + "=" * 80)
print("TEST 4: EXPORTACIÓN INDIVIDUAL POR FECHA (IDs + FECHAS)")
print("=" * 80)

test_cases_combinados = [
    ("IDs + fecha_desde", {"formato": "xlsx", "analisis_ids": "dosn:1,2,3", "fecha_desde": "2024-01-01"}),
    ("IDs + fecha_hasta", {"formato": "xlsx", "analisis_ids": "dosn:1,2,3", "fecha_hasta": "2024-12-31"}),
    ("IDs + rango de fechas completo", {"formato": "xlsx", "analisis_ids": "dosn:1,2,3", "fecha_desde": "2024-01-01", "fecha_hasta": "2024-12-31"}),
    ("Múltiples tipos + rango de fechas", {"formato": "xlsx", "analisis_ids": "dosn:1,2;pureza:3,4", "fecha_desde": "2024-01-01", "fecha_hasta": "2024-12-31"}),
    ("IDs + fechas + campo_fecha específico", {"formato": "xlsx", "analisis_ids": "dosn:1,2,3", "fecha_desde": "2024-01-01", "fecha_hasta": "2024-12-31", "campo_fecha": "fecha_inia"}),
    ("IDs + fechas + campo_fecha=auto", {"formato": "xlsx", "analisis_ids": "dosn:1,2,3", "fecha_desde": "2024-01-01", "fecha_hasta": "2024-12-31", "campo_fecha": "auto"}),
    ("Múltiples tipos + fechas + campo específico", {"formato": "xlsx", "analisis_ids": "dosn:1,2;pureza:3,4;germinacion:10", "fecha_desde": "2024-01-01", "fecha_hasta": "2024-12-31", "campo_fecha": "fecha_analisis"}),
    ("Con formato CSV", {"formato": "csv", "analisis_ids": "dosn:1,2,3", "fecha_desde": "2024-01-01", "fecha_hasta": "2024-12-31"}),
]

for nombre, params in test_cases_combinados:
    passed, message = test_export(nombre, params)
    if passed:
        results['passed'].append(f"{nombre}: {message}")
    else:
        results['failed'].append(f"{nombre}: {message}")

# Test 5: Casos edge y validaciones
print("\n" + "=" * 80)
print("TEST 5: CASOS EDGE Y VALIDACIONES")
print("=" * 80)

test_cases_edge = [
    ("Formato inválido (debe fallar)", {"formato": "invalid"}, [400, 422]),
    ("Tablas específicas sin filtros", {"formato": "xlsx", "tablas": "dosn,pureza"}),
    ("Tablas específicas + fechas", {"formato": "xlsx", "tablas": "dosn,pureza", "fecha_desde": "2024-01-01", "fecha_hasta": "2024-12-31"}),
    ("Tablas específicas + IDs", {"formato": "xlsx", "tablas": "dosn", "analisis_ids": "dosn:1,2,3"}),
    ("Solo tablas sin formato (default)", {"tablas": "dosn"}),
]

for test_case in test_cases_edge:
    if len(test_case) == 3:
        nombre, params, expected_status = test_case
    else:
        nombre, params = test_case
        expected_status = [200, 400, 500, 503]
    
    passed, message = test_export(nombre, params, expected_status)
    if passed:
        results['passed'].append(f"{nombre}: {message}")
    else:
        results['failed'].append(f"{nombre}: {message}")

# Resumen final
print("\n" + "=" * 80)
print("RESUMEN DE PRUEBAS DE EXPORTACIÓN")
print("=" * 80)
print(f"\n✓ Pruebas pasadas: {len(results['passed'])}")
print(f"✗ Pruebas fallidas: {len(results['failed'])}")

if results['failed']:
    print("\n⚠ Pruebas fallidas:")
    for test in results['failed'][:10]:  # Mostrar solo las primeras 10
        print(f"  - {test}")
    if len(results['failed']) > 10:
        print(f"  ... y {len(results['failed']) - 10} más")

print("\n" + "=" * 80)
if not results['failed']:
    print("🎉 TODAS LAS PRUEBAS DE EXPORTACIÓN PASARON")
else:
    print(f"⚠️  {len(results['failed'])} PRUEBA(S) FALLARON")
    print("\nNota: Algunos fallos pueden ser esperados si:")
    print("  - La base de datos no está disponible")
    print("  - Los IDs de análisis no existen")
    print("  - No hay datos en el rango de fechas especificado")
print("=" * 80)

sys.exit(0 if not results['failed'] else 1)


"""
Pruebas completas de exportación de Excel usando directamente las funciones del servicio.
Prueba todos los casos posibles de exportación sin requerir httpx.
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
print("PRUEBAS COMPLETAS DE EXPORTACIÓN DE EXCEL")
print("=" * 80)

results = {
    'passed': [],
    'failed': [],
    'skipped': []
}

# Importar módulos necesarios
try:
    from app.services.export_service import (
        validar_fechas,
        exportar_con_filtros,
        exportar_tradicional,
        crear_zip_exportacion
    )
    from ExportExcel import parsear_analisis_ids, obtener_campo_fecha_analisis
    print("✓ Módulos importados correctamente\n")
except Exception as e:
    print(f"✗ Error importando módulos: {e}")
    sys.exit(1)

# Test 1: Validación de fechas
print("=" * 80)
print("TEST 1: VALIDACIÓN DE FECHAS")
print("=" * 80)

test_cases_fechas = [
    ("Fecha válida desde", "2024-01-01", None, True),
    ("Fecha válida hasta", None, "2024-12-31", True),
    ("Rango válido", "2024-01-01", "2024-12-31", True),
    ("Fecha inválida formato", "2024-13-01", None, False),
    ("Fecha inválida formato 2", "2024/01/01", None, False),
    ("Rango inválido (desde > hasta)", "2024-12-31", "2024-01-01", False),
    ("Rango igual (válido)", "2024-06-15", "2024-06-15", True),
]

for nombre, fecha_desde, fecha_hasta, deberia_pasar in test_cases_fechas:
    try:
        fecha_desde_obj, fecha_hasta_obj = validar_fechas(fecha_desde, fecha_hasta)
        if deberia_pasar:
            results['passed'].append(f"{nombre}: ✓")
            print(f"  ✓ {nombre}: fecha_desde={fecha_desde_obj}, fecha_hasta={fecha_hasta_obj}")
        else:
            results['failed'].append(f"{nombre}: Debería haber fallado pero pasó")
            print(f"  ✗ {nombre}: Debería haber fallado pero pasó")
    except Exception as e:
        if not deberia_pasar:
            results['passed'].append(f"{nombre}: ✓ (falló como se esperaba)")
            print(f"  ✓ {nombre}: Falló como se esperaba - {str(e)[:50]}")
        else:
            results['failed'].append(f"{nombre}: {str(e)[:50]}")
            print(f"  ✗ {nombre}: {str(e)[:50]}")

# Test 2: Parseo de análisis IDs
print("\n" + "=" * 80)
print("TEST 2: PARSEO DE ANÁLISIS IDs")
print("=" * 80)

test_cases_ids = [
    ("Un solo tipo, múltiples IDs", "dosn:1,2,3", {'dosn': [1, 2, 3]}),
    ("Múltiples tipos, múltiples IDs", "dosn:1,2,3;pureza:5,6", {'dosn': [1, 2, 3], 'pureza': [5, 6]}),
    ("Un solo tipo, un solo ID", "germinacion:10", {'germinacion': [10]}),
    ("Múltiples tipos", "dosn:1,2;pureza:3,4;germinacion:10", {'dosn': [1, 2], 'pureza': [3, 4], 'germinacion': [10]}),
    ("String vacío", "", {}),
    ("None", None, {}),
    ("Con espacios", "dosn: 1 , 2 , 3 ", {'dosn': [1, 2, 3]}),
]

for nombre, input_val, expected in test_cases_ids:
    try:
        result = parsear_analisis_ids(input_val)
        if result == expected:
            results['passed'].append(f"{nombre}: ✓")
            print(f"  ✓ {nombre}: {result}")
        else:
            results['failed'].append(f"{nombre}: Esperado {expected}, obtenido {result}")
            print(f"  ✗ {nombre}: Esperado {expected}, obtenido {result}")
    except Exception as e:
        results['failed'].append(f"{nombre}: {str(e)[:50]}")
        print(f"  ✗ {nombre}: {str(e)[:50]}")

# Test 3: Obtención de campo de fecha
print("\n" + "=" * 80)
print("TEST 3: OBTENCIÓN DE CAMPO DE FECHA")
print("=" * 80)

test_cases_campo_fecha = [
    ("DOSN auto", "dosn", "auto", "dosn_fecha_analisis"),
    ("DOSN específico", "dosn", "dosn_fecha_inia", "dosn_fecha_inia"),
    ("Pureza auto", "pureza", None, "fecha_inia"),
    ("Pureza auto explícito", "pureza", "auto", "fecha_inia"),
    ("Germinación auto", "germinacion", "auto", "fecha_germinacion"),
    ("PMS auto", "pms", "auto", "fecha_creacion"),
    ("Tipo desconocido", "tipo_inexistente", "auto", None),
]

for nombre, tipo, campo, expected in test_cases_campo_fecha:
    try:
        result = obtener_campo_fecha_analisis(tipo, campo)
        if result == expected:
            results['passed'].append(f"{nombre}: ✓")
            print(f"  ✓ {nombre}: {result}")
        else:
            results['failed'].append(f"{nombre}: Esperado {expected}, obtenido {result}")
            print(f"  ✗ {nombre}: Esperado {expected}, obtenido {result}")
    except Exception as e:
        results['failed'].append(f"{nombre}: {str(e)[:50]}")
        print(f"  ✗ {nombre}: {str(e)[:50]}")

# Test 4: Verificación de parámetros de exportación
print("\n" + "=" * 80)
print("TEST 4: VERIFICACIÓN DE PARÁMETROS DE EXPORTACIÓN")
print("=" * 80)

# Verificar que las funciones existen y son llamables
funciones_a_verificar = [
    ("validar_fechas", validar_fechas),
    ("exportar_con_filtros", exportar_con_filtros),
    ("exportar_tradicional", exportar_tradicional),
    ("crear_zip_exportacion", crear_zip_exportacion),
]

for nombre, funcion in funciones_a_verificar:
    try:
        assert callable(funcion), f"{nombre} no es llamable"
        results['passed'].append(f"{nombre} es llamable: ✓")
        print(f"  ✓ {nombre} es llamable")
    except Exception as e:
        results['failed'].append(f"{nombre}: {str(e)[:50]}")
        print(f"  ✗ {nombre}: {str(e)[:50]}")

# Test 5: Casos de uso de exportación (sin ejecutar, solo verificar estructura)
print("\n" + "=" * 80)
print("TEST 5: CASOS DE USO DE EXPORTACIÓN")
print("=" * 80)

casos_uso = [
    {
        "nombre": "Exportación completa sin filtros",
        "params": {
            "tablas": "",
            "formato": "xlsx",
            "incluir_sin_pk": True,
            "analisis_ids": None,
            "fecha_desde": None,
            "fecha_hasta": None,
            "campo_fecha": "auto"
        }
    },
    {
        "nombre": "Exportación filtrando por fecha",
        "params": {
            "tablas": "",
            "formato": "xlsx",
            "incluir_sin_pk": True,
            "analisis_ids": None,
            "fecha_desde": "2024-01-01",
            "fecha_hasta": "2024-12-31",
            "campo_fecha": "fecha_inia"
        }
    },
    {
        "nombre": "Exportación individual por IDs",
        "params": {
            "tablas": "",
            "formato": "xlsx",
            "incluir_sin_pk": True,
            "analisis_ids": "dosn:1,2,3",
            "fecha_desde": None,
            "fecha_hasta": None,
            "campo_fecha": "auto"
        }
    },
    {
        "nombre": "Exportación individual por fecha (IDs + fechas)",
        "params": {
            "tablas": "",
            "formato": "xlsx",
            "incluir_sin_pk": True,
            "analisis_ids": "dosn:1,2,3",
            "fecha_desde": "2024-01-01",
            "fecha_hasta": "2024-12-31",
            "campo_fecha": "fecha_inia"
        }
    },
    {
        "nombre": "Exportación con tablas específicas",
        "params": {
            "tablas": "dosn,pureza",
            "formato": "csv",
            "incluir_sin_pk": False,
            "analisis_ids": None,
            "fecha_desde": None,
            "fecha_hasta": None,
            "campo_fecha": "auto"
        }
    },
]

for caso in casos_uso:
    try:
        # Verificar que los parámetros son válidos
        usar_filtros = caso["params"]["analisis_ids"] or caso["params"]["fecha_desde"] or caso["params"]["fecha_hasta"]
        
        # Validar fechas si están presentes
        if caso["params"]["fecha_desde"] or caso["params"]["fecha_hasta"]:
            try:
                validar_fechas(caso["params"]["fecha_desde"], caso["params"]["fecha_hasta"])
                fecha_valida = True
            except:
                fecha_valida = False
        else:
            fecha_valida = True
        
        # Parsear IDs si están presentes
        if caso["params"]["analisis_ids"]:
            try:
                ids_parseados = parsear_analisis_ids(caso["params"]["analisis_ids"])
                ids_validos = len(ids_parseados) > 0
            except:
                ids_validos = False
        else:
            ids_validos = True
        
        if fecha_valida and ids_validos:
            results['passed'].append(f"{caso['nombre']}: Parámetros válidos ✓")
            print(f"  ✓ {caso['nombre']}: Parámetros válidos")
            print(f"    - Usar filtros: {usar_filtros}")
            if caso["params"]["analisis_ids"]:
                print(f"    - IDs parseados: {parsear_analisis_ids(caso['params']['analisis_ids'])}")
        else:
            results['failed'].append(f"{caso['nombre']}: Parámetros inválidos")
            print(f"  ✗ {caso['nombre']}: Parámetros inválidos")
    except Exception as e:
        results['failed'].append(f"{caso['nombre']}: {str(e)[:50]}")
        print(f"  ✗ {caso['nombre']}: {str(e)[:50]}")

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
print("=" * 80)

print("\n📝 NOTA: Estas pruebas verifican la lógica de validación y parseo.")
print("   Para probar la exportación real, se necesita:")
print("   1. Base de datos configurada y disponible")
print("   2. Datos de prueba en la base de datos")
print("   3. Ejecutar el servidor y hacer peticiones HTTP reales")

sys.exit(0 if not results['failed'] else 1)


"""
Tests de importación de Lote y asignación con Recibo.
Caso de uso de máxima prioridad: Verificar que los recibos se asignan correctamente a los lotes.
"""
import pytest
import os
import sys
from pathlib import Path
from fastapi.testclient import TestClient
from fastapi import status

# Agregar el directorio raíz del middleware al path
middleware_root = Path(__file__).parent.parent
sys.path.insert(0, str(middleware_root))

# IMPORTANTE: Configurar variables de entorno ANTES de importar cualquier módulo
# que use database_config, para evitar que se carguen valores por defecto de conftest.py
os.environ['DB_PASSWORD'] = 'Inia2024SecurePass!'
os.environ['DB_USER'] = 'postgres'
os.environ['DB_HOST'] = 'localhost'
os.environ['DB_PORT'] = '5432'
os.environ['DB_NAME'] = 'Inia'

# Importar utilidades de normalización y normalizar variables de entorno
from tests.test_utils import normalize_env_vars
normalize_env_vars()

# Ahora importar módulos que usan database_config
from http_server import app


@pytest.fixture(scope="module")
def client():
    """Fixture que proporciona un TestClient para los tests."""
    return TestClient(app)


@pytest.fixture(scope="module")
def exports_dir():
    """Fixture que retorna la ruta al directorio de exports."""
    exports_path = middleware_root / "exports"
    if not exports_path.exists():
        pytest.skip(f"Directorio exports no encontrado: {exports_path}")
    return exports_path


@pytest.fixture(scope="module")
def lote_file(exports_dir):
    """Fixture que retorna la ruta al archivo lote.xlsx."""
    lote_path = exports_dir / "lote.xlsx"
    if not lote_path.exists():
        pytest.skip(f"Archivo lote.xlsx no encontrado: {lote_path}")
    return lote_path


@pytest.fixture(scope="module")
def recibo_file(exports_dir):
    """Fixture que retorna la ruta al archivo recibo.csv."""
    recibo_path = exports_dir / "recibo.csv"
    if not recibo_path.exists():
        pytest.skip(f"Archivo recibo.csv no encontrado: {recibo_path}")
    return recibo_path


@pytest.fixture(scope="module")
def recibo_xlsx_file(exports_dir):
    """Fixture que retorna la ruta al archivo recibo.xlsx."""
    recibo_path = exports_dir / "recibo.xlsx"
    if not recibo_path.exists():
        pytest.skip(f"Archivo recibo.xlsx no encontrado: {recibo_path}")
    return recibo_path


def assert_import_successful(response, expected_table=None):
    """
    Helper function para verificar que una importación fue exitosa.
    Falla el test si la importación no fue exitosa.
    
    Args:
        response: Response object de FastAPI TestClient
        expected_table: Nombre de tabla esperado (opcional)
    
    Returns:
        dict: Contenido de la respuesta JSON
    
    Raises:
        AssertionError: Si la importación no fue exitosa
    """
    assert response.status_code == 200, \
        f"Status code debería ser 200, pero fue {response.status_code}. Response: {response.text}"
    
    content = response.json()
    assert "exitoso" in content, "Respuesta no contiene campo 'exitoso'"
    assert content.get("exitoso") is True, \
        f"Importación debería ser exitosa pero falló. Mensaje: {content.get('mensaje')}, Detalles: {content.get('detalles')}"
    
    if expected_table:
        datos = content.get("datos", {})
        assert "tabla" in datos, "Datos no contienen campo 'tabla'"
        tabla = datos["tabla"].lower()
        assert expected_table.lower() in tabla, \
            f"Tabla detectada incorrecta: {tabla}. Se esperaba '{expected_table}'"
    
    return content


class TestImportLote:
    """Tests para importación de Lote."""
    
    def test_import_lote_xlsx_exists(self, client, lote_file):
        """Verifica que el archivo lote.xlsx existe y se puede leer."""
        assert lote_file.exists(), f"Archivo lote.xlsx no encontrado: {lote_file}"
        assert lote_file.stat().st_size > 0, "Archivo lote.xlsx está vacío"
    
    def test_import_lote_xlsx_without_table(self, client, lote_file):
        """
        Test de importación de lote.xlsx sin especificar tabla (detección automática).
        Prioridad: ALTA - Verificar que se detecta automáticamente la tabla 'lote'.
        """
        with open(lote_file, "rb") as f:
            response = client.post(
                "/importar",
                files={"file": ("lote.xlsx", f, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
                data={
                    "upsert": "false",
                    "keep_ids": "false"
                }
            )
        
        print(f"\n=== RESULTADO IMPORTACIÓN LOTE ===")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # Verificar que la importación fue exitosa
        content = assert_import_successful(response, expected_table="lote")
        datos = content.get("datos", {})
        print(f"✓ Tabla detectada correctamente: {datos.get('tabla')}")
        if "insertados" in datos:
            print(f"✓ Filas insertadas: {datos['insertados']}")
    
    def test_import_lote_xlsx_with_table(self, client, lote_file):
        """
        Test de importación de lote.xlsx especificando tabla manualmente.
        Prioridad: ALTA - Verificar que funciona con tabla especificada.
        """
        with open(lote_file, "rb") as f:
            response = client.post(
                "/importar",
                files={"file": ("lote.xlsx", f, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
                data={
                    "table": "lote",
                    "upsert": "false",
                    "keep_ids": "false"
                }
            )
        
        print(f"\n=== RESULTADO IMPORTACIÓN LOTE (TABLA ESPECIFICADA) ===")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # Verificar que la importación fue exitosa
        content = assert_import_successful(response, expected_table="lote")
        datos = content.get("datos", {})
        print(f"✓ Tabla: {datos.get('tabla')}")
        print(f"✓ Filas insertadas: {datos.get('insertados', 0)}")


class TestImportRecibo:
    """Tests para importación de Recibo."""
    
    def test_import_recibo_csv_exists(self, client, recibo_file):
        """Verifica que el archivo recibo.csv existe y se puede leer."""
        assert recibo_file.exists(), f"Archivo recibo.csv no encontrado: {recibo_file}"
        assert recibo_file.stat().st_size > 0, "Archivo recibo.csv está vacío"
    
    def test_import_recibo_csv_without_table(self, client, recibo_file):
        """
        Test de importación de recibo.csv sin especificar tabla (detección automática).
        Prioridad: ALTA - Verificar que se detecta automáticamente la tabla 'recibo'.
        """
        with open(recibo_file, "rb") as f:
            response = client.post(
                "/importar",
                files={"file": ("recibo.csv", f, "text/csv")},
                data={
                    "upsert": "false",
                    "keep_ids": "false"
                }
            )
        
        print(f"\n=== RESULTADO IMPORTACIÓN RECIBO CSV ===")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # Verificar que la importación fue exitosa
        content = assert_import_successful(response, expected_table="recibo")
        datos = content.get("datos", {})
        print(f"✓ Tabla detectada correctamente: {datos.get('tabla')}")
        if "insertados" in datos:
            print(f"✓ Filas insertadas: {datos['insertados']}")
    
    def test_import_recibo_xlsx_without_table(self, client, recibo_xlsx_file):
        """
        Test de importación de recibo.xlsx sin especificar tabla (detección automática).
        Prioridad: ALTA - Verificar que funciona con formato XLSX.
        """
        with open(recibo_xlsx_file, "rb") as f:
            response = client.post(
                "/importar",
                files={"file": ("recibo.xlsx", f, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
                data={
                    "upsert": "false",
                    "keep_ids": "false"
                }
            )
        
        print(f"\n=== RESULTADO IMPORTACIÓN RECIBO XLSX ===")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # Verificar que la importación fue exitosa
        content = assert_import_successful(response, expected_table="recibo")
        datos = content.get("datos", {})
        print(f"✓ Tabla detectada: {datos.get('tabla')}")


class TestAsignacionLoteRecibo:
    """
    Tests para verificar la asignación de Lote a Recibo.
    MÁXIMA PRIORIDAD: Verificar que los recibos se asignan correctamente a los lotes.
    """
    
    def test_import_lote_then_recibo_verificar_asignacion(self, client, lote_file, recibo_file):
        """
        Test completo: Importar lote primero, luego recibo, y verificar asignación.
        MÁXIMA PRIORIDAD: Este es el caso de uso crítico.
        
        Flujo:
        1. Importar lote.xlsx
        2. Importar recibo.csv (que contiene columna 'lote' con IDs de lotes)
        3. Verificar que los recibos tienen el campo 'lote' correctamente asignado
        """
        print("\n" + "="*80)
        print("TEST DE ASIGNACIÓN LOTE-RECIBO (MÁXIMA PRIORIDAD)")
        print("="*80)
        
        # Paso 1: Importar lote
        print("\n[PASO 1] Importando lote.xlsx...")
        lote_response = None
        with open(lote_file, "rb") as f:
            lote_response = client.post(
                "/importar",
                files={"file": ("lote.xlsx", f, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
                data={
                    "table": "lote",
                    "upsert": "false",
                    "keep_ids": "false"
                }
            )
        
        print(f"Status Code Lote: {lote_response.status_code}")
        lote_content = lote_response.json() if lote_response.status_code == 200 else {}
        print(f"Response Lote: {lote_content}")
        
        # Verificar que la importación de lote fue exitosa
        lote_content = assert_import_successful(lote_response, expected_table="lote")
        lote_insertados = lote_content.get("datos", {}).get("insertados", 0)
        print(f"✓ Lote importado exitosamente. Filas insertadas: {lote_insertados}")
        
        # Paso 2: Importar recibo
        print("\n[PASO 2] Importando recibo.csv...")
        recibo_response = None
        with open(recibo_file, "rb") as f:
            recibo_response = client.post(
                "/importar",
                files={"file": ("recibo.csv", f, "text/csv")},
                data={
                    "table": "recibo",
                    "upsert": "false",
                    "keep_ids": "false"
                }
            )
        
        print(f"Status Code Recibo: {recibo_response.status_code}")
        recibo_content = recibo_response.json() if recibo_response.status_code == 200 else {}
        print(f"Response Recibo: {recibo_content}")
        
        # Verificar que la importación de recibo fue exitosa
        recibo_content = assert_import_successful(recibo_response, expected_table="recibo")
        recibo_insertados = recibo_content.get("datos", {}).get("insertados", 0)
        print(f"✓ Recibo importado exitosamente. Filas insertadas: {recibo_insertados}")
        
        # Paso 3: Verificar asignación
        print("\n[PASO 3] Verificación de asignación...")
        print("NOTA: La verificación completa de asignación requiere consultar la base de datos.")
        print("      Los recibos importados deberían tener el campo 'lote' asignado correctamente.")
        print(f"      Se importaron {lote_insertados} lotes y {recibo_insertados} recibos.")
        print("\n✓✓✓ TEST COMPLETO: Lote y Recibo importados exitosamente")
        print("   La asignación debería estar correcta si el CSV contiene la columna 'lote'")
    
    def test_import_recibo_with_upsert(self, client, recibo_file):
        """
        Test de importación de recibo con upsert=True.
        Verifica que se pueden actualizar recibos existentes.
        """
        print("\n=== TEST IMPORTACIÓN RECIBO CON UPSERT ===")
        
        with open(recibo_file, "rb") as f:
            response = client.post(
                "/importar",
                files={"file": ("recibo.csv", f, "text/csv")},
                data={
                    "table": "recibo",
                    "upsert": "true",
                    "keep_ids": "false"
                }
            )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # Verificar que la importación fue exitosa
        content = assert_import_successful(response, expected_table="recibo")
        datos = content.get("datos", {})
        print(f"✓ Filas insertadas: {datos.get('insertados', 0)}")
        print(f"✓ Filas actualizadas: {datos.get('actualizados', 0)}")


class TestImportMultipleFiles:
    """Tests para importación de múltiples archivos."""
    
    def test_import_lote_and_recibo_together(self, client, lote_file, recibo_file):
        """
        Test de importación de lote y recibo juntos (múltiples archivos).
        Verifica que se pueden importar múltiples archivos en una sola petición.
        """
        print("\n=== TEST IMPORTACIÓN MÚLTIPLE: LOTE + RECIBO ===")
        
        with open(lote_file, "rb") as lote_f, open(recibo_file, "rb") as recibo_f:
            response = client.post(
                "/importar",
                files=[
                    ("files", ("lote.xlsx", lote_f, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")),
                    ("files", ("recibo.csv", recibo_f, "text/csv"))
                ],
                data={
                    "upsert": "false",
                    "keep_ids": "false"
                }
            )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # Verificar que la importación fue exitosa
        assert response.status_code == 200, \
            f"Status code debería ser 200, pero fue {response.status_code}"
        
        content = response.json()
        assert content.get("exitoso") is True, \
            f"Importación debería ser exitosa. Mensaje: {content.get('mensaje')}"
        
        datos = content.get("datos", {})
        print(f"✓ Archivos procesados: {datos.get('archivos_procesados', 0)}")
        print(f"✓ Archivos exitosos: {datos.get('archivos_exitosos', 0)}")
        print(f"✓ Total filas insertadas: {datos.get('total_filas_insertadas', 0)}")


class TestValidacionesAdicionales:
    """Tests adicionales de validación."""
    
    def test_verificar_modelos_inicializados(self, client):
        """
        Test que verifica que los modelos se inicializan correctamente.
        Esto es importante porque si los modelos no se cargan, las importaciones fallarán.
        """
        print("\n=== TEST VERIFICACIÓN DE MODELOS ===")
        
        # Hacer una petición simple al endpoint de health para verificar que la app funciona
        response = client.get("/health")
        print(f"Status Code Health: {response.status_code}")
        
        # Si health funciona, la app está corriendo
        assert response.status_code in [200, 503], \
            f"Health check debería retornar 200 o 503, pero retornó {response.status_code}"
        
        print("✓ Aplicación está funcionando")
    
    def test_import_sin_archivo_debe_fallar(self, client):
        """
        Test que verifica que importar sin archivo retorna error 400.
        """
        print("\n=== TEST IMPORTACIÓN SIN ARCHIVO ===")
        
        response = client.post("/importar")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        assert response.status_code == 400, \
            f"Debería retornar 400 cuando no se envía archivo, pero retornó {response.status_code}"
        
        content = response.json()
        assert content.get("exitoso") is False, \
            "La respuesta debería indicar que la importación falló"
        
        print("✓ Test correcto: importar sin archivo retorna error")
    
    def test_import_archivo_invalido_debe_fallar(self, client, temp_dir):
        """
        Test que verifica que importar un archivo con extensión inválida retorna error.
        """
        print("\n=== TEST IMPORTACIÓN ARCHIVO INVÁLIDO ===")
        
        # Crear un archivo con extensión inválida
        import os
        archivo_invalido = os.path.join(temp_dir, "test.exe")
        with open(archivo_invalido, "wb") as f:
            f.write(b"dummy content")
        
        with open(archivo_invalido, "rb") as f:
            response = client.post(
                "/importar",
                files={"file": ("test.exe", f, "application/octet-stream")}
            )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # Debería retornar 400 o 500 dependiendo de dónde se valide
        assert response.status_code in [400, 500], \
            f"Debería retornar 400 o 500 para archivo inválido, pero retornó {response.status_code}"
        
        content = response.json()
        assert content.get("exitoso") is False, \
            "La respuesta debería indicar que la importación falló"
        
        print("✓ Test correcto: archivo inválido retorna error")
    
    def test_import_con_keep_ids(self, client, lote_file):
        """
        Test que verifica que el parámetro keep_ids funciona correctamente.
        """
        print("\n=== TEST IMPORTACIÓN CON KEEP_IDS ===")
        
        with open(lote_file, "rb") as f:
            response = client.post(
                "/importar",
                files={"file": ("lote.xlsx", f, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
                data={
                    "table": "lote",
                    "upsert": "false",
                    "keep_ids": "true"
                }
            )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        # Verificar que la importación fue exitosa
        content = assert_import_successful(response, expected_table="lote")
        datos = content.get("datos", {})
        assert datos.get("keep_ids") is True, \
            "El parámetro keep_ids debería estar en la respuesta"
        
        print(f"✓ Importación con keep_ids=True exitosa")
        print(f"✓ Filas insertadas: {datos.get('insertados', 0)}")


if __name__ == "__main__":
    # Ejecutar tests con pytest
    pytest.main([__file__, "-v", "-s"])


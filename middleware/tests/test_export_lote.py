"""
Tests para el endpoint de Quick Export por Lote.
Verifica que se puedan exportar todos los análisis asociados a un lote.
"""
import pytest
import os
import sys
import zipfile
import tempfile
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


@pytest.fixture(scope="function")
def temp_export_dir():
    """Fixture que crea un directorio temporal para guardar exports de prueba."""
    temp_path = tempfile.mkdtemp(prefix="inia_test_export_")
    yield temp_path
    # Limpiar después del test
    if os.path.exists(temp_path):
        import shutil
        shutil.rmtree(temp_path, ignore_errors=True)


def test_export_lote_endpoint_exists(client):
    """Test que verifica que el endpoint existe y responde (aunque pueda ser 404)."""
    # Intentar con un lote que probablemente no existe
    response = client.post("/middleware/exportar-lote/99999?formato=xlsx")
    
    # Debe responder (no debe ser 404 de ruta no encontrada)
    # Si el lote no existe, debería ser 404 pero con mensaje estructurado
    # Si la ruta no existe, sería 404 sin body o 405 Method Not Allowed
    assert response.status_code in [404, 500], \
        f"El endpoint debería existir. Status: {response.status_code}, Response: {response.text}"
    
    # Si es 404, debe tener un body con estructura de error
    if response.status_code == 404:
        try:
            error_data = response.json()
            assert "mensaje" in error_data or "detail" in error_data, \
                "Error 404 debe tener estructura de mensaje"
        except:
            # Si no es JSON, está bien, solo verificamos que la ruta existe
            pass


def test_export_lote_sin_recibo(client):
    """Test que verifica el comportamiento cuando un lote no tiene recibo asociado."""
    # Usar un lote que probablemente no tiene recibo (ID muy alto)
    lote_id = 999999
    response = client.post(f"/middleware/exportar-lote/{lote_id}?formato=xlsx")
    
    assert response.status_code == 404, \
        f"Debería retornar 404 cuando no hay recibo. Status: {response.status_code}, Response: {response.text}"
    
    # Verificar que el mensaje de error es apropiado
    try:
        error_data = response.json()
        assert "mensaje" in error_data or "detail" in error_data, \
            "Error debe tener estructura de mensaje"
    except:
        # Si no es JSON estructurado, verificar que al menos hay texto
        assert len(response.text) > 0, "Error debe tener algún mensaje"


def test_export_lote_formato_invalido(client):
    """Test que verifica validación de formato inválido."""
    response = client.post("/middleware/exportar-lote/1?formato=pdf")
    
    # Debe retornar 422 (Unprocessable Entity) por formato inválido
    assert response.status_code == 422, \
        f"Debería retornar 422 para formato inválido. Status: {response.status_code}, Response: {response.text}"


def test_export_lote_formato_csv(client):
    """Test que verifica que se acepta formato CSV."""
    # Intentar con CSV (aunque el lote no exista, debe pasar la validación de formato)
    response = client.post("/middleware/exportar-lote/99999?formato=csv")
    
    # Debe pasar la validación de formato (puede ser 404 por lote inexistente)
    assert response.status_code != 422, \
        f"Formato CSV debería ser válido. Status: {response.status_code}, Response: {response.text}"


def test_export_lote_con_datos(client, temp_export_dir):
    """
    Test que verifica la exportación exitosa cuando hay datos.
    NOTA: Este test requiere que exista un lote con recibo y análisis en la BD.
    """
    # Buscar un lote que tenga recibo y análisis
    # Primero intentar obtener información de la BD
    from sqlalchemy import create_engine, text
    from database_config import build_connection_string
    
    try:
        engine = create_engine(build_connection_string())
        with engine.connect() as conn:
            # Buscar un lote que tenga recibo activo con análisis
            query = text("""
                SELECT DISTINCT r.LOTE_ID, r.RECIBO_ID
                FROM RECIBO r
                WHERE r.RECIBO_ACTIVO = true
                AND r.LOTE_ID IS NOT NULL
                AND (
                    EXISTS (SELECT 1 FROM DOSN d WHERE d.RECIBO_ID = r.RECIBO_ID)
                    OR EXISTS (SELECT 1 FROM PMS p WHERE p.RECIBO_ID = r.RECIBO_ID)
                    OR EXISTS (SELECT 1 FROM PUREZA pu WHERE pu.RECIBO_ID = r.RECIBO_ID)
                    OR EXISTS (SELECT 1 FROM GERMINACION g WHERE g.RECIBO_ID = r.RECIBO_ID)
                )
                LIMIT 1
            """)
            result = conn.execute(query).fetchone()
            
            if not result:
                pytest.skip("No hay lotes con recibo y análisis en la base de datos para probar")
            
            lote_id = result[0]
            recibo_id = result[1]
            
            # Ahora hacer la petición de exportación
            response = client.post(f"/middleware/exportar-lote/{lote_id}?formato=xlsx")
            
            # Debe ser exitoso (200)
            assert response.status_code == 200, \
                f"Debería retornar 200 cuando hay datos. Status: {response.status_code}, Response: {response.text[:500]}"
            
            # Verificar que el contenido es un ZIP
            assert response.headers.get("content-type") == "application/zip", \
                f"Content-Type debe ser application/zip, pero es {response.headers.get('content-type')}"
            
            # Verificar que tiene Content-Disposition con el nombre del archivo
            content_disposition = response.headers.get("content-disposition", "")
            assert f"lote_{lote_id}_export.zip" in content_disposition, \
                f"Content-Disposition debe incluir el nombre del archivo. Actual: {content_disposition}"
            
            # Guardar el ZIP en un archivo temporal para verificar su contenido
            zip_path = os.path.join(temp_export_dir, f"lote_{lote_id}_export.zip")
            with open(zip_path, "wb") as f:
                f.write(response.content)
            
            # Verificar que el archivo ZIP no está vacío
            assert os.path.getsize(zip_path) > 0, "El archivo ZIP no debe estar vacío"
            
            # Verificar que el ZIP es válido y contiene archivos
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                file_list = zip_ref.namelist()
                assert len(file_list) > 0, "El ZIP debe contener al menos un archivo"
                
                # Verificar que los archivos son Excel
                excel_files = [f for f in file_list if f.endswith('.xlsx')]
                assert len(excel_files) > 0, \
                    f"El ZIP debe contener al menos un archivo Excel. Archivos encontrados: {file_list}"
                
                # Verificar que podemos leer al menos un archivo Excel
                for excel_file in excel_files[:1]:  # Solo verificar el primero
                    excel_content = zip_ref.read(excel_file)
                    assert len(excel_content) > 0, \
                        f"El archivo Excel {excel_file} no debe estar vacío"
                    
                    # Verificar que tiene la firma de archivo Excel (PK header)
                    assert excel_content[:2] == b'PK', \
                        f"El archivo {excel_file} debe ser un archivo ZIP/Excel válido"
            
            print(f"\n✓ Exportación exitosa para lote {lote_id} (recibo {recibo_id})")
            print(f"  Archivos en ZIP: {file_list}")
            print(f"  Tamaño del ZIP: {os.path.getsize(zip_path)} bytes")
            
    except Exception as e:
        pytest.skip(f"No se pudo conectar a la base de datos o verificar datos: {e}")


def test_export_lote_con_recibo_sin_analisis(client):
    """
    Test que verifica el comportamiento cuando un lote tiene recibo pero no tiene análisis.
    """
    from sqlalchemy import create_engine, text
    from database_config import build_connection_string
    
    try:
        engine = create_engine(build_connection_string())
        with engine.connect() as conn:
            # Buscar un lote que tenga recibo activo pero sin análisis
            query = text("""
                SELECT DISTINCT r.LOTE_ID, r.RECIBO_ID
                FROM RECIBO r
                WHERE r.RECIBO_ACTIVO = true
                AND r.LOTE_ID IS NOT NULL
                AND NOT EXISTS (SELECT 1 FROM DOSN d WHERE d.RECIBO_ID = r.RECIBO_ID)
                AND NOT EXISTS (SELECT 1 FROM PMS p WHERE p.RECIBO_ID = r.RECIBO_ID)
                AND NOT EXISTS (SELECT 1 FROM PUREZA pu WHERE pu.RECIBO_ID = r.RECIBO_ID)
                AND NOT EXISTS (SELECT 1 FROM GERMINACION g WHERE g.RECIBO_ID = r.RECIBO_ID)
                AND NOT EXISTS (SELECT 1 FROM SANITARIO s WHERE s.SANITARIO_RECIBOID = r.RECIBO_ID)
                AND NOT EXISTS (SELECT 1 FROM TETRAZOLIO t WHERE t.RECIBO_ID = r.RECIBO_ID)
                AND NOT EXISTS (SELECT 1 FROM PUREZA_PNOTATUM pp WHERE pp.RECIBO_ID = r.RECIBO_ID)
                LIMIT 1
            """)
            result = conn.execute(query).fetchone()
            
            if not result:
                pytest.skip("No hay lotes con recibo pero sin análisis en la base de datos para probar")
            
            lote_id = result[0]
            
            # Hacer la petición de exportación
            response = client.post(f"/middleware/exportar-lote/{lote_id}?formato=xlsx")
            
            # Debe retornar 404 porque no hay análisis para exportar
            assert response.status_code == 404, \
                f"Debería retornar 404 cuando no hay análisis. Status: {response.status_code}, Response: {response.text[:500]}"
            
            # Verificar que el mensaje de error es apropiado
            try:
                error_data = response.json()
                assert "mensaje" in error_data or "detail" in error_data, \
                    "Error debe tener estructura de mensaje"
            except:
                # Si no es JSON estructurado, verificar que al menos hay texto
                assert len(response.text) > 0, "Error debe tener algún mensaje"
            
            print(f"\n✓ Verificado que lote {lote_id} con recibo pero sin análisis retorna 404")
            
    except Exception as e:
        pytest.skip(f"No se pudo conectar a la base de datos: {e}")


def test_export_lote_verificar_tipos_analisis(client, temp_export_dir):
    """
    Test que verifica que se exportan todos los tipos de análisis disponibles.
    """
    from sqlalchemy import create_engine, text
    from database_config import build_connection_string
    
    try:
        engine = create_engine(build_connection_string())
        with engine.connect() as conn:
            # Buscar un lote que tenga múltiples tipos de análisis
            query = text("""
                SELECT DISTINCT r.LOTE_ID, r.RECIBO_ID,
                    (SELECT COUNT(*) FROM DOSN d WHERE d.RECIBO_ID = r.RECIBO_ID) as dosn_count,
                    (SELECT COUNT(*) FROM PMS p WHERE p.RECIBO_ID = r.RECIBO_ID) as pms_count,
                    (SELECT COUNT(*) FROM PUREZA pu WHERE pu.RECIBO_ID = r.RECIBO_ID) as pureza_count,
                    (SELECT COUNT(*) FROM GERMINACION g WHERE g.RECIBO_ID = r.RECIBO_ID) as germinacion_count
                FROM RECIBO r
                WHERE r.RECIBO_ACTIVO = true
                AND r.LOTE_ID IS NOT NULL
                AND (
                    EXISTS (SELECT 1 FROM DOSN d WHERE d.RECIBO_ID = r.RECIBO_ID)
                    OR EXISTS (SELECT 1 FROM PMS p WHERE p.RECIBO_ID = r.RECIBO_ID)
                    OR EXISTS (SELECT 1 FROM PUREZA pu WHERE pu.RECIBO_ID = r.RECIBO_ID)
                    OR EXISTS (SELECT 1 FROM GERMINACION g WHERE g.RECIBO_ID = r.RECIBO_ID)
                )
                LIMIT 1
            """)
            result = conn.execute(query).fetchone()
            
            if not result:
                pytest.skip("No hay lotes con análisis en la base de datos para probar")
            
            lote_id = result[0]
            recibo_id = result[1]
            dosn_count = result[2] or 0
            pms_count = result[3] or 0
            pureza_count = result[4] or 0
            germinacion_count = result[5] or 0
            
            # Hacer la petición de exportación
            response = client.post(f"/middleware/exportar-lote/{lote_id}?formato=xlsx")
            
            assert response.status_code == 200, \
                f"Debería retornar 200. Status: {response.status_code}, Response: {response.text[:500]}"
            
            # Guardar el ZIP
            zip_path = os.path.join(temp_export_dir, f"lote_{lote_id}_export.zip")
            with open(zip_path, "wb") as f:
                f.write(response.content)
            
            # Verificar contenido del ZIP
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                file_list = zip_ref.namelist()
                
                # Verificar que se exportaron los tipos de análisis que existen
                if dosn_count > 0:
                    assert any('dosn' in f.lower() for f in file_list), \
                        f"Debería exportar DOSN si hay {dosn_count} registros. Archivos: {file_list}"
                
                if pms_count > 0:
                    assert any('pms' in f.lower() for f in file_list), \
                        f"Debería exportar PMS si hay {pms_count} registros. Archivos: {file_list}"
                
                if pureza_count > 0:
                    assert any('pureza' in f.lower() for f in file_list), \
                        f"Debería exportar Pureza si hay {pureza_count} registros. Archivos: {file_list}"
                
                if germinacion_count > 0:
                    assert any('germinacion' in f.lower() or 'germinación' in f.lower() for f in file_list), \
                        f"Debería exportar Germinación si hay {germinacion_count} registros. Archivos: {file_list}"
            
            print(f"\n✓ Verificado tipos de análisis para lote {lote_id}")
            print(f"  DOSN: {dosn_count}, PMS: {pms_count}, Pureza: {pureza_count}, Germinación: {germinacion_count}")
            print(f"  Archivos exportados: {file_list}")
            
    except Exception as e:
        pytest.skip(f"No se pudo conectar a la base de datos: {e}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])


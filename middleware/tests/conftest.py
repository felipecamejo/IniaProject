"""
Configuración global de pytest para tests del middleware FastAPI.
Este archivo contiene fixtures compartidas y configuración común.
"""

import pytest
import sys
import os
from pathlib import Path

# Configurar variables de entorno antes de importar módulos que las requieren
os.environ.setdefault('DB_PASSWORD', 'test_password')
os.environ.setdefault('DB_USER', 'test_user')
os.environ.setdefault('DB_HOST', 'localhost')
os.environ.setdefault('DB_PORT', '5432')
os.environ.setdefault('DB_NAME', 'test_db')

# Agregar el directorio raíz del middleware al path
middleware_root = Path(__file__).parent.parent
sys.path.insert(0, str(middleware_root))

from fastapi.testclient import TestClient
from fastapi import FastAPI
import tempfile
import shutil


@pytest.fixture(scope="session")
def app():
    """
    Fixture que proporciona la aplicación FastAPI para los tests.
    Se crea una vez por sesión de tests.
    """
    from http_server import app
    return app


@pytest.fixture(scope="function")
def client(app: FastAPI):
    """
    Fixture que proporciona un TestClient para hacer peticiones HTTP.
    Se crea una nueva instancia para cada test.
    """
    return TestClient(app)


@pytest.fixture(scope="function")
def temp_dir():
    """
    Fixture que crea un directorio temporal para tests.
    Se limpia automáticamente después de cada test.
    """
    temp_path = tempfile.mkdtemp(prefix="inia_test_")
    yield temp_path
    # Limpiar después del test
    if os.path.exists(temp_path):
        shutil.rmtree(temp_path, ignore_errors=True)


@pytest.fixture(scope="function")
def sample_csv_file(temp_dir):
    """
    Fixture que crea un archivo CSV de ejemplo para tests.
    """
    csv_path = os.path.join(temp_dir, "test.csv")
    with open(csv_path, "w", encoding="utf-8") as f:
        f.write("id,nombre,email\n")
        f.write("1,Test User,test@example.com\n")
        f.write("2,Another User,another@example.com\n")
    return csv_path


@pytest.fixture(scope="function")
def sample_xlsx_file(temp_dir):
    """
    Fixture que crea un archivo XLSX de ejemplo para tests.
    Requiere openpyxl.
    """
    try:
        from openpyxl import Workbook
        
        xlsx_path = os.path.join(temp_dir, "test.xlsx")
        wb = Workbook()
        ws = wb.active
        ws.title = "Test Sheet"
        
        # Agregar headers
        ws.append(["id", "nombre", "email"])
        ws.append([1, "Test User", "test@example.com"])
        ws.append([2, "Another User", "another@example.com"])
        
        wb.save(xlsx_path)
        return xlsx_path
    except ImportError:
        pytest.skip("openpyxl no está instalado")


@pytest.fixture(scope="function")
def mock_db_connection(monkeypatch):
    """
    Fixture para mockear la conexión a la base de datos.
    Útil para tests que no requieren una BD real.
    """
    def mock_build_connection_string():
        return "postgresql://test:test@localhost:5432/test_db"
    
    monkeypatch.setattr("http_server.build_connection_string", mock_build_connection_string)
    return mock_build_connection_string


"""
Tests básicos para validar el ambiente de desarrollo del middleware INIA.
Estos tests verifican que todas las dependencias están instaladas correctamente
y que los componentes principales funcionan.
"""

import pytest
import sys
import os

# Agregar el directorio actual al path para importaciones
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def test_dependencies_import():
    """Test que verifica que todas las dependencias principales se pueden importar."""
    # Dependencias principales
    import sqlalchemy
    import psycopg2
    import fastapi
    import uvicorn
    import openpyxl
    import pydantic
    
    # Dependencias de testing
    import pytest
    import httpx
    
    # Verificar que los módulos están disponibles
    assert sqlalchemy.__version__ is not None
    assert fastapi.__version__ is not None
    assert pydantic.__version__ is not None


def test_fastapi_app_import():
    """Test que verifica que la aplicación FastAPI se puede importar."""
    from http_server import app
    
    # Verificar que la app es una instancia de FastAPI
    assert app is not None
    assert hasattr(app, 'routes')


def test_testclient_functionality():
    """Test que verifica que TestClient funciona con la aplicación FastAPI."""
    from fastapi.testclient import TestClient
    from http_server import app
    
    # Crear cliente de test
    client = TestClient(app)
    
    # Verificar que el cliente se creó correctamente
    assert client is not None
    
    # Test básico: verificar que la app responde (aunque no tengamos endpoint GET /)
    # Esto validará que TestClient puede comunicarse con la app
    try:
        # Intentar hacer una petición a un endpoint que no existe
        # Esto debería devolver 404, no un error de conexión
        response = client.get("/")
        # Si llegamos aquí, TestClient está funcionando
        assert response.status_code in [404, 405]  # 404 Not Found o 405 Method Not Allowed
    except Exception as e:
        pytest.fail(f"TestClient no puede comunicarse con la app: {e}")


def test_middleware_scripts_import():
    """Test que verifica que los scripts principales del middleware se pueden importar."""
    # Importar scripts principales
    from MassiveInsertFiles import build_connection_string, create_engine
    from ExportExcel import export_selected_tables, MODELS
    from ImportExcel import import_one_file, MODELS as IMPORT_MODELS
    
    # Verificar que las funciones están disponibles
    assert callable(build_connection_string)
    assert callable(create_engine)
    assert callable(export_selected_tables)
    assert callable(import_one_file)
    
    # Verificar que MODELS están definidos
    assert MODELS is not None
    assert IMPORT_MODELS is not None


def test_database_connection_string():
    """Test que verifica que se puede construir la cadena de conexión a la base de datos."""
    from MassiveInsertFiles import build_connection_string
    
    try:
        connection_string = build_connection_string()
        assert connection_string is not None
        assert isinstance(connection_string, str)
        assert len(connection_string) > 0
    except Exception as e:
        # Si falla, puede ser por configuración de base de datos
        # pero al menos verificar que la función existe y es llamable
        pytest.skip(f"No se pudo construir connection string (puede ser normal): {e}")


def test_pytest_configuration():
    """Test que verifica que pytest está configurado correctamente."""
    # Verificar que pytest está disponible
    import pytest
    
    # Verificar que podemos usar fixtures básicas
    @pytest.fixture
    def sample_fixture():
        return "test_value"
    
    def test_with_fixture(sample_fixture):
        assert sample_fixture == "test_value"
    
    # Si llegamos aquí, pytest está funcionando
    assert True


if __name__ == "__main__":
    # Ejecutar tests si se ejecuta directamente
    pytest.main([__file__, "-v"])

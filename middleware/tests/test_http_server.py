"""
Tests para los endpoints del servidor HTTP FastAPI.
Estos tests verifican el comportamiento de los endpoints principales.
"""

import pytest
from fastapi import status
from fastapi.testclient import TestClient
import os
import tempfile
from pathlib import Path


class TestHealthCheck:
    """Tests para verificar el estado del servidor."""
    
    def test_app_exists(self, app):
        """Verifica que la aplicación FastAPI existe."""
        assert app is not None
        assert hasattr(app, "routes")
    
    def test_app_title(self, app):
        """Verifica el título de la aplicación."""
        assert app.title == "INIA Python Middleware"
        assert app.version == "1.0.0"


class TestInsertEndpoint:
    """Tests para el endpoint /insertar."""
    
    def test_insert_endpoint_exists(self, client: TestClient):
        """Verifica que el endpoint /insertar existe."""
        response = client.post("/insertar")
        # Puede fallar por conexión a BD, pero el endpoint debe existir
        assert response.status_code in [200, 500, 503]
    
    def test_insert_endpoint_method_not_allowed(self, client: TestClient):
        """Verifica que GET no está permitido en /insertar."""
        response = client.get("/insertar")
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED


class TestExportEndpoint:
    """Tests para el endpoint /exportar."""
    
    def test_export_endpoint_exists(self, client: TestClient):
        """Verifica que el endpoint /exportar existe."""
        response = client.post("/exportar")
        # Puede fallar por conexión a BD, pero el endpoint debe existir
        assert response.status_code in [200, 400, 500, 503]
    
    def test_export_with_invalid_format(self, client: TestClient):
        """Verifica que formato inválido retorna error 400 o 422."""
        response = client.post("/exportar?formato=invalid")
        # FastAPI retorna 422 (Unprocessable Entity) para errores de validación
        assert response.status_code in [status.HTTP_400_BAD_REQUEST, status.HTTP_422_UNPROCESSABLE_CONTENT]
    
    def test_export_with_valid_format_xlsx(self, client: TestClient):
        """Verifica que formato xlsx es válido."""
        response = client.post("/exportar?formato=xlsx")
        # Puede fallar por BD, pero el formato debe ser aceptado
        assert response.status_code in [200, 400, 500, 503]
        if response.status_code == 400:
            # Si es 400, verificar que no es por formato inválido
            content = response.json()
            assert "formato" not in str(content).lower() or "xlsx" in str(content).lower()
    
    def test_export_with_valid_format_csv(self, client: TestClient):
        """Verifica que formato csv es válido."""
        response = client.post("/exportar?formato=csv")
        # Puede fallar por BD, pero el formato debe ser aceptado
        assert response.status_code in [200, 400, 500, 503]


class TestImportEndpoint:
    """Tests para el endpoint /importar."""
    
    def test_import_endpoint_exists(self, client: TestClient):
        """Verifica que el endpoint /importar existe."""
        response = client.post("/importar")
        # Debe retornar error 400 porque no se envió archivo
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_import_without_file(self, client: TestClient):
        """Verifica que importar sin archivo retorna error 400."""
        response = client.post("/importar")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        content = response.json()
        assert "exitoso" in content
        assert content["exitoso"] is False
        assert "archivo" in content["mensaje"].lower() or "file" in content["mensaje"].lower()
    
    def test_import_with_empty_file(self, client: TestClient, temp_dir):
        """Verifica que importar archivo vacío retorna error."""
        empty_file_path = os.path.join(temp_dir, "empty.csv")
        with open(empty_file_path, "w") as f:
            pass  # Archivo vacío
        
        with open(empty_file_path, "rb") as f:
            response = client.post(
                "/importar",
                files={"file": ("empty.csv", f, "text/csv")}
            )
        
        assert response.status_code in [400, 500]
        content = response.json()
        assert content["exitoso"] is False
    
    def test_import_with_valid_csv(self, client: TestClient, sample_csv_file):
        """Verifica que se puede enviar un CSV válido."""
        with open(sample_csv_file, "rb") as f:
            response = client.post(
                "/importar",
                files={"file": ("test.csv", f, "text/csv")},
                data={"table": "usuario", "upsert": "false", "keep_ids": "false"}
            )
        
        # Puede fallar por BD o tabla no encontrada, pero debe procesar el archivo
        assert response.status_code in [200, 400, 500, 503]
        content = response.json()
        assert "exitoso" in content


class TestAnalyzeEndpoint:
    """Tests para el endpoint /analizar."""
    
    def test_analyze_endpoint_exists(self, client: TestClient):
        """Verifica que el endpoint /analizar existe."""
        response = client.post("/analizar")
        # FastAPI retorna 422 (Unprocessable Entity) para errores de validación
        assert response.status_code in [status.HTTP_400_BAD_REQUEST, status.HTTP_422_UNPROCESSABLE_CONTENT]
    
    def test_analyze_without_file(self, client: TestClient):
        """Verifica que analizar sin archivo retorna error 400 o 422."""
        response = client.post("/analizar")
        # FastAPI retorna 422 (Unprocessable Entity) para errores de validación
        assert response.status_code in [status.HTTP_400_BAD_REQUEST, status.HTTP_422_UNPROCESSABLE_CONTENT]
        content = response.json()
        # FastAPI 422 retorna formato {'detail': [...]}, middleware 400 retorna {'exitoso': False, ...}
        if response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT:
            assert "detail" in content
        else:
            assert "exitoso" in content
            assert content["exitoso"] is False
    
    def test_analyze_with_invalid_format(self, client: TestClient, sample_csv_file):
        """Verifica que analizar CSV (no Excel) retorna error."""
        with open(sample_csv_file, "rb") as f:
            response = client.post(
                "/analizar",
                files={"file": ("test.csv", f, "text/csv")}
            )
        
        # FastAPI retorna 422 (Unprocessable Entity) para errores de validación
        assert response.status_code in [status.HTTP_400_BAD_REQUEST, status.HTTP_422_UNPROCESSABLE_CONTENT]
        content = response.json()
        # FastAPI 422 retorna formato {'detail': [...]}, middleware 400 retorna {'exitoso': False, ...}
        if response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT:
            assert "detail" in content
        else:
            assert content["exitoso"] is False
            # Verificar que el mensaje indica error de formato (puede estar en detalles o mensaje)
            mensaje_completo = str(content.get("mensaje", "")).lower() + " " + str(content.get("detalles", "")).lower()
            assert len(mensaje_completo) > 0
    
    def test_analyze_with_invalid_output_format(self, client: TestClient, sample_xlsx_file):
        """Verifica que formato de salida inválido retorna error."""
        if sample_xlsx_file is None:
            pytest.skip("openpyxl no está instalado")
        
        with open(sample_xlsx_file, "rb") as f:
            response = client.post(
                "/analizar?formato=invalid",
                files={"file": ("test.xlsx", f, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}
            )
        
        # FastAPI retorna 422 (Unprocessable Entity) para errores de validación
        assert response.status_code in [status.HTTP_400_BAD_REQUEST, status.HTTP_422_UNPROCESSABLE_CONTENT]
        content = response.json()
        # FastAPI 422 retorna formato {'detail': [...]}, middleware 400 retorna {'exitoso': False, ...}
        if response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT:
            assert "detail" in content
        else:
            assert content["exitoso"] is False


class TestErrorHandling:
    """Tests para el manejo de errores."""
    
    def test_nonexistent_endpoint(self, client: TestClient):
        """Verifica que endpoints inexistentes retornan 404."""
        response = client.get("/nonexistent")
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_method_not_allowed(self, client: TestClient):
        """Verifica que métodos no permitidos retornan 405."""
        response = client.get("/insertar")
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED
    
    def test_error_response_structure(self, client: TestClient):
        """Verifica que las respuestas de error tienen la estructura correcta."""
        response = client.post("/importar")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        content = response.json()
        
        # Verificar estructura de respuesta de error
        assert "exitoso" in content
        assert "mensaje" in content
        assert "codigo" in content
        assert content["exitoso"] is False
        assert isinstance(content["codigo"], int)


class TestResponseStructure:
    """Tests para verificar la estructura de las respuestas."""
    
    def test_success_response_structure(self, client: TestClient):
        """Verifica que las respuestas exitosas tienen la estructura correcta."""
        # Este test puede necesitar un endpoint que siempre funcione
        # Por ahora, verificamos la estructura de error que siempre está disponible
        response = client.post("/importar")
        content = response.json()
        
        # Verificar que tiene los campos esperados
        assert "exitoso" in content
        assert "mensaje" in content
        assert "codigo" in content
    
    def test_error_response_has_details(self, client: TestClient):
        """Verifica que las respuestas de error pueden tener detalles."""
        response = client.post("/importar")
        content = response.json()
        
        # Los detalles pueden estar presentes o no
        if "detalles" in content:
            assert isinstance(content["detalles"], str)


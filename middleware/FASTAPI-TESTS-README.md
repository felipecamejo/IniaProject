# Guía de Tests para FastAPI - Middleware INIA

Esta guía explica cómo ejecutar y crear tests para el middleware FastAPI del proyecto INIA.

---

## Estructura de Tests

```
middleware/
├── tests/
│   ├── __init__.py
│   ├── conftest.py              # Configuración y fixtures compartidas
│   ├── test_http_server.py      # Tests de endpoints HTTP
│   └── pytest.ini               # Configuración de pytest
├── test_setup.py                # Tests básicos de configuración
└── requirements.txt             # Dependencias (incluye pytest)
```

---

## Requisitos Previos

### Dependencias

Las dependencias de testing ya están incluidas en `requirements.txt`:

```txt
pytest>=7.4.0
pytest-asyncio>=0.21.0
httpx>=0.25.0
```

### Instalación

```powershell
# Desde el directorio middleware
cd middleware
pip install -r requirements.txt
```

---

## Ejecutar Tests

### Ejecutar Todos los Tests

```powershell
# Desde el directorio middleware
pytest

# Con más verbosidad
pytest -v

# Con salida detallada
pytest -vv
```

### Ejecutar Tests Específicos

```powershell
# Ejecutar un archivo de test específico
pytest tests/test_http_server.py

# Ejecutar una clase de test específica
pytest tests/test_http_server.py::TestHealthCheck

# Ejecutar un test específico
pytest tests/test_http_server.py::TestHealthCheck::test_app_exists
```

### Ejecutar Tests por Marcador

```powershell
# Tests unitarios
pytest -m unit

# Tests de integración
pytest -m integration

# Tests que requieren base de datos
pytest -m requires_db

# Excluir tests lentos
pytest -m "not slow"
```

### Ejecutar Tests con Cobertura

```powershell
# Instalar pytest-cov primero
pip install pytest-cov

# Ejecutar con cobertura
pytest --cov=http_server --cov-report=html --cov-report=term

# Ver reporte HTML
# Abrir htmlcov/index.html en el navegador
```

---

## Estructura de un Test

### Ejemplo Básico

```python
import pytest
from fastapi.testclient import TestClient

def test_endpoint_basico(client: TestClient):
    """Test básico de un endpoint."""
    response = client.get("/endpoint")
    assert response.status_code == 200
    assert response.json()["exitoso"] is True
```

### Ejemplo con Fixtures

```python
def test_importar_archivo(client: TestClient, sample_csv_file):
    """Test de importación con archivo de prueba."""
    with open(sample_csv_file, "rb") as f:
        response = client.post(
            "/importar",
            files={"file": ("test.csv", f, "text/csv")}
        )
    
    assert response.status_code == 200
    content = response.json()
    assert content["exitoso"] is True
```

---

## Fixtures Disponibles

### Fixtures de conftest.py

- **`app`**: Aplicación FastAPI (sesión)
- **`client`**: TestClient para hacer peticiones HTTP (función)
- **`temp_dir`**: Directorio temporal (función)
- **`sample_csv_file`**: Archivo CSV de ejemplo (función)
- **`sample_xlsx_file`**: Archivo XLSX de ejemplo (función)
- **`mock_db_connection`**: Mock de conexión a BD (función)

### Uso de Fixtures

```python
def test_con_fixture(client: TestClient, temp_dir):
    """Test que usa múltiples fixtures."""
    # client para hacer peticiones
    # temp_dir para archivos temporales
    pass
```

---

## Crear Nuevos Tests

### 1. Crear Archivo de Test

```python
# tests/test_mi_endpoint.py
import pytest
from fastapi.testclient import TestClient

class TestMiEndpoint:
    """Tests para mi endpoint."""
    
    def test_caso_exitoso(self, client: TestClient):
        """Test del caso exitoso."""
        response = client.post("/mi-endpoint")
        assert response.status_code == 200
    
    def test_caso_error(self, client: TestClient):
        """Test del caso de error."""
        response = client.post("/mi-endpoint")
        assert response.status_code == 400
```

### 2. Usar Marcadores

```python
import pytest

@pytest.mark.slow
def test_lento(client: TestClient):
    """Test que tarda mucho tiempo."""
    # Test que tarda mucho
    pass

@pytest.mark.requires_db
def test_con_bd(client: TestClient):
    """Test que requiere base de datos."""
    # Test que necesita BD
    pass
```

### 3. Tests Parametrizados

```python
import pytest

@pytest.mark.parametrize("formato", ["xlsx", "csv"])
def test_exportar_formato(client: TestClient, formato):
    """Test parametrizado para diferentes formatos."""
    response = client.post(f"/exportar?formato={formato}")
    assert response.status_code in [200, 500]  # Puede fallar por BD
```

---

## Tests de Endpoints

### Test de GET

```python
def test_get_endpoint(client: TestClient):
    response = client.get("/endpoint")
    assert response.status_code == 200
    data = response.json()
    assert "exitoso" in data
```

### Test de POST

```python
def test_post_endpoint(client: TestClient):
    response = client.post(
        "/endpoint",
        json={"campo": "valor"}
    )
    assert response.status_code == 200
```

### Test de POST con Archivo

```python
def test_post_con_archivo(client: TestClient, sample_csv_file):
    with open(sample_csv_file, "rb") as f:
        response = client.post(
            "/importar",
            files={"file": ("test.csv", f, "text/csv")},
            data={"table": "usuario"}
        )
    assert response.status_code in [200, 400, 500]
```

### Test de Validación

```python
def test_validacion_campos(client: TestClient):
    response = client.post("/endpoint", json={})
    assert response.status_code == 400
    content = response.json()
    assert content["exitoso"] is False
    assert "mensaje" in content
```

---

## Tests Asíncronos

### Test de Endpoint Asíncrono

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_endpoint_async(app):
    """Test de endpoint asíncrono."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/endpoint")
        assert response.status_code == 200
```

---

## Mocking

### Mock de Base de Datos

```python
import pytest
from unittest.mock import patch

def test_con_mock_db(client: TestClient, mock_db_connection):
    """Test con conexión a BD mockeada."""
    with patch("http_server.build_connection_string") as mock:
        mock.return_value = "postgresql://test:test@localhost:5432/test"
        response = client.post("/insertar")
        # Test aquí
```

---

## Interpretar Resultados

### Salida Exitosa

```
tests/test_http_server.py::TestHealthCheck::test_app_exists PASSED
tests/test_http_server.py::TestHealthCheck::test_app_title PASSED
```

### Salida con Errores

```
tests/test_http_server.py::TestImportEndpoint::test_import_without_file FAILED
...
AssertionError: assert 500 == 400
```

### Salida con Errores de Conexión

```
tests/test_http_server.py::TestInsertEndpoint::test_insert_endpoint_exists FAILED
...
ConnectionError: No se pudo conectar a la base de datos
```

**Nota**: Algunos tests pueden fallar si la base de datos no está disponible. Esto es normal en entornos de desarrollo.

---

## Troubleshooting

### Error: "ModuleNotFoundError: No module named 'http_server'"

**Solución**: Asegúrate de ejecutar pytest desde el directorio `middleware`:

```powershell
cd middleware
pytest
```

### Error: "TestClient no puede comunicarse con la app"

**Solución**: Verifica que todas las dependencias están instaladas:

```powershell
pip install -r requirements.txt
```

### Tests fallan por conexión a base de datos

**Solución**: Esto es normal. Los tests están diseñados para funcionar con o sin BD:

- Si la BD está disponible, los tests de integración pasarán
- Si no está disponible, los tests básicos aún deberían pasar

Para tests que requieren BD, usa el marcador `@pytest.mark.requires_db`:

```powershell
# Ejecutar solo tests que no requieren BD
pytest -m "not requires_db"
```

### Error: "openpyxl no está instalado"

**Solución**: Instala openpyxl:

```powershell
pip install openpyxl
```

---

## Mejores Prácticas

### 1. Nombres Descriptivos

```python
# ✅ Bueno
def test_importar_archivo_csv_valido_retorna_200(client: TestClient):
    pass

# ❌ Malo
def test1(client: TestClient):
    pass
```

### 2. Un Test, Una Aserción Principal

```python
# ✅ Bueno
def test_endpoint_retorna_200(client: TestClient):
    response = client.get("/endpoint")
    assert response.status_code == 200

# ❌ Malo (múltiples aserciones no relacionadas)
def test_todo(client: TestClient):
    assert client.get("/endpoint1").status_code == 200
    assert client.get("/endpoint2").status_code == 200
    assert client.post("/endpoint3").status_code == 200
```

### 3. Usar Fixtures para Datos de Prueba

```python
# ✅ Bueno
def test_con_fixture(client: TestClient, sample_csv_file):
    with open(sample_csv_file, "rb") as f:
        response = client.post("/importar", files={"file": f})
    assert response.status_code == 200

# ❌ Malo (crear datos en cada test)
def test_sin_fixture(client: TestClient):
    # Crear archivo manualmente
    with open("temp.csv", "w") as f:
        f.write("data")
    # ...
```

### 4. Limpiar Recursos

```python
# ✅ Bueno (usar fixtures que limpian automáticamente)
def test_con_temp_dir(client: TestClient, temp_dir):
    # temp_dir se limpia automáticamente
    pass

# ❌ Malo (no limpiar)
def test_sin_limpiar(client: TestClient):
    with open("temp.csv", "w") as f:
        f.write("data")
    # Archivo no se elimina
```

---

## Integración con CI/CD

### GitHub Actions

```yaml
name: FastAPI Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd middleware
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd middleware
          pytest
```

---

## Referencias

- [Documentación de pytest](https://docs.pytest.org/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [TestClient Documentation](https://www.python-httpx.org/api/#testclient)
- [GUIA-EJECUCION-TESTS.md](../GUIA-EJECUCION-TESTS.md) - Guía general de tests

---

## Resumen de Comandos

```powershell
# Ejecutar todos los tests
pytest

# Ejecutar con verbosidad
pytest -v

# Ejecutar un archivo específico
pytest tests/test_http_server.py

# Ejecutar con cobertura
pytest --cov=http_server --cov-report=html

# Ejecutar tests rápidos (sin BD)
pytest -m "not requires_db"

# Ejecutar tests específicos
pytest -k "test_import"
```

---

**Última actualización**: Enero 2024
**Versión**: 1.0


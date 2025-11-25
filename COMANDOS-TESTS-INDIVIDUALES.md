# Comandos para Ejecutar Tests Individuales - Proyecto INIA

Esta guía proporciona comandos específicos para ejecutar cada test de forma individual.

---

## ⚠️ IMPORTANTE: Antes de Ejecutar Tests

### Verificar que Maven está Instalado

```powershell
# Verificar Maven
mvn -version

# Si no está instalado, ejecutar:
.\PowerShell\SetupMaven.ps1

# O ver: SOLUCION-MAVEN-NO-ENCONTRADO.md
```

### Verificar Java 21

```powershell
# Verificar Java
java -version

# Debe mostrar Java 21. Si muestra Java 1.8 u otra versión:
# Descargar Java 21 desde: https://adoptium.net/
```

---

## Tests del Backend (Java/Maven)

### Ejecutar una Clase de Test Completa

#### Tests de Integración

```powershell
# UsuarioControllerTest (15 tests)
mvn test -Dtest=UsuarioControllerTest

# CultivoControllerTest (12 tests)
mvn test -Dtest=CultivoControllerTest

# HongoControllerTest (12 tests)
mvn test -Dtest=HongoControllerTest

# MalezaControllerTest (12 tests)
mvn test -Dtest=MalezaControllerTest

# DepositoControllerTest (12 tests)
mvn test -Dtest=DepositoControllerTest

# MetodoControllerTest (12 tests)
mvn test -Dtest=MetodoControllerTest

# CertificadoControllerTest (12 tests)
mvn test -Dtest=CertificadoControllerTest

# AutoCompletadoControllerTest (8 tests)
mvn test -Dtest=AutoCompletadoControllerTest

# LogControllerTest (6 tests)
mvn test -Dtest=LogControllerTest
```

#### Tests de Seguridad

```powershell
# LoteSecurityTest (12 tests)
mvn test -Dtest=LoteSecurityTest

# DOSNSecurityTest (8 tests)
mvn test -Dtest=DOSNSecurityTest

# ReciboSecurityTest (6 tests)
mvn test -Dtest=ReciboSecurityTest

# UsuarioSecurityService (10 tests)
mvn test -Dtest=UsuarioSecurityService

# HongoSecurityTest (8 tests)
mvn test -Dtest=HongoSecurityTest

# MalezaSecurityTest (8 tests)
mvn test -Dtest=MalezaSecurityTest

# CultivoSecurityTest (8 tests)
mvn test -Dtest=CultivoSecurityTest

# DepositoSecurityTest (8 tests)
mvn test -Dtest=DepositoSecurityTest

# GerminacionSecurityTest (8 tests)
mvn test -Dtest=GerminacionSecurityTest

# PurezaPNotatumSecurityTest (8 tests)
mvn test -Dtest=PurezaPNotatumSecurityTest

# PandMiddlewareSecurityTest (6 tests)
mvn test -Dtest=PandMiddlewareSecurityTest

# MetodoSecurityTest (6 tests)
mvn test -Dtest=MetodoSecurityTest

# LogSecurityTest (6 tests)
mvn test -Dtest=LogSecurityTest

# CertificadoSecurityTest (6 tests)
mvn test -Dtest=CertificadoSecurityTest

# AutocompletadoSecurityTest (6 tests)
mvn test -Dtest=AutocompletadoSecurityTest

# GramosPMSSecurityTest (6 tests)
mvn test -Dtest=GramosPMSSecurityTest

# HumedadReciboSecurityTest (6 tests)
mvn test -Dtest=HumedadReciboSecurityTest

# GerminacionTablasSecurityTest (6 tests)
mvn test -Dtest=GerminacionTablasSecurityTest
```

### Ejecutar un Método de Test Específico

#### Ejemplos con UsuarioControllerTest

```powershell
# Test: getById_ReturnsOk
mvn test -Dtest=UsuarioControllerTest#getById_ReturnsOk

# Test: getById_IdIncorrect
mvn test -Dtest=UsuarioControllerTest#getById_IdIncorrect

# Test: getById_IdInvalid
mvn test -Dtest=UsuarioControllerTest#getById_IdInvalid

# Test: getByEmail_ReturnsOk
mvn test -Dtest=UsuarioControllerTest#getByEmail_ReturnsOk

# Test: crear_Correcto
mvn test -Dtest=UsuarioControllerTest#crear_Correcto

# Test: crear_YaExiste
mvn test -Dtest=UsuarioControllerTest#crear_YaExiste

# Test: update_ReturnsUpdated
mvn test -Dtest=UsuarioControllerTest#update_ReturnsUpdated

# Test: delete_ReturnsOk
mvn test -Dtest=UsuarioControllerTest#delete_ReturnsOk

# Test: obtenerPerfilUsuarioActual_ReturnsOk_WhenTokenValid
mvn test -Dtest=UsuarioControllerTest#obtenerPerfilUsuarioActual_ReturnsOk_WhenTokenValid
```

#### Ejemplos con LoteSecurityTest

```powershell
# Test: adminPuedeCrearLote
mvn test -Dtest=LoteSecurityTest#adminPuedeCrearLote

# Test: guestNoPuedeCrearLote
mvn test -Dtest=LoteSecurityTest#guestNoPuedeCrearLote

# Test: noAutenticadoDebeRetornar401AlCrear
mvn test -Dtest=LoteSecurityTest#noAutenticadoDebeRetornar401AlCrear

# Test: adminPuedeListarLotes
mvn test -Dtest=LoteSecurityTest#adminPuedeListarLotes

# Test: adminPuedeObtenerLote
mvn test -Dtest=LoteSecurityTest#adminPuedeObtenerLote

# Test: adminPuedeEditarLote
mvn test -Dtest=LoteSecurityTest#adminPuedeEditarLote

# Test: adminPuedeEliminarLote
mvn test -Dtest=LoteSecurityTest#adminPuedeEliminarLote
```

#### Ejemplos con DOSNSecurityTest

```powershell
# Test: adminPuedeCrear
mvn test -Dtest=DOSNSecurityTest#adminPuedeCrear

# Test: userNoPuedeCrear
mvn test -Dtest=DOSNSecurityTest#userNoPuedeCrear

# Test: adminPuedeListarPorRecibo
mvn test -Dtest=DOSNSecurityTest#adminPuedeListarPorRecibo

# Test: analistaPuedeVerPorId
mvn test -Dtest=DOSNSecurityTest#analistaPuedeVerPorId

# Test: adminPuedeEditar
mvn test -Dtest=DOSNSecurityTest#adminPuedeEditar

# Test: adminPuedeEliminar
mvn test -Dtest=DOSNSecurityTest#adminPuedeEliminar
```

### Ejecutar Múltiples Métodos de una Clase

```powershell
# Ejecutar varios métodos de UsuarioControllerTest
mvn test -Dtest=UsuarioControllerTest#getById_ReturnsOk+crear_Correcto+update_ReturnsUpdated

# Ejecutar todos los métodos de creación
mvn test -Dtest=UsuarioControllerTest#crear_*

# Ejecutar todos los métodos de eliminación
mvn test -Dtest=UsuarioControllerTest#delete_*
```

### Ejecutar Tests por Patrón

```powershell
# Todos los tests de seguridad
mvn test -Dtest=*SecurityTest

# Todos los tests de integración
mvn test -Dtest=*ControllerTest

# Todos los tests de Usuario
mvn test -Dtest=*Usuario*

# Todos los tests de Lote
mvn test -Dtest=*Lote*

# Todos los tests de DOSN
mvn test -Dtest=*DOSN*
```

### Ejecutar Tests por Paquete

```powershell
# Todos los tests del paquete security
mvn test -Dtest=ti.proyectoinia.api.controllers.security.**

# Todos los tests del paquete integration
mvn test -Dtest=ti.proyectoinia.api.controllers.integration.**

# Todos los tests de un paquete específico con patrón
mvn test -Dtest=ti.proyectoinia.api.controllers.security.*SecurityTest
```

---

## Tests del Middleware (Python/pytest)

### Ejecutar un Archivo de Test Completo

```powershell
# Desde el directorio middleware
cd middleware

# Ejecutar todos los tests de test_http_server.py
pytest tests/test_http_server.py

# Con verbosidad
pytest tests/test_http_server.py -v

# Con salida muy detallada
pytest tests/test_http_server.py -vv
```

### Ejecutar una Clase de Test Específica

```powershell
# TestHealthCheck
pytest tests/test_http_server.py::TestHealthCheck

# TestInsertEndpoint
pytest tests/test_http_server.py::TestInsertEndpoint

# TestExportEndpoint
pytest tests/test_http_server.py::TestExportEndpoint

# TestImportEndpoint
pytest tests/test_http_server.py::TestImportEndpoint

# TestAnalyzeEndpoint
pytest tests/test_http_server.py::TestAnalyzeEndpoint

# TestErrorHandling
pytest tests/test_http_server.py::TestErrorHandling

# TestResponseStructure
pytest tests/test_http_server.py::TestResponseStructure
```

### Ejecutar un Método de Test Específico

```powershell
# Test: test_app_exists
pytest tests/test_http_server.py::TestHealthCheck::test_app_exists

# Test: test_app_title
pytest tests/test_http_server.py::TestHealthCheck::test_app_title

# Test: test_insert_endpoint_exists
pytest tests/test_http_server.py::TestInsertEndpoint::test_insert_endpoint_exists

# Test: test_export_with_invalid_format
pytest tests/test_http_server.py::TestExportEndpoint::test_export_with_invalid_format

# Test: test_import_without_file
pytest tests/test_http_server.py::TestImportEndpoint::test_import_without_file

# Test: test_import_with_valid_csv
pytest tests/test_http_server.py::TestImportEndpoint::test_import_with_valid_csv

# Test: test_analyze_without_file
pytest tests/test_http_server.py::TestAnalyzeEndpoint::test_analyze_without_file

# Test: test_nonexistent_endpoint
pytest tests/test_http_server.py::TestErrorHandling::test_nonexistent_endpoint
```

### Ejecutar Tests por Patrón

```powershell
# Todos los tests que contengan "test_import"
pytest -k "test_import"

# Todos los tests que contengan "test_export"
pytest -k "test_export"

# Todos los tests que contengan "test_analyze"
pytest -k "test_analyze"

# Todos los tests de TestHealthCheck
pytest -k "TestHealthCheck"

# Todos los tests de endpoints
pytest -k "endpoint"
```

### Ejecutar Tests por Marcador

```powershell
# Tests unitarios
pytest -m unit

# Tests de integración
pytest -m integration

# Tests que requieren BD
pytest -m requires_db

# Excluir tests lentos
pytest -m "not slow"
```

---

## Tests con Testcontainers

### Ejecutar Tests de Integración con BD Real

```powershell
# Todos los tests de integración con Testcontainers
mvn test -Dtest=*IntegrationTest

# UsuarioIntegrationTest específico
mvn test -Dtest=UsuarioIntegrationTest

# Método específico de UsuarioIntegrationTest
mvn test -Dtest=UsuarioIntegrationTest#crearUsuario_ConBaseDeDatosReal_DeberiaCrearCorrectamente
```

### Requisitos para Testcontainers

```powershell
# Verificar que Docker está corriendo
docker ps

# Si Docker no está corriendo, iniciarlo
# Windows: Abrir Docker Desktop
```

---

## Ejemplos Prácticos

### Ejemplo 1: Probar un Endpoint Específico del Backend

```powershell
# Probar solo el endpoint GET /usuario/obtener/{id}
mvn test -Dtest=UsuarioControllerTest#getById_ReturnsOk

# Probar el endpoint POST /usuario/crear
mvn test -Dtest=UsuarioControllerTest#crear_Correcto

# Probar el endpoint PUT /usuario/editar
mvn test -Dtest=UsuarioControllerTest#update_ReturnsUpdated

# Probar el endpoint DELETE /usuario/eliminar/{id}
mvn test -Dtest=UsuarioControllerTest#delete_ReturnsOk
```

### Ejemplo 2: Probar Permisos de Seguridad

```powershell
# Verificar que ADMIN puede crear lote
mvn test -Dtest=LoteSecurityTest#adminPuedeCrearLote

# Verificar que GUEST NO puede crear lote
mvn test -Dtest=LoteSecurityTest#guestNoPuedeCrearLote

# Verificar que sin autenticación retorna 401
mvn test -Dtest=LoteSecurityTest#noAutenticadoDebeRetornar401AlCrear
```

### Ejemplo 3: Probar un Endpoint del Middleware

```powershell
cd middleware

# Probar endpoint /insertar
pytest tests/test_http_server.py::TestInsertEndpoint::test_insert_endpoint_exists

# Probar endpoint /exportar con formato inválido
pytest tests/test_http_server.py::TestExportEndpoint::test_export_with_invalid_format

# Probar endpoint /importar sin archivo
pytest tests/test_http_server.py::TestImportEndpoint::test_import_without_file

# Probar endpoint /analizar sin archivo
pytest tests/test_http_server.py::TestAnalyzeEndpoint::test_analyze_without_file
```

### Ejemplo 4: Debuggear un Test que Falla

```powershell
# Backend: Ejecutar test específico con salida detallada
mvn test -Dtest=UsuarioControllerTest#getById_ReturnsOk -X

# Ver reporte detallado
cat target/surefire-reports/TEST-UsuarioControllerTest.txt

# Middleware: Ejecutar con salida detallada
cd middleware
pytest tests/test_http_server.py::TestImportEndpoint::test_import_with_valid_csv -vv -s
```

### Ejemplo 5: Ejecutar Tests Relacionados

```powershell
# Todos los tests de Usuario (integración y seguridad)
mvn test -Dtest=*Usuario*

# Todos los tests de Lote
mvn test -Dtest=*Lote*

# Todos los tests de creación
mvn test -Dtest=*ControllerTest#crear_*

# Todos los tests de seguridad de endpoints POST
mvn test -Dtest=*SecurityTest#*Crear*
```

---

## Comandos con Cobertura

### Backend con Cobertura

```powershell
# Ejecutar un test específico con cobertura
mvn test -Dtest=UsuarioControllerTest jacoco:report

# Ver reporte
start target/site/jacoco/index.html
```

### Middleware con Cobertura

```powershell
cd middleware

# Ejecutar un test específico con cobertura
pytest tests/test_http_server.py::TestHealthCheck --cov=http_server --cov-report=html

# Ver reporte
start htmlcov/index.html
```

---

## Comandos Rápidos por Categoría

### Tests de Seguridad (Backend)

```powershell
# Todos los tests de seguridad
mvn test -Dtest=*SecurityTest

# LoteSecurityTest completo
mvn test -Dtest=LoteSecurityTest

# DOSNSecurityTest completo
mvn test -Dtest=DOSNSecurityTest

# ReciboSecurityTest completo
mvn test -Dtest=ReciboSecurityTest
```

### Tests de Integración (Backend)

```powershell
# Todos los tests de integración
mvn test -Dtest=*ControllerTest

# UsuarioControllerTest completo
mvn test -Dtest=UsuarioControllerTest

# CultivoControllerTest completo
mvn test -Dtest=CultivoControllerTest

# HongoControllerTest completo
mvn test -Dtest=HongoControllerTest
```

### Tests del Middleware

```powershell
cd middleware

# Todos los tests
pytest

# TestHealthCheck completo
pytest tests/test_http_server.py::TestHealthCheck

# TestImportEndpoint completo
pytest tests/test_http_server.py::TestImportEndpoint

# TestExportEndpoint completo
pytest tests/test_http_server.py::TestExportEndpoint
```

---

## Ver Resultados Detallados

### Backend

```powershell
# Ver reporte XML de un test específico
cat target/surefire-reports/TEST-UsuarioControllerTest.xml

# Ver log de ejecución
cat target/surefire-reports/UsuarioControllerTest.txt

# Listar todos los reportes
ls target/surefire-reports/
```

### Middleware

```powershell
cd middleware

# Ver salida detallada
pytest tests/test_http_server.py::TestHealthCheck -vv

# Ver con print statements
pytest tests/test_http_server.py::TestHealthCheck -s

# Ver salida completa
pytest tests/test_http_server.py::TestHealthCheck -vv -s
```

---

## Troubleshooting de Tests Individuales

### Test del Backend no se ejecuta

```powershell
# Verificar que el test existe
ls src/test/java/ti/proyectoinia/api/controllers/integration/UsuarioControllerTest.java

# Limpiar y recompilar
mvn clean compile test-compile

# Ejecutar con nombre completo
mvn test -Dtest=ti.proyectoinia.api.controllers.integration.UsuarioControllerTest
```

### Test del Middleware no se ejecuta

```powershell
cd middleware

# Verificar que el test existe
ls tests/test_http_server.py

# Verificar sintaxis
python -m py_compile tests/test_http_server.py

# Ejecutar con ruta completa
pytest tests/test_http_server.py::TestHealthCheck::test_app_exists -v
```

### Error: "mvn no se reconoce"

**Solución:**
```powershell
# Instalar Maven
.\PowerShell\SetupMaven.ps1

# O ver: SOLUCION-MAVEN-NO-ENCONTRADO.md
```

---

## Resumen de Comandos Más Usados

### Backend - Tests Individuales

```powershell
# Un test específico
mvn test -Dtest=UsuarioControllerTest#getById_ReturnsOk

# Una clase completa
mvn test -Dtest=UsuarioControllerTest

# Múltiples métodos
mvn test -Dtest=UsuarioControllerTest#getById_ReturnsOk+crear_Correcto

# Por patrón
mvn test -Dtest=*SecurityTest
```

### Middleware - Tests Individuales

```powershell
cd middleware

# Un test específico
pytest tests/test_http_server.py::TestHealthCheck::test_app_exists

# Una clase completa
pytest tests/test_http_server.py::TestHealthCheck

# Por patrón
pytest -k "test_import"
```

---

## Referencias

- [GUIA-EJECUCION-TESTS.md](./GUIA-EJECUCION-TESTS.md) - Guía completa de tests
- [SOLUCION-MAVEN-NO-ENCONTRADO.md](./SOLUCION-MAVEN-NO-ENCONTRADO.md) - Solución para error de Maven
- [TESTS-INTEGRADOS.md](./TESTS-INTEGRADOS.md) - Ejecución integrada
- [TESTCONTAINERS-README.md](./TESTCONTAINERS-README.md) - Tests con BD real
- [middleware/FASTAPI-TESTS-README.md](./middleware/FASTAPI-TESTS-README.md) - Tests de FastAPI

---

**Última actualización**: Enero 2024
**Versión**: 1.0


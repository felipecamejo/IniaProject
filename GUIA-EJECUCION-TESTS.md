# Guía de Ejecución de Tests - Proyecto INIA

Este documento explica cómo ejecutar y ver los resultados de las pruebas automatizadas del proyecto INIA.

---

## Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Estructura de Tests](#estructura-de-tests)
3. [Ejecutar Todos los Tests](#ejecutar-todos-los-tests)
4. [Ejecutar Tests Específicos](#ejecutar-tests-específicos)
5. [Ejecutar Tests por Categoría](#ejecutar-tests-por-categoría)
6. [Cobertura de Código con JaCoCo](#cobertura-de-código-con-jacoco)
7. [Tests de Integración con Testcontainers](#tests-de-integración-con-testcontainers)
8. [Ver Resultados](#ver-resultados)
9. [Interpretar Resultados](#interpretar-resultados)
10. [Troubleshooting](#troubleshooting)
11. [Tests Disponibles](#tests-disponibles)

---

## Requisitos Previos

### Herramientas Necesarias

- **Java 21**: Verificar con `java -version`
- **Maven 3.6+**: Verificar con `mvn -version`
- **IDE** (opcional): IntelliJ IDEA, Eclipse, VS Code

### Verificar Instalación

```powershell
# Verificar Java
java -version
# Debe mostrar: openjdk version "21" o similar

# Verificar Maven
mvn -version
# Debe mostrar: Apache Maven 3.x.x

# Si Maven no está instalado, ver:
# SOLUCION-MAVEN-NO-ENCONTRADO.md

# Verificar que estás en el directorio del proyecto
pwd
# Debe mostrar: D:\IniaProject
```

### Instalar Maven (Si no está instalado)

**Opción 1: Script Automático (Recomendado)**
```powershell
.\PowerShell\SetupMaven.ps1
```

**Opción 2: Con Chocolatey**
```powershell
choco install maven -y
```

**Opción 3: Manual**
Ver instrucciones completas en: [SOLUCION-MAVEN-NO-ENCONTRADO.md](./SOLUCION-MAVEN-NO-ENCONTRADO.md)

---

## Estructura de Tests

Los tests están organizados en dos categorías principales:

```
src/test/java/ti/proyectoinia/api/controllers/
├── security/          # Tests de seguridad y permisos
│   ├── LoteSecurityTest.java
│   ├── DOSNSecurityTest.java
│   ├── ReciboSecurityTest.java
│   └── ... (18 archivos)
│
└── integration/      # Tests de integración y funcionalidad
    ├── UsuarioControllerTest.java
    ├── CultivoControllerTest.java
    ├── HongoControllerTest.java
    └── ... (9 archivos)
```

### Tipos de Tests

1. **Tests de Seguridad** (`security/`):
   - Verifican permisos por rol (ADMIN, ANALISTA, OBSERVADOR, GUEST)
   - Validan autenticación y autorización
   - Prueban acceso denegado (401, 403)

2. **Tests de Integración** (`integration/`):
   - Prueban funcionalidad CRUD completa
   - Validan reglas de negocio
   - Verifican códigos de respuesta HTTP
   - Validan datos de entrada y salida

---

## Ejecutar Todos los Tests

### Método 1: Maven (Recomendado)

```powershell
# Ejecutar todos los tests
mvn test

# Ejecutar tests y compilar (si es necesario)
mvn clean test

# Ejecutar tests sin compilar
mvn surefire:test
```

### Método 2: Desde el IDE

#### IntelliJ IDEA
1. Click derecho en `src/test/java`
2. Seleccionar "Run 'All Tests'"
3. O usar el atajo: `Ctrl+Shift+F10`

#### VS Code
1. Abrir la paleta de comandos: `Ctrl+Shift+P`
2. Escribir: "Java: Run Tests"
3. Seleccionar "Run All Tests"

---

## Ejecutar Tests Específicos

### Ejecutar una Clase de Test Completa

```powershell
# Ejecutar solo UsuarioControllerTest
mvn test -Dtest=UsuarioControllerTest

# Ejecutar solo LoteSecurityTest
mvn test -Dtest=LoteSecurityTest

# Ejecutar con nombre completo
mvn test -Dtest=ti.proyectoinia.api.controllers.integration.UsuarioControllerTest
```

### Ejecutar un Método de Test Específico

```powershell
# Ejecutar un método específico
mvn test -Dtest=UsuarioControllerTest#getById_ReturnsOk

# Ejecutar múltiples métodos
mvn test -Dtest=UsuarioControllerTest#getById_ReturnsOk+crear_Correcto
```

### Ejecutar Tests por Patrón

```powershell
# Todos los tests que contengan "Security" en el nombre
mvn test -Dtest=*SecurityTest

# Todos los tests que contengan "Usuario" en el nombre
mvn test -Dtest=*Usuario*

# Todos los tests de integración
mvn test -Dtest=*ControllerTest
```

---

## Ejecutar Tests por Categoría

### Tests de Seguridad

```powershell
# Todos los tests de seguridad
mvn test -Dtest=*SecurityTest

# Ejecutar desde el directorio específico
cd src/test/java/ti/proyectoinia/api/controllers/security
mvn test
```

### Tests de Integración

```powershell
# Todos los tests de integración
mvn test -Dtest=*ControllerTest

# Ejecutar desde el directorio específico
cd src/test/java/ti/proyectoinia/api/controllers/integration
mvn test
```

### Ejecutar Tests por Paquete

```powershell
# Todos los tests del paquete security
mvn test -Dtest=ti.proyectoinia.api.controllers.security.**

# Todos los tests del paquete integration
mvn test -Dtest=ti.proyectoinia.api.controllers.integration.**
```

---

## Cobertura de Código con JaCoCo

### Ejecutar Tests con Cobertura

```powershell
# Ejecutar tests y generar reporte de cobertura
mvn clean test

# Solo generar reporte de cobertura (si los tests ya se ejecutaron)
mvn jacoco:report

# Verificar cobertura mínima (falla si no se cumple)
mvn jacoco:check
```

### Ver Reportes de Cobertura

Los reportes de JaCoCo se generan en:

```
target/site/jacoco/
├── index.html          # Reporte principal (abrir en navegador)
├── jacoco.xml          # Reporte en formato XML
└── jacoco.csv          # Reporte en formato CSV
```

**Abrir reporte HTML:**
```powershell
# Windows
start target/site/jacoco/index.html

# O abrir manualmente el archivo en tu navegador
```

### Interpretar Reportes de Cobertura

El reporte HTML muestra:

- **Cobertura por Paquete**: Porcentaje de líneas cubiertas por paquete
- **Cobertura por Clase**: Porcentaje de líneas cubiertas por clase
- **Líneas Cubiertas/No Cubiertas**: Código marcado en verde (cubierto) y rojo (no cubierto)
- **Métricas**:
  - **Instructions**: Instrucciones ejecutadas
  - **Branches**: Ramas de código cubiertas
  - **Lines**: Líneas de código cubiertas
  - **Methods**: Métodos ejecutados

### Configuración de Cobertura Mínima

El proyecto está configurado con un mínimo del **50%** de cobertura. Esto se puede ajustar en `pom.xml`:

```xml
<minimum>0.50</minimum>  <!-- 50% -->
```

Para cambiar el mínimo:
```xml
<minimum>0.70</minimum>  <!-- 70% -->
```

### Excluir Clases de Cobertura

Las siguientes clases están excluidas de la cobertura (configurado en `pom.xml`):

- DTOs (Data Transfer Objects)
- Entidades JPA
- Clases de configuración
- Clases de seguridad (filters, providers)
- Clase principal de aplicación

### Comandos Útiles de JaCoCo

```powershell
# Generar reporte completo
mvn clean test jacoco:report

# Verificar cobertura sin fallar el build
mvn jacoco:check -DfailOnMissingCoverage=false

# Generar reporte para un paquete específico
mvn test jacoco:report -Djacoco.includes=**/controllers/**

# Ver cobertura en consola
mvn test jacoco:report
cat target/site/jacoco/index.html
```

---

## Ver Resultados

### Resultados en Consola

Al ejecutar `mvn test`, verás:

```
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running ti.proyectoinia.api.controllers.integration.UsuarioControllerTest
[INFO] Tests run: 15, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 2.345 s
[INFO] Running ti.proyectoinia.api.controllers.security.LoteSecurityTest
[INFO] Tests run: 12, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.234 s
[INFO]
[INFO] Results:
[INFO]
[INFO] Tests run: 431, Failures: 0, Errors: 0, Skipped: 0
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

### Archivos de Reporte

Maven genera reportes en:

```
target/surefire-reports/
├── TEST-*.xml          # Reportes XML por clase
├── *.txt               # Logs de ejecución
└── jacoco/             # Reportes de cobertura (si está configurado)
```

### Ver Reportes XML

```powershell
# Ver el contenido de un reporte
cat target/surefire-reports/TEST-UsuarioControllerTest.xml

# Listar todos los reportes
ls target/surefire-reports/
```

### Resultados en el IDE

#### IntelliJ IDEA
- Los resultados aparecen en la ventana "Run"
- Clic en un test fallido para ver el stack trace
- Clic derecho → "Show Diff" para ver diferencias

#### VS Code
- Los resultados aparecen en la pestaña "Testing"
- Clic en un test para ver detalles
- Los errores se muestran en "Problems"

---

## Interpretar Resultados

### Estados de Tests

1. **PASSED (✓)**: El test pasó correctamente
   ```
   [INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
   ```

2. **FAILED (✗)**: El test falló (assertion incorrecta)
   ```
   [ERROR] Tests run: 1, Failures: 1, Errors: 0, Skipped: 0
   [ERROR] Failures:
   [ERROR]   UsuarioControllerTest.getById_ReturnsOk
   [ERROR]     java.lang.AssertionError: Expected status 200 but was 404
   ```

3. **ERROR (✗)**: Error durante la ejecución (excepción)
   ```
   [ERROR] Tests run: 1, Failures: 0, Errors: 1, Skipped: 0
   [ERROR] Errors:
   [ERROR]   UsuarioControllerTest.getById_ReturnsOk
   [ERROR]     java.lang.NullPointerException: ...
   ```

4. **SKIPPED (⊘)**: Test omitido (usando `@Disabled`)
   ```
   [INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 1
   ```

### Ejemplo de Salida Completa

```
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running ti.proyectoinia.api.controllers.integration.UsuarioControllerTest
[INFO] Tests run: 15, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 2.345 s - in ti.proyectoinia.api.controllers.integration.UsuarioControllerTest
[INFO] Running ti.proyectoinia.api.controllers.security.LoteSecurityTest
[INFO] Tests run: 12, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.234 s - in ti.proyectoinia.api.controllers.security.LoteSecurityTest
[INFO]
[INFO] Results:
[INFO]
[INFO] Tests run: 431, Failures: 0, Errors: 0, Skipped: 0
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  45.678 s
[INFO] Finished at: 2024-01-15T10:30:00-03:00
[INFO] ------------------------------------------------------------------------
```

**Interpretación:**
- **Tests run: 431**: Total de tests ejecutados
- **Failures: 0**: Ningún test falló
- **Errors: 0**: Ningún error de ejecución
- **Skipped: 0**: Ningún test omitido
- **BUILD SUCCESS**: Todos los tests pasaron

---

## Troubleshooting

### Problema: "No tests found"

**Causa**: Maven no encuentra los tests

**Solución**:
```powershell
# Limpiar y recompilar
mvn clean compile test-compile

# Verificar que los tests estén en la ubicación correcta
ls src/test/java/ti/proyectoinia/api/controllers/
```

### Problema: "Tests are skipped"

**Causa**: Puede haber un problema de configuración

**Solución**:
```powershell
# Forzar ejecución de tests
mvn test -DskipTests=false

# Verificar configuración de surefire
mvn help:effective-pom | Select-String "surefire"
```

### Problema: "ClassNotFoundException"

**Causa**: Dependencias faltantes o clase no compilada

**Solución**:
```powershell
# Recompilar todo
mvn clean install

# Verificar dependencias
mvn dependency:tree
```

### Problema: "Tests fallan con Mockito"

**Causa**: Versión incompatible o configuración incorrecta

**Solución**:
```powershell
# Verificar versión de Mockito en pom.xml
# Debe ser: 5.14.2

# Limpiar y reinstalar
mvn clean install -U
```

### Problema: "Tests muy lentos"

**Causa**: Ejecutando todos los tests o tests pesados

**Solución**:
```powershell
# Ejecutar solo tests específicos
mvn test -Dtest=UsuarioControllerTest

# Ejecutar en paralelo (si está configurado)
mvn test -T 4
```

### Problema: "No se pueden ejecutar desde el IDE"

**Causa**: Configuración del IDE incorrecta

**Solución**:
1. **IntelliJ IDEA**:
   - File → Project Structure → Modules
   - Verificar que `src/test/java` esté marcado como "Test Sources"
   - File → Invalidate Caches / Restart

2. **VS Code**:
   - Instalar extensión "Extension Pack for Java"
   - Verificar que Java está configurado: `Ctrl+Shift+P` → "Java: Configure Java Runtime"

---

## Tests Disponibles

### Tests de Seguridad (18 archivos)

| Archivo | Descripción | Tests Aprox. |
|---------|-------------|--------------|
| `LoteSecurityTest` | Permisos de lotes | 12 |
| `DOSNSecurityTest` | Permisos de análisis DOSN | 8 |
| `ReciboSecurityTest` | Permisos de recibos | 6 |
| `UsuarioSecurityService` | Seguridad de usuarios | 10 |
| `HongoSecurityTest` | Permisos de hongos | 8 |
| `MalezaSecurityTest` | Permisos de malezas | 8 |
| `CultivoSecurityTest` | Permisos de cultivos | 8 |
| `DepositoSecurityTest` | Permisos de depósitos | 8 |
| `GerminacionSecurityTest` | Permisos de germinación | 8 |
| `PurezaPNotatumSecurityTest` | Permisos de pureza | 8 |
| `PandMiddlewareSecurityTest` | Permisos de middleware | 6 |
| `MetodoSecurityTest` | Permisos de métodos | 6 |
| `LogSecurityTest` | Permisos de logs | 6 |
| `CertificadoSecurityTest` | Permisos de certificados | 6 |
| `AutocompletadoSecurityTest` | Permisos de autocompletado | 6 |
| `GramosPMSSecurityTest` | Permisos de gramos PMS | 6 |
| `HumedadReciboSecurityTest` | Permisos de humedad | 6 |
| `GerminacionTablasSecurityTest` | Permisos de tablas | 6 |

### Tests de Integración (9 archivos)

| Archivo | Descripción | Tests Aprox. |
|---------|-------------|--------------|
| `UsuarioControllerTest` | CRUD de usuarios | 15 |
| `CultivoControllerTest` | CRUD de cultivos | 12 |
| `HongoControllerTest` | CRUD de hongos | 12 |
| `MalezaControllerTest` | CRUD de malezas | 12 |
| `DepositoControllerTest` | CRUD de depósitos | 12 |
| `MetodoControllerTest` | CRUD de métodos | 12 |
| `CertificadoControllerTest` | CRUD de certificados | 12 |
| `AutoCompletadoControllerTest` | Autocompletado | 8 |
| `LogControllerTest` | Logs del sistema | 6 |

**Total aproximado: ~431 tests**

---

## Comandos Rápidos de Referencia

```powershell
# Ejecutar todos los tests
mvn test

# Ejecutar tests con cobertura
mvn clean test jacoco:report

# Ver reporte de cobertura
start target/site/jacoco/index.html

# Ejecutar tests de seguridad
mvn test -Dtest=*SecurityTest

# Ejecutar tests de integración
mvn test -Dtest=*ControllerTest

# Ejecutar un test específico
mvn test -Dtest=UsuarioControllerTest

# Ejecutar un método específico
mvn test -Dtest=UsuarioControllerTest#getById_ReturnsOk

# Limpiar y ejecutar tests
mvn clean test

# Ver reportes de tests
ls target/surefire-reports/

# Ver reporte de cobertura
ls target/site/jacoco/

# Ver un reporte específico
cat target/surefire-reports/TEST-UsuarioControllerTest.xml
```

---

## Ejemplos Prácticos

### Ejemplo 1: Verificar que un nuevo test funciona

```powershell
# 1. Ejecutar solo el test nuevo
mvn test -Dtest=UsuarioControllerTest#nuevoMetodoTest

# 2. Si pasa, ejecutar toda la clase
mvn test -Dtest=UsuarioControllerTest

# 3. Si todo pasa, ejecutar todos los tests
mvn test
```

### Ejemplo 2: Debuggear un test que falla

```powershell
# 1. Ejecutar el test que falla
mvn test -Dtest=UsuarioControllerTest#getById_ReturnsOk

# 2. Ver el reporte detallado
cat target/surefire-reports/TEST-UsuarioControllerTest.txt

# 3. Ver el XML con más detalles
cat target/surefire-reports/TEST-UsuarioControllerTest.xml
```

### Ejemplo 3: Ejecutar tests antes de commit

```powershell
# Ejecutar todos los tests rápidamente
mvn test

# Si hay fallos, ejecutar solo los relacionados
mvn test -Dtest=*Usuario*

# Verificar que no hay tests rotos
mvn test -Dtest=*SecurityTest
```

---

## Integración con CI/CD

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-java@v2
        with:
          java-version: '21'
      - run: mvn test
```

### Jenkins

```groovy
stage('Tests') {
    steps {
        sh 'mvn clean test'
        junit 'target/surefire-reports/*.xml'
    }
}
```

---

## Tests de Integración con Testcontainers

### ¿Qué es Testcontainers?

Testcontainers permite ejecutar tests de integración con bases de datos reales en contenedores Docker. Esto proporciona:

- **Base de datos real**: PostgreSQL en un contenedor Docker
- **Aislamiento**: Cada ejecución de tests tiene su propia base de datos
- **Automatización**: El contenedor se crea y destruye automáticamente
- **Realismo**: Pruebas más cercanas al entorno de producción

### Requisitos

- **Docker** debe estar instalado y corriendo
- Verificar con: `docker --version`

### Ejecutar Tests con Testcontainers

```powershell
# Ejecutar todos los tests (incluye tests con Testcontainers)
mvn clean test

# Ejecutar solo tests de integración con Testcontainers
mvn test -Dtest=*IntegrationTest

# Ejecutar un test específico
mvn test -Dtest=UsuarioIntegrationTest
```

### Estructura de Tests con Testcontainers

Los tests de integración extienden `AbstractTestcontainersIntegrationTest`:

```java
@AutoConfigureMockMvc
@Transactional
class UsuarioIntegrationTest extends AbstractTestcontainersIntegrationTest {
    // Tests aquí
}
```

### Características

- **Base de datos automática**: Se crea un contenedor PostgreSQL automáticamente
- **Limpieza automática**: `@Transactional` limpia la BD entre tests
- **Reutilización**: El contenedor se reutiliza para mejorar rendimiento
- **Configuración dinámica**: Spring Boot se configura automáticamente

### Ejemplo de Test

```java
@Test
@WithMockUser(authorities = "ADMIN")
void crearUsuario_ConBaseDeDatosReal_DeberiaCrearCorrectamente() {
    // Test que usa base de datos real
}
```

### Troubleshooting

**Error: "Docker daemon not running"**
```powershell
# Iniciar Docker Desktop o Docker daemon
# Verificar que Docker está corriendo
docker ps
```

**Error: "Could not find a valid Docker environment"**
- Verifica que Docker Desktop esté instalado
- Reinicia Docker Desktop
- Verifica permisos de Docker

**Tests muy lentos**
- Los tests con Testcontainers son más lentos que los tests con mocks
- El contenedor se reutiliza entre ejecuciones para mejorar rendimiento
- Considera ejecutar solo tests específicos durante desarrollo

---

## Tests del Middleware FastAPI

### Ejecutar Tests de FastAPI

```powershell
# Desde el directorio middleware
cd middleware
pytest

# Con verbosidad
pytest -v

# Ejecutar un archivo específico
pytest tests/test_http_server.py

# Con cobertura
pytest --cov=http_server --cov-report=html
```

### Estructura de Tests

Los tests del middleware están en `middleware/tests/`:

- `conftest.py`: Fixtures compartidas
- `test_http_server.py`: Tests de endpoints HTTP
- `pytest.ini`: Configuración de pytest

### Documentación Completa

Ver [FASTAPI-TESTS-README.md](./middleware/FASTAPI-TESTS-README.md) para la guía completa de tests de FastAPI.

---

## Próximos Pasos

1. ✅ **JaCoCo configurado** - Cobertura de código disponible
2. ✅ **Testcontainers configurado** - Tests con base de datos real disponibles
3. ✅ **Tests de FastAPI configurados** - Tests del middleware disponibles
4. **Agregar RestAssured** para tests de contratos HTTP
5. **Configurar tests de Frontend** (Angular/Jasmine)
6. **Aumentar cobertura mínima** a 70% o más
7. **Crear más tests de integración** usando Testcontainers

---

## Ejecución Integrada de Tests

### Script de Ejecución Integrada

Para ejecutar todos los tests del proyecto de forma integrada:

```powershell
# Ejecutar todos los tests
.\PowerShell\RunAllTests.ps1

# Con reportes de cobertura
.\PowerShell\RunAllTests.ps1 -Coverage

# Solo backend
.\PowerShell\RunAllTests.ps1 -Backend

# Solo middleware
.\PowerShell\RunAllTests.ps1 -Middleware
```

**Ver documentación completa:** [TESTS-INTEGRADOS.md](./TESTS-INTEGRADOS.md)

---

## Pruebas de Carga y Rendimiento con JMeter

### ¿Qué es JMeter?

Apache JMeter es una herramienta de código abierto para realizar pruebas de carga y rendimiento en aplicaciones web. En este proyecto, JMeter se utiliza para:

- **Pruebas de carga masiva**: Evaluar la capacidad del sistema para manejar inserciones masivas de datos
- **Pruebas de rendimiento**: Medir tiempos de respuesta bajo carga
- **Pruebas de estrés**: Identificar límites del sistema

### Requisitos

- **JMeter instalado**: Versión 5.6.3 o superior
- **Backend corriendo**: La API debe estar accesible en `http://localhost:8080/Inia`
- **Middleware Python corriendo**: Si se usan endpoints de importación masiva

### Verificar Instalación de JMeter

```powershell
# Verificar que JMeter está instalado
jmeter --version

# Si no está instalado, ejecutar:
.\PowerShell\setup_Backend.ps1
```

### Planes de Prueba Disponibles

#### 1. INIA_API_Test_Plan.jmx
Plan de prueba funcional básico para validar endpoints principales.

#### 2. INIA_API_Performance_Test.jmx
Plan de prueba de rendimiento con múltiples usuarios concurrentes.

#### 3. INIA_API_Bulk_Load_Test.jmx
Plan de prueba de carga masiva de datos que incluye:
- Inserción masiva usando `/api/v1/pandmiddleware/insertar-datos-masivos`
- Importación masiva de archivos CSV usando `/api/v1/pandmiddleware/http/importar`

#### 4. INIA_API_Use_Cases_Test.jmx (NUEVO - CASOS DE USO)
Plan de prueba de casos de uso de negocio que incluye:
- **Flujo completo de análisis**: Lote → Recibo → Análisis (PMS, DOSN)
- **Validaciones de reglas de negocio**: Validar lote activo al crear recibo
- **Consultas de negocio**: Listar análisis por recibo, verificar asociaciones
- **Extracción de IDs**: Extrae IDs de respuestas para usar en requests siguientes
- **Validaciones con assertions**: Verifica códigos de respuesta y mensajes de error

**Casos de Uso Probados:**
1. **CU01**: Crear Lote
2. **CU02**: Crear Recibo (validando que el lote existe y está activo)
3. **CU03**: Crear Análisis PMS asociado al recibo
4. **CU04**: Crear Análisis DOSN asociado al recibo
5. **CU05**: Listar PMS por Recibo (consulta de negocio)
6. **CU06**: Verificar Asociación Recibo-Lote (validación de negocio)
7. **CU07**: Validación de Regla de Negocio - Recibo con Lote Inactivo (debe fallar con 400)

### Ejecutar Pruebas con JMeter

#### Usando el Script PowerShell (Recomendado)

```powershell
# Prueba funcional básica
.\PowerShell\RunJMeterTests.ps1 -TestPlan INIA_API_Test_Plan -Mode nogui

# Prueba de rendimiento
.\PowerShell\RunJMeterTests.ps1 -TestPlan INIA_API_Performance_Test -Mode nogui -Threads 20 -RampUp 10 -Loops 10

# Prueba de carga masiva de datos
.\PowerShell\RunJMeterTests.ps1 -TestPlan INIA_API_Bulk_Load_Test -Mode nogui -Threads 5 -RampUp 10 -Loops 3 -GenerateReport

# Pruebas de casos de uso (RECOMENDADO - Prueba flujos de negocio)
.\PowerShell\RunJMeterUseCases.ps1

# Casos de uso con reporte HTML
.\PowerShell\RunJMeterUseCases.ps1 -GenerateReport

# Casos de uso solo en GUI (sin ejecutar)
.\PowerShell\RunJMeterUseCases.ps1 -Mode gui
```

#### Modo No-GUI (Línea de Comandos)

```powershell
cd jmeter

# Prueba de carga masiva
jmeter -n -t scripts/INIA_API_Bulk_Load_Test.jmx `
  -JTHREADS=5 `
  -JRAMP_UP=10 `
  -JLOOPS=3 `
  -l results/bulk-load-results.jtl `
  -e -o reports/bulk-load-report
```

#### Modo GUI (Interfaz Gráfica)

**Opción 1: Scripts de Acceso Rápido (Recomendado)**

Los planes de prueba se cargan automáticamente:

```powershell
# Plan de prueba funcional básico
.\PowerShell\OpenJMeterTestPlan.ps1

# Plan de prueba de rendimiento
.\PowerShell\OpenJMeterPerformance.ps1

# Plan de prueba de carga masiva
.\PowerShell\OpenJMeterBulkLoad.ps1

# Plan de prueba de casos de uso (NUEVO)
.\PowerShell\RunJMeterUseCases.ps1 -Mode gui

# Abrir todos los planes
.\PowerShell\OpenJMeter.ps1 -TestPlan All

# Listar planes disponibles
.\PowerShell\OpenJMeter.ps1 -List
```

**Opción 2: Usando RunJMeterTests.ps1**

```powershell
# Abrir JMeter GUI con plan específico
.\PowerShell\RunJMeterTests.ps1 -TestPlan INIA_API_Bulk_Load_Test -Mode gui
.\PowerShell\RunJMeterTests.ps1 -TestPlan INIA_API_Test_Plan -Mode gui
.\PowerShell\RunJMeterTests.ps1 -TestPlan INIA_API_Performance_Test -Mode gui
```

**Ventaja**: Los planes se cargan automáticamente, no necesitas abrirlos manualmente desde File → Open.

**Ver guía completa**: [GUIA-JMETER-GUI.md](./GUIA-JMETER-GUI.md)

### Parámetros de Configuración

- **THREADS**: Número de usuarios concurrentes (default: 5 para carga masiva)
- **RAMP_UP**: Tiempo en segundos para alcanzar el número total de threads (default: 10)
- **LOOPS**: Número de iteraciones por thread (default: 3)
- **BASE_URL**: URL base de la API (default: `http://localhost:8080/Inia`)

### Ver Resultados

#### Reporte HTML

```powershell
# Generar reporte HTML desde resultados existentes
jmeter -g jmeter/results/bulk-load-results.jtl -o jmeter/reports/bulk-load-report

# Abrir el reporte
Start-Process "jmeter/reports/bulk-load-report/index.html"
```

#### Métricas Importantes

- **Response Time**: Tiempo de respuesta promedio
- **Throughput**: Solicitudes por segundo
- **Error Rate**: Porcentaje de errores
- **Min/Max Response Time**: Tiempos mínimo y máximo
- **Percentiles (90th, 95th, 99th)**: Tiempos de respuesta en percentiles

### Archivos de Datos de Prueba

El plan de carga masiva utiliza:
- `jmeter/data/bulk_data.csv`: Archivo CSV con 1000 registros de prueba

### Notas Importantes

- **Tiempo de ejecución**: Las pruebas de carga masiva pueden tardar varios minutos
- **Timeouts**: Configurados para 5 minutos por request (operaciones masivas)
- **Recursos**: Asegúrate de tener suficiente memoria y espacio en disco
- **Base de datos**: Las pruebas insertan datos reales, considera usar una base de datos de prueba

### Integración con CI/CD

```yaml
# Ejemplo para GitHub Actions
- name: Run JMeter Bulk Load Tests
  run: |
    jmeter -n -t jmeter/scripts/INIA_API_Bulk_Load_Test.jmx \
      -JTHREADS=3 \
      -JRAMP_UP=5 \
      -JLOOPS=1 \
      -l jmeter/results/ci-bulk-load.jtl \
      -e -o jmeter/reports/ci-bulk-load-report
```

### Documentación Completa

Para más detalles, consulta:
- [JMeter README](./jmeter/README.md) - Guía completa de JMeter

---

## Solución de Problemas Comunes

### Error: "mvn no se reconoce"

Si aparece el error "mvn no se reconoce como nombre de un cmdlet":

1. **Instalar Maven:**
   ```powershell
   .\PowerShell\SetupMaven.ps1
   ```

2. **O ver guía completa:**
   - [SOLUCION-MAVEN-NO-ENCONTRADO.md](./SOLUCION-MAVEN-NO-ENCONTRADO.md)

3. **Verificar instalación:**
   ```powershell
   mvn -version
   ```

### Error: "Java versión incorrecta"

El proyecto requiere Java 21, pero tienes Java 1.8:

1. **Descargar Java 21:**
   - https://adoptium.net/
   - Instalar Java 21

2. **Configurar JAVA_HOME:**
   ```powershell
   [Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-21.x.x", "User")
   ```

3. **Verificar:**
   ```powershell
   java -version
   ```

---

## Referencias

- [COMANDOS-TESTS-INDIVIDUALES.md](./COMANDOS-TESTS-INDIVIDUALES.md) - Comandos para tests individuales
- [SOLUCION-MAVEN-NO-ENCONTRADO.md](./SOLUCION-MAVEN-NO-ENCONTRADO.md) - Solución para error de Maven
- [Testing.md](./Testing.md) - Guía de herramientas de testing
- [TESTS-INTEGRADOS.md](./TESTS-INTEGRADOS.md) - Ejecución integrada de tests
- [TestDocument.md](./TestDocument.md) - Documentación de pruebas manuales
- [TESTCONTAINERS-README.md](./TESTCONTAINERS-README.md) - Guía completa de Testcontainers
- [FASTAPI-TESTS-README.md](./middleware/FASTAPI-TESTS-README.md) - Guía de tests de FastAPI
- [Documentation.md](./Documentation.md) - Documentación general del proyecto
- [JMeter README](./jmeter/README.md) - Guía de pruebas de rendimiento

---

## Notas Importantes

- Los tests usan **MockMvc** para simular peticiones HTTP
- Los tests de seguridad usan **@WithMockUser** para simular usuarios
- Los servicios se mockean con **Mockito** (`@MockitoBean`)
- Los tests **NO requieren** que la aplicación esté corriendo
- Los tests **NO usan** base de datos real (usan mocks)

---

**Última actualización**: Enero 2024
**Versión del documento**: 1.0


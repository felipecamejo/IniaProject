# JMeter - Planes de Prueba para API INIA

Este directorio contiene los planes de prueba de JMeter para la API del Sistema INIA - Proyecto de Análisis de Semillas.

## Estructura de Directorios

```
jmeter/
├── scripts/          # Planes de prueba (.jmx)
├── data/            # Datos de prueba (CSV, JSON, etc.)
├── results/         # Resultados de ejecución (.jtl)
├── reports/         # Reportes HTML generados
└── README.md        # Este archivo
```

## Planes de Prueba Disponibles

### 1. INIA_API_Test_Plan.jmx
Plan de prueba funcional básico que incluye:
- Autenticación y obtención de token JWT
- Pruebas de endpoints principales:
  - Listar Usuarios
  - Listar Lotes
  - Listar Hongos
  - Listar Malezas
- Validaciones de respuesta (assertions)
- Visualización de resultados en tiempo real

**Uso:**
```bash
jmeter -n -t scripts/INIA_API_Test_Plan.jmx -l results/test-results.jtl -e -o reports/test-report
```

### 2. INIA_API_Performance_Test.jmx
Plan de prueba de rendimiento que incluye:
- Configuración de carga (threads, ramp-up, loops)
- Pruebas de rendimiento con múltiples usuarios concurrentes
- Reportes agregados y estadísticas
- Setup thread group para autenticación inicial

**Uso:**
```bash
jmeter -n -t scripts/INIA_API_Performance_Test.jmx -l results/performance-results.jtl -e -o reports/performance-report
```

### 3. INIA_API_Use_Cases_Test_Simple.jmx
Plan de prueba simplificado para pruebas controladas paso a paso que incluye:
- Login y autenticación
- Crear Lote (caso de uso básico)
- Listar Lotes (consulta simple)
- Estructura mínima y fácil de modificar
- Ideal para depuración y pruebas controladas

**Uso:**
```powershell
# Modo GUI (recomendado para pruebas controladas)
.\PowerShell\RunJMeterSimple.ps1 -Mode gui

# Modo No-GUI
.\PowerShell\RunJMeterSimple.ps1 -Mode nogui
```

### 4. INIA_API_Crear_Usuarios.jmx
Plan de prueba para crear usuarios de prueba que incluye:
- Login como administrador
- Crear 1 usuario Analista
- Crear 2 usuarios Observadores
- Listar usuarios creados
- Estructura simple y fácil de modificar

**Uso:**
```powershell
# Modo GUI (recomendado)
.\PowerShell\RunJMeterCrearUsuarios.ps1 -Mode gui

# Modo No-GUI
.\PowerShell\RunJMeterCrearUsuarios.ps1 -Mode nogui
```

**Nota:** Los emails de los usuarios incluyen un timestamp para evitar duplicados.

### 5. INIA_API_Use_Cases_Test.jmx
Plan de prueba completo para casos de uso de negocio que incluye:
- Flujos completos de negocio
- Validaciones de reglas de negocio
- Casos de prueba positivos y negativos
- Múltiples casos de uso interconectados

**Uso:**
```powershell
# Modo GUI
.\PowerShell\RunJMeterUseCases.ps1 -Mode gui

# Modo No-GUI
.\PowerShell\RunJMeterUseCases.ps1 -Mode nogui
```

### 6. INIA_API_Bulk_Load_Test.jmx
Plan de prueba de carga masiva de datos que incluye:
- Inserción masiva de datos usando el endpoint `/api/v1/pandmiddleware/insertar-datos-masivos`
- Importación masiva de archivos CSV usando `/api/v1/pandmiddleware/http/importar`
- Configuración de carga con múltiples threads y loops
- Timeouts extendidos para operaciones de larga duración (5 minutos)
- Validaciones de respuesta y assertions
- Setup thread group para autenticación inicial

**Características:**
- Prueba la capacidad del sistema para manejar inserciones masivas de datos
- Evalúa el rendimiento de importación de archivos grandes
- Configurable con variables: THREADS, RAMP_UP, LOOPS
- Utiliza archivo CSV de prueba: `data/bulk_data.csv` (1000 registros)

**Uso:**
```bash
jmeter -n -t scripts/INIA_API_Bulk_Load_Test.jmx \
  -JTHREADS=5 \
  -JRAMP_UP=10 \
  -JLOOPS=3 \
  -l results/bulk-load-results.jtl \
  -e -o reports/bulk-load-report
```

**Nota importante:** Este plan de prueba puede tardar varios minutos en ejecutarse debido a la naturaleza de las operaciones masivas. Los timeouts están configurados para 5 minutos por request.

### 4. INIA_API_Use_Cases_Test.jmx (NUEVO)
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

**Uso:**
```bash
# Ejecutar automáticamente (recomendado)
.\PowerShell\RunJMeterUseCases.ps1

# Ejecutar y generar reporte HTML
.\PowerShell\RunJMeterUseCases.ps1 -GenerateReport

# Abrir solo en GUI (sin ejecutar)
.\PowerShell\RunJMeterUseCases.ps1 -Mode gui

# Ejecutar en modo no-GUI
.\PowerShell\RunJMeterUseCases.ps1 -Mode nogui
```

**Características:**
- Prueba flujos completos de negocio, no solo CRUDs
- Valida reglas de negocio importantes
- Extrae y reutiliza IDs entre requests
- Incluye validaciones de errores esperados

## Configuración

### Variables del Plan de Prueba

Los planes de prueba utilizan las siguientes variables que puedes modificar:

- `BASE_URL`: URL base de la API (default: `http://localhost:8080/Inia`)
- `ADMIN_EMAIL`: Email del usuario administrador (default: `admin@inia.com`)
- `ADMIN_PASSWORD`: Contraseña del administrador (default: `admin123`)
- `THREADS`: Número de usuarios concurrentes para pruebas de rendimiento (default: `10`)
- `RAMP_UP`: Tiempo en segundos para alcanzar el número total de threads (default: `5`)
- `LOOPS`: Número de iteraciones por thread (default: `5`)

### Modificar Variables desde Línea de Comandos

Puedes sobrescribir las variables al ejecutar JMeter:

```bash
jmeter -n -t scripts/INIA_API_Test_Plan.jmx \
  -JBASE_URL=http://localhost:8080/Inia \
  -JADMIN_EMAIL=admin@inia.com \
  -JADMIN_PASSWORD=admin123 \
  -l results/test-results.jtl
```

## Requisitos Previos

1. **JMeter instalado**: Versión 5.6.3 o superior
   - Verificar instalación: `jmeter --version`
   - Si no está instalado, ejecutar: `PowerShell\setup_Backend.ps1`

2. **API en ejecución**: El backend debe estar corriendo en `http://localhost:8080/Inia`

3. **Credenciales válidas**: Usuario administrador con permisos adecuados

## Ejecución de Pruebas

### Usando el Script de PowerShell (Recomendado)

El proyecto incluye un script de PowerShell para facilitar la ejecución de pruebas:

```powershell
# Ejecutar prueba funcional básica
.\PowerShell\RunJMeterTests.ps1 -TestPlan INIA_API_Test_Plan -Mode nogui

# Ejecutar prueba de rendimiento
.\PowerShell\RunJMeterTests.ps1 -TestPlan INIA_API_Performance_Test -Mode nogui -Threads 20 -RampUp 10 -Loops 10

# Ejecutar prueba de carga masiva de datos
.\PowerShell\RunJMeterTests.ps1 -TestPlan INIA_API_Bulk_Load_Test -Mode nogui -Threads 5 -RampUp 10 -Loops 3 -GenerateReport

# Ejecutar pruebas de casos de uso (RECOMENDADO)
.\PowerShell\RunJMeterUseCases.ps1

# Ejecutar casos de uso y generar reporte HTML
.\PowerShell\RunJMeterUseCases.ps1 -GenerateReport

# Abrir casos de uso en GUI (sin ejecutar)
.\PowerShell\RunJMeterUseCases.ps1 -Mode gui

# Ejecutar y generar reporte HTML automáticamente
.\PowerShell\RunJMeterTests.ps1 -TestPlan INIA_API_Test_Plan -Mode nogui -GenerateReport

# Abrir en modo GUI
.\PowerShell\RunJMeterTests.ps1 -TestPlan INIA_API_Test_Plan -Mode gui

# Personalizar URL base
.\PowerShell\RunJMeterTests.ps1 -TestPlan INIA_API_Test_Plan -BaseUrl http://localhost:8080/Inia
```

**Parámetros disponibles para RunJMeterTests.ps1:**
- `-TestPlan`: Nombre del plan de prueba (`INIA_API_Test_Plan`, `INIA_API_Performance_Test`, o `INIA_API_Bulk_Load_Test`)
- `-Mode`: Modo de ejecución (`gui` o `nogui`)
- `-GenerateReport`: Genera reporte HTML automáticamente
- `-BaseUrl`: URL base de la API (default: `http://localhost:8080/Inia`)
- `-Threads`: Número de usuarios concurrentes (solo para performance test y bulk load test)
- `-RampUp`: Tiempo de ramp-up en segundos (solo para performance test y bulk load test)
- `-Loops`: Número de iteraciones (solo para performance test y bulk load test)

**Parámetros disponibles para RunJMeterUseCases.ps1:**
- `-Mode`: Modo de ejecución (`gui`, `nogui`, o `auto` - default: `auto`)
  - `auto`: Ejecuta en no-GUI y luego abre GUI con el plan cargado
  - `gui`: Solo abre GUI con el plan cargado (sin ejecutar)
  - `nogui`: Solo ejecuta en modo no-GUI (sin abrir GUI)
- `-GenerateReport`: Genera reporte HTML automáticamente (default: `true`)
- `-BaseUrl`: URL base de la API (default: `http://localhost:8080/Inia`)

### Modo GUI (Interfaz Gráfica)

#### Opción 1: Script PowerShell (Recomendado - Carga automática)

Los scripts de PowerShell abren JMeter con el plan de prueba ya cargado:

```powershell
# Abrir plan de prueba funcional básico
.\PowerShell\OpenJMeterTestPlan.ps1

# Abrir plan de prueba de rendimiento
.\PowerShell\OpenJMeterPerformance.ps1

# Abrir plan de prueba de carga masiva
.\PowerShell\OpenJMeterBulkLoad.ps1

# Abrir plan específico
.\PowerShell\OpenJMeter.ps1 -TestPlan INIA_API_Test_Plan

# Abrir todos los planes
.\PowerShell\OpenJMeter.ps1 -TestPlan All

# Listar planes disponibles
.\PowerShell\OpenJMeter.ps1 -List
```

**Ventaja**: El plan de prueba se carga automáticamente, no necesitas abrirlo manualmente.

#### Opción 2: Usando RunJMeterTests.ps1

```powershell
# Abrir JMeter GUI con plan específico
.\PowerShell\RunJMeterTests.ps1 -TestPlan INIA_API_Test_Plan -Mode gui
.\PowerShell\RunJMeterTests.ps1 -TestPlan INIA_API_Performance_Test -Mode gui
.\PowerShell\RunJMeterTests.ps1 -TestPlan INIA_API_Bulk_Load_Test -Mode gui
```

#### Opción 3: Manual (si prefieres abrir JMeter directamente)

1. Abrir JMeter GUI:
   ```bash
   jmeter
   ```

2. Abrir el plan de prueba:
   - File → Open → Seleccionar `jmeter/scripts/INIA_API_Test_Plan.jmx`

3. Configurar variables si es necesario:
   - Click derecho en "Test Plan" → Add → Config Element → User Defined Variables

4. Ejecutar:
   - Click en el botón "Run" (▶️) o presionar `Ctrl+R`

5. Ver resultados:
   - Los resultados aparecen en "View Results Tree" y "Summary Report"

### Modo No-GUI (Línea de Comandos)

#### Prueba Funcional Básica
```bash
cd jmeter
jmeter -n -t scripts/INIA_API_Test_Plan.jmx -l results/test-$(Get-Date -Format "yyyyMMdd-HHmmss").jtl
```

#### Prueba de Rendimiento
```bash
cd jmeter
jmeter -n -t scripts/INIA_API_Performance_Test.jmx \
  -JTHREADS=20 \
  -JRAMP_UP=10 \
  -JLOOPS=10 \
  -l results/performance-$(Get-Date -Format "yyyyMMdd-HHmmss").jtl
```

#### Prueba de Carga Masiva
```bash
cd jmeter
jmeter -n -t scripts/INIA_API_Bulk_Load_Test.jmx \
  -JTHREADS=5 \
  -JRAMP_UP=10 \
  -JLOOPS=3 \
  -l results/bulk-load-$(Get-Date -Format "yyyyMMdd-HHmmss").jtl \
  -e -o reports/bulk-load-report-$(Get-Date -Format "yyyyMMdd-HHmmss")
```

**Nota:** La prueba de carga masiva puede tardar varios minutos. Asegúrate de que:
- El backend esté corriendo y accesible
- El middleware Python esté corriendo (si se usa el endpoint de importación)
- Tengas suficiente espacio en disco para los resultados
- El archivo `data/bulk_data.csv` exista y contenga datos válidos

#### Generar Reporte HTML
```bash
cd jmeter
jmeter -n -t scripts/INIA_API_Test_Plan.jmx \
  -l results/test-results.jtl \
  -e -o reports/test-report-$(Get-Date -Format "yyyyMMdd-HHmmss")
```

## Análisis de Resultados

### Archivos de Resultados (.jtl)

Los archivos `.jtl` contienen los resultados en formato CSV. Puedes:
- Abrirlos en Excel o cualquier editor de texto
- Importarlos de nuevo en JMeter para análisis
- Procesarlos con scripts personalizados

### Reportes HTML

Los reportes HTML generados incluyen:
- Resumen de estadísticas
- Gráficos de respuesta
- Distribución de tiempos
- Errores y fallos
- Throughput y latencia

### Métricas Importantes

- **Response Time**: Tiempo de respuesta promedio
- **Throughput**: Solicitudes por segundo
- **Error Rate**: Porcentaje de errores
- **Min/Max Response Time**: Tiempos mínimo y máximo
- **Percentiles (90th, 95th, 99th)**: Tiempos de respuesta en percentiles

## Personalización

### Agregar Nuevos Endpoints

1. Abrir el plan de prueba en JMeter GUI
2. Click derecho en "Thread Group" → Add → Sampler → HTTP Request
3. Configurar:
   - Name: Nombre descriptivo
   - Method: GET, POST, PUT, DELETE
   - Path: Ruta del endpoint (ej: `/api/v1/usuario/listar`)
   - Body (si es POST/PUT): JSON del request
4. Agregar assertions para validar respuestas
5. Guardar el plan de prueba

### Agregar Datos de Prueba desde CSV

1. Crear archivo CSV en `data/` con los datos
2. En JMeter: Add → Config Element → CSV Data Set Config
3. Configurar:
   - Filename: Ruta al archivo CSV
   - Variable Names: Nombres de columnas separados por coma
   - Delimiter: `,`
4. Usar variables en requests: `${variable_name}`

### Configurar Timeouts

Modificar en "HTTP Request Defaults":
- Connect Timeout: Tiempo máximo para establecer conexión
- Response Timeout: Tiempo máximo para recibir respuesta

## Troubleshooting

### Error: "Connection refused"
- Verificar que la API esté corriendo
- Verificar que el puerto sea correcto (8080)
- Verificar que el context-path sea `/Inia`

### Error: "401 Unauthorized"
- Verificar que las credenciales sean correctas
- Verificar que el token JWT se esté extrayendo correctamente
- Verificar que el header Authorization esté configurado

### Error: "JMeter no encontrado"
- Verificar que JMeter esté instalado: `jmeter --version`
- Verificar que esté en el PATH
- Si no está, ejecutar: `PowerShell\setup_Backend.ps1`

### Resultados vacíos o sin datos
- Verificar que los assertions no estén fallando silenciosamente
- Revisar el log de JMeter
- Verificar que los endpoints estén respondiendo correctamente

## Integración con CI/CD

### Ejemplo para GitHub Actions

```yaml
- name: Run JMeter Tests
  run: |
    jmeter -n -t jmeter/scripts/INIA_API_Test_Plan.jmx \
      -l jmeter/results/ci-results.jtl \
      -e -o jmeter/reports/ci-report
```

### Ejemplo para Jenkins

```groovy
stage('Performance Tests') {
    steps {
        sh '''
            jmeter -n -t jmeter/scripts/INIA_API_Performance_Test.jmx \
              -l jmeter/results/jenkins-results.jtl \
              -e -o jmeter/reports/jenkins-report
        '''
    }
    post {
        always {
            publishHTML([
                reportDir: 'jmeter/reports/jenkins-report',
                reportFiles: 'index.html',
                reportName: 'JMeter Report'
            ])
        }
    }
}
```

## Referencias

- [Documentación oficial de JMeter](https://jmeter.apache.org/usermanual/)
- [TestDocument.md](../TestDocument.md) - Documentación de endpoints de la API
- [Testing.md](../Testing.md) - Guía de pruebas del proyecto

## Notas

- Los planes de prueba están configurados para usar autenticación JWT
- Los tokens se extraen automáticamente del response del login
- Los headers de autorización se agregan automáticamente a las requests subsiguientes
- Los resultados se guardan con timestamp para evitar sobrescritura


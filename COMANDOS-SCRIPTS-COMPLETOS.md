# Comandos de Scripts - Proyecto INIA

Este documento contiene todos los comandos disponibles en los scripts del proyecto INIA, organizados por categoría.

---

## Tabla de Contenidos

1. [Scripts de Setup y Configuración](#1-scripts-de-setup-y-configuración)
2. [Scripts de Ejecución de Servicios](#2-scripts-de-ejecución-de-servicios)
3. [Scripts de Testing](#3-scripts-de-testing)
4. [Scripts de Docker](#4-scripts-de-docker)
5. [Scripts de JMeter](#5-scripts-de-jmeter)
6. [Comandos Maven Directos](#6-comandos-maven-directos)
7. [Comandos Python/pytest Directos](#7-comandos-pythonpytest-directos)
8. [Comandos Angular/npm Directos](#8-comandos-angularnpm-directos)
9. [Comandos Docker Directos](#9-comandos-docker-directos)

---

## 1. Scripts de Setup y Configuración

### 1.1 Setup del Middleware (Python/FastAPI)

**Script:** `PowerShell\SetupMiddleware.ps1`

```powershell
# Configurar entorno del middleware (crea venv, instala dependencias)
.\PowerShell\SetupMiddleware.ps1

# Con ruta específica del proyecto
.\PowerShell\SetupMiddleware.ps1 D:\IniaProject
```

**Qué hace:**
- Crea entorno virtual Python (`.venv`)
- Instala todas las dependencias de `requirements.txt`
- Verifica que todas las importaciones funcionen correctamente
- Prueba la conexión a la base de datos

**Dependencias instaladas:**
- SQLAlchemy, psycopg2-binary
- FastAPI, uvicorn, python-multipart
- openpyxl (Excel)
- pydantic
- pytest, pytest-asyncio, httpx (testing)

---

### 1.2 Setup del Backend (Java/Maven)

**Script:** `PowerShell\setup_Backend.ps1`

```powershell
# Instalar y configurar JMeter (incluye Java si es necesario)
.\PowerShell\setup_Backend.ps1
```

**Qué hace:**
- Verifica instalación de Java
- Instala Java (OpenJDK) si no está presente
- Descarga e instala Apache JMeter 5.6.3
- Configura variables de entorno (JMETER_HOME, PATH)
- Crea estructura de directorios para tests
- Genera plan de prueba de ejemplo

**Ubicación de JMeter:** `C:\JMeter\JMeter`

---

## 2. Scripts de Ejecución de Servicios

### 2.1 Middleware (Python/FastAPI)

**Script:** `PowerShell\run_middleware.ps1`

```powershell
# Iniciar o reiniciar el servidor del middleware
.\PowerShell\run_middleware.ps1 server

# Detener el servidor del middleware
.\PowerShell\run_middleware.ps1 stop

# Mostrar ayuda
.\PowerShell\run_middleware.ps1 help
```

**Características:**
- Verifica si el entorno está configurado (ejecuta setup automáticamente si es necesario)
- Detecta si el puerto 9099 está en uso
- Detiene procesos existentes antes de iniciar
- Activa el entorno virtual automáticamente

**Endpoints disponibles:**
- `POST /insertar` - Inserción masiva de datos
- `POST /exportar` - Exportar tablas a Excel/CSV
- `POST /importar` - Importar archivos Excel/CSV
- `GET /docs` - Documentación interactiva de la API

**URLs:**
- API: `http://localhost:9099`
- Documentación: `http://localhost:9099/docs`

---

### 2.2 Frontend (Angular)

**Script:** `PowerShell\Run_Fronted.ps1`

```powershell
# Iniciar servidor de desarrollo en puerto 4200
.\PowerShell\Run_Fronted.ps1

# Iniciar en puerto específico
.\PowerShell\Run_Fronted.ps1 -Port 4201

# Iniciar y abrir navegador automáticamente
.\PowerShell\Run_Fronted.ps1 -Open

# Combinar ambas opciones
.\PowerShell\Run_Fronted.ps1 -Port 4201 -Open
```

**Características:**
- Verifica Node.js (requiere 18+)
- Instala dependencias automáticamente (`npm ci` o `npm install`)
- Detecta puerto libre si el especificado está en uso
- Maneja errores de instalación con recuperación automática

**URL:** `http://localhost:4200` (o el puerto especificado)

---

## 3. Scripts de Testing

### 3.1 Ejecutar Todos los Tests

**Script:** `PowerShell\RunAllTests.ps1`

```powershell
# Ejecutar todos los tests (Backend, Middleware, Frontend)
.\PowerShell\RunAllTests.ps1

# Ejecutar solo tests del backend
.\PowerShell\RunAllTests.ps1 -Backend

# Ejecutar solo tests del middleware
.\PowerShell\RunAllTests.ps1 -Middleware

# Ejecutar solo tests del frontend
.\PowerShell\RunAllTests.ps1 -Frontend

# Ejecutar con reportes de cobertura
.\PowerShell\RunAllTests.ps1 -Coverage

# Ejecutar con salida detallada
.\PowerShell\RunAllTests.ps1 -Verbose

# Omitir tests del frontend
.\PowerShell\RunAllTests.ps1 -SkipFrontend

# Combinar opciones
.\PowerShell\RunAllTests.ps1 -Backend -Coverage -Verbose

# Mostrar ayuda
.\PowerShell\RunAllTests.ps1 -Help
```

**Qué hace:**
- Ejecuta tests del Backend (Maven)
- Ejecuta tests del Middleware (pytest)
- Ejecuta tests del Frontend (Angular/Jasmine)
- Genera resumen con tiempos y resultados
- Opcionalmente genera reportes de cobertura

---

### 3.2 Tests del Middleware

**Script:** `PowerShell\TestMiddleware.ps1`

```powershell
# Ejecutar tests del middleware (inicia servidor, ejecuta tests, detiene servidor)
.\PowerShell\TestMiddleware.ps1

# Ejecutar tests y mantener el servidor corriendo
.\PowerShell\TestMiddleware.ps1 -KeepServerRunning
```

**Qué hace:**
- Verifica si el servidor está corriendo (si no, lo inicia)
- Espera a que el servidor esté listo
- Ejecuta los tests de pytest
- Detiene el servidor al finalizar (a menos que se use `-KeepServerRunning`)

---

### 3.3 Tests con Testcontainers

**Script:** `PowerShell\RunTestcontainersTest.ps1`

```powershell
# Ejecutar test de conexión con Testcontainers
.\PowerShell\RunTestcontainersTest.ps1
```

**Qué hace:**
- Busca Maven en ubicaciones comunes
- Ejecuta `TestcontainersConnectionTest`
- Verifica que Docker esté corriendo

---

### 3.4 Verificar Testcontainers

**Script:** `PowerShell\VerifyTestcontainers.ps1`

```powershell
# Verificar que Testcontainers está listo
.\PowerShell\VerifyTestcontainers.ps1

# Verificar y ejecutar test
.\PowerShell\VerifyTestcontainers.ps1 -RunTest
```

**Qué verifica:**
- Docker Desktop está corriendo
- Imagen de PostgreSQL está disponible
- Maven está instalado
- Estructura del proyecto es correcta
- Dependencias de Maven están instaladas

---

### 3.5 Generar Resultados de Tests

**Script:** `PowerShell\GenerarResultadosTests.ps1`

```powershell
# Generar archivo de resultados con fecha actual
.\PowerShell\GenerarResultadosTests.ps1

# Con parámetros personalizados
.\PowerShell\GenerarResultadosTests.ps1 -Nombre "Juan Pérez" -Ambiente "Producción" -Version "1.2.0"
```

**Qué hace:**
- Genera archivo `RESULTADOS-TESTS-YYYY-MM-DD.md`
- Usa plantilla `PLANTILLA-RESULTADOS-TESTS.md`
- Reemplaza placeholders con valores actuales
- Pregunta si desea abrir el archivo generado

---

## 4. Scripts de Docker

### 4.1 Iniciar Docker

**Script:** `scriptDockers\iniciar-docker.ps1`

```powershell
# Iniciar todos los servicios Docker
.\scriptDockers\iniciar-docker.ps1
```

**Qué hace:**
- Verifica Docker Desktop
- Verifica y libera puerto 5432 (detiene PostgreSQL local si es necesario)
- Inicia todos los servicios con `docker compose up -d`
- Espera a que backend y frontend estén listos
- Abre navegador automáticamente (Frontend y Swagger)

**URLs disponibles:**
- Frontend: `http://localhost` (o `http://localhost:4200` en desarrollo)
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- Backend API: `http://localhost:8080/Inia`
- Middleware: `http://localhost:9099`

**Credenciales:**
- Email: `admin@inia.com`
- Password: `password123`

---

### 4.2 Detener Docker

**Script:** `scriptDockers\detener-docker.ps1`

```powershell
# Detener todos los servicios Docker
.\scriptDockers\detener-docker.ps1
```

**Qué hace:**
- Muestra servicios en ejecución
- Pide confirmación
- Detiene servicios con `docker compose down`
- Conserva los datos de la base de datos

---

### 4.3 Recrear Docker

**Script:** `scriptDockers\recrear-docker.ps1`

```powershell
# Recrear contenedores Docker
.\scriptDockers\recrear-docker.ps1
```

**Opciones disponibles:**
1. **Recrear contenedores (mantener datos)**
   - Detiene servicios
   - Reconstruye imágenes sin cache
   - Levanta servicios
   - Mantiene volúmenes (datos)

2. **Recrear todo (ELIMINAR DATOS)**
   - Detiene y elimina contenedores con volúmenes
   - Limpia sistema Docker
   - Reconstruye imágenes
   - Recrea base de datos desde `init.sql`

3. **Cancelar**

---

### 4.4 Abrir Docker (Inicio Rápido)

**Script:** `scriptDockers\abrir-docker.ps1`

```powershell
# Inicio rápido: iniciar servicios y abrir navegador
.\scriptDockers\abrir-docker.ps1
```

**Qué hace:**
- Verifica Docker Desktop
- Inicia servicios si no están corriendo
- Espera a que backend esté listo (hasta 3 minutos)
- Abre Frontend y Swagger automáticamente

---

### 4.5 Limpiar Docker Completamente

**Script:** `scriptDockers\clear-docker.ps1`

```powershell
# Limpiar TODO (contenedores, imágenes, volúmenes, redes, cache)
.\scriptDockers\clear-docker.ps1
```

**ADVERTENCIA CRÍTICA:**
- Elimina TODOS los contenedores de INIA
- Elimina TODAS las imágenes Docker del proyecto
- Elimina TODOS los volúmenes (BASE DE DATOS COMPLETA)
- Elimina TODAS las redes personalizadas
- Elimina cache de construcción

**Requiere doble confirmación:**
1. Escribir `LIMPIAR`
2. Escribir `SI ELIMINAR TODO`

**Útil para:**
- Empezar completamente desde cero
- Resolver problemas graves con Docker
- Liberar espacio en disco

---

## 5. Scripts de JMeter

### 5.1 Ejecutar Pruebas de Casos de Uso

**Script:** `PowerShell\RunJMeterUseCases.ps1`

```powershell
# Modo GUI - Solo abrir JMeter con el plan de prueba
.\PowerShell\RunJMeterUseCases.ps1 -Mode gui

# Modo No-GUI - Ejecutar automáticamente
.\PowerShell\RunJMeterUseCases.ps1 -Mode nogui

# Modo AUTO - Abrir GUI, cargar plan y ejecutar automáticamente
.\PowerShell\RunJMeterUseCases.ps1 -Mode auto

# Generar reporte HTML después de ejecutar
.\PowerShell\RunJMeterUseCases.ps1 -Mode nogui -GenerateReport
```

**Plan de prueba:** `jmeter\scripts\INIA_API_Use_Cases_Test.jmx`

**Resultados:** `jmeter\results\use-cases-YYYY-MM-DD-HH-MM-SS.jtl`

---

### 5.2 Ejecutar Pruebas Simples

**Script:** `PowerShell\RunJMeterSimple.ps1`

```powershell
# Abrir JMeter GUI con plan simple
.\PowerShell\RunJMeterSimple.ps1 -Mode gui

# Modo AUTO - Abrir y ejecutar automáticamente
.\PowerShell\RunJMeterSimple.ps1 -Mode auto
```

**Plan de prueba:** `jmeter\scripts\INIA_API_Simple_Test.jmx`

---

### 5.3 Ejecutar Pruebas de Creación de Usuarios

**Script:** `PowerShell\RunJMeterCrearUsuarios.ps1`

```powershell
# Modo GUI
.\PowerShell\RunJMeterCrearUsuarios.ps1 -Mode gui

# Modo No-GUI
.\PowerShell\RunJMeterCrearUsuarios.ps1 -Mode nogui

# Modo AUTO
.\PowerShell\RunJMeterCrearUsuarios.ps1 -Mode auto

# Con generación de reporte
.\PowerShell\RunJMeterCrearUsuarios.ps1 -Mode nogui -GenerateReport
```

**Plan de prueba:** `jmeter\scripts\INIA_API_Crear_Usuarios_Test.jmx`

**Resultados:** `jmeter\results\crear-usuarios-YYYY-MM-DD-HH-MM-SS.jtl`

---

## 6. Comandos Maven Directos

### 6.1 Compilación

```powershell
# Compilar proyecto
mvn clean compile

# Compilar sin ejecutar tests
mvn clean package -DskipTests

# Compilar e instalar en repositorio local
mvn clean install
```

---

### 6.2 Ejecutar Tests

```powershell
# Ejecutar todos los tests
mvn test

# Ejecutar tests y limpiar antes
mvn clean test

# Ejecutar tests sin compilar
mvn surefire:test

# Ejecutar una clase de test específica
mvn test -Dtest=UsuarioControllerTest

# Ejecutar un método específico
mvn test -Dtest=UsuarioControllerTest#getById_ReturnsOk

# Ejecutar múltiples métodos
mvn test -Dtest=UsuarioControllerTest#getById_ReturnsOk+crear_Correcto

# Ejecutar tests por patrón
mvn test -Dtest=*SecurityTest
mvn test -Dtest=*ControllerTest
mvn test -Dtest=*Usuario*

# Ejecutar tests por paquete
mvn test -Dtest=ti.proyectoinia.api.controllers.security.**
mvn test -Dtest=ti.proyectoinia.api.controllers.integration.**
```

---

### 6.3 Cobertura de Código (JaCoCo)

```powershell
# Ejecutar tests y generar reporte de cobertura
mvn clean test jacoco:report

# Solo generar reporte (si los tests ya se ejecutaron)
mvn jacoco:report

# Verificar cobertura mínima (falla si no se cumple)
mvn jacoco:check

# Verificar cobertura sin fallar el build
mvn jacoco:check -DfailOnMissingCoverage=false

# Generar reporte para un paquete específico
mvn test jacoco:report -Djacoco.includes=**/controllers/**

# Ver reporte HTML
start target/site/jacoco/index.html
```

**Ubicación de reportes:**
- HTML: `target/site/jacoco/index.html`
- XML: `target/site/jacoco/jacoco.xml`
- CSV: `target/site/jacoco/jacoco.csv`

---

### 6.4 Otros Comandos Maven

```powershell
# Ver versión de Maven
mvn -version

# Ver información del proyecto
mvn help:effective-pom

# Ver dependencias del proyecto
mvn dependency:tree

# Actualizar dependencias
mvn versions:display-dependency-updates

# Limpiar proyecto
mvn clean

# Compilar y empaquetar
mvn clean package

# Instalar en repositorio local
mvn clean install

# Ejecutar aplicación Spring Boot
mvn spring-boot:run
```

---

## 7. Comandos Python/pytest Directos

### 7.1 Activar Entorno Virtual

```powershell
# Navegar al directorio middleware
cd middleware

# Activar entorno virtual
.\.venv\Scripts\Activate.ps1

# Desactivar entorno virtual
deactivate
```

---

### 7.2 Ejecutar Tests con pytest

```powershell
# Ejecutar todos los tests
pytest

# Ejecutar con salida detallada
pytest -v

# Ejecutar con salida muy detallada
pytest -vv

# Ejecutar un archivo de test específico
pytest tests/test_http_server.py

# Ejecutar un test específico
pytest tests/test_http_server.py::test_export_with_invalid_format

# Ejecutar tests que coincidan con un patrón
pytest -k "export"

# Ejecutar tests y mostrar prints
pytest -s

# Ejecutar tests y detenerse en el primer fallo
pytest -x

# Ejecutar tests con cobertura
pytest --cov=http_server --cov-report=html --cov-report=term

# Ver reporte de cobertura HTML
start htmlcov/index.html
```

---

### 7.3 Ejecutar Servidor del Middleware

```powershell
# Activar entorno virtual primero
cd middleware
.\.venv\Scripts\Activate.ps1

# Ejecutar servidor
python http_server.py

# O con uvicorn directamente
uvicorn http_server:app --host 0.0.0.0 --port 9099 --reload
```

---

### 7.4 Scripts Python del Middleware

```powershell
# Inserción masiva de datos
python MassiveInsertFiles.py

# Exportar tablas a Excel
python ExportExcel.py --tables lote,recibo --format xlsx

# Exportar tablas a CSV
python ExportExcel.py --tables lote,recibo --format csv

# Importar archivo Excel
python ImportExcel.py --file datos.xlsx --table lote

# Importar archivo CSV
python ImportExcel.py --file datos.csv --table lote
```

---

### 7.5 Instalar Dependencias Python

```powershell
# Instalar desde requirements.txt
pip install -r requirements.txt

# Instalar una dependencia específica
pip install fastapi

# Actualizar pip
python -m pip install --upgrade pip

# Ver dependencias instaladas
pip list

# Verificar dependencias
pip check
```

---

## 8. Comandos Angular/npm Directos

### 8.1 Instalar Dependencias

```powershell
# Navegar al directorio frontend
cd frontend

# Instalar dependencias (usar si no hay package-lock.json)
npm install

# Instalar dependencias con lockfile (más rápido y confiable)
npm ci

# Limpiar e instalar desde cero
rm -r node_modules package-lock.json
npm install
```

---

### 8.2 Ejecutar Servidor de Desarrollo

```powershell
# Iniciar servidor en puerto 4200
npm start

# O con Angular CLI directamente
ng serve

# En puerto específico
ng serve --port 4201

# Abrir navegador automáticamente
ng serve --open

# Con recarga automática deshabilitada
ng serve --live-reload=false
```

---

### 8.3 Ejecutar Tests del Frontend

```powershell
# Ejecutar tests una vez
npm test -- --watch=false

# Ejecutar tests en modo watch (desarrollo)
npm test

# Ejecutar tests con Chrome Headless
npm test -- --watch=false --browsers=ChromeHeadless

# Ejecutar tests con cobertura
ng test --code-coverage

# Ver reporte de cobertura
start coverage/index.html
```

---

### 8.4 Compilar para Producción

```powershell
# Compilar para producción
ng build

# Compilar con optimizaciones
ng build --configuration production

# Compilar con análisis de bundle
ng build --stats-json

# Compilar para PWA
ng build --configuration production
```

---

### 8.5 Otros Comandos Angular/npm

```powershell
# Ver versión de Angular CLI
ng version

# Generar componente
ng generate component nombre-componente

# Generar servicio
ng generate service nombre-servicio

# Linting
ng lint

# Actualizar Angular
ng update

# Verificar actualizaciones disponibles
ng update
```

---

## 9. Comandos Docker Directos

### 9.1 Gestión de Servicios

```powershell
# Iniciar todos los servicios
docker compose up -d

# Iniciar servicios y reconstruir imágenes
docker compose up -d --build

# Detener servicios
docker compose down

# Detener servicios y eliminar volúmenes
docker compose down -v

# Reiniciar un servicio específico
docker compose restart backend

# Ver estado de servicios
docker compose ps

# Ver logs de todos los servicios
docker compose logs

# Ver logs de un servicio específico
docker compose logs backend

# Ver logs en tiempo real
docker compose logs -f backend

# Ver logs de las últimas 100 líneas
docker compose logs --tail=100 backend
```

---

### 9.2 Gestión de Imágenes

```powershell
# Reconstruir una imagen específica
docker compose build backend

# Reconstruir sin usar cache
docker compose build --no-cache backend

# Ver imágenes del proyecto
docker images --filter "reference=*inia*"

# Eliminar imágenes no usadas
docker image prune

# Eliminar todas las imágenes no usadas
docker image prune -a
```

---

### 9.3 Gestión de Contenedores

```powershell
# Ver contenedores en ejecución
docker ps

# Ver todos los contenedores (incluyendo detenidos)
docker ps -a

# Detener un contenedor
docker stop nombre-contenedor

# Iniciar un contenedor
docker start nombre-contenedor

# Reiniciar un contenedor
docker restart nombre-contenedor

# Eliminar un contenedor
docker rm nombre-contenedor

# Eliminar contenedor aunque esté corriendo
docker rm -f nombre-contenedor

# Ejecutar comando en contenedor
docker exec -it nombre-contenedor bash

# Ejecutar comando en contenedor de base de datos
docker exec -it inia-database psql -U postgres -d inia
```

---

### 9.4 Gestión de Volúmenes

```powershell
# Ver volúmenes
docker volume ls

# Ver detalles de un volumen
docker volume inspect nombre-volumen

# Eliminar un volumen
docker volume rm nombre-volumen

# Eliminar volúmenes no usados
docker volume prune
```

---

### 9.5 Limpieza del Sistema

```powershell
# Limpiar contenedores detenidos, redes no usadas, imágenes huérfanas
docker system prune

# Limpiar todo (incluyendo volúmenes)
docker system prune -a --volumes

# Limpiar cache de construcción
docker builder prune

# Ver uso de espacio
docker system df
```

---

### 9.6 Backup y Restore de Base de Datos

```powershell
# Backup de la base de datos
docker exec inia-database pg_dump -U postgres inia > backup.sql

# Backup con compresión
docker exec inia-database pg_dump -U postgres inia | gzip > backup.sql.gz

# Restore de la base de datos
docker exec -i inia-database psql -U postgres inia < backup.sql

# Restore desde archivo comprimido
gunzip < backup.sql.gz | docker exec -i inia-database psql -U postgres inia
```

---

## 10. Comandos Útiles Adicionales

### 10.1 Verificar Puertos en Uso

```powershell
# Verificar puerto específico
netstat -ano | findstr :8080

# Ver todos los puertos en uso
netstat -ano

# Ver procesos usando un puerto
Get-NetTCPConnection -LocalPort 8080 | Select-Object OwningProcess
```

---

### 10.2 Verificar Servicios en Ejecución

```powershell
# Verificar si Docker está corriendo
docker version

# Verificar si PostgreSQL local está corriendo
Get-Service -Name "*postgres*"

# Detener PostgreSQL local (requiere admin)
Stop-Service -Name postgresql-x64-* -Force
```

---

### 10.3 Variables de Entorno

```powershell
# Ver variable de entorno
$env:JMETER_HOME

# Establecer variable de entorno (sesión actual)
$env:JMETER_HOME = "C:\JMeter\JMeter"

# Agregar al PATH (sesión actual)
$env:Path += ";C:\JMeter\JMeter\bin"
```

---

## 11. Resumen de URLs del Proyecto

### URLs de Desarrollo

- **Frontend (Angular):** `http://localhost:4200`
- **Backend API:** `http://localhost:8080/Inia`
- **Swagger UI:** `http://localhost:8080/swagger-ui/index.html`
- **Middleware API:** `http://localhost:9099`
- **Middleware Docs:** `http://localhost:9099/docs`
- **Base de Datos:** `localhost:5432`

### URLs de Producción (Docker)

- **Frontend:** `http://localhost` (puerto 80)
- **Backend API:** `http://localhost:8080/Inia`
- **Swagger UI:** `http://localhost:8080/swagger-ui/index.html`
- **Middleware API:** `http://localhost:9099`
- **Middleware Docs:** `http://localhost:9099/docs`
- **Base de Datos:** `localhost:5432`

### Credenciales por Defecto

- **Email:** `admin@inia.com`
- **Password:** `password123`

---

## 12. Flujos de Trabajo Comunes

### 12.1 Iniciar Proyecto Completo (Primera Vez)

```powershell
# 1. Configurar middleware
.\PowerShell\SetupMiddleware.ps1

# 2. Iniciar Docker (incluye backend, frontend, base de datos)
.\scriptDockers\iniciar-docker.ps1

# 3. Iniciar middleware (si no está en Docker)
.\PowerShell\run_middleware.ps1 server
```

---

### 12.2 Desarrollo Diario

```powershell
# Iniciar todo con Docker
.\scriptDockers\abrir-docker.ps1

# O iniciar servicios individualmente
.\PowerShell\run_middleware.ps1 server
.\PowerShell\Run_Fronted.ps1 -Open
```

---

### 12.3 Ejecutar Todos los Tests

```powershell
# Ejecutar todos los tests con cobertura
.\PowerShell\RunAllTests.ps1 -Coverage

# O ejecutar por componente
.\PowerShell\RunAllTests.ps1 -Backend -Coverage
.\PowerShell\RunAllTests.ps1 -Middleware -Verbose
```

---

### 12.4 Limpiar y Recrear Todo

```powershell
# Opción 1: Limpiar completamente (ELIMINA DATOS)
.\scriptDockers\clear-docker.ps1

# Opción 2: Recrear manteniendo datos
.\scriptDockers\recrear-docker.ps1
# Seleccionar opción 1

# Opción 3: Recrear eliminando datos
.\scriptDockers\recrear-docker.ps1
# Seleccionar opción 2
```

---

## 13. Solución de Problemas Comunes

### 13.1 Puerto en Uso

```powershell
# Ver qué proceso usa el puerto
netstat -ano | findstr :8080

# Detener proceso (reemplazar PID)
taskkill /PID <PID> /F

# O usar el script del middleware
.\PowerShell\run_middleware.ps1 stop
```

---

### 13.2 Docker no Inicia

```powershell
# Verificar Docker Desktop
docker version

# Si no funciona, reiniciar Docker Desktop manualmente
# Luego verificar
docker ps
```

---

### 13.3 Tests Fallan

```powershell
# Ejecutar tests con salida detallada
.\PowerShell\RunAllTests.ps1 -Verbose

# Ejecutar tests individuales
mvn test -Dtest=UsuarioControllerTest -X
pytest -vv tests/test_http_server.py
```

---

### 13.4 Dependencias Faltantes

```powershell
# Middleware
.\PowerShell\SetupMiddleware.ps1

# Frontend
cd frontend
npm ci

# Backend
mvn clean install
```

---

## Notas Finales

- Todos los scripts de PowerShell deben ejecutarse desde la raíz del proyecto (`D:\IniaProject`)
- Los scripts manejan automáticamente la navegación a directorios necesarios
- La mayoría de scripts incluyen verificación de prerrequisitos
- Los scripts de Docker requieren Docker Desktop corriendo
- Los scripts de testing pueden requerir servicios activos (base de datos, etc.)

---

**Última actualización:** 2025-01-27


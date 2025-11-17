# 🐳 Docker para Proyecto INIA

Esta documentación explica cómo usar Docker para ejecutar el proyecto INIA completo, incluyendo el backend Spring Boot, frontend Angular, middleware Python/FastAPI y base de datos PostgreSQL.

## 📋 Tabla de Contenidos

- [Requisitos](#requisitos)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Configuración Inicial](#configuración-inicial)
- [Comandos Básicos](#comandos-básicos)
- [Scripts de Utilidad](#scripts-de-utilidad)
- [Desarrollo vs Producción](#desarrollo-vs-producción)
- [Solución de Problemas](#solución-de-problemas)
- [Arquitectura](#arquitectura)

## 🔧 Requisitos

### Software Necesario
- **Docker Desktop** (Windows/Mac) o **Docker Engine** (Linux)
- **Docker Compose** (incluido con Docker Desktop)
- **PowerShell** (para los scripts de utilidad)

### Verificar Instalación
```bash
# Verificar Docker
docker --version
docker-compose --version

# Verificar que Docker esté ejecutándose
docker ps
```

## 🏗️ Estructura del Proyecto

```
IniaProject/
├── 📁 docker-scripts/          # Scripts de utilidad PowerShell
│   ├── build.ps1              # Construir imágenes
│   ├── start.ps1              # Iniciar servicios
│   ├── stop.ps1               # Detener servicios
│   ├── restart.ps1            # Reiniciar servicios
│   ├── logs.ps1               # Ver logs
│   └── status.ps1             # Ver estado
├── 📄 Dockerfile.backend      # Imagen del backend Spring Boot
├── 📄 Dockerfile.frontend     # Imagen del frontend Angular
├── 📄 Dockerfile.frontend.dev # Imagen de desarrollo del frontend
├── 📄 Dockerfile.middleware   # Imagen del middleware Python
├── 📄 docker-compose.yml      # Configuración principal
├── 📄 docker-compose.override.yml # Configuración de desarrollo
├── 📄 nginx.conf              # Configuración de Nginx
├── 📄 .dockerignore           # Archivos a ignorar en Docker
├── 📄 init.sql                # Script de inicialización de BD
└── 📄 DOCKER.md               # Esta documentación
```

## 🚀 Configuración Inicial

### 1. Clonar y Preparar el Proyecto
```bash
# Navegar al directorio del proyecto
cd C:\Github\IniaProject

# Verificar que todos los archivos Docker estén presentes
ls Dockerfile.* docker-compose.yml
```

### 2. Configurar Variables de Entorno (Opcional)
Crear un archivo `.env` en la raíz del proyecto:
```env
# Base de datos
DB_USER=postgres
DB_PASS=897888fg2
POSTGRES_DB=Inia

# JWT
JWT_SECRET=tu_secreto_jwt_muy_seguro_aqui
JWT_EXPIRATION=86400000

# URLs
PYTHON_MIDDLEWARE_BASE_URL=http://middleware:9099
```

### 3. Primera Ejecución
```bash
# Construir todas las imágenes
.\docker-scripts\build.ps1

# Iniciar todos los servicios
.\docker-scripts\start.ps1
```

## ⚡ Comandos Básicos

### Usando Docker Compose Directamente

#### Construir Imágenes
```bash
# Construir todas las imágenes
docker-compose build

# Construir una imagen específica
docker-compose build backend
docker-compose build frontend
docker-compose build middleware

# Construir sin usar cache
docker-compose build --no-cache
```

#### Gestionar Servicios
```bash
# Iniciar todos los servicios
docker-compose up -d

# Iniciar un servicio específico
docker-compose up -d backend

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (¡CUIDADO! Borra la BD)
docker-compose down -v

# Ver estado de los servicios
docker-compose ps

# Ver logs
docker-compose logs -f
docker-compose logs -f backend
```

#### Reiniciar Servicios
```bash
# Reiniciar un servicio específico
docker-compose restart backend

# Reiniciar todos los servicios
docker-compose restart
```

### Usando Scripts de Utilidad (Recomendado)

#### Construcción
```powershell
# Construir todo
.\docker-scripts\build.ps1

# Construir servicio específico
.\docker-scripts\build.ps1 backend
.\docker-scripts\build.ps1 frontend
.\docker-scripts\build.ps1 middleware

# Construir sin cache
.\docker-scripts\build.ps1 -NoCache

# Ver ayuda
.\docker-scripts\build.ps1 -Help
```

#### Gestión de Servicios
```powershell
# Iniciar servicios
.\docker-scripts\start.ps1

# Iniciar con construcción previa
.\docker-scripts\start.ps1 -Build

# Iniciar forzando recreación
.\docker-scripts\start.ps1 -Force

# Detener servicios
.\docker-scripts\stop.ps1

# Detener y eliminar datos (¡CUIDADO!)
.\docker-scripts\stop.ps1 -RemoveVolumes

# Ver estado
.\docker-scripts\status.ps1

# Ver estado detallado
.\docker-scripts\status.ps1 -Detailed
```

#### Logs y Monitoreo
```powershell
# Ver logs de todos los servicios
.\docker-scripts\logs.ps1

# Ver logs de un servicio específico
.\docker-scripts\logs.ps1 backend
.\docker-scripts\logs.ps1 frontend
.\docker-scripts\logs.ps1 middleware
.\docker-scripts\logs.ps1 database

# Seguir logs en tiempo real
.\docker-scripts\logs.ps1 -Follow

# Ver últimas 50 líneas
.\docker-scripts\logs.ps1 -Lines 50
```

#### Reinicio
```powershell
# Reiniciar todos los servicios
.\docker-scripts\restart.ps1

# Reiniciar servicio específico
.\docker-scripts\restart.ps1 backend

# Reiniciar con construcción previa
.\docker-scripts\restart.ps1 -Build
```

## 🛠️ Scripts de Utilidad

### build.ps1
Construye las imágenes Docker del proyecto.

**Uso:**
```powershell
.\docker-scripts\build.ps1 [servicio] [opciones]
```

**Servicios:** `all`, `backend`, `frontend`, `middleware`  
**Opciones:** `-NoCache`, `-Help`

### start.ps1
Inicia los servicios Docker.

**Uso:**
```powershell
.\docker-scripts\start.ps1 [opciones]
```

**Opciones:** `-Detached`, `-Build`, `-Force`, `-Help`

### stop.ps1
Detiene los servicios Docker.

**Uso:**
```powershell
.\docker-scripts\stop.ps1 [opciones]
```

**Opciones:** `-RemoveVolumes`, `-RemoveImages`, `-Help`

### logs.ps1
Muestra los logs de los servicios.

**Uso:**
```powershell
.\docker-scripts\logs.ps1 [servicio] [opciones]
```

**Servicios:** `all`, `backend`, `frontend`, `middleware`, `database`  
**Opciones:** `-Follow`, `-Lines N`, `-Help`

### status.ps1
Muestra el estado de los servicios.

**Uso:**
```powershell
.\docker-scripts\status.ps1 [opciones]
```

**Opciones:** `-Detailed`, `-Help`

### restart.ps1
Reinicia los servicios Docker.

**Uso:**
```powershell
.\docker-scripts\restart.ps1 [servicio] [opciones]
```

**Servicios:** `all`, `backend`, `frontend`, `middleware`, `database`  
**Opciones:** `-Build`, `-Help`

## 🔄 Desarrollo vs Producción

### Modo Desarrollo
El archivo `docker-compose.override.yml` se carga automáticamente en desarrollo y proporciona:

- **Hot reload** para el middleware Python
- **Volúmenes montados** para el código fuente
- **Configuraciones de desarrollo** específicas
- **Puerto 4200** para Angular en desarrollo

```bash
# Iniciar en modo desarrollo
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f middleware
```

### Modo Producción
Para producción, usa solo `docker-compose.yml` (sin override):

```bash
# Iniciar en modo producción (sin override de desarrollo)
docker-compose -f docker-compose.yml up -d

# O construir e iniciar
docker-compose -f docker-compose.yml build --no-cache
docker-compose -f docker-compose.yml up -d

# Verificar configuración de producción
docker-compose -f docker-compose.yml config | grep -A 20 middleware
```

**Configuración de Producción:**
- ✅ **8 workers de Uvicorn** (alta concurrencia)
- ✅ **200 requests concurrentes** (alta carga)
- ✅ **50 workers en thread pool** (operaciones pesadas)
- ✅ **Pool de BD: 30 base + 50 overflow** (80 conexiones máx)
- ✅ **Rate limiting: 200 req/min** (protección)
- ✅ **Health check mejorado** con endpoint `/health`
- ✅ **Timeout: 600 segundos** (10 minutos)

### Cambiar entre Modos
```bash
# Desarrollo (con override)
docker-compose up -d

# Producción (sin override)
docker-compose -f docker-compose.yml up -d
```

## 🔍 Solución de Problemas

### Problemas Comunes

#### 1. Puerto ya en uso
```bash
# Verificar qué está usando el puerto
netstat -ano | findstr :8080
netstat -ano | findstr :80
netstat -ano | findstr :5432

# Detener servicios que usen el puerto
docker-compose down
```

#### 2. Error de permisos en Windows
```powershell
# Ejecutar PowerShell como administrador
# O cambiar la política de ejecución
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 3. Problemas de memoria
```bash
# Verificar uso de recursos
docker stats

# Limpiar recursos no utilizados
docker system prune -a
```

#### 4. Base de datos no conecta
```bash
# Verificar logs de la base de datos
docker-compose logs database

# Verificar conectividad
docker-compose exec backend ping database
```

#### 5. Frontend no carga
```bash
# Verificar logs de Nginx
docker-compose logs frontend

# Verificar que el build de Angular fue exitoso
docker-compose exec frontend ls -la /usr/share/nginx/html
```

### Comandos de Diagnóstico

```bash
# Ver estado detallado
docker-compose ps
docker-compose top

# Ver logs de todos los servicios
docker-compose logs

# Verificar conectividad de red
docker network ls
docker network inspect iniaproject_inia-network

# Verificar volúmenes
docker volume ls
docker volume inspect iniaproject_postgres_data

# Acceder a un contenedor
docker-compose exec backend bash
docker-compose exec database psql -U postgres -d Inia
```

### Limpieza Completa
```bash
# Detener y eliminar todo
docker-compose down -v --rmi all

# Limpiar sistema Docker
docker system prune -a --volumes

# Reconstruir desde cero
.\docker-scripts\build.ps1 -NoCache
.\docker-scripts\start.ps1
```

## 🏛️ Arquitectura

### Servicios

#### 🗄️ Database (PostgreSQL)
- **Puerto:** 5432
- **Imagen:** postgres:15-alpine
- **Volumen:** postgres_data (persistente)
- **Health Check:** pg_isready

#### 🚀 Backend (Spring Boot)
- **Puerto:** 8080
- **Imagen:** Construida desde Dockerfile.backend
- **Dependencias:** Database
- **Health Check:** /actuator/health

#### 🐍 Middleware (Python/FastAPI)
- **Puerto:** 9099
- **Imagen:** Construida desde Dockerfile.middleware
- **Dependencias:** Database
- **Volúmenes:** exports/ (para archivos generados)
- **Optimizaciones de PRODUCCIÓN:**
  - **8 workers de Uvicorn** (configurable vía `UVICORN_WORKERS`)
  - **200 requests concurrentes** (configurable vía `MAX_CONCURRENT_REQUESTS`)
  - **Rate limiting: 200 req/min por IP** (configurable)
  - **Thread pool: 50 workers** para operaciones pesadas
  - **Pool de BD: 30 conexiones base + 50 overflow**
  - **Timeout: 600 segundos** (10 minutos) por request
  - **Health check mejorado** usando endpoint `/health`

#### 🌐 Frontend (Angular + Nginx)
- **Puerto:** 80 (producción), 4200 (desarrollo)
- **Imagen:** Construida desde Dockerfile.frontend
- **Proxy:** Backend y Middleware
- **Health Check:** /health

### Red
- **Red personalizada:** inia-network (172.20.0.0/16)
- **Comunicación interna:** Por nombre de servicio
- **Acceso externo:** Por puertos mapeados

### Volúmenes
- **postgres_data:** Datos persistentes de PostgreSQL
- **exports/:** Archivos generados por el middleware

### Flujo de Datos
```
Usuario → Frontend (Nginx) → Backend/Middleware → Database
```

## 📞 Acceso a la Aplicación

Una vez que todos los servicios estén ejecutándose:

- **🌐 Frontend:** http://localhost
- **🔧 Backend API:** http://localhost:8080/Inia
- **📊 Middleware API:** http://localhost:9099
- **🗄️ Base de datos:** localhost:5432

### Documentación de APIs
- **Backend:** http://localhost:8080/Inia/swagger-ui.html
- **Middleware:** http://localhost:9099/docs
- **Middleware ReDoc:** http://localhost:9099/redoc
- **Middleware Health Check:** http://localhost:9099/health

## 🔐 Seguridad

### Variables de Entorno Sensibles
- `JWT_SECRET`: Cambiar en producción
- `DB_PASS`: Usar contraseña segura
- `POSTGRES_PASSWORD`: Usar contraseña segura

### Variables de Optimización del Middleware
El middleware FastAPI soporta las siguientes variables de entorno para optimización:

- `UVICORN_WORKERS`: Número de workers (default: **8 en producción**, 1 en desarrollo)
- `MAX_CONCURRENT_REQUESTS`: Requests simultáneos (default: **200 en producción**, 20 en desarrollo)
- `MAX_REQUEST_TIMEOUT`: Timeout en segundos (default: 600)
- `RATE_LIMIT_REQUESTS`: Requests por ventana (default: **200 en producción**, 200 en desarrollo)
- `RATE_LIMIT_WINDOW`: Ventana en segundos (default: 60)
- `THREAD_POOL_WORKERS`: Workers del thread pool (default: **50 en producción**, 5 en desarrollo)
- `DB_POOL_SIZE`: Tamaño del pool de BD (default: **30 en producción**, 5 en desarrollo)
- `DB_MAX_OVERFLOW`: Conexiones adicionales (default: **50 en producción**, 10 en desarrollo)
- `DB_POOL_RECYCLE`: Reciclar conexiones cada N segundos (default: 3600)
- `LOG_LEVEL`: Nivel de logging (default: info)

**Nota:** En desarrollo (docker-compose.override.yml), los valores son más bajos para mejor debugging.  
**Producción:** Los valores están optimizados para alta carga y rendimiento.

### Recomendaciones de Producción
1. Usar secrets de Docker o variables de entorno seguras
2. Configurar firewall para limitar acceso a puertos
3. Usar HTTPS con certificados SSL
4. Configurar backup automático de la base de datos
5. Monitorear logs de seguridad

## 📚 Recursos Adicionales

- [Documentación oficial de Docker](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Spring Boot Docker Guide](https://spring.io/guides/gs/spring-boot-docker/)
- [Angular Docker Guide](https://angular.io/guide/docker)
- [FastAPI Docker Guide](https://fastapi.tiangolo.com/deployment/docker/)

---

**¿Necesitas ayuda?** Revisa la sección de [Solución de Problemas](#solución-de-problemas) o ejecuta `.\docker-scripts\[comando].ps1 -Help` para ver la ayuda específica de cada script.

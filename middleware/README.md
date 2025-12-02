# Middleware Python/FastAPI - Documentación de Configuración

## Descripción

El middleware Python/FastAPI proporciona endpoints para operaciones de importación, exportación y análisis de datos Excel/CSV para el proyecto INIA.

## Endpoints Disponibles

Todos los endpoints están disponibles tanto con el prefijo `/middleware/` como sin él para compatibilidad con diferentes entornos:

### Health Check
- `GET /health` o `GET /middleware/health` - Verifica el estado del servicio y la conexión a la base de datos

### Exportación
- `POST /exportar` o `POST /middleware/exportar` - Exporta tablas a Excel/CSV
  - Parámetros: `tablas` (opcional), `formato` (xlsx|csv), `analisis_ids`, `fecha_desde`, `fecha_hasta`, `campo_fecha`
  - Retorna: Archivo ZIP con los archivos exportados

### Importación
- `POST /importar` o `POST /middleware/importar` - Importa archivos Excel/CSV
  - Parámetros: `file` o `files` (multipart), `table` (opcional), `upsert`, `keep_ids`
  - Retorna: Respuesta JSON con el resultado de la importación

### Inserción Masiva
- `POST /insertar` o `POST /middleware/insertar` - Ejecuta inserción masiva de datos

### Análisis
- `POST /analizar` o `POST /middleware/analizar` - Analiza estructura de archivos Excel
  - Parámetros: `file` (multipart), `formato` (json|texto), `contrastar_bd`, `umbral_coincidencia`

## Configuración de Entornos

### Desarrollo Local

1. **Instalar dependencias:**
   ```powershell
   .\PowerShell\SetupMiddleware.ps1
   ```

2. **Iniciar servidor:**
   ```powershell
   .\PowerShell\run_middleware.ps1 server
   ```

3. **El servidor estará disponible en:**
   - `http://localhost:9099`
   - Documentación interactiva: `http://localhost:9099/docs`

4. **Configuración del proxy Angular:**
   - El archivo `frontend/proxy.conf.json` está configurado para redirigir `/middleware` a `http://middleware:9099` (nombre de servicio Docker)
   - En desarrollo local con `ng serve`, el proxy usa `localhost:9099`

### Docker Compose (Desarrollo)

1. **Iniciar servicios:**
   ```powershell
   docker-compose -f docker-compose.dev.yml up
   ```

2. **Configuración:**
   - El middleware se ejecuta en el contenedor `middleware` en el puerto `9099`
   - El frontend usa el proxy de Angular que redirige `/middleware` a `http://middleware:9099`
   - El backend Java usa la variable de entorno `PYTHON_MIDDLEWARE_BASE_URL=http://middleware:9099`

3. **Health Check:**
   - Docker verifica el health check en `http://localhost:9099/health`
   - El middleware responde correctamente en ambos endpoints: `/health` y `/middleware/health`

### Producción (ECS/AWS)

1. **Configuración del ALB:**
   - El ALB enruta `/middleware/*` al servicio ECS del middleware
   - El middleware recibe las rutas con el prefijo `/middleware/`

2. **URL del Backend:**
   - El backend Java usa `PYTHON_MIDDLEWARE_BASE_URL=http://zimmzimmgames.com/middleware`
   - Las URLs se construyen como `baseUrl + "/endpoint"`, resultando en `/middleware/endpoint`

3. **CORS:**
   - Los orígenes permitidos se configuran mediante la variable de entorno `CORS_ORIGINS` (separados por comas)

## Variables de Entorno

### Base de Datos
- `DB_USER` - Usuario de PostgreSQL (default: `postgres`)
- `DB_PASSWORD` - Contraseña de PostgreSQL
- `DB_HOST` - Host de PostgreSQL (default: `localhost`)
- `DB_PORT` - Puerto de PostgreSQL (default: `5432`)
- `DB_NAME` - Nombre de la base de datos (default: `Inia`)
- `DATABASE_URL` - URL completa de conexión (opcional, se construye automáticamente)

### Servidor
- `PY_MIDDLEWARE_PORT` - Puerto del servidor (default: `9099`)
- `UVICORN_WORKERS` - Número de workers de Uvicorn (default: `1` para desarrollo)

### Límites y Protección
- `MAX_FILE_SIZE` - Tamaño máximo de archivo individual (default: `100MB`)
- `MAX_TOTAL_FILES_SIZE` - Tamaño máximo total de archivos (default: `500MB`)
- `MAX_REQUEST_TIMEOUT` - Timeout máximo por request (default: `600s`)
- `MAX_CONCURRENT_REQUESTS` - Máximo de requests concurrentes (default: `50`)
- `MAX_IMPORT_FILES` - Máximo de archivos por importación (default: `50`)
- `RATE_LIMIT_REQUESTS` - Límite de requests por ventana (default: `100`)
- `RATE_LIMIT_WINDOW` - Ventana de tiempo para rate limiting en segundos (default: `60`)
- `THREAD_POOL_WORKERS` - Número de workers en el thread pool (default: `10`)
- `DB_POOL_SIZE` - Tamaño del pool de conexiones (default: `10`)
- `DB_MAX_OVERFLOW` - Máximo de conexiones adicionales (default: `20`)
- `DB_POOL_RECYCLE` - Tiempo de reciclaje de conexiones en segundos (default: `3600`)

### CORS
- `CORS_ORIGINS` - Orígenes permitidos separados por comas (opcional)

## Rutas y Compatibilidad

El middleware está diseñado para funcionar en tres escenarios:

1. **Desarrollo Local:** 
   - Frontend usa proxy de Angular → `http://localhost:9099`
   - Backend Java usa → `http://localhost:9099`
   - Rutas sin prefijo funcionan correctamente

2. **Docker Compose:**
   - Frontend usa proxy de Angular → `http://middleware:9099` (con prefijo `/middleware`)
   - Backend Java usa → `http://middleware:9099` (sin prefijo)
   - Nginx redirige `/middleware/` → `http://middleware:9099/middleware/`

3. **Producción (ECS/AWS):**
   - ALB enruta `/middleware/*` → Servicio ECS
   - Backend Java usa → `http://zimmzimmgames.com/middleware` (con prefijo)
   - Rutas con prefijo `/middleware/` funcionan correctamente

## Troubleshooting

### El servidor no inicia
1. Verificar que Python esté instalado: `python --version`
2. Verificar que las dependencias estén instaladas: `pip list`
3. Ejecutar setup: `.\PowerShell\SetupMiddleware.ps1`
4. Verificar que el puerto 9099 no esté en uso

### Error de conexión a base de datos
1. Verificar que PostgreSQL esté ejecutándose
2. Verificar variables de entorno de conexión
3. Verificar que la base de datos `Inia` exista
4. Revisar logs del middleware para detalles del error

### Error 404 en endpoints
1. Verificar que el servidor esté ejecutándose
2. Verificar que se use la URL correcta (con o sin prefijo según el entorno)
3. Verificar configuración del proxy (desarrollo) o ALB (producción)

### Error CORS
1. Verificar que el origen esté en la lista de `allow_origins`
2. Agregar origen mediante variable de entorno `CORS_ORIGINS`
3. Verificar headers de la solicitud

### Timeout en operaciones largas
1. Aumentar `MAX_REQUEST_TIMEOUT` si es necesario
2. Verificar timeouts del proxy/ALB
3. Para exportaciones grandes, considerar procesamiento asíncrono

## Pruebas

Ejecutar pruebas del middleware:
```powershell
.\PowerShell\TestMiddleware.ps1
```

Ejecutar pruebas manteniendo el servidor corriendo:
```powershell
.\PowerShell\TestMiddleware.ps1 -KeepServerRunning
```

## Documentación de API

Una vez que el servidor esté ejecutándose, la documentación interactiva está disponible en:
- Swagger UI: `http://localhost:9099/docs`
- ReDoc: `http://localhost:9099/redoc`


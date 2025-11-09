# Documentación: run_middleware.ps1

Script de PowerShell para gestionar el middleware Python del proyecto INIA.

## Ubicación

```
C:\Github\IniaProject\PowerShell\run_middleware.ps1
```

## Cómo llamar el script

### Desde la raíz del proyecto

```powershell
# Desde cualquier ubicación dentro del proyecto
.\PowerShell\run_middleware.ps1 [comando] [opciones]
```

### Desde el directorio PowerShell

```powershell
# Si estás en el directorio PowerShell/
cd C:\Github\IniaProject\PowerShell
.\run_middleware.ps1 [comando] [opciones]
```

### Desde el directorio raíz del proyecto

```powershell
# Si estás en la raíz del proyecto
cd C:\Github\IniaProject
.\PowerShell\run_middleware.ps1 [comando] [opciones]
```

## Comandos disponibles

### 1. `server` - Iniciar/Reiniciar servidor API

Inicia el servidor FastAPI en el puerto 9099. Si ya hay un servidor corriendo, lo detiene automáticamente y reinicia uno nuevo.

```powershell
.\PowerShell\run_middleware.ps1 server
```

**Características:**
- ✅ Detecta automáticamente si el puerto 9099 está en uso
- ✅ Detiene el servidor anterior si existe
- ✅ Inicia un nuevo servidor con los cambios más recientes
- ✅ Accesible en `http://localhost:9099`
- ✅ Documentación interactiva en `http://localhost:9099/docs`

**Ejemplo de uso:**
```powershell
# Primera vez - inicia el servidor
.\PowerShell\run_middleware.ps1 server

# Después de hacer cambios - reinicia automáticamente
.\PowerShell\run_middleware.ps1 server
```

**Para detener el servidor:**
- Presiona `Ctrl+C` en la terminal donde está corriendo
- O ejecuta: `.\PowerShell\run_middleware.ps1 stop`

---

### 2. `stop` - Detener servidor

Detiene el servidor que está corriendo en el puerto 9099 sin iniciar uno nuevo.

```powershell
.\PowerShell\run_middleware.ps1 stop
```

**Ejemplo de uso:**
```powershell
# Detener el servidor
.\PowerShell\run_middleware.ps1 stop
```

---

### 3. `insert` - Inserción masiva de datos

Ejecuta la inserción masiva de datos en la base de datos.

```powershell
.\PowerShell\run_middleware.ps1 insert
```

**Equivalente a:**
```powershell
cd middleware
python MassiveInsertFiles.py
```

---

### 4. `export` - Exportar datos

Exporta tablas de la base de datos a archivos Excel o CSV.

```powershell
# Exportar todas las tablas a Excel
.\PowerShell\run_middleware.ps1 export

# Exportar tablas específicas
.\PowerShell\run_middleware.ps1 export --tables lote,recibo --format xlsx

# Exportar a CSV
.\PowerShell\run_middleware.ps1 export --tables lote --format csv
```

**Opciones disponibles:**
- `--tables`: Lista de tablas separadas por comas (ej: `lote,recibo,analisis`)
- `--format`: Formato de salida (`xlsx` o `csv`)

---

### 5. `import` - Importar datos

Importa datos desde archivos Excel o CSV a la base de datos.

```powershell
# Importar archivo Excel
.\PowerShell\run_middleware.ps1 import --file datos.xlsx --table lote

# Importar con upsert (actualizar si existe)
.\PowerShell\run_middleware.ps1 import --file datos.xlsx --table lote --upsert

# Importar manteniendo IDs
.\PowerShell\run_middleware.ps1 import --file datos.xlsx --table lote --keep-ids
```

**Opciones disponibles:**
- `--file`: Ruta al archivo a importar (requerido)
- `--table`: Nombre de la tabla destino (requerido)
- `--upsert`: Actualizar registros existentes en lugar de insertar nuevos
- `--keep-ids`: Mantener los IDs proporcionados en el archivo

---

### 6. `test` - Pruebas de rendimiento

Ejecuta pruebas de inserción masiva con ~35,000 registros para pruebas de laboratorio.

```powershell
.\PowerShell\run_middleware.ps1 test
```

**⚠️ ADVERTENCIA:** Esto insertará una gran cantidad de registros en la base de datos. Se pedirá confirmación antes de ejecutar.

---

### 7. `help` - Mostrar ayuda

Muestra la ayuda completa con todos los comandos disponibles.

```powershell
.\PowerShell\run_middleware.ps1 help
```

O simplemente ejecuta el script sin parámetros:

```powershell
.\PowerShell\run_middleware.ps1
```

---

## Ejemplos de uso completos

### Iniciar el servidor para desarrollo

```powershell
# 1. Navegar a la raíz del proyecto
cd C:\Github\IniaProject

# 2. Iniciar el servidor
.\PowerShell\run_middleware.ps1 server

# El servidor estará disponible en:
# - API: http://localhost:9099
# - Documentación: http://localhost:9099/docs
```

### Reiniciar el servidor después de cambios

```powershell
# Si el servidor ya está corriendo, simplemente ejecuta de nuevo
.\PowerShell\run_middleware.ps1 server

# El script detectará automáticamente el servidor anterior,
# lo detendrá y iniciará uno nuevo con los cambios
```

### Detener el servidor manualmente

```powershell
# Opción 1: Usar el comando stop
.\PowerShell\run_middleware.ps1 stop

# Opción 2: Presionar Ctrl+C en la terminal donde está corriendo
```

### Flujo completo de trabajo

```powershell
# 1. Iniciar el servidor
.\PowerShell\run_middleware.ps1 server

# 2. Hacer cambios en el código Python
# (editar middleware/http_server.py, etc.)

# 3. Reiniciar el servidor para aplicar cambios
.\PowerShell\run_middleware.ps1 server

# 4. Probar los cambios en http://localhost:9099/docs

# 5. Detener el servidor cuando termines
.\PowerShell\run_middleware.ps1 stop
```

---

## Requisitos previos

### 1. Entorno virtual (recomendado)

El script intenta activar automáticamente el entorno virtual si existe:

```powershell
# Si no existe, crearlo primero:
cd C:\Github\IniaProject\middleware
py -m venv .venv

# O usar el script de setup:
.\PowerShell\SetupMiddleware.ps1
```

### 2. Dependencias Python

El script requiere que las dependencias estén instaladas. Si no lo están, el script mostrará un error.

**Instalar dependencias:**
```powershell
cd C:\Github\IniaProject\middleware
pip install -r requirements.txt
```

O usar el script de setup:
```powershell
.\PowerShell\SetupMiddleware.ps1
```

### 3. Base de datos PostgreSQL

El servidor requiere que PostgreSQL esté corriendo y accesible con la configuración por defecto:
- **Host**: localhost
- **Puerto**: 5432
- **Base de datos**: Inia
- **Usuario**: postgres

---

## Solución de problemas

### Error: "No se encontró MassiveInsertFiles.py"

**Causa:** El script no puede encontrar los archivos del middleware.

**Solución:**
- Asegúrate de estar ejecutando el script desde la raíz del proyecto
- Verifica que el directorio `middleware/` existe y contiene los archivos necesarios

### Error: "No se encontró entorno virtual"

**Causa:** No existe el entorno virtual `.venv` en el directorio `middleware/`.

**Solución:**
```powershell
cd C:\Github\IniaProject\middleware
py -m venv .venv
.\PowerShell\SetupMiddleware.ps1
```

### Error: "El puerto 9099 aún está en uso"

**Causa:** Hay un proceso que no se pudo detener automáticamente.

**Solución:**
```powershell
# Opción 1: Detener manualmente
.\PowerShell\run_middleware.ps1 stop

# Opción 2: Encontrar y detener el proceso manualmente
netstat -ano | findstr :9099
taskkill /PID [número_de_proceso] /F
```

### Error: "No se puede sobrescribir la variable PID"

**Causa:** Este error ya está corregido en la versión actual del script.

**Solución:** Asegúrate de tener la versión más reciente del script.

### El servidor no se reinicia automáticamente

**Causa:** El script puede no detectar correctamente el servidor anterior.

**Solución:**
```powershell
# Detener manualmente primero
.\PowerShell\run_middleware.ps1 stop

# Luego iniciar de nuevo
.\PowerShell\run_middleware.ps1 server
```

---

## Notas importantes

1. **El script navega automáticamente** al directorio correcto, no necesitas estar en ningún directorio específico para ejecutarlo.

2. **El servidor se reinicia automáticamente** cuando ejecutas `server` de nuevo, no necesitas detenerlo manualmente.

3. **El puerto 9099** es el puerto por defecto. Si necesitas cambiarlo, modifica el código del script o usa variables de entorno.

4. **Ctrl+C** detiene el servidor de forma segura cuando está corriendo.

5. **El script activa el entorno virtual** automáticamente si existe en `middleware/.venv/`.

---

## Referencias

- **README del middleware**: `middleware/README.md`
- **Script de setup**: `PowerShell/SetupMiddleware.ps1`
- **Servidor API**: `middleware/http_server.py`
- **Documentación de la API**: http://localhost:9099/docs (cuando el servidor está corriendo)


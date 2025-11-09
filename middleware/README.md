# Middleware INIA - Python

Este middleware proporciona funcionalidades para la gestión de datos del proyecto INIA, incluyendo inserción masiva, exportación e importación de datos.

## Instalación

### Opción 1: Script automático (Recomendado)
```powershell
.\SetupMiddleware.ps1
```

### Opción 2: Instalación manual
```powershell
# Crear entorno virtual
py -m venv .venv

# Activar entorno virtual
.\.venv\Scripts\Activate.ps1

# Instalar dependencias
pip install -r requirements.txt
```

## Uso

### Script de ayuda
```powershell
.\run_middleware.ps1 help
```

### Comandos disponibles

#### 1. Inserción masiva de datos
```powershell
# Inserción normal (cantidades estándar)
.\run_middleware.ps1 insert

# Inserción masiva para laboratorio (5000 registros por análisis)
.\run_middleware.ps1 test

# o directamente:
python MassiveInsertFiles.py
```

#### 2. Exportar datos
```powershell
# Exportar todas las tablas a Excel
.\run_middleware.ps1 export

# Exportar tablas específicas
.\run_middleware.ps1 export --tables lote,recibo --format xlsx

# Exportar a CSV
.\run_middleware.ps1 export --tables lote --format csv
```

#### 3. Importar datos
```powershell
# Importar archivo Excel
.\run_middleware.ps1 import --file datos.xlsx --table lote

# Importar con upsert (actualizar si existe)
.\run_middleware.ps1 import --file datos.xlsx --table lote --upsert

# Importar manteniendo IDs
.\run_middleware.ps1 import --file datos.xlsx --table lote --keep-ids
```

#### 4. Servidor API
```powershell
# Desde la raíz del proyecto:
.\PowerShell\run_middleware.ps1 server

# O desde el directorio PowerShell:
cd PowerShell
.\run_middleware.ps1 server

# O directamente:
cd middleware
python http_server.py
```

**Características del comando `server`:**
- ✅ Detecta automáticamente si el puerto 9099 está en uso
- ✅ Detiene el servidor anterior si existe
- ✅ Reinicia automáticamente con los cambios más recientes
- ✅ No necesitas detener el servidor manualmente antes de reiniciarlo

**Detener el servidor:**
```powershell
# Opción 1: Usar el comando stop
.\PowerShell\run_middleware.ps1 stop

# Opción 2: Presionar Ctrl+C en la terminal donde está corriendo
```

El servidor se ejecutará en `http://localhost:9099`

**Ver documentación completa:** `PowerShell/README_run_middleware.md`

#### 5. Pruebas de rendimiento
```powershell
# Ejecutar pruebas de inserción masiva (35,000+ registros)
.\run_middleware.ps1 test
# o directamente:
python test_massive_insert.py
```

### Endpoints de la API

- **POST /insertar** - Ejecutar inserción masiva de datos
- **POST /exportar** - Exportar tablas (parámetros: `tablas`, `formato`)
- **POST /importar** - Importar archivo (formulario: `table`, `file`, `upsert`, `keep_ids`)
- **GET /docs** - Documentación interactiva de la API

## Dependencias

El proyecto utiliza las siguientes dependencias principales:

- **SQLAlchemy** - ORM para base de datos
- **psycopg2-binary** - Driver PostgreSQL
- **FastAPI** - Framework web para la API
- **uvicorn** - Servidor ASGI
- **openpyxl** - Manipulación de archivos Excel
- **pandas** - Análisis de datos
- **faker** - Generación de datos de prueba
- **pydantic** - Validación de datos

## Estructura del proyecto

```
middleware/
├── SetupMiddleware.ps1      # Script de instalación
├── run_middleware.ps1       # Script de ejecución
├── requirements.txt         # Dependencias Python
├── MassiveInsertFiles.py    # Inserción masiva de datos (modo laboratorio)
├── test_massive_insert.py   # Pruebas de rendimiento
├── ExportExcel.py          # Exportación a Excel/CSV
├── ImportExcel.py          # Importación desde Excel/CSV
├── http_server.py          # Servidor API FastAPI
└── README.md               # Este archivo
```

## Configuración de base de datos

El middleware se conecta a PostgreSQL con la siguiente configuración por defecto:

- **Host**: localhost
- **Puerto**: 5432
- **Base de datos**: Inia
- **Usuario**: postgres
- **Contraseña**: 897888fg2

Para cambiar la configuración, modifica las variables en `MassiveInsertFiles.py`:

```python
DEFAULT_CONFIG = {
    'DB_USER': 'tu_usuario',
    'DB_PASSWORD': 'tu_contraseña',
    'DB_HOST': 'tu_host',
    'DB_PORT': 'tu_puerto',
    'DB_NAME': 'tu_base_datos',
}
```

## Modo Laboratorio

El sistema incluye un **modo laboratorio** optimizado para pruebas de rendimiento:

### Características del modo laboratorio:
- **35,000+ registros** insertados en total
- **5000 registros por análisis** (PMS, Pureza, DOSN, Germinación, etc.)
- **Inserción optimizada por lotes** con indicadores de progreso
- **Medición de rendimiento** automática
- **Barras de progreso** visuales durante la inserción

### Uso del modo laboratorio:
```powershell
# Ejecutar pruebas de rendimiento
.\run_middleware.ps1 test

# Verificar rendimiento esperado
# - ~35,000 registros en total
# - Tiempo estimado: 2-5 minutos (dependiendo del hardware)
# - Rendimiento: 1000-2000 registros/segundo
```

## Instalación automática de dependencias

Todos los scripts del middleware instalan dependencias automáticamente si faltan. Esto significa que puedes ejecutar cualquier script sin preocuparte por instalar dependencias manualmente.

### Para scripts nuevos

Si estás creando un nuevo script y quieres que instale dependencias automáticamente, usa el módulo `InstallDependencies`:

```python
# Al inicio de tu script
try:
    from InstallDependencies import ensure_dependencies
    # Asegurar que los módulos necesarios estén instalados
    ensure_dependencies('sqlalchemy', 'openpyxl', 'pandas', silent=False)
except ImportError:
    pass  # Si InstallDependencies no está disponible, continuar sin instalación

# Ahora puedes importar con seguridad
from sqlalchemy import create_engine
from openpyxl import Workbook
import pandas as pd
```

### Funciones disponibles

- `ensure_dependencies(*modules)`: Verifica e instala múltiples módulos
- `ensure_dependencies_from_list(modules)`: Versión que acepta una lista
- `instalar_dependencias_faltantes(module_name)`: Instala dependencias para un módulo específico
- `verificar_e_instalar(modulo, package_name)`: Verifica e instala un módulo individual

Ver `ejemplo_uso_dependencias.py` para más ejemplos.

## Solución de problemas

### Error de conexión a base de datos
- Verifica que PostgreSQL esté ejecutándose
- Confirma que la base de datos 'Inia' existe
- Revisa las credenciales en la configuración

### Error de dependencias
- Los scripts intentan instalar dependencias automáticamente
- Si falla la instalación automática, ejecuta manualmente:
  ```powershell
  pip install -r requirements.txt
  ```
- O instala dependencias para un módulo específico:
  ```powershell
  python InstallDependencies.py --module ExportExcel
  ```

### Error de permisos
- Ejecuta PowerShell como administrador si es necesario
- Verifica permisos de escritura en el directorio del proyecto

### Rendimiento lento en modo laboratorio
- Verifica que PostgreSQL tenga suficiente memoria asignada
- Considera aumentar el `shared_buffers` en postgresql.conf
- Asegúrate de que no haya otros procesos pesados ejecutándose

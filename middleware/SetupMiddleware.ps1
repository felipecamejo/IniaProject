Write-Host "==> Setup del middleware para el proyecto INIA" -ForegroundColor Cyan
Write-Host "Instalando dependencias completas: SQLAlchemy, psycopg2-binary, fastapi, uvicorn, openpyxl, pydantic" -ForegroundColor Gray

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Usar py (Python Launcher) que es más confiable en Windows
if (-not (Get-Command py -ErrorAction SilentlyContinue)) {
    Write-Error "Python no está instalado. Instálalo y vuelve a ejecutar."
    exit 1
}

Push-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)

# 1) Crear venv si no existe
if (-not (Test-Path ".venv")) {
    Write-Host "Creando .venv..." -ForegroundColor Cyan
    py -m venv .venv
}

# 2) Activar venv
Write-Host "Activando .venv..." -ForegroundColor Cyan
. .\.venv\Scripts\Activate.ps1

# 3) Actualizar pip y herramientas básicas
Write-Host "Actualizando pip..." -ForegroundColor Cyan
py -m pip install --upgrade pip setuptools wheel

# 4) Instalar dependencias completas para el middleware INIA
Write-Host "Instalando dependencias desde requirements.txt..." -ForegroundColor Cyan
if (Test-Path "requirements.txt") {
    pip install -r requirements.txt
    Write-Host "✓ Dependencias instaladas desde requirements.txt" -ForegroundColor Green
} else {
    Write-Host "⚠ requirements.txt no encontrado, instalando dependencias individualmente..." -ForegroundColor Yellow
    Write-Host "Instalando dependencias principales..." -ForegroundColor Cyan
    pip install SQLAlchemy psycopg2-binary

    Write-Host "Instalando dependencias para FastAPI..." -ForegroundColor Cyan
    pip install fastapi uvicorn python-multipart

    Write-Host "Instalando dependencias para Excel..." -ForegroundColor Cyan
    pip install openpyxl

    Write-Host "Instalando dependencias adicionales..." -ForegroundColor Cyan
    pip install pydantic
}

# 5) Verificación completa de dependencias
Write-Host "Verificando importaciones..." -ForegroundColor Cyan
$testCode = @"
import importlib, sys
mods = [
    "sqlalchemy", "psycopg2", 
    "fastapi", "uvicorn", "openpyxl", "pydantic"
]
for m in mods:
    try:
        importlib.import_module(m)
        print(f"✓ {m} - OK")
    except ImportError as e:
        print(f"✗ {m} - ERROR: {e}")
        sys.exit(1)
print("✓ Todas las dependencias instaladas correctamente")
"@
$testCode | py
if ($LASTEXITCODE -ne 0) { 
    Write-Error "Error en la verificación de dependencias"
    exit 1 
}

# 6) Prueba rápida de los scripts del middleware
Write-Host "Probando scripts del middleware..." -ForegroundColor Cyan
$testScript = @"
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    # Probar importación de MassiveInsertFiles
    from MassiveInsertFiles import build_connection_string, create_engine
    print("✓ MassiveInsertFiles.py se puede importar correctamente")
    
    # Probar importación de ExportExcel
    from ExportExcel import export_selected_tables, MODELS
    print("✓ ExportExcel.py se puede importar correctamente")
    
    # Probar importación de ImportExcel
    from ImportExcel import import_one_file, MODELS as IMPORT_MODELS
    print("✓ ImportExcel.py se puede importar correctamente")
    
    # Probar importación de http_server
    from http_server import app
    print("✓ http_server.py se puede importar correctamente")
    
    # Probar la conexión a la base de datos
    try:
        connection_string = build_connection_string()
        engine = create_engine(connection_string)
        print("✓ Conexión a la base de datos exitosa")
    except Exception as e:
        print(f"⚠ Advertencia: No se pudo conectar a la base de datos: {e}")
        print("  Asegúrate de que PostgreSQL esté ejecutándose y la base de datos 'Inia' exista")
    
except Exception as e:
    print(f"✗ Error importando scripts del middleware: {e}")
    sys.exit(1)
"@

$testScript | py
if ($LASTEXITCODE -ne 0) { 
    Write-Warning "Los scripts del middleware tienen problemas, pero las dependencias están instaladas"
}

Write-Host "`n=== SETUP COMPLETADO ===" -ForegroundColor Green
Write-Host "Para usar el middleware:" -ForegroundColor Yellow
Write-Host "1. Activa el entorno: .\.venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "2. Inserción masiva: python .\MassiveInsertFiles.py" -ForegroundColor White
Write-Host "3. Exportar datos: python .\ExportExcel.py --tables lote,recibo --format xlsx" -ForegroundColor White
Write-Host "4. Importar datos: python .\ImportExcel.py --file datos.xlsx --table lote" -ForegroundColor White
Write-Host "5. Servidor API: python .\http_server.py" -ForegroundColor White
Write-Host "6. Endpoints disponibles:" -ForegroundColor White
Write-Host "   - POST /insertar (inserción masiva)" -ForegroundColor Gray
Write-Host "   - POST /exportar (exportar tablas)" -ForegroundColor Gray
Write-Host "   - POST /importar (importar archivos)" -ForegroundColor Gray

Pop-Location


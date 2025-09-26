Write-Host "==> Setup simple del middleware (KISS)" -ForegroundColor Cyan

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

# 4) Instalar dependencias mínimas
Write-Host "Instalando dependencias..." -ForegroundColor Cyan
pip install SQLAlchemy psycopg2-binary Faker pandas

# 5) Verificación simple
Write-Host "Verificando importaciones..." -ForegroundColor Cyan
$testCode = @"
import importlib, sys
mods = ["sqlalchemy", "psycopg2", "faker", "pandas"]
for m in mods:
    importlib.import_module(m)
print("OK")
"@
$testCode | py
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "Listo. Activa el entorno con:" -ForegroundColor Green
Write-Host ".\.venv\Scripts\Activate.ps1" -ForegroundColor Yellow
Write-Host "Y ejecuta: python .\InsertTablesHere.py --rows 5000" -ForegroundColor Yellow

Pop-Location


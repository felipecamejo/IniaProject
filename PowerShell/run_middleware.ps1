# Script para ejecutar el middleware INIA
# Uso: .\run_middleware.ps1 [comando] [opciones]

param(
    [Parameter(Position=0)]
    [ValidateSet("insert", "export", "import", "server", "test", "help")]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [string]$Options = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Obtener directorio del script (PowerShell/)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Navegar a la raíz del proyecto (un nivel arriba)
$projectRoot = Split-Path -Parent $scriptDir
Set-Location $projectRoot

# Navegar al directorio middleware
Push-Location "middleware"

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "MassiveInsertFiles.py")) {
    Write-Error "No se encontró MassiveInsertFiles.py en el directorio middleware/"
    Pop-Location
    exit 1
}

# Activar entorno virtual si existe
if (Test-Path ".venv\Scripts\Activate.ps1") {
    Write-Host "Activando entorno virtual..." -ForegroundColor Cyan
    . .\.venv\Scripts\Activate.ps1
} else {
    Write-Warning "No se encontró entorno virtual. Asegúrate de ejecutar SetupMiddleware.ps1 primero."
}

switch ($Command) {
    "insert" {
        Write-Host "Ejecutando inserción masiva de datos..." -ForegroundColor Green
        python MassiveInsertFiles.py
    }
    
    "export" {
        if ($Options) {
            Write-Host "Exportando datos con opciones: $Options" -ForegroundColor Green
            python ExportExcel.py $Options
        } else {
            Write-Host "Exportando todas las tablas a Excel..." -ForegroundColor Green
            python ExportExcel.py --format xlsx
        }
    }
    
    "import" {
        if ($Options) {
            Write-Host "Importando datos con opciones: $Options" -ForegroundColor Green
            python ImportExcel.py $Options
        } else {
            Write-Host "Uso: .\run_middleware.ps1 import --file archivo.xlsx --table lote" -ForegroundColor Yellow
        }
    }
    
    "server" {
        Write-Host "Iniciando servidor API en puerto 9099..." -ForegroundColor Green
        Write-Host "Endpoints disponibles:" -ForegroundColor Yellow
        Write-Host "  POST /insertar - Inserción masiva" -ForegroundColor White
        Write-Host "  POST /exportar - Exportar tablas" -ForegroundColor White
        Write-Host "  POST /importar - Importar archivos" -ForegroundColor White
        Write-Host "  http://localhost:9099/docs - Documentación interactiva" -ForegroundColor White
        python http_server.py
    }
    
    "test" {
        Write-Host "Ejecutando pruebas del sistema de inserción masiva..." -ForegroundColor Green
        Write-Host "⚠️  ADVERTENCIA: Esto insertará ~35,000 registros para pruebas de laboratorio" -ForegroundColor Yellow
        $confirm = Read-Host "¿Continuar? (s/N)"
        if ($confirm -eq "s" -or $confirm -eq "S" -or $confirm -eq "si" -or $confirm -eq "Si") {
            python test_massive_insert.py
        } else {
            Write-Host "Prueba cancelada por el usuario" -ForegroundColor Yellow
        }
    }
    
    "help" {
        Write-Host "=== MIDDLEWARE INIA - COMANDOS DISPONIBLES ===" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Uso: .\run_middleware.ps1 [comando] [opciones]" -ForegroundColor White
        Write-Host ""
        Write-Host "Comandos:" -ForegroundColor Yellow
        Write-Host "  insert                    - Ejecutar inserción masiva de datos" -ForegroundColor White
        Write-Host "  export [opciones]         - Exportar tablas a Excel/CSV" -ForegroundColor White
        Write-Host "  import [opciones]         - Importar datos desde archivos" -ForegroundColor White
        Write-Host "  server                    - Iniciar servidor API FastAPI" -ForegroundColor White
        Write-Host "  test                      - Ejecutar pruebas de inserción masiva (35K registros)" -ForegroundColor White
        Write-Host "  help                      - Mostrar esta ayuda" -ForegroundColor White
        Write-Host ""
        Write-Host "Ejemplos:" -ForegroundColor Yellow
        Write-Host "  .\run_middleware.ps1 insert" -ForegroundColor Gray
        Write-Host "  .\run_middleware.ps1 export --tables lote,recibo --format xlsx" -ForegroundColor Gray
        Write-Host "  .\run_middleware.ps1 import --file datos.xlsx --table lote" -ForegroundColor Gray
        Write-Host "  .\run_middleware.ps1 server" -ForegroundColor Gray
        Write-Host "  .\run_middleware.ps1 test" -ForegroundColor Gray
    }
}

# Restaurar directorio original
Pop-Location

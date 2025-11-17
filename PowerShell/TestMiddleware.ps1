# Script para probar el middleware FastAPI
# Inicia el servidor, espera a que esté listo, ejecuta las pruebas y luego detiene el servidor

param(
    [switch]$KeepServerRunning = $false
)

$ErrorActionPreference = "Stop"

# Colores
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Info "=========================================="
Write-Info "  PRUEBAS DE MIDDLEWARE FASTAPI - INIA"
Write-Info "=========================================="
Write-Host ""

# Obtener directorio del script
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$MiddlewareDir = Join-Path $ProjectRoot "middleware"

# Verificar que existe el directorio middleware
if (-not (Test-Path $MiddlewareDir)) {
    Write-Error "No se encuentra el directorio middleware: $MiddlewareDir"
    exit 1
}

# Verificar que existe http_server.py
$ServerScript = Join-Path $MiddlewareDir "http_server.py"
if (-not (Test-Path $ServerScript)) {
    Write-Error "No se encuentra http_server.py: $ServerScript"
    exit 1
}

# Verificar que existe test_middleware.py
$TestScript = Join-Path $MiddlewareDir "test_middleware.py"
if (-not (Test-Path $TestScript)) {
    Write-Error "No se encuentra test_middleware.py: $TestScript"
    exit 1
}

Write-Info "Verificando si el servidor ya está corriendo..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9099/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Warning "El servidor ya está corriendo en el puerto 9099"
        Write-Info "Ejecutando pruebas directamente..."
        Set-Location $MiddlewareDir
        python test_middleware.py
        exit $LASTEXITCODE
    }
} catch {
    Write-Info "Servidor no está corriendo, iniciando..."
}

# Función para verificar si el servidor está listo
function Test-ServerReady {
    $maxAttempts = 30
    $attempt = 0
    
    while ($attempt -lt $maxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:9099/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                return $true
            }
        } catch {
            # Servidor aún no está listo
        }
        
        $attempt++
        Start-Sleep -Seconds 1
        Write-Host "." -NoNewline
    }
    
    Write-Host ""
    return $false
}

# Iniciar servidor en segundo plano
Write-Info "Iniciando servidor FastAPI..."
$serverJob = Start-Job -ScriptBlock {
    param($MiddlewareDir)
    Set-Location $MiddlewareDir
    python http_server.py
} -ArgumentList $MiddlewareDir

Write-Info "Esperando a que el servidor esté listo..."
if (Test-ServerReady) {
    Write-Success "Servidor iniciado correctamente!"
    Write-Host ""
    
    # Ejecutar pruebas
    Write-Info "Ejecutando pruebas del middleware..."
    Write-Host ""
    Set-Location $MiddlewareDir
    python test_middleware.py
    $testExitCode = $LASTEXITCODE
    
    Write-Host ""
    
    # Detener servidor si no se debe mantener corriendo
    if (-not $KeepServerRunning) {
        Write-Info "Deteniendo servidor..."
        Stop-Job $serverJob -ErrorAction SilentlyContinue
        Remove-Job $serverJob -Force -ErrorAction SilentlyContinue
        
        # Esperar un momento para que el puerto se libere
        Start-Sleep -Seconds 2
        
        Write-Success "Servidor detenido"
    } else {
        Write-Warning "Servidor sigue corriendo (usar -KeepServerRunning para mantenerlo activo)"
        Write-Info "Para detenerlo manualmente, usa: Get-Job | Stop-Job; Get-Job | Remove-Job"
    }
    
    exit $testExitCode
} else {
    Write-Error "El servidor no se inició correctamente después de 30 segundos"
    Stop-Job $serverJob -ErrorAction SilentlyContinue
    Remove-Job $serverJob -Force -ErrorAction SilentlyContinue
    exit 1
}


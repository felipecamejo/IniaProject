# Script de PowerShell para iniciar los servicios Docker
# Uso: .\docker-scripts\start.ps1 [opciones]

param(
    [switch]$Detached = $true,
    [switch]$Build = $false,
    [switch]$Force = $false,
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "=== Script de Inicio Docker para INIA ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Uso: .\docker-scripts\start.ps1 [opciones]"
    Write-Host ""
    Write-Host "Opciones:"
    Write-Host "  -Detached  - Ejecutar en segundo plano (por defecto)"
    Write-Host "  -Build     - Construir antes de iniciar"
    Write-Host "  -Force     - Forzar recreación de contenedores"
    Write-Host "  -Help      - Mostrar esta ayuda"
    Write-Host ""
    Write-Host "Ejemplos:"
    Write-Host "  .\docker-scripts\start.ps1"
    Write-Host "  .\docker-scripts\start.ps1 -Build"
    Write-Host "  .\docker-scripts\start.ps1 -Force"
    Write-Host "  .\docker-scripts\start.ps1 -Detached:$false  # Ver logs en tiempo real"
    exit 0
}

Write-Host "=== Iniciando Servicios Docker para INIA ===" -ForegroundColor Green
Write-Host "En segundo plano: $Detached" -ForegroundColor Yellow
Write-Host "Construir antes: $Build" -ForegroundColor Yellow
Write-Host "Forzar recreación: $Force" -ForegroundColor Yellow
Write-Host ""

# Verificar que Docker esté ejecutándose
try {
    docker version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker no está ejecutándose"
    }
} catch {
    Write-Host "Error: Docker no está ejecutándose o no está instalado" -ForegroundColor Red
    exit 1
}

# Verificar si ya hay contenedores ejecutándose
$runningContainers = docker-compose ps --services --filter "status=running"
if ($runningContainers -and -not $Force) {
    Write-Host "Advertencia: Ya hay servicios ejecutándose:" -ForegroundColor Yellow
    $runningContainers | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    Write-Host ""
    $response = Read-Host "¿Deseas detener los servicios existentes y continuar? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "Operación cancelada" -ForegroundColor Yellow
        exit 0
    }
}

# Detener servicios existentes si es necesario
if ($Force -or $runningContainers) {
    Write-Host "Deteniendo servicios existentes..." -ForegroundColor Cyan
    docker-compose down
}

# Construir si es necesario
if ($Build) {
    Write-Host "Construyendo servicios..." -ForegroundColor Cyan
    docker-compose build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error construyendo los servicios" -ForegroundColor Red
        exit 1
    }
}

# Iniciar servicios
Write-Host "Iniciando servicios..." -ForegroundColor Cyan

$startArgs = @("up")
if ($Detached) {
    $startArgs += "-d"
}
if ($Force) {
    $startArgs += "--force-recreate"
}

& docker-compose @startArgs

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== Servicios Iniciados Exitosamente ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Acceso a la aplicación:" -ForegroundColor Yellow
    Write-Host "  Frontend:    http://localhost" -ForegroundColor White
    Write-Host "  Backend API: http://localhost:8080/Inia" -ForegroundColor White
    Write-Host "  Middleware:  http://localhost:9099" -ForegroundColor White
    Write-Host "  Base datos:  localhost:5432" -ForegroundColor White
    Write-Host ""
    
    if ($Detached) {
        Write-Host "Comandos útiles:" -ForegroundColor Yellow
        Write-Host "  Ver logs:     .\docker-scripts\logs.ps1" -ForegroundColor White
        Write-Host "  Ver estado:   .\docker-scripts\status.ps1" -ForegroundColor White
        Write-Host "  Detener:      .\docker-scripts\stop.ps1" -ForegroundColor White
    }
} else {
    Write-Host "Error iniciando los servicios" -ForegroundColor Red
    exit 1
}

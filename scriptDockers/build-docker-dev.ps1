# Script para construir imágenes Docker - Modo Desarrollo
# Ubicación: IniaProject/scriptDockers/build-docker-dev.ps1
# Uso: .\scriptDockers\build-docker-dev.ps1 [--no-cache]

param(
    [switch]$NoCache = $false,
    [string]$Service = "",
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "Uso: .\scriptDockers\build-docker-dev.ps1 [opciones]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor Yellow
    Write-Host "  -NoCache          Reconstruir sin usar cache" -ForegroundColor White
    Write-Host "  -Service <nombre> Construir solo un servicio (backend, frontend, middleware)" -ForegroundColor White
    Write-Host "  -Help             Mostrar esta ayuda" -ForegroundColor White
    Write-Host ""
    Write-Host "Ejemplos:" -ForegroundColor Yellow
    Write-Host "  .\scriptDockers\build-docker-dev.ps1" -ForegroundColor Gray
    Write-Host "  .\scriptDockers\build-docker-dev.ps1 -NoCache" -ForegroundColor Gray
    Write-Host "  .\scriptDockers\build-docker-dev.ps1 -Service frontend" -ForegroundColor Gray
    Write-Host ""
    exit 0
}

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Construir Imagenes - Desarrollo" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Función para verificar Docker
function Test-DockerRunning {
    try {
        $null = docker version 2>&1
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

# Verificar Docker Desktop
if (-not (Test-DockerRunning)) {
    Write-Host "ERROR: Docker Desktop no esta ejecutandose" -ForegroundColor Red
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "Docker Desktop esta ejecutandose" -ForegroundColor Green
Write-Host ""

# Navegar al directorio raíz del proyecto
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot
Write-Host "Directorio: $projectRoot" -ForegroundColor Yellow
Write-Host ""

# Construir comando
$composeFile = "-f docker-compose.dev.yml"
$buildCommand = "docker compose $composeFile build"

if ($NoCache) {
    $buildCommand += " --no-cache"
    Write-Host "Modo: Reconstruccion completa (sin cache)" -ForegroundColor Yellow
} else {
    Write-Host "Modo: Construccion con cache" -ForegroundColor Yellow
}

if (-not [string]::IsNullOrWhiteSpace($Service)) {
    $buildCommand += " $Service"
    Write-Host "Servicio: $Service" -ForegroundColor Cyan
} else {
    Write-Host "Servicios: Todos (backend, frontend, middleware)" -ForegroundColor Cyan
}

Write-Host ""

# Mostrar tamaño de imágenes antes
Write-Host "Imagenes existentes:" -ForegroundColor Yellow
docker images --filter "reference=*inia*" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" 2>$null
Write-Host ""

# Construir
Write-Host "Iniciando construccion..." -ForegroundColor Yellow
Write-Host "Esto puede tardar varios minutos..." -ForegroundColor Gray
Write-Host ""

$startTime = Get-Date
Invoke-Expression $buildCommand
$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ""

if ($LASTEXITCODE -eq 0) {
    Write-Host "Construccion completada exitosamente" -ForegroundColor Green
    Write-Host "Tiempo transcurrido: $($duration.ToString('mm\:ss'))" -ForegroundColor Gray
    Write-Host ""
    
    # Mostrar tamaño de imágenes después
    Write-Host "Imagenes construidas:" -ForegroundColor Yellow
    docker images --filter "reference=*inia*" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" 2>$null
    Write-Host ""
    
    Write-Host "Para iniciar los servicios:" -ForegroundColor Cyan
    Write-Host "  .\scriptDockers\iniciar-docker-dev.ps1" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "ERROR: La construccion fallo" -ForegroundColor Red
    Write-Host "Revisa los mensajes de error arriba" -ForegroundColor Yellow
    Write-Host ""
}

Read-Host "Presiona Enter para salir"


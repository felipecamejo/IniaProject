# Script de PowerShell para ver el estado de los servicios Docker
# Uso: .\docker-scripts\status.ps1 [opciones]

param(
    [switch]$Detailed = $false,
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "=== Script de Estado Docker para INIA ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Uso: .\docker-scripts\status.ps1 [opciones]"
    Write-Host ""
    Write-Host "Opciones:"
    Write-Host "  -Detailed  - Mostrar información detallada"
    Write-Host "  -Help      - Mostrar esta ayuda"
    Write-Host ""
    Write-Host "Ejemplos:"
    Write-Host "  .\docker-scripts\status.ps1"
    Write-Host "  .\docker-scripts\status.ps1 -Detailed"
    exit 0
}

Write-Host "=== Estado de Servicios Docker para INIA ===" -ForegroundColor Green
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

# Obtener estado de los servicios
Write-Host "Estado de los servicios:" -ForegroundColor Cyan
Write-Host ""

$services = @("database", "backend", "middleware", "frontend")
$allRunning = $true

foreach ($service in $services) {
    $status = docker-compose ps $service --format "table {{.Service}}\t{{.State}}\t{{.Ports}}"
    $lines = $status -split "`n"
    
    if ($lines.Count -gt 1) {
        $serviceInfo = $lines[1] -split "`t"
        $serviceName = $serviceInfo[0]
        $serviceState = $serviceInfo[1]
        $servicePorts = $serviceInfo[2]
        
        # Determinar color según el estado
        $color = switch ($serviceState.ToLower()) {
            "running" { "Green" }
            "exited" { "Red" }
            "restarting" { "Yellow" }
            default { "White" }
        }
        
        Write-Host "  $serviceName" -ForegroundColor White -NoNewline
        Write-Host " - " -ForegroundColor Gray -NoNewline
        Write-Host $serviceState -ForegroundColor $color -NoNewline
        Write-Host " - $servicePorts" -ForegroundColor Gray
        
        if ($serviceState.ToLower() -ne "running") {
            $allRunning = $false
        }
    } else {
        Write-Host "  $service" -ForegroundColor White -NoNewline
        Write-Host " - " -ForegroundColor Gray -NoNewline
        Write-Host "No encontrado" -ForegroundColor Red
        $allRunning = $false
    }
}

Write-Host ""

# Mostrar resumen
if ($allRunning) {
    Write-Host "✓ Todos los servicios están ejecutándose correctamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Acceso a la aplicación:" -ForegroundColor Yellow
    Write-Host "  Frontend:    http://localhost" -ForegroundColor White
    Write-Host "  Backend API: http://localhost:8080/Inia" -ForegroundColor White
    Write-Host "  Middleware:  http://localhost:9099" -ForegroundColor White
    Write-Host "  Base datos:  localhost:5432" -ForegroundColor White
} else {
    Write-Host "⚠️  Algunos servicios no están ejecutándose" -ForegroundColor Yellow
    Write-Host "   Para iniciar los servicios, usa: .\docker-scripts\start.ps1" -ForegroundColor Yellow
}

# Información detallada si se solicita
if ($Detailed) {
    Write-Host ""
    Write-Host "=== Información Detallada ===" -ForegroundColor Cyan
    
    # Información de contenedores
    Write-Host ""
    Write-Host "Contenedores:" -ForegroundColor Yellow
    docker-compose ps
    
    # Información de volúmenes
    Write-Host ""
    Write-Host "Volúmenes:" -ForegroundColor Yellow
    docker volume ls --filter "name=iniaproject"
    
    # Información de red
    Write-Host ""
    Write-Host "Red:" -ForegroundColor Yellow
    docker network ls --filter "name=inia"
    
    # Uso de recursos
    Write-Host ""
    Write-Host "Uso de recursos:" -ForegroundColor Yellow
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
}

Write-Host ""
Write-Host "Comandos útiles:" -ForegroundColor Yellow
Write-Host "  Ver logs:     .\docker-scripts\logs.ps1" -ForegroundColor White
Write-Host "  Detener:      .\docker-scripts\stop.ps1" -ForegroundColor White
Write-Host "  Reiniciar:    .\docker-scripts\restart.ps1" -ForegroundColor White

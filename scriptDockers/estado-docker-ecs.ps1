# Script para verificar estado de servicios Docker - Modo Testing ECS
# Ubicación: IniaProject/scriptDockers/estado-docker-ecs.ps1
# Uso: .\scriptDockers\estado-docker-ecs.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Estado INIA - Testing ECS      " -ForegroundColor Cyan
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

# Navegar al directorio raíz del proyecto
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "Estado de contenedores:" -ForegroundColor Yellow
Write-Host ""
docker compose -f docker-compose.ecs.yml --env-file .env ps
Write-Host ""

# Verificar healthchecks
Write-Host "Verificando healthchecks..." -ForegroundColor Yellow
Write-Host ""

$services = @("backend", "frontend", "middleware", "database")
$allHealthy = $true

foreach ($service in $services) {
    $containerName = "inia-$service-ecs"
    $containerInfo = docker inspect $containerName --format '{{.State.Health.Status}}' 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        if ($containerInfo -eq "healthy") {
            Write-Host "  $service : OK (healthy)" -ForegroundColor Green
        } elseif ($containerInfo -eq "starting") {
            Write-Host "  $service : Iniciando..." -ForegroundColor Yellow
            $allHealthy = $false
        } elseif ($containerInfo -eq "unhealthy") {
            Write-Host "  $service : ERROR (unhealthy)" -ForegroundColor Red
            $allHealthy = $false
        } else {
            Write-Host "  $service : $containerInfo" -ForegroundColor Gray
        }
    } else {
        Write-Host "  $service : No encontrado" -ForegroundColor Red
        $allHealthy = $false
    }
}

Write-Host ""

# Verificar conectividad HTTP
Write-Host "Verificando conectividad HTTP..." -ForegroundColor Yellow
Write-Host ""

# Backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/Inia/actuator/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "  Backend (8080) : OK" -ForegroundColor Green
    } else {
        Write-Host "  Backend (8080) : Respuesta $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  Backend (8080) : No disponible" -ForegroundColor Red
}

# Middleware
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9099/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "  Middleware (9099) : OK" -ForegroundColor Green
    } else {
        Write-Host "  Middleware (9099) : Respuesta $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  Middleware (9099) : No disponible" -ForegroundColor Red
}

# Frontend (puerto 80)
try {
    $response = Invoke-WebRequest -Uri "http://localhost/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "  Frontend (80) : OK" -ForegroundColor Green
    } else {
        Write-Host "  Frontend (80) : Respuesta $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  Frontend (80) : No disponible" -ForegroundColor Red
}

Write-Host ""

# Mostrar uso de recursos
Write-Host "Uso de recursos:" -ForegroundColor Yellow
Write-Host ""
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" $(docker compose -f docker-compose.ecs.yml --env-file .env ps -q) 2>$null
Write-Host ""

# Mostrar puertos expuestos
Write-Host "Puertos expuestos (Testing ECS):" -ForegroundColor Yellow
Write-Host "  Frontend:     http://localhost (puerto 80, Nginx)" -ForegroundColor White
Write-Host "  Backend:      http://localhost:8080/Inia" -ForegroundColor White
Write-Host "  Swagger:      http://localhost:8080/swagger-ui/index.html" -ForegroundColor White
Write-Host "  Middleware:   http://localhost:9099" -ForegroundColor White
Write-Host "  Middleware Docs: http://localhost:9099/docs" -ForegroundColor White
Write-Host "  Database:     localhost:5432" -ForegroundColor White
Write-Host ""

# Mostrar configuración actual
Write-Host "Configuracion actual (desde .env):" -ForegroundColor Yellow
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "MIDDLEWARE_UVICORN_WORKERS=(\d+)") {
        Write-Host "  Workers:      $($matches[1])" -ForegroundColor White
    }
    if ($envContent -match "MIDDLEWARE_DB_POOL_SIZE=(\d+)") {
        Write-Host "  DB Pool:      $($matches[1])" -ForegroundColor White
    }
    Write-Host "  (Ver .env para configuracion completa)" -ForegroundColor Gray
} else {
    Write-Host "  .env no encontrado" -ForegroundColor Red
}
Write-Host ""

# Resumen
if ($allHealthy) {
    Write-Host "Estado general: OK" -ForegroundColor Green
} else {
    Write-Host "Estado general: Algunos servicios tienen problemas" -ForegroundColor Yellow
    Write-Host "Revisa los logs con: .\scriptDockers\logs-docker-ecs.ps1" -ForegroundColor Yellow
}

Write-Host ""

Read-Host "Presiona Enter para salir"

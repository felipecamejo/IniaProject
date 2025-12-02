# Script para iniciar INIA con Docker - Modo Desarrollo
# Ubicación: IniaProject/scriptDockers/iniciar-docker-dev.ps1
# Uso: .\scriptDockers\iniciar-docker-dev.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Iniciando INIA - Desarrollo    " -ForegroundColor Cyan
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

# Función para verificar si el puerto está en uso
function Test-PortInUse {
    param([int]$Port)
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        return $null -ne $connections
    } catch {
        $result = netstat -ano | Select-String ":$Port\s+LISTENING"
        return $null -ne $result
    }
}

# Función para detener PostgreSQL local
function Stop-LocalPostgreSQL {
    Write-Host "Detectado PostgreSQL local corriendo..." -ForegroundColor Yellow
    
    $postgresServices = Get-Service -Name "*postgres*" -ErrorAction SilentlyContinue
    if ($postgresServices) {
        foreach ($service in $postgresServices) {
            if ($service.Status -eq 'Running') {
                Write-Host "  Deteniendo servicio: $($service.Name)..." -ForegroundColor Yellow
                try {
                    Stop-Service -Name $service.Name -Force -ErrorAction Stop
                    Write-Host "  OK Servicio $($service.Name) detenido" -ForegroundColor Green
                }
                catch {
                    Write-Host "  ADVERTENCIA: No se pudo detener el servicio $($service.Name) automáticamente" -ForegroundColor Yellow
                    Write-Host "    Necesitas ejecutar PowerShell como Administrador para detenerlo" -ForegroundColor Yellow
                    return $false
                }
            }
        }
    }
    
    Start-Sleep -Seconds 2
    if (-not (Test-PortInUse -Port 5432)) {
        Write-Host "OK Puerto 5432 liberado" -ForegroundColor Green
        return $true
    }
    else {
        Write-Host "ADVERTENCIA: El puerto 5432 aun esta en uso" -ForegroundColor Yellow
        return $false
    }
}

# Verificar Docker Desktop
Write-Host "[1/5] Verificando Docker Desktop..." -ForegroundColor Yellow

if (-not (Test-DockerRunning)) {
    Write-Host "Docker Desktop no esta ejecutandose." -ForegroundColor Red
    Write-Host ""
    
    $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerPath) {
        Write-Host "Intentando iniciar Docker Desktop..." -ForegroundColor Yellow
        Start-Process $dockerPath
        Write-Host "Esperando a que Docker Desktop inicie..." -ForegroundColor Yellow
        
        $maxRetries = 30
        $retryCount = 0
        $started = $false
        
        while ($retryCount -lt $maxRetries) {
            Start-Sleep -Seconds 2
            $retryCount++
            
            if (Test-DockerRunning) {
                $started = $true
                break
            }
            
            if ($retryCount % 5 -eq 0) {
                Write-Host "  Esperando... ($($retryCount * 2) segundos)" -ForegroundColor Gray
            }
        }
        
        if (-not $started) {
            Write-Host ""
            Write-Host "ERROR: Docker Desktop no pudo iniciarse despues de 60 segundos" -ForegroundColor Red
            Write-Host "Por favor, inicia Docker Desktop manualmente y vuelve a intentar" -ForegroundColor Yellow
            Write-Host ""
            Read-Host "Presiona Enter para salir"
            exit 1
        }
    } else {
        Write-Host "ERROR: Docker Desktop no esta instalado" -ForegroundColor Red
        Write-Host "Descargalo desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Presiona Enter para salir"
        exit 1
    }
}

Write-Host "Docker Desktop esta ejecutandose correctamente" -ForegroundColor Green

# Verificar puertos de desarrollo
Write-Host ""
Write-Host "[2/5] Verificando puertos..." -ForegroundColor Yellow

$portsToCheck = @(5432, 4200, 8080, 9099)
$portsInUse = @()

foreach ($port in $portsToCheck) {
    if (Test-PortInUse -Port $port) {
        if ($port -eq 5432) {
            $postgresProcess = Get-Process -Name "postgres" -ErrorAction SilentlyContinue
            $postgresService = Get-Service -Name "*postgres*" -ErrorAction SilentlyContinue | Where-Object { $_.Status -eq 'Running' }
            
            if ($postgresProcess -or $postgresService) {
                if (-not (Stop-LocalPostgreSQL)) {
                    Write-Host ""
                    Write-Host "ERROR: No se pudo liberar el puerto 5432" -ForegroundColor Red
                    Write-Host ""
                    Read-Host "Presiona Enter para salir"
                    exit 1
                }
            } else {
                Write-Host "ADVERTENCIA: El puerto $port esta en uso por otro proceso" -ForegroundColor Yellow
                $portsInUse += $port
            }
        } else {
            Write-Host "ADVERTENCIA: El puerto $port esta en uso" -ForegroundColor Yellow
            $portsInUse += $port
        }
    }
}

if ($portsInUse.Count -gt 0) {
    Write-Host ""
    Write-Host "Puertos en uso: $($portsInUse -join ', ')" -ForegroundColor Yellow
    Write-Host "Puede que los servicios ya esten corriendo" -ForegroundColor Yellow
    Write-Host ""
}

# Navegar al directorio raíz del proyecto
Write-Host ""
Write-Host "[3/5] Navegando al directorio del proyecto..." -ForegroundColor Yellow
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot
Write-Host "Directorio: $projectRoot" -ForegroundColor Green

# Detener servicios anteriores (si existen)
Write-Host ""
Write-Host "[4/5] Verificando servicios existentes..." -ForegroundColor Yellow
$existingContainers = docker compose -f docker-compose.dev.yml ps -q
if ($existingContainers) {
    Write-Host "Deteniendo servicios anteriores..." -ForegroundColor Yellow
    docker compose -f docker-compose.dev.yml down
}

# Levantar servicios
Write-Host ""
Write-Host "[5/5] Levantando servicios con Docker Compose (desarrollo)..." -ForegroundColor Yellow
docker compose -f docker-compose.dev.yml up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "  Servicios iniciados con exito  " -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Estado de los servicios:" -ForegroundColor Cyan
    docker compose -f docker-compose.dev.yml ps
    Write-Host ""
    
    Write-Host "Esperando a que los servicios esten listos..." -ForegroundColor Yellow
    
    $maxWait = 180
    $waited = 0
    $backendReady = $false
    $middlewareReady = $false
    $frontendReady = $false
    
    while ($waited -lt $maxWait) {
        Start-Sleep -Seconds 5
        $waited += 5
        
        if (-not $backendReady) {
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:8080/Inia/actuator/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200) {
                    $backendReady = $true
                    Write-Host "OK Backend listo!" -ForegroundColor Green
                }
            } catch {
            }
        }
        
        if (-not $middlewareReady) {
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:9099/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200) {
                    $middlewareReady = $true
                    Write-Host "OK Middleware listo!" -ForegroundColor Green
                }
            } catch {
            }
        }
        
        if (-not $frontendReady) {
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:4200" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 304) {
                    $frontendReady = $true
                    Write-Host "OK Frontend listo! (puerto 4200 - modo desarrollo)" -ForegroundColor Green
                }
            } catch {
            }
        }
        
        if ($backendReady -and $middlewareReady -and $frontendReady) {
            break
        }
        
        if ($waited % 15 -eq 0) {
            $status = "Backend: " + $(if ($backendReady) { "OK" } else { "..." }) + " | Middleware: " + $(if ($middlewareReady) { "OK" } else { "..." }) + " | Frontend: " + $(if ($frontendReady) { "OK" } else { "..." })
            Write-Host "  Esperando... ($waited segundos) - $status" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Write-Host "URLs disponibles (Modo Desarrollo):" -ForegroundColor Cyan
    Write-Host "  Frontend:     http://localhost:4200 (ng serve con hot reload)" -ForegroundColor White
    Write-Host "  Backend API:  http://localhost:8080/Inia" -ForegroundColor White
    Write-Host "  Swagger UI:   http://localhost:8080/swagger-ui/index.html" -ForegroundColor White
    Write-Host "  Middleware:   http://localhost:9099" -ForegroundColor White
    Write-Host "  Middleware Docs: http://localhost:9099/docs" -ForegroundColor White
    Write-Host ""
    Write-Host "Credenciales de acceso:" -ForegroundColor Cyan
    Write-Host "  Email:        admin@inia.com" -ForegroundColor White
    Write-Host "  Password:     password123" -ForegroundColor White
    Write-Host ""
    Write-Host "NOTA: Modo desarrollo con hot reload activado" -ForegroundColor Yellow
    Write-Host "  - Cambios en frontend/src se reflejan automaticamente" -ForegroundColor Gray
    Write-Host "  - Cambios en middleware se reflejan automaticamente" -ForegroundColor Gray
    Write-Host ""
    
    # Abrir navegador automáticamente
    Write-Host "Abriendo navegador automaticamente..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    try {
        Start-Process "http://localhost:4200"
        Write-Host "OK Frontend abierto en el navegador: http://localhost:4200" -ForegroundColor Green
    } catch {
        Write-Host "ADVERTENCIA: No se pudo abrir el Frontend automaticamente" -ForegroundColor Yellow
        Write-Host "  Abre manualmente: http://localhost:4200" -ForegroundColor White
    }
    
    Start-Sleep -Seconds 2
    
    if ($backendReady) {
        try {
            Start-Process "http://localhost:8080/swagger-ui/index.html"
            Write-Host "OK Swagger UI abierto en el navegador" -ForegroundColor Green
        } catch {
            Write-Host "ADVERTENCIA: No se pudo abrir Swagger automaticamente" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "Comandos utiles:" -ForegroundColor Yellow
    Write-Host "  Ver logs:     docker compose -f docker-compose.dev.yml logs -f [servicio]" -ForegroundColor White
    Write-Host "  Ver estado:   docker compose -f docker-compose.dev.yml ps" -ForegroundColor White
    Write-Host "  Detener:      .\scriptDockers\detener-docker-dev.ps1" -ForegroundColor White
    Write-Host "  Ver logs todos: docker compose -f docker-compose.dev.yml logs -f" -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host ""
    Write-Host "ERROR: Fallo al iniciar los servicios" -ForegroundColor Red
    Write-Host "Revisa los logs con: docker compose -f docker-compose.dev.yml logs" -ForegroundColor Yellow
    Write-Host ""
}

Read-Host "Presiona Enter para salir"


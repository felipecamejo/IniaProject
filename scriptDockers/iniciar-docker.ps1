# Script para iniciar INIA con Docker
# Ubicación: IniaProject/scriptDockers/iniciar-docker.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Iniciando INIA con Docker      " -ForegroundColor Cyan
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
        # Fallback usando netstat
        $result = netstat -ano | Select-String ":$Port\s+LISTENING"
        return $null -ne $result
    }
}

# Función para detener PostgreSQL local
function Stop-LocalPostgreSQL {
    Write-Host "Detectado PostgreSQL local corriendo..." -ForegroundColor Yellow
    
    # Intentar detener servicios de PostgreSQL
    $postgresServices = Get-Service -Name "*postgres*" -ErrorAction SilentlyContinue
    if ($postgresServices) {
        foreach ($service in $postgresServices) {
            if ($service.Status -eq 'Running') {
                Write-Host "  Deteniendo servicio: $($service.Name)..." -ForegroundColor Yellow
                try {
                    Stop-Service -Name $service.Name -Force -ErrorAction Stop
                    Write-Host "  ✓ Servicio $($service.Name) detenido" -ForegroundColor Green
                }
                catch {
                    Write-Host "  ⚠ ADVERTENCIA: No se pudo detener el servicio $($service.Name) automáticamente" -ForegroundColor Yellow
                    Write-Host "    Necesitas ejecutar PowerShell como Administrador para detenerlo" -ForegroundColor Yellow
                    Write-Host "    O detenerlo manualmente desde: Servicios de Windows" -ForegroundColor Yellow
                    return $false
                }
            }
        }
    }
    
    # Verificar si el puerto se liberó
    Start-Sleep -Seconds 2
    if (-not (Test-PortInUse -Port 5432)) {
        Write-Host "✓ Puerto 5432 liberado" -ForegroundColor Green
        return $true
    }
    else {
        Write-Host "⚠ ADVERTENCIA: El puerto 5432 aún está en uso" -ForegroundColor Yellow
        Write-Host "  Puede ser necesario ejecutar este script como Administrador" -ForegroundColor Yellow
        return $false
    }
}

# Verificar Docker Desktop
Write-Host "[1/4] Verificando Docker Desktop..." -ForegroundColor Yellow

if (-not (Test-DockerRunning)) {
    Write-Host "Docker Desktop no está ejecutándose." -ForegroundColor Red
    Write-Host ""
    
    # Verificar si Docker está instalado
    $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerPath) {
        Write-Host "Intentando iniciar Docker Desktop..." -ForegroundColor Yellow
        Start-Process $dockerPath
        Write-Host "Esperando a que Docker Desktop inicie..." -ForegroundColor Yellow
        
        # Reintentar hasta 60 segundos
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
            Write-Host "ERROR: Docker Desktop no pudo iniciarse después de 60 segundos" -ForegroundColor Red
            Write-Host "Por favor, inicia Docker Desktop manualmente y vuelve a intentar" -ForegroundColor Yellow
            Write-Host ""
            Read-Host "Presiona Enter para salir"
            exit 1
        }
    } else {
        Write-Host "ERROR: Docker Desktop no está instalado" -ForegroundColor Red
        Write-Host "Descárgalo desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Presiona Enter para salir"
        exit 1
    }
}

Write-Host "Docker Desktop está ejecutándose correctamente" -ForegroundColor Green

# Verificar puerto 5432
Write-Host ""
Write-Host "[2/5] Verificando puerto 5432..." -ForegroundColor Yellow
if (Test-PortInUse -Port 5432) {
    Write-Host "El puerto 5432 está en uso" -ForegroundColor Yellow
    
    # Verificar si es PostgreSQL local
    $postgresProcess = Get-Process -Name "postgres" -ErrorAction SilentlyContinue
    $postgresService = Get-Service -Name "*postgres*" -ErrorAction SilentlyContinue | Where-Object { $_.Status -eq 'Running' }
    
    if ($postgresProcess -or $postgresService) {
        if (-not (Stop-LocalPostgreSQL)) {
            Write-Host ""
            Write-Host "ERROR: No se pudo liberar el puerto 5432" -ForegroundColor Red
            Write-Host ""
            Write-Host "Solución:" -ForegroundColor Yellow
            Write-Host "  1. Ejecuta PowerShell como Administrador" -ForegroundColor White
            Write-Host "  2. Ejecuta: Stop-Service -Name postgresql-x64-* -Force" -ForegroundColor White
            Write-Host "  3. O detén PostgreSQL desde: Servicios de Windows" -ForegroundColor White
            Write-Host ""
            Read-Host "Presiona Enter para salir"
            exit 1
        }
    } else {
        Write-Host "El puerto 5432 está en uso por otro proceso" -ForegroundColor Red
        Write-Host "Por favor, libera el puerto 5432 antes de continuar" -ForegroundColor Yellow
        Write-Host ""
        Read-Host "Presiona Enter para salir"
        exit 1
    }
} else {
    Write-Host "Puerto 5432 disponible" -ForegroundColor Green
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
$existingContainers = docker compose ps -q
if ($existingContainers) {
    Write-Host "Deteniendo servicios anteriores..." -ForegroundColor Yellow
    docker compose down
}

# Levantar servicios
Write-Host ""
Write-Host "[5/5] Levantando servicios con Docker Compose..." -ForegroundColor Yellow
docker compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "  Servicios iniciados con éxito  " -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    
    # Mostrar estado
    Write-Host "Estado de los servicios:" -ForegroundColor Cyan
    docker compose ps
    
    Write-Host ""
    Write-Host "Esperando a que los servicios estén listos..." -ForegroundColor Yellow
    
    # Esperar a que el backend esté listo (máximo 2 minutos)
    $maxWait = 120
    $waited = 0
    $backendReady = $false
    $frontendReady = $false
    
    Write-Host "Esperando a que el backend inicie..." -ForegroundColor Yellow
    while ($waited -lt $maxWait) {
        Start-Sleep -Seconds 5
        $waited += 5
        
        # Verificar backend
        if (-not $backendReady) {
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:8080/Inia" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 401 -or $response.StatusCode -eq 403) {
                    $backendReady = $true
                    Write-Host "✓ Backend listo!" -ForegroundColor Green
                }
            } catch {
                # Backend aún no está listo
            }
        }
        
        # Verificar frontend (puerto 80 para Nginx o 4200 para ng serve)
        if (-not $frontendReady) {
            try {
                # Intentar puerto 80 primero (Nginx en producción)
                $response = Invoke-WebRequest -Uri "http://localhost" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 304) {
                    $frontendReady = $true
                    Write-Host "✓ Frontend listo! (puerto 80)" -ForegroundColor Green
                }
            } catch {
                # Si falla puerto 80, intentar puerto 4200 (ng serve en desarrollo)
                try {
                    $response = Invoke-WebRequest -Uri "http://localhost:4200" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
                    if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 304) {
                        $frontendReady = $true
                        Write-Host "✓ Frontend listo! (puerto 4200 - modo desarrollo)" -ForegroundColor Green
                        Write-Host "  Nota: Frontend está en modo desarrollo. Usa http://localhost:4200" -ForegroundColor Yellow
                    }
                } catch {
                    # Frontend aún no está listo
                }
            }
        }
        
        # Si ambos están listos, salir
        if ($backendReady -and $frontendReady) {
            break
        }
        
        if ($waited % 15 -eq 0) {
            $status = "Backend: " + $(if ($backendReady) { "✓" } else { "⏳" }) + " | Frontend: " + $(if ($frontendReady) { "✓" } else { "⏳" })
            Write-Host "  Esperando... ($waited segundos) - $status" -ForegroundColor Gray
        }
    }
    
    if (-not $backendReady) {
        Write-Host "⚠ ADVERTENCIA: El backend puede tardar más en iniciar" -ForegroundColor Yellow
        Write-Host "Puedes verificar los logs con: docker compose logs backend" -ForegroundColor Yellow
    }
    
    if (-not $frontendReady) {
        Write-Host "⚠ ADVERTENCIA: El frontend puede tardar más en iniciar" -ForegroundColor Yellow
        Write-Host "Puedes verificar los logs con: docker compose logs frontend" -ForegroundColor Yellow
        Write-Host "Intentando abrir el navegador de todas formas..." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "URLs disponibles:" -ForegroundColor Cyan
    Write-Host "  Frontend:     http://localhost (o http://localhost:4200 si está en modo desarrollo)" -ForegroundColor White
    Write-Host "  Swagger UI:   http://localhost:8080/swagger-ui/index.html" -ForegroundColor White
    Write-Host "  Backend API:  http://localhost:8080/Inia" -ForegroundColor White
    Write-Host "  Middleware:   http://localhost:9099" -ForegroundColor White
    Write-Host ""
    Write-Host "Credenciales de acceso:" -ForegroundColor Cyan
    Write-Host "  Email:        admin@inia.com" -ForegroundColor White
    Write-Host "  Password:     password123" -ForegroundColor White
    Write-Host ""
    
    # Abrir navegador automáticamente
    Write-Host ""
    Write-Host "Abriendo navegador automáticamente..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    # Abrir Frontend (intentar ambos puertos)
    $frontendUrl = "http://localhost"
    if (-not $frontendReady) {
        # Si no está listo en 80, intentar 4200
        try {
            $test4200 = Invoke-WebRequest -Uri "http://localhost:4200" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($test4200.StatusCode -eq 200) {
                $frontendUrl = "http://localhost:4200"
            }
        } catch {
            # Usar puerto 80 por defecto
        }
    } else {
        # Verificar si está en 4200
        try {
            $test4200 = Invoke-WebRequest -Uri "http://localhost:4200" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($test4200.StatusCode -eq 200) {
                $frontendUrl = "http://localhost:4200"
            }
        } catch {
            # Usar puerto 80
        }
    }
    
    try {
        Start-Process $frontendUrl
        Write-Host "✓ Frontend abierto en el navegador: $frontendUrl" -ForegroundColor Green
        if (-not $frontendReady) {
            Write-Host "  Nota: El frontend puede tardar unos segundos más en cargar completamente" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠ No se pudo abrir el Frontend automáticamente" -ForegroundColor Yellow
        Write-Host "  Abre manualmente: http://localhost o http://localhost:4200" -ForegroundColor White
    }
    
    Start-Sleep -Seconds 3
    
    # Abrir Swagger (solo si el backend está listo)
    if ($backendReady) {
        try {
            Start-Process "http://localhost:8080/swagger-ui/index.html"
            Write-Host "✓ Swagger UI abierto en el navegador" -ForegroundColor Green
        } catch {
            Write-Host "⚠ No se pudo abrir Swagger automáticamente" -ForegroundColor Yellow
            Write-Host "  Abre manualmente: http://localhost:8080/swagger-ui/index.html" -ForegroundColor White
        }
    } else {
        Write-Host "⏭ Swagger no se abrió (backend aún iniciando)" -ForegroundColor Yellow
        Write-Host "  Abre manualmente cuando esté listo: http://localhost:8080/swagger-ui/index.html" -ForegroundColor White
    }
    
    Write-Host ""
    
    Write-Host ""
    Write-Host "Comandos útiles:" -ForegroundColor Yellow
    Write-Host "  Ver logs:     docker compose logs -f [servicio]" -ForegroundColor White
    Write-Host "  Ver estado:   docker compose ps" -ForegroundColor White
    Write-Host "  Detener:      docker compose down" -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host ""
    Write-Host "ERROR: Falló al iniciar los servicios" -ForegroundColor Red
    Write-Host "Revisa los logs con: docker compose logs" -ForegroundColor Yellow
    Write-Host ""
}

Read-Host "Presiona Enter para salir"


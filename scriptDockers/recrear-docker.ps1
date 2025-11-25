# Script para recrear completamente los contenedores Docker de INIA
# Ubicación: IniaProject/scriptDockers/recrear-docker.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Recrear INIA Docker            " -ForegroundColor Cyan
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
                    Write-Host "  OK Servicio $($service.Name) detenido" -ForegroundColor Green
                }
                catch {
                    Write-Host "  ADVERTENCIA: No se pudo detener el servicio $($service.Name) automaticamente" -ForegroundColor Yellow
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
        Write-Host "OK Puerto 5432 liberado" -ForegroundColor Green
        return $true
    }
    else {
        Write-Host "ADVERTENCIA: El puerto 5432 aun esta en uso" -ForegroundColor Yellow
        Write-Host "  Puede ser necesario ejecutar este script como Administrador" -ForegroundColor Yellow
        return $false
    }
}

# Verificar Docker Desktop
Write-Host "Verificando Docker Desktop..." -ForegroundColor Yellow

if (-not (Test-DockerRunning)) {
    Write-Host "ERROR: Docker Desktop no está ejecutándose" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor:" -ForegroundColor Yellow
    Write-Host "  1. Inicia Docker Desktop" -ForegroundColor White
    Write-Host "  2. Espera a que esté completamente iniciado" -ForegroundColor White
    Write-Host "  3. Vuelve a ejecutar este script" -ForegroundColor White
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "Docker Desktop está ejecutándose correctamente" -ForegroundColor Green

# Verificar puerto 5432
Write-Host ""
Write-Host "Verificando puerto 5432..." -ForegroundColor Yellow
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

Write-Host ""
Write-Host "ADVERTENCIA: Esto recreará todos los contenedores" -ForegroundColor Yellow
Write-Host ""

# Navegar al directorio raíz del proyecto
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot
Write-Host "Directorio: $projectRoot" -ForegroundColor Yellow
Write-Host ""

# Preguntar si mantener datos
Write-Host "Opciones:" -ForegroundColor Cyan
Write-Host "  1. Recrear contenedores (mantener datos)" -ForegroundColor White
Write-Host "  2. Recrear todo (ELIMINAR DATOS de la base de datos)" -ForegroundColor Red
Write-Host "  3. Cancelar" -ForegroundColor White
Write-Host ""
$opcion = Read-Host "Selecciona una opción (1-3)"

switch ($opcion) {
    "1" {
        Write-Host ""
        Write-Host "[1/5] Deteniendo servicios..." -ForegroundColor Yellow
        docker compose down
        
        Write-Host "[2/5] Reconstruyendo imágenes..." -ForegroundColor Yellow
        docker compose build --no-cache
        
        Write-Host "[3/5] Levantando servicios..." -ForegroundColor Yellow
        docker compose up -d
        
        Write-Host "[4/5] Esperando servicios..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        Write-Host "[5/5] Verificando estado..." -ForegroundColor Yellow
        docker compose ps
        
        Write-Host ""
        Write-Host "Contenedores recreados exitosamente (datos mantenidos)" -ForegroundColor Green
        Write-Host ""
        
        # Preguntar si abrir navegador
        $openBrowser = Read-Host "Abrir Frontend y Swagger? (S/N)"
        if ($openBrowser -eq "S" -or $openBrowser -eq "s") {
            Start-Process "http://localhost"
            Start-Sleep -Seconds 1
            Start-Process "http://localhost:8080/swagger-ui/index.html"
        }
    }
    "2" {
        Write-Host ""
        Write-Host "ULTIMA ADVERTENCIA: Esto eliminará TODOS los datos (PostgreSQL)" -ForegroundColor Red
        Write-Host "Se perderán usuarios, lotes, análisis, certificados, etc." -ForegroundColor Red
        Write-Host ""
        $confirmar = Read-Host "Estás seguro? Escribe 'ELIMINAR' para confirmar"
        
        if ($confirmar -eq "ELIMINAR") {
            Write-Host ""
            Write-Host "[1/6] Deteniendo y eliminando contenedores con volúmenes..." -ForegroundColor Yellow
            docker compose down -v
            
            Write-Host "[2/6] Limpiando sistema Docker..." -ForegroundColor Yellow
            docker system prune -f
            
            Write-Host "[3/6] Reconstruyendo imágenes..." -ForegroundColor Yellow
            docker compose build --no-cache
            
            Write-Host "[4/6] Levantando servicios..." -ForegroundColor Yellow
            docker compose up -d
            
            Write-Host "[5/6] Esperando servicios..." -ForegroundColor Yellow
            Start-Sleep -Seconds 15
            
            Write-Host "[6/6] Verificando estado..." -ForegroundColor Yellow
            docker compose ps
            
            Write-Host ""
            Write-Host "Sistema completamente recreado" -ForegroundColor Green
            Write-Host "NOTA: Base de datos recreada con init.sql (esquema y permisos)" -ForegroundColor Yellow
            Write-Host ""
            
            # Preguntar si abrir navegador
            $openBrowser = Read-Host "Abrir Frontend y Swagger? (S/N)"
            if ($openBrowser -eq "S" -or $openBrowser -eq "s") {
                Start-Process "http://localhost"
                Start-Sleep -Seconds 1
                Start-Process "http://localhost:8080/swagger-ui/index.html"
            }
        } else {
            Write-Host ""
            Write-Host "Operación cancelada" -ForegroundColor Yellow
            Write-Host ""
        }
    }
    "3" {
        Write-Host ""
        Write-Host "Operación cancelada" -ForegroundColor Yellow
        Write-Host ""
    }
    default {
        Write-Host ""
        Write-Host "Opción inválida" -ForegroundColor Red
        Write-Host ""
    }
}

Read-Host "Presiona Enter para salir"


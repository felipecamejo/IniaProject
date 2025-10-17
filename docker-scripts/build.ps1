# Script de PowerShell para construir las imágenes Docker
# Uso: .\docker-scripts\build.ps1 [servicio]

param(
    [string]$Service = "all",
    [switch]$NoCache = $false,
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "=== Script de Construcción Docker para INIA ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Uso: .\docker-scripts\build.ps1 [servicio] [opciones]"
    Write-Host ""
    Write-Host "Servicios disponibles:"
    Write-Host "  all        - Construir todos los servicios (por defecto)"
    Write-Host "  backend    - Solo backend Spring Boot"
    Write-Host "  frontend   - Solo frontend Angular"
    Write-Host "  middleware - Solo middleware Python"
    Write-Host "  database   - Solo base de datos (no aplica)"
    Write-Host ""
    Write-Host "Opciones:"
    Write-Host "  -NoCache   - Construir sin usar cache"
    Write-Host "  -Help      - Mostrar esta ayuda"
    Write-Host ""
    Write-Host "Ejemplos:"
    Write-Host "  .\docker-scripts\build.ps1"
    Write-Host "  .\docker-scripts\build.ps1 backend -NoCache"
    Write-Host "  .\docker-scripts\build.ps1 frontend"
    exit 0
}

Write-Host "=== Construyendo Imágenes Docker para INIA ===" -ForegroundColor Green
Write-Host "Servicio: $Service" -ForegroundColor Yellow
Write-Host "Sin cache: $NoCache" -ForegroundColor Yellow
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

# Función para construir un servicio específico
function Build-Service {
    param([string]$ServiceName)
    
    Write-Host "Construyendo $ServiceName..." -ForegroundColor Cyan
    
    $buildArgs = @("build")
    if ($NoCache) {
        $buildArgs += "--no-cache"
    }
    $buildArgs += $ServiceName
    
    & docker-compose @buildArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ $ServiceName construido exitosamente" -ForegroundColor Green
    } else {
        Write-Host "✗ Error construyendo $ServiceName" -ForegroundColor Red
        exit 1
    }
}

# Construir según el servicio especificado
switch ($Service.ToLower()) {
    "all" {
        Write-Host "Construyendo todos los servicios..." -ForegroundColor Cyan
        $buildArgs = @("build")
        if ($NoCache) {
            $buildArgs += "--no-cache"
        }
        
        & docker-compose @buildArgs
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Todos los servicios construidos exitosamente" -ForegroundColor Green
        } else {
            Write-Host "✗ Error construyendo los servicios" -ForegroundColor Red
            exit 1
        }
    }
    "backend" {
        Build-Service "backend"
    }
    "frontend" {
        Build-Service "frontend"
    }
    "middleware" {
        Build-Service "middleware"
    }
    "database" {
        Write-Host "La base de datos usa una imagen oficial, no necesita construcción" -ForegroundColor Yellow
    }
    default {
        Write-Host "Error: Servicio '$Service' no reconocido" -ForegroundColor Red
        Write-Host "Usa -Help para ver los servicios disponibles" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "=== Construcción Completada ===" -ForegroundColor Green
Write-Host "Para ejecutar los servicios, usa: .\docker-scripts\start.ps1" -ForegroundColor Yellow

# ========================================
# RUN PWA - SISTEMA INIA
# ========================================
# Script simplificado para ejecutar la PWA del Sistema INIA

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "prod", "build", "test", "help")]
    [string]$Mode = "dev"
)

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor White
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "OK: $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "WARNING: $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "ERROR: $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "INFO: $Message" -ForegroundColor Cyan
}

function Test-Command {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

function Test-PWA-Configured {
    $pwaFiles = @(
        "frontend/ngsw-config.json",
        "frontend/public/manifest.webmanifest",
        "frontend/src/app/app.config.ts"
    )
    
    foreach ($file in $pwaFiles) {
        if (-not (Test-Path $file)) {
            return $false
        }
    }
    return $true
}

function Run-Dev {
    Write-Header "EJECUTANDO PWA EN MODO DESARROLLO"
    
    if (-not (Test-PWA-Configured)) {
        Write-Error "PWA no esta configurado. Ejecutando configuracion..."
        Write-Info "Configurando PWA automaticamente..."
        $configPWAPath = Join-Path $scriptDir "configPWA.ps1"
        & $configPWAPath setup
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Error en la configuracion PWA"
            return
        }
    }
    
    Write-Info "Iniciando PWA en modo desarrollo con ngrok..."
    Write-Host ""
    Write-Host "Esto iniciara:" -ForegroundColor White
    Write-Host "  1. Aplicacion Angular en modo PWA" -ForegroundColor Gray
    Write-Host "  2. Túnel ngrok para HTTPS" -ForegroundColor Gray
    Write-Host "  3. URLs disponibles para testing" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Presiona Ctrl+C en cualquier ventana para detener" -ForegroundColor Red
    Write-Host ""
    
    # Ejecutar configPWA.ps1 dev
    $configPWAPath = Join-Path $scriptDir "configPWA.ps1"
    & $configPWAPath dev
}

function Run-Prod {
    Write-Header "EJECUTANDO PWA EN MODO PRODUCCION"
    
    if (-not (Test-PWA-Configured)) {
        Write-Error "PWA no esta configurado. Ejecutando configuracion..."
        $configPWAPath = Join-Path $scriptDir "configPWA.ps1"
        & $configPWAPath setup
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Error en la configuracion PWA"
            return
        }
    }
    
    Write-Info "Construyendo PWA para produccion..."
    $buildPWAPath = Join-Path $scriptDir "BuildPWA.ps1"
    & $buildPWAPath build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Build completado. Iniciando servidor local..."
        Write-Host ""
        Write-Host "PWA disponible en:" -ForegroundColor White
        Write-Host "  http://localhost:8080" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Para testing PWA completo, usa modo 'dev' con ngrok" -ForegroundColor Yellow
        Write-Host ""
        
        $buildPWAPath = Join-Path $scriptDir "BuildPWA.ps1"
        & $buildPWAPath serve
    } else {
        Write-Error "Error en el build PWA"
    }
}

function Run-Build {
    Write-Header "CONSTRUYENDO PWA PARA PRODUCCION"
    
    if (-not (Test-PWA-Configured)) {
        Write-Error "PWA no esta configurado. Ejecutando configuracion..."
        $configPWAPath = Join-Path $scriptDir "configPWA.ps1"
        & $configPWAPath setup
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Error en la configuracion PWA"
            return
        }
    }
    
    Write-Info "Construyendo PWA..."
    $buildPWAPath = Join-Path $scriptDir "BuildPWA.ps1"
    & $buildPWAPath build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Build PWA completado!"
        Write-Host ""
        Write-Host "Archivos generados en: frontend/dist/inia-frontend/" -ForegroundColor White
        Write-Host ""
        Write-Host "Para servir localmente:" -ForegroundColor Yellow
        Write-Host "  .\RunPWA.ps1 prod" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Para preparar despliegue:" -ForegroundColor Yellow
        Write-Host "  .\PowerShell\BuildPWA.ps1 deploy" -ForegroundColor Gray
    } else {
        Write-Error "Error en el build PWA"
    }
}

function Run-Test {
    Write-Header "TESTING PWA"
    
    if (-not (Test-PWA-Configured)) {
        Write-Error "PWA no esta configurado. Ejecutando configuracion..."
        $configPWAPath = Join-Path $scriptDir "configPWA.ps1"
        & $configPWAPath setup
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Error en la configuracion PWA"
            return
        }
    }
    
    Write-Info "Verificando configuracion PWA..."
    $configPWAPath = Join-Path $scriptDir "configPWA.ps1"
    & $configPWAPath test
    
    Write-Host ""
    Write-Info "Ejecutando auditoria Lighthouse..."
    $configPWAPath = Join-Path $scriptDir "configPWA.ps1"
    & $configPWAPath lighthouse
    
    Write-Host ""
    Write-Success "Testing completado!"
    Write-Host ""
    Write-Host "Para testing completo con ngrok:" -ForegroundColor Yellow
    Write-Host "  .\RunPWA.ps1 dev" -ForegroundColor Gray
}

function Show-Help {
    Write-Header "AYUDA - RUN PWA SISTEMA INIA"
    
    Write-Host "Uso: .\RunPWA.ps1 [modo]" -ForegroundColor White
    Write-Host ""
    Write-Host "Modos disponibles:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  dev     - Ejecuta PWA en modo desarrollo con ngrok (RECOMENDADO)" -ForegroundColor Gray
    Write-Host "  prod    - Construye y sirve PWA en modo produccion local" -ForegroundColor Gray
    Write-Host "  build   - Solo construye PWA para produccion" -ForegroundColor Gray
    Write-Host "  test    - Ejecuta verificaciones y auditorias PWA" -ForegroundColor Gray
    Write-Host "  help    - Muestra esta ayuda" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Ejemplos:" -ForegroundColor Cyan
    Write-Host "  .\RunPWA.ps1        # Modo desarrollo (por defecto)" -ForegroundColor Gray
    Write-Host "  .\RunPWA.ps1 dev    # Modo desarrollo con ngrok" -ForegroundColor Gray
    Write-Host "  .\RunPWA.ps1 prod   # Modo produccion local" -ForegroundColor Gray
    Write-Host "  .\RunPWA.ps1 build  # Solo build" -ForegroundColor Gray
    Write-Host "  .\RunPWA.ps1 test   # Testing completo" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Flujo recomendado:" -ForegroundColor Cyan
    Write-Host "  1. .\RunPWA.ps1 dev     # Desarrollo y testing" -ForegroundColor Gray
    Write-Host "  2. .\RunPWA.ps1 build   # Build para produccion" -ForegroundColor Gray
    Write-Host "  3. .\RunPWA.ps1 prod    # Probar build localmente" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Caracteristicas PWA:" -ForegroundColor White
    Write-Host "  - Instalable en dispositivos moviles y escritorio" -ForegroundColor Gray
    Write-Host "  - Funciona sin conexion a internet" -ForegroundColor Gray
    Write-Host "  - Túnel HTTPS automatico con ngrok" -ForegroundColor Gray
    Write-Host "  - Service Worker para cache y actualizaciones" -ForegroundColor Gray
    Write-Host ""
    Write-Host "URLs disponibles en modo dev:" -ForegroundColor Yellow
    Write-Host "  - Local: http://localhost:4200" -ForegroundColor Gray
    Write-Host "  - ngrok: https://[tunel].ngrok.io" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Documentacion completa: Documentation.md" -ForegroundColor White
}

# Obtener directorio del script (PowerShell/)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Navegar a la raíz del proyecto (un nivel arriba)
$projectRoot = Split-Path -Parent $scriptDir
Set-Location $projectRoot

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "frontend/package.json")) {
    Write-Error "No se encontro el directorio frontend. Ejecuta desde la raiz del proyecto."
    exit 1
}

# Ejecutar modo seleccionado
switch ($Mode) {
    "dev" { Run-Dev }
    "prod" { Run-Prod }
    "build" { Run-Build }
    "test" { Run-Test }
    "help" { Show-Help }
    default { Run-Dev }
}

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

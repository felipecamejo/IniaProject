# CONFIGURACION PWA - SISTEMA INIA
# Script para configurar y gestionar PWA desde la raiz del proyecto

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("setup", "dev", "build", "test", "ngrok", "lighthouse", "help")]
    [string]$Action = "help",
    [Parameter(Mandatory=$false)]
    [string]$ProjectRoot = ""
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

function Install-GlobalPackage {
    param([string]$Package)
    if (-not (Test-Command $Package)) {
        Write-Info "Instalando $Package globalmente..."
        npm install -g $Package
        if ($LASTEXITCODE -eq 0) {
            Write-Success "$Package instalado correctamente"
        } else {
            Write-Error "Error instalando $Package"
            return $false
        }
    } else {
        Write-Success "$Package ya esta instalado"
    }
    return $true
}

function Setup-PWA {
    param([string]$ProjectRoot)
    
    Write-Header "CONFIGURACION INICIAL PWA"
    
    # Validate ProjectRoot parameter
    if ([string]::IsNullOrEmpty($ProjectRoot) -or -not (Test-Path $ProjectRoot)) {
        Write-Error "ProjectRoot invalido o no existe: $ProjectRoot"
        return
    }
    
    try {
        Set-Location $ProjectRoot
        
        if (-not (Test-Path "frontend/package.json")) {
            Write-Error "No se encontro el directorio frontend. Ejecuta desde la raiz del proyecto."
            return
        }
        
        Write-Info "Configurando PWA para Sistema INIA..."
        
        Push-Location "frontend"
        try {
            if (Test-Path "ngsw-config.json") {
                Write-Warning "PWA ya esta configurado. Deseas reinstalar? (y/N)"
                $response = Read-Host
                if ($response -ne "y" -and $response -ne "Y") {
                    Write-Info "Configuracion PWA cancelada"
                    return
                }
            }
        
        Write-Info "Instalando Angular PWA..."
        ng add @angular/pwa --skip-confirmation
        
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Error en ng add, intentando instalacion manual..."
            npm install @angular/service-worker@^20.3.6 --legacy-peer-deps
        }
        
        Write-Info "Personalizando manifest para INIA..."
        $manifestPath = "public/manifest.webmanifest"
        if (Test-Path $manifestPath) {
            $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
            $manifest.name = "INIA - Sistema de Analisis de Semillas"
            $manifest.short_name = "INIA"
            $manifest.description = "Sistema integral para la gestion y analisis de semillas en laboratorios especializados"
            $manifest.theme_color = "#1976d2"
            $manifest.background_color = "#fafafa"
            $manifest.orientation = "portrait-primary"
            $manifest | ConvertTo-Json -Depth 10 | Set-Content $manifestPath
            Write-Success "Manifest personalizado"
        } else {
            Write-Warning "Manifest no encontrado en $manifestPath, creando uno personalizado..."
            $manifest = @{
                name = "INIA - Sistema de Analisis de Semillas"
                short_name = "INIA"
                description = "Sistema integral para la gestion y analisis de semillas en laboratorios especializados"
                theme_color = "#1976d2"
                background_color = "#fafafa"
                orientation = "portrait-primary"
                display = "standalone"
                start_url = "/"
                icons = @(
                    @{
                        src = "icons/icon-192x192.png"
                        sizes = "192x192"
                        type = "image/png"
                    },
                    @{
                        src = "icons/icon-512x512.png"
                        sizes = "512x512"
                        type = "image/png"
                    }
                )
            }
            $manifest | ConvertTo-Json -Depth 10 | Set-Content $manifestPath
            Write-Success "Manifest creado y personalizado"
        }
        
        Write-Info "Configurando service worker para desarrollo..."
        $appConfigPath = "src/app/app.config.ts"
        if (Test-Path $appConfigPath) {
            $content = Get-Content $appConfigPath -Raw
            # Verificar si ya tiene configuración de service worker
            if ($content -match "provideServiceWorker") {
                $content = $content -replace "enabled: !isDevMode\(\)", "enabled: true"
                Set-Content $appConfigPath $content
                Write-Success "Service worker habilitado para desarrollo"
            } else {
                Write-Warning "Configuración de service worker no encontrada en app.config.ts"
                Write-Info "Asegúrate de que el service worker esté configurado correctamente"
            }
        } else {
            Write-Warning "app.config.ts no encontrado en $appConfigPath"
        }
        
        Write-Info "Ajustando limites de build..."
        $angularJsonPath = "angular.json"
        if (Test-Path $angularJsonPath) {
            $content = Get-Content $angularJsonPath -Raw
            # Ajustar límites de build para PWA
            $content = $content -replace '"maximumWarning": "500kB"', '"maximumWarning": "2MB"'
            $content = $content -replace '"maximumError": "1MB"', '"maximumError": "5MB"'
            $content = $content -replace '"maximumWarning": "4kB"', '"maximumWarning": "10kB"'
            $content = $content -replace '"maximumError": "8kB"', '"maximumError": "15kB"'
            Set-Content $angularJsonPath $content
            Write-Success "Limites de build ajustados"
        } else {
            Write-Warning "angular.json no encontrado en $angularJsonPath"
        }
        
        Write-Info "Instalando herramientas de desarrollo..."
        Install-GlobalPackage "ngrok"
        Install-GlobalPackage "lighthouse"
        
        # Configurar token de ngrok
        Write-Info "Configurando token de ngrok..."
        ngrok config add-authtoken 2yK9mpFEZXa9gvXRS2IHS6baOgL_7ABJwf2GPr1zMA28yPgLd
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Token de ngrok configurado correctamente"
        } else {
            Write-Warning "Error configurando token de ngrok"
        }
        
            Write-Success "Configuracion PWA completada!"
            
        } finally {
            Pop-Location
        }
        
    } catch {
        Write-Error "Error en la configuracion PWA: $($_.Exception.Message)"
    }
}

function Start-Dev {
    Write-Header "INICIANDO DESARROLLO PWA"
    
    if (-not (Test-Path "frontend/ngsw-config.json")) {
        Write-Error "PWA no esta configurado. Ejecuta: .\configPWA.ps1 setup"
        return
    }
    
    Install-GlobalPackage "ngrok"
    Install-GlobalPackage "lighthouse"
    
    # Verificar y configurar token de ngrok
    Write-Info "Verificando configuracion de ngrok..."
    ngrok config add-authtoken 2yK9mpFEZXa9gvXRS2IHS6baOgL_7ABJwf2GPr1zMA28yPgLd
    
    Write-Info "Iniciando aplicacion Angular en modo PWA..."
    
    Push-Location "frontend"
    
    try {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; ng serve --configuration=production"
        
        Write-Info "Esperando 10 segundos para que la aplicacion inicie..."
        Start-Sleep -Seconds 10
        
        Write-Info "Iniciando tunel ngrok..."
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; ngrok http 4200"
        
        Write-Success "Desarrollo PWA iniciado!"
        Write-Host ""
        Write-Host "URLs disponibles:" -ForegroundColor White
        Write-Host "   Local: http://localhost:4200" -ForegroundColor Gray
        Write-Host "   ngrok: https://[tunel-ngrok].ngrok.io" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Comandos utiles:" -ForegroundColor White
        Write-Host "   Lighthouse: .\configPWA.ps1 lighthouse" -ForegroundColor Gray
        Write-Host "   Build: .\configPWA.ps1 build" -ForegroundColor Gray
        Write-Host "   Test: .\configPWA.ps1 test" -ForegroundColor Gray
        
    } finally {
        Pop-Location
    }
}

function Build-PWA {
    param([string]$ProjectRoot)
    
    Write-Header "BUILD PWA PARA PRODUCCION"
    
    # Validate ProjectRoot parameter
    if ([string]::IsNullOrEmpty($ProjectRoot) -or -not (Test-Path $ProjectRoot)) {
        Write-Error "ProjectRoot invalido o no existe: $ProjectRoot"
        return
    }
    
    Set-Location $ProjectRoot
    
    if (-not (Test-Path "frontend/ngsw-config.json")) {
        Write-Error "PWA no esta configurado. Ejecuta: .\configPWA.ps1 setup"
        return
    }
    
    Push-Location "frontend"
    
    try {
        Write-Info "Construyendo aplicacion PWA..."
        ng build --configuration=production
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Build PWA completado!"
            Write-Host ""
            Write-Host "Archivos generados en: frontend/dist/inia-frontend/" -ForegroundColor White
            Write-Host "   ngsw-worker.js - Service Worker" -ForegroundColor Gray
            Write-Host "   manifest.webmanifest - Manifest PWA" -ForegroundColor Gray
            Write-Host "   Iconos PWA en multiples tamanos" -ForegroundColor Gray
            Write-Host ""
            Write-Host "Para servir la aplicacion construida:" -ForegroundColor White
            Write-Host "   npx http-server dist/inia-frontend -p 8080" -ForegroundColor Gray
        } else {
            Write-Error "Error en el build PWA"
        }
        
    } finally {
        Pop-Location
    }
}

function Test-PWA {
    Write-Header "TESTING PWA"
    
    Write-Info "Verificando configuracion PWA..."
    
        $files = @(
        "frontend/ngsw-config.json",
        "frontend/public/manifest.webmanifest",
        "frontend/src/app/app.config.ts"
    )
    
    $allExist = $true
        foreach ($file in $files) {
        if (Test-Path $file) {
            Write-Success "OK: $file"
            } else {
            Write-Error "FALTANTE: $file"
            $allExist = $false
            }
        }
        
    if ($allExist) {
        Write-Success "Configuracion PWA verificada correctamente"
        Write-Host ""
        Write-Host "Para testing completo:" -ForegroundColor White
        Write-Host "   1. Ejecuta: .\configPWA.ps1 dev" -ForegroundColor Gray
        Write-Host "   2. Abre la URL de ngrok en Chrome" -ForegroundColor Gray
        Write-Host "   3. F12 -> Application -> Verifica Service Worker" -ForegroundColor Gray
        Write-Host "   4. F12 -> Lighthouse -> Ejecuta auditoria PWA" -ForegroundColor Gray
        Write-Host "   5. Busca el boton 'Instalar' en la barra de direcciones" -ForegroundColor Gray
        } else {
        Write-Error "Configuracion PWA incompleta. Ejecuta: .\configPWA.ps1 setup"
    }
}

function Start-Ngrok {
    Write-Header "INICIANDO NGROK"
    
    if (-not (Test-Command "ngrok")) {
        Write-Error "ngrok no esta instalado. Ejecuta: .\configPWA.ps1 setup"
        return
    }
    
    # Configurar token de ngrok
    Write-Info "Configurando token de ngrok..."
    ngrok config add-authtoken 2yK9mpFEZXa9gvXRS2IHS6baOgL_7ABJwf2GPr1zMA28yPgLd
    
    Write-Info "Iniciando tunel ngrok en puerto 4200..."
    Write-Host ""
    Write-Host "URLs disponibles:" -ForegroundColor White
    Write-Host "   Local: http://localhost:4200" -ForegroundColor Gray
    Write-Host "   ngrok: https://[tunel].ngrok.io" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Presiona Ctrl+C para detener ngrok" -ForegroundColor Red
        Write-Host ""
    
    ngrok http 4200
}

function Run-Lighthouse {
    Write-Header "AUDITORIA LIGHTHOUSE PWA"
    
    if (-not (Test-Command "lighthouse")) {
        Write-Error "lighthouse no esta instalado. Ejecuta: .\configPWA.ps1 setup"
        return
    }
    
    Write-Info "Que URL quieres auditar?"
    Write-Host "1. http://localhost:4200 (local)" -ForegroundColor Gray
    Write-Host "2. URL personalizada" -ForegroundColor Gray
    $choice = Read-Host "Selecciona (1-2)"
    
    $url = ""
    if ($choice -eq "1") {
        $url = "http://localhost:4200"
    } else {
        $url = Read-Host "Ingresa la URL"
    }
    
    Write-Info "Ejecutando auditoria Lighthouse en $url..."
    lighthouse $url --only-categories=pwa --output html --output-path "./lighthouse-pwa-report.html"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Auditoria completada! Reporte guardado en: lighthouse-pwa-report.html"
    } else {
        Write-Error "Error ejecutando auditoria Lighthouse"
    }
}

function Show-Help {
    Write-Header "AYUDA - CONFIGURACION PWA SISTEMA INIA"
    
    Write-Host "Uso: .\PowerShell\configPWA.ps1 [comando]" -ForegroundColor White
    Write-Host ""
    Write-Host "Comandos disponibles:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  setup      - Configura PWA inicialmente" -ForegroundColor Gray
    Write-Host "  dev        - Inicia desarrollo PWA con ngrok" -ForegroundColor Gray
    Write-Host "  build      - Construye PWA para produccion" -ForegroundColor Gray
    Write-Host "  test       - Verifica configuracion PWA" -ForegroundColor Gray
    Write-Host "  ngrok      - Solo inicia tunel ngrok" -ForegroundColor Gray
    Write-Host "  lighthouse - Ejecuta auditoria PWA" -ForegroundColor Gray
    Write-Host "  help       - Muestra esta ayuda" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Ejemplos:" -ForegroundColor Cyan
    Write-Host "  .\configPWA.ps1 setup     # Primera configuracion" -ForegroundColor Gray
    Write-Host "  .\configPWA.ps1 dev       # Desarrollo PWA" -ForegroundColor Gray
    Write-Host "  .\configPWA.ps1 build     # Build produccion" -ForegroundColor Gray
        Write-Host ""
    Write-Host "Documentacion completa en: Documentation.md" -ForegroundColor White
}

# Ejecutar comando seleccionado
switch ($Action) {
    "setup" { Setup-PWA -ProjectRoot $ProjectRoot }
    "dev" { Start-Dev }
    "build" { Build-PWA -ProjectRoot $ProjectRoot }
    "test" { Test-PWA }
    "ngrok" { Start-Ngrok }
    "lighthouse" { Run-Lighthouse }
    "help" { Show-Help }
    default { Show-Help }
}

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
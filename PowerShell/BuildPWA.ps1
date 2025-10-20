# ========================================
# BUILD PWA - SISTEMA INIA
# ========================================
# Script especializado para construir la aplicación PWA para producción

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("build", "serve", "deploy", "verify", "clean", "help")]
    [string]$Action = "build",
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

function Build-PWA {
    param([string]$ProjectRoot)
    
    Write-Header "BUILD PWA PARA PRODUCCION"
    
    # Validate ProjectRoot parameter
    if ([string]::IsNullOrEmpty($ProjectRoot) -or -not (Test-Path $ProjectRoot)) {
        Write-Error "ProjectRoot invalido o no existe: $ProjectRoot"
        return
    }
    
    Set-Location $ProjectRoot
    
    # Verificar que estamos en el directorio correcto
    if (-not (Test-Path "frontend/package.json")) {
        Write-Error "No se encontro el directorio frontend. Ejecuta desde la raiz del proyecto."
        return
    }
    
    # Verificar configuración PWA
    if (-not (Test-Path "frontend/ngsw-config.json")) {
        Write-Error "PWA no esta configurado. Ejecuta primero: .\PowerShell\configPWA.ps1 setup"
        return
    }
    
    Write-Info "Iniciando build PWA para Sistema INIA..."
    
    # Navegar al directorio frontend
    Push-Location "frontend"
    
    try {
        # Limpiar build anterior
        Write-Info "Limpiando build anterior..."
        if (Test-Path "dist") {
            Remove-Item "dist" -Recurse -Force
            Write-Success "Build anterior eliminado"
        }
        
        # Instalar dependencias
        Write-Info "Verificando dependencias..."
        npm install
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Error instalando dependencias"
            return
        }
        
        # Build de producción
        Write-Info "Construyendo aplicacion PWA en modo produccion..."
        ng build --configuration=production
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Build PWA completado exitosamente!"
            
            # Verificar archivos generados
            $buildPath = "dist/inia-frontend/browser"
            if (Test-Path $buildPath) {
                Write-Info "Verificando archivos PWA generados..."
                
                $pwaFiles = @(
                    "ngsw-worker.js",
                    "ngsw.json"
                )
                
                $allFilesExist = $true
                foreach ($file in $pwaFiles) {
                    $filePath = Join-Path $buildPath $file
                    if (Test-Path $filePath) {
                        Write-Success "OK: $file"
                    } else {
                        Write-Error "FALTANTE: $file"
                        $allFilesExist = $false
                    }
                }
                
                if ($allFilesExist) {
                    Write-Success "Todos los archivos PWA generados correctamente"
                    
                    # Mostrar información del build
                    $indexPath = Join-Path $buildPath "index.html"
                    if (Test-Path $indexPath) {
                        $indexSize = (Get-Item $indexPath).Length
                        Write-Info "Tamaño del index.html: $([math]::Round($indexSize/1KB, 2)) KB"
                    }
                    
                    # Verificar iconos
                    $iconsPath = Join-Path $buildPath "icons"
                    if (Test-Path $iconsPath) {
                        $iconCount = (Get-ChildItem $iconsPath -Filter "*.png").Count
                        Write-Info "Iconos PWA generados: $iconCount archivos"
                    }
                    
                    Write-Host ""
                    Write-Host "BUILD COMPLETADO:" -ForegroundColor Green
                    Write-Host "   Ubicacion: frontend/dist/inia-frontend/" -ForegroundColor Gray
                    Write-Host "   Service Worker: ngsw-worker.js" -ForegroundColor Gray
                    Write-Host "   Manifest: manifest.webmanifest" -ForegroundColor Gray
                    Write-Host "   Iconos: $iconCount archivos PNG" -ForegroundColor Gray
                    Write-Host ""
                    Write-Host "Para servir localmente: .\PowerShell\BuildPWA.ps1 serve" -ForegroundColor Yellow
                    Write-Host "Para verificar PWA: .\PowerShell\BuildPWA.ps1 verify" -ForegroundColor Yellow
                    
                } else {
                    Write-Error "Algunos archivos PWA no se generaron correctamente"
                }
            } else {
                Write-Error "Directorio de build no encontrado"
            }
        } else {
            Write-Error "Error en el build PWA"
        }
        
    } finally {
        Pop-Location
    }
}

function Serve-PWA {
    param([string]$ProjectRoot)
    
    Write-Header "SIRVIENDO PWA LOCALMENTE"
    
    # Validate ProjectRoot parameter
    if ([string]::IsNullOrEmpty($ProjectRoot) -or -not (Test-Path $ProjectRoot)) {
        Write-Error "ProjectRoot invalido o no existe: $ProjectRoot"
        return
    }
    
    Set-Location $ProjectRoot
    
    $buildPath = "frontend/dist/inia-frontend/browser"
    if (-not (Test-Path $buildPath)) {
        Write-Error "Build PWA no encontrado. Ejecuta primero: .\PowerShell\BuildPWA.ps1 build"
        return
    }
    
    Write-Info "Sirviendo PWA desde: $buildPath"
    
    # Verificar si http-server está instalado
    if (-not (Test-Command "http-server")) {
        Write-Info "Instalando http-server..."
        npm install -g http-server
    }
    
    Push-Location $buildPath
    
    try {
        Write-Info "Iniciando servidor local en puerto 8080..."
        Write-Host ""
        Write-Host "PWA disponible en:" -ForegroundColor White
        Write-Host "   http://localhost:8080" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Para probar PWA:" -ForegroundColor Yellow
        Write-Host "   1. Abre http://localhost:8080 en Chrome" -ForegroundColor Gray
        Write-Host "   2. F12 -> Application -> Verifica Service Worker" -ForegroundColor Gray
        Write-Host "   3. Busca el boton 'Instalar' en la barra de direcciones" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Red
        
        http-server -p 8080 -c-1
        
    } finally {
        Pop-Location
    }
}

function Deploy-PWA {
    param([string]$ProjectRoot)
    
    Write-Header "PREPARACION PARA DESPLIEGUE PWA"
    
    # Validate ProjectRoot parameter
    if ([string]::IsNullOrEmpty($ProjectRoot) -or -not (Test-Path $ProjectRoot)) {
        Write-Error "ProjectRoot invalido o no existe: $ProjectRoot"
        return
    }
    
    Set-Location $ProjectRoot
    
    $buildPath = "frontend/dist/inia-frontend/browser"
    if (-not (Test-Path $buildPath)) {
        Write-Error "Build PWA no encontrado. Ejecuta primero: .\PowerShell\BuildPWA.ps1 build"
        return
    }
    
    Write-Info "Preparando archivos para despliegue..."
    
    # Crear directorio de despliegue
    $deployPath = "deploy-pwa"
    if (Test-Path $deployPath) {
        Remove-Item $deployPath -Recurse -Force
    }
    New-Item -ItemType Directory -Path $deployPath | Out-Null
    
    # Copiar archivos de build
    Copy-Item "$buildPath/*" -Destination $deployPath -Recurse
    
    # Copiar manifest desde public
    $manifestSource = "frontend/public/manifest.webmanifest"
    if (Test-Path $manifestSource) {
        Copy-Item $manifestSource -Destination $deployPath
    }
    
    # Crear archivo de información de despliegue
    $deployInfo = @"
# INFORMACION DE DESPLIEGUE PWA - SISTEMA INIA
# Generado el: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Archivos incluidos:
- ngsw-worker.js (Service Worker)
- manifest.webmanifest (Manifest PWA)
- index.html (Aplicacion principal)
- Iconos PWA en multiples tamanos
- Assets y recursos estaticos

## Requisitos para despliegue:
1. Servidor web con soporte HTTPS (obligatorio para PWA)
2. Configurar MIME types para .webmanifest
3. Verificar que ngsw-worker.js sea accesible
4. Probar instalacion en dispositivos reales

## URLs de prueba:
- Verificar Service Worker: F12 -> Application -> Service Workers
- Verificar Manifest: F12 -> Application -> Manifest
- Auditoria PWA: F12 -> Lighthouse -> Progressive Web App

## Comandos utiles:
- Verificar build: .\PowerShell\BuildPWA.ps1 verify
- Servir localmente: .\PowerShell\BuildPWA.ps1 serve
"@
    
    $deployInfo | Out-File -FilePath "$deployPath/DEPLOY-INFO.txt" -Encoding UTF8
    
    Write-Success "Archivos preparados para despliegue en: $deployPath"
    Write-Host ""
    Write-Host "ARCHIVOS LISTOS PARA DESPLIEGUE:" -ForegroundColor Green
    Write-Host "   Directorio: $deployPath" -ForegroundColor Gray
    Write-Host "   Informacion: $deployPath/DEPLOY-INFO.txt" -ForegroundColor Gray
    Write-Host ""
    Write-Host "IMPORTANTE:" -ForegroundColor Yellow
    Write-Host "   - Requiere servidor HTTPS para funcionar como PWA" -ForegroundColor Gray
    Write-Host "   - Subir todos los archivos al servidor web" -ForegroundColor Gray
    Write-Host "   - Verificar que el Service Worker se registre correctamente" -ForegroundColor Gray
}

function Verify-PWA {
    param([string]$ProjectRoot)
    
    Write-Header "VERIFICACION PWA"
    
    # Validate ProjectRoot parameter
    if ([string]::IsNullOrEmpty($ProjectRoot) -or -not (Test-Path $ProjectRoot)) {
        Write-Error "ProjectRoot invalido o no existe: $ProjectRoot"
        return
    }
    
    Set-Location $ProjectRoot
    
    $buildPath = "frontend/dist/inia-frontend/browser"
    if (-not (Test-Path $buildPath)) {
        Write-Error "Build PWA no encontrado. Ejecuta primero: .\PowerShell\BuildPWA.ps1 build"
        return
    }
    
    Write-Info "Verificando archivos PWA..."
    
    # Verificar archivos esenciales
    $essentialFiles = @(
        @{Path="index.html"; Description="Pagina principal"},
        @{Path="ngsw-worker.js"; Description="Service Worker"},
        @{Path="ngsw.json"; Description="Configuracion Service Worker"}
    )
    
    $allEssential = $true
    foreach ($file in $essentialFiles) {
        $filePath = Join-Path $buildPath $file.Path
        if (Test-Path $filePath) {
            $size = (Get-Item $filePath).Length
            Write-Success "OK: $($file.Description) ($([math]::Round($size/1KB, 2)) KB)"
        } else {
            Write-Error "FALTANTE: $($file.Description)"
            $allEssential = $false
        }
    }
    
    # Verificar iconos (están en el directorio public)
    $iconsPath = "frontend/public/icons"
    if (Test-Path $iconsPath) {
        $icons = Get-ChildItem $iconsPath -Filter "*.png"
        Write-Success "OK: Iconos PWA ($($icons.Count) archivos)"
        foreach ($icon in $icons) {
            $size = $icon.Name -replace "icon-|\.png", ""
            Write-Host "   - $($icon.Name) ($size)" -ForegroundColor Gray
        }
    } else {
        Write-Error "FALTANTE: Directorio de iconos"
        $allEssential = $false
    }
    
    # Verificar assets
    $assetsPath = Join-Path $buildPath "assets"
    if (Test-Path $assetsPath) {
        $assetCount = (Get-ChildItem $assetsPath -Recurse).Count
        Write-Success "OK: Assets ($assetCount archivos)"
    } else {
        Write-Warning "Assets no encontrados"
    }
    
    # Verificar manifest (está en el directorio public)
    $manifestPath = "frontend/public/manifest.webmanifest"
    if (Test-Path $manifestPath) {
        try {
            $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
            Write-Success "OK: Manifest PWA valido"
            Write-Host "   - Nombre: $($manifest.name)" -ForegroundColor Gray
            Write-Host "   - Short Name: $($manifest.short_name)" -ForegroundColor Gray
            Write-Host "   - Display: $($manifest.display)" -ForegroundColor Gray
            Write-Host "   - Iconos: $($manifest.icons.Count)" -ForegroundColor Gray
        } catch {
            Write-Error "ERROR: Manifest PWA invalido"
            $allEssential = $false
        }
    }
    
    Write-Host ""
    if ($allEssential) {
        Write-Success "VERIFICACION COMPLETADA - PWA LISTO PARA DESPLIEGUE"
        Write-Host ""
        Write-Host "Para probar localmente:" -ForegroundColor Yellow
        Write-Host "   .\PowerShell\BuildPWA.ps1 serve" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Para preparar despliegue:" -ForegroundColor Yellow
        Write-Host "   .\PowerShell\BuildPWA.ps1 deploy" -ForegroundColor Gray
    } else {
        Write-Error "VERIFICACION FALLIDA - Revisar archivos faltantes"
    }
}

function Clean-Build {
    Write-Header "LIMPIANDO BUILD PWA"
    
    $paths = @(
        "frontend/dist",
        "deploy-pwa"
    )
    
    foreach ($path in $paths) {
        if (Test-Path $path) {
            Write-Info "Eliminando: $path"
            Remove-Item $path -Recurse -Force
            Write-Success "Eliminado: $path"
        } else {
            Write-Info "No encontrado: $path"
        }
    }
    
    Write-Success "Limpieza completada"
}

function Show-Help {
    Write-Header "AYUDA - BUILD PWA SISTEMA INIA"
    
    Write-Host "Uso: .\BuildPWA.ps1 [comando]" -ForegroundColor White
    Write-Host ""
    Write-Host "Comandos disponibles:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  build   - Construye PWA para produccion" -ForegroundColor Gray
    Write-Host "  serve   - Sirve PWA localmente (puerto 8080)" -ForegroundColor Gray
    Write-Host "  deploy  - Prepara archivos para despliegue" -ForegroundColor Gray
    Write-Host "  verify  - Verifica archivos PWA generados" -ForegroundColor Gray
    Write-Host "  clean   - Limpia builds anteriores" -ForegroundColor Gray
    Write-Host "  help    - Muestra esta ayuda" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Flujo recomendado:" -ForegroundColor Cyan
    Write-Host "  1. .\PowerShell\BuildPWA.ps1 build    # Construir PWA" -ForegroundColor Gray
    Write-Host "  2. .\PowerShell\BuildPWA.ps1 verify   # Verificar archivos" -ForegroundColor Gray
    Write-Host "  3. .\PowerShell\BuildPWA.ps1 serve    # Probar localmente" -ForegroundColor Gray
    Write-Host "  4. .\PowerShell\BuildPWA.ps1 deploy   # Preparar despliegue" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Requisitos previos:" -ForegroundColor Yellow
    Write-Host "  - PWA configurado: .\PowerShell\configPWA.ps1 setup" -ForegroundColor Gray
    Write-Host "  - Node.js y npm instalados" -ForegroundColor Gray
    Write-Host "  - Angular CLI instalado" -ForegroundColor Gray
}

# Ejecutar comando seleccionado
switch ($Action) {
    "build" { Build-PWA -ProjectRoot $ProjectRoot }
    "serve" { Serve-PWA -ProjectRoot $ProjectRoot }
    "deploy" { Deploy-PWA -ProjectRoot $ProjectRoot }
    "verify" { Verify-PWA -ProjectRoot $ProjectRoot }
    "clean" { Clean-Build }
    "help" { Show-Help }
    default { Show-Help }
}

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

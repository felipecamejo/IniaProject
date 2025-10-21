# ========================================
# CONFIGURACION NGROK - SISTEMA INIA
# ========================================
# Script para configurar ngrok con token de autenticacion

param(
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

Write-Header "CONFIGURACION NGROK PARA SISTEMA INIA"

# Validate ProjectRoot parameter
if ([string]::IsNullOrEmpty($ProjectRoot) -or -not (Test-Path $ProjectRoot)) {
    Write-Error "ProjectRoot invalido o no existe: $ProjectRoot"
    exit 1
}

Set-Location $ProjectRoot

# Token de autenticacion de ngrok
$ngrokToken = "2yK9mpFEZXa9gvXRS2IHS6baOgL_7ABJwf2GPr1zMA28yPgLd"

Write-Info "Configurando ngrok para Sistema INIA..."

# Verificar si ngrok esta instalado
if (-not (Test-Command "ngrok")) {
    Write-Info "Instalando ngrok globalmente..."
    npm install -g ngrok
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "ngrok instalado correctamente"
    } else {
        Write-Error "Error instalando ngrok"
        exit 1
    }
} else {
    Write-Success "ngrok ya esta instalado"
}

# Configurar token de autenticacion
Write-Info "Configurando token de autenticacion..."
ngrok config add-authtoken $ngrokToken

if ($LASTEXITCODE -eq 0) {
    Write-Success "Token de ngrok configurado correctamente"
    Write-Host ""
    Write-Host "Configuracion completada:" -ForegroundColor Green
    Write-Host "   Token: $ngrokToken" -ForegroundColor Gray
    Write-Host "   Archivo config: C:\Users\$env:USERNAME\AppData\Local\ngrok\ngrok.yml" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Comandos disponibles:" -ForegroundColor White
    Write-Host "   .\PowerShell\configPWA.ps1 dev     # Desarrollo PWA con ngrok" -ForegroundColor Gray
    Write-Host "   .\PowerShell\configPWA.ps1 ngrok   # Solo ngrok" -ForegroundColor Gray
    Write-Host "   ngrok http 4200         # Túnel directo" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Para probar PWA:" -ForegroundColor Yellow
    Write-Host "   1. Ejecuta: .\PowerShell\configPWA.ps1 dev" -ForegroundColor Gray
    Write-Host "   2. Abre la URL de ngrok en Chrome" -ForegroundColor Gray
    Write-Host "   3. Verifica que aparezca el boton 'Instalar'" -ForegroundColor Gray
} else {
    Write-Error "Error configurando token de ngrok"
    exit 1
}

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

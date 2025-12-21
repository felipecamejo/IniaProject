# ==============================================================================
# Script de Instalacion Automatica: AWS CLI + Terraform
# ==============================================================================
# Verifica e instala AWS CLI y Terraform si no existen en el sistema
# Uso: .\PowerShell\instalar-prerequisitos.ps1
#
# Requisitos: Ejecutar como Administrador para modificar PATH del sistema
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Instalacion de Prerequisitos AWS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Este script instalara:" -ForegroundColor Yellow
Write-Host "  - AWS CLI (si no existe)" -ForegroundColor White
Write-Host "  - Terraform (si no existe)" -ForegroundColor White
Write-Host ""

# ==============================================================================
# FUNCIONES AUXILIARES
# ==============================================================================

function Test-IsAdmin {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Add-ToSystemPath {
    param (
        [string]$Path
    )
    
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    
    if ($currentPath -notlike "*$Path*") {
        Write-Host "  Agregando al PATH del sistema: $Path" -ForegroundColor Gray
        $newPath = "$currentPath;$Path"
        [Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
        
        # Tambien agregar a la sesion actual
        $env:Path += ";$Path"
        
        Write-Host "  PATH actualizado correctamente" -ForegroundColor Green
    } else {
        Write-Host "  Ya existe en PATH: $Path" -ForegroundColor Gray
    }
}

function Test-CommandExists {
    param (
        [string]$Command
    )
    
    try {
        $null = Get-Command $Command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# ==============================================================================
# VERIFICACION DE PERMISOS
# ==============================================================================

if (-not (Test-IsAdmin)) {
    Write-Host "ADVERTENCIA: No se detectaron permisos de Administrador" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Este script puede instalar las herramientas, pero NO podra" -ForegroundColor Yellow
    Write-Host "modificar el PATH del sistema automaticamente." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor Cyan
    Write-Host "  1. Continuar (instalacion sin agregar al PATH)" -ForegroundColor White
    Write-Host "  2. Reiniciar como Administrador (recomendado)" -ForegroundColor White
    Write-Host ""
    $respuesta = Read-Host "Presiona Enter para continuar o Ctrl+C para cancelar"
    $isAdmin = $false
} else {
    Write-Host "Permisos de Administrador: OK" -ForegroundColor Green
    Write-Host ""
    $isAdmin = $true
}

# ==============================================================================
# INSTALACION DE AWS CLI
# ==============================================================================

Write-Host "[1/2] Verificando AWS CLI..." -ForegroundColor Cyan
Write-Host ""

$awsInstalled = Test-CommandExists "aws"

if ($awsInstalled) {
    $awsVersion = (aws --version 2>&1).ToString()
    Write-Host "  AWS CLI ya esta instalado" -ForegroundColor Green
    Write-Host "  Version: $awsVersion" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "  AWS CLI no encontrado. Instalando..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        # Descargar instalador MSI
        $awsInstallerUrl = "https://awscli.amazonaws.com/AWSCLIV2.msi"
        $awsInstallerPath = "$env:TEMP\AWSCLIV2.msi"
        
        Write-Host "  Descargando AWS CLI..." -ForegroundColor Gray
        Write-Host "  URL: $awsInstallerUrl" -ForegroundColor DarkGray
        
        Invoke-WebRequest -Uri $awsInstallerUrl -OutFile $awsInstallerPath -UseBasicParsing
        
        Write-Host "  Descarga completada" -ForegroundColor Green
        Write-Host ""
        
        # Instalar
        Write-Host "  Instalando AWS CLI..." -ForegroundColor Gray
        Write-Host "  (Puede tardar 1-2 minutos...)" -ForegroundColor DarkGray
        
        Start-Process msiexec.exe -ArgumentList "/i `"$awsInstallerPath`" /quiet /norestart" -Wait -NoNewWindow
        
        Write-Host "  Instalacion completada" -ForegroundColor Green
        Write-Host ""
        
        # Limpiar instalador
        Remove-Item $awsInstallerPath -Force -ErrorAction SilentlyContinue
        
        # Agregar al PATH si es admin
        $awsPath = "C:\Program Files\Amazon\AWSCLIV2"
        if ($isAdmin) {
            Add-ToSystemPath -Path $awsPath
        } else {
            Write-Host "  NOTA: Agrega manualmente al PATH: $awsPath" -ForegroundColor Yellow
        }
        
        # Verificar instalacion
        Write-Host ""
        Write-Host "  Verificando instalacion..." -ForegroundColor Gray
        
        # Recargar PATH en sesion actual
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        if (Test-CommandExists "aws") {
            $awsVersion = (aws --version 2>&1).ToString()
            Write-Host "  AWS CLI instalado correctamente" -ForegroundColor Green
            Write-Host "  Version: $awsVersion" -ForegroundColor Gray
        } else {
            Write-Host "  AWS CLI instalado, pero requiere reiniciar terminal" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "  ERROR al instalar AWS CLI: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "  Instalacion manual:" -ForegroundColor Yellow
        Write-Host "  1. Descarga desde: https://aws.amazon.com/cli/" -ForegroundColor White
        Write-Host "  2. Ejecuta el instalador MSI" -ForegroundColor White
        Write-Host ""
    }
}

Write-Host ""

# ==============================================================================
# INSTALACION DE TERRAFORM
# ==============================================================================

Write-Host "[2/2] Verificando Terraform..." -ForegroundColor Cyan
Write-Host ""

$terraformInstalled = Test-CommandExists "terraform"

if ($terraformInstalled) {
    $terraformVersion = (terraform version 2>&1 | Select-String "Terraform v").ToString()
    Write-Host "  Terraform ya esta instalado" -ForegroundColor Green
    Write-Host "  Version: $terraformVersion" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "  Terraform no encontrado. Instalando..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        # Configuracion
        $terraformVersion = "1.7.4"
        $terraformUrl = "https://releases.hashicorp.com/terraform/${terraformVersion}/terraform_${terraformVersion}_windows_amd64.zip"
        $terraformZip = "$env:TEMP\terraform.zip"
        $terraformInstallPath = "$env:USERPROFILE\terraform"
        
        Write-Host "  Descargando Terraform v$terraformVersion..." -ForegroundColor Gray
        Write-Host "  URL: $terraformUrl" -ForegroundColor DarkGray
        
        Invoke-WebRequest -Uri $terraformUrl -OutFile $terraformZip -UseBasicParsing
        
        Write-Host "  Descarga completada" -ForegroundColor Green
        Write-Host ""
        
        # Crear directorio de instalacion
        Write-Host "  Extrayendo a: $terraformInstallPath" -ForegroundColor Gray
        
        if (-not (Test-Path $terraformInstallPath)) {
            New-Item -Path $terraformInstallPath -ItemType Directory -Force | Out-Null
        }
        
        # Extraer ZIP
        Expand-Archive -Path $terraformZip -DestinationPath $terraformInstallPath -Force
        
        Write-Host "  Extraccion completada" -ForegroundColor Green
        Write-Host ""
        
        # Limpiar ZIP
        Remove-Item $terraformZip -Force -ErrorAction SilentlyContinue
        
        # Agregar al PATH
        if ($isAdmin) {
            Add-ToSystemPath -Path $terraformInstallPath
        } else {
            Write-Host "  NOTA: Agrega manualmente al PATH: $terraformInstallPath" -ForegroundColor Yellow
        }
        
        # Verificar instalacion
        Write-Host ""
        Write-Host "  Verificando instalacion..." -ForegroundColor Gray
        
        # Recargar PATH en sesion actual
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        $env:Path += ";$terraformInstallPath"
        
        if (Test-CommandExists "terraform") {
            $terraformVersion = (terraform version 2>&1 | Select-String "Terraform v").ToString()
            Write-Host "  Terraform instalado correctamente" -ForegroundColor Green
            Write-Host "  Version: $terraformVersion" -ForegroundColor Gray
        } else {
            Write-Host "  Terraform instalado en: $terraformInstallPath\terraform.exe" -ForegroundColor Yellow
            Write-Host "  Requiere reiniciar terminal o agregar al PATH manualmente" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "  ERROR al instalar Terraform: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "  Instalacion manual:" -ForegroundColor Yellow
        Write-Host "  1. Descarga desde: https://www.terraform.io/downloads" -ForegroundColor White
        Write-Host "  2. Extrae terraform.exe a una carpeta" -ForegroundColor White
        Write-Host "  3. Agrega la carpeta al PATH del sistema" -ForegroundColor White
        Write-Host ""
    }
}

Write-Host ""

# ==============================================================================
# RESUMEN FINAL
# ==============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Resumen de Instalacion" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Recargar PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Verificar AWS CLI
if (Test-CommandExists "aws") {
    Write-Host "AWS CLI:    INSTALADO" -ForegroundColor Green
    $awsVersion = (aws --version 2>&1).ToString()
    Write-Host "  Version:  $awsVersion" -ForegroundColor Gray
} else {
    Write-Host "AWS CLI:    NO DISPONIBLE (requiere reiniciar terminal)" -ForegroundColor Yellow
}

Write-Host ""

# Verificar Terraform
if (Test-CommandExists "terraform") {
    Write-Host "Terraform:  INSTALADO" -ForegroundColor Green
    $terraformVersion = (terraform version 2>&1 | Select-String "Terraform v").ToString()
    Write-Host "  Version:  $terraformVersion" -ForegroundColor Gray
} else {
    Write-Host "Terraform:  NO DISPONIBLE (requiere reiniciar terminal)" -ForegroundColor Yellow
}

Write-Host ""

# ==============================================================================
# PROXIMOS PASOS
# ==============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Proximos Pasos" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Configurar credenciales AWS:" -ForegroundColor Yellow
Write-Host "   aws configure" -ForegroundColor White
Write-Host ""

Write-Host "2. Inicializar Terraform:" -ForegroundColor Yellow
Write-Host "   .\ScriptTerraform\inicializar-terraform.ps1" -ForegroundColor White
Write-Host ""

Write-Host "3. Si los comandos no funcionan:" -ForegroundColor Yellow
Write-Host "   - Reinicia esta terminal" -ForegroundColor White
Write-Host "   - O ejecuta: " -NoNewline -ForegroundColor White
Write-Host "`$env:Path += ';C:\Program Files\Amazon\AWSCLIV2;$env:USERPROFILE\terraform'" -ForegroundColor Gray
Write-Host ""

Write-Host "Instalacion completada!" -ForegroundColor Green
Write-Host ""

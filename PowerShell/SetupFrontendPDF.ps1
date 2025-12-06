param(
    [Parameter(Mandatory=$false, Position=0)]
    [string]$ProjectRoot = ""
)

Write-Host "==> INIA Project Frontend PDF Setup" -ForegroundColor Cyan
Write-Host "Instalando dependencias para exportar certificados a PDF: jspdf, html2canvas, jspdf-autotable" -ForegroundColor Gray

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Auto-detect ProjectRoot if not provided
if ([string]::IsNullOrEmpty($ProjectRoot)) {
    # Get script directory (PowerShell/)
    if ($PSScriptRoot) {
        $scriptDir = $PSScriptRoot
    } else {
        $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    }
    # Navigate to project root (one level up from PowerShell/)
    $ProjectRoot = Split-Path -Parent $scriptDir
    Write-Host "Auto-detectando ProjectRoot: $ProjectRoot" -ForegroundColor Gray
}

# Validate ProjectRoot parameter
if (-not (Test-Path $ProjectRoot)) {
    Write-Error "ProjectRoot invalido o no existe: $ProjectRoot"
    Write-Host "`nUso correcto:" -ForegroundColor Yellow
    Write-Host "  .\SetupFrontendPDF.ps1                    # Auto-detecta el directorio del proyecto" -ForegroundColor White
    Write-Host "  .\SetupFrontendPDF.ps1 D:\IniaProject    # Especifica la ruta manualmente" -ForegroundColor White
    exit 1
}

Set-Location $ProjectRoot

# Navegar al directorio frontend
Push-Location "frontend"

# Verificar que existe package.json
if (-not (Test-Path "package.json")) {
    Write-Error "No se encontró package.json en el directorio frontend."
    Pop-Location
    exit 1
}

# Funcion para verificar si un comando esta disponible
function Test-Command {
    param([Parameter(Mandatory=$true)][string]$Name)
    $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

# Verificar Node.js
if (-not (Test-Command -Name 'node')) {
    Write-Error "Node.js no esta instalado o no esta en PATH. Instala Node 18+ (recomendado 20 LTS)."
    Pop-Location
    exit 1
}

# Verificar npm
if (-not (Test-Command -Name 'npm')) {
    Write-Error "npm no esta instalado o no esta en PATH."
    Pop-Location
    exit 1
}

# Verificar versión de Node.js
function Get-NodeVersionMajorMinor {
    try {
        $raw = (& node --version).Trim()
        if ($raw -match '^v(\d+)\.(\d+)\.(\d+)$') {
            return @{ Major = [int]$Matches[1]; Minor = [int]$Matches[2]; Patch = [int]$Matches[3]; Raw = $raw }
        }
        return $null
    } catch {
        return $null
    }
}

$ver = Get-NodeVersionMajorMinor
if ($null -eq $ver) {
    Write-Warning "No se pudo determinar la versión de Node. Continuando bajo tu propio riesgo."
} else {
    if ($ver.Major -lt 18) {
        Write-Error "Se requiere Node 18+ (recomendado 20 LTS). Detectado: $($ver.Raw)"
        Pop-Location
        exit 1
    }
    Write-Host "Node detectado: $($ver.Raw)" -ForegroundColor Green
}

# Verificar si las dependencias ya estan instaladas
Write-Host "`nVerificando dependencias instaladas..." -ForegroundColor Cyan

$dependenciasFaltantes = @()

# Verificar jspdf
if (Test-Path "node_modules/jspdf") {
    Write-Host "  [OK] jspdf ya esta instalado" -ForegroundColor Green
} else {
    Write-Host "  [X] jspdf no esta instalado" -ForegroundColor Yellow
    $dependenciasFaltantes += "jspdf"
}

# Verificar html2canvas
if (Test-Path "node_modules/html2canvas") {
    Write-Host "  [OK] html2canvas ya esta instalado" -ForegroundColor Green
} else {
    Write-Host "  [X] html2canvas no esta instalado" -ForegroundColor Yellow
    $dependenciasFaltantes += "html2canvas"
}

# Verificar jspdf-autotable
if (Test-Path "node_modules/jspdf-autotable") {
    Write-Host "  [OK] jspdf-autotable ya esta instalado" -ForegroundColor Green
} else {
    Write-Host "  [X] jspdf-autotable no esta instalado" -ForegroundColor Yellow
    $dependenciasFaltantes += "jspdf-autotable"
}

# Verificar @types/html2canvas
if (Test-Path "node_modules/@types/html2canvas") {
    Write-Host "  [OK] @types/html2canvas ya esta instalado" -ForegroundColor Green
} else {
    Write-Host "  [X] @types/html2canvas no esta instalado" -ForegroundColor Yellow
    $dependenciasFaltantes += "@types/html2canvas"
}

# Si todas las dependencias estan instaladas, verificar que se puedan importar
if ($dependenciasFaltantes.Count -eq 0) {
    Write-Host "`nTodas las dependencias estan instaladas. Verificando importacion..." -ForegroundColor Cyan
    
    # Crear un script temporal para verificar las importaciones
    $testScript = @'
const fs = require('fs');
const path = require('path');

const errors = [];
const warnings = [];

// Verificar jspdf
try {
    const jspdfPath = path.join(__dirname, 'node_modules', 'jspdf');
    if (fs.existsSync(jspdfPath)) {
        const pkg = JSON.parse(fs.readFileSync(path.join(jspdfPath, 'package.json'), 'utf8'));
        console.log(`OK jspdf - versión ${pkg.version}`);
    } else {
        errors.push('jspdf no encontrado en node_modules');
    }
} catch (e) {
    warnings.push(`jspdf: ${e.message}`);
}

// Verificar html2canvas
try {
    const html2canvasPath = path.join(__dirname, 'node_modules', 'html2canvas');
    if (fs.existsSync(html2canvasPath)) {
        const pkg = JSON.parse(fs.readFileSync(path.join(html2canvasPath, 'package.json'), 'utf8'));
        console.log(`OK html2canvas - versión ${pkg.version}`);
    } else {
        errors.push('html2canvas no encontrado en node_modules');
    }
} catch (e) {
    warnings.push(`html2canvas: ${e.message}`);
}

// Verificar jspdf-autotable
try {
    const autotablePath = path.join(__dirname, 'node_modules', 'jspdf-autotable');
    if (fs.existsSync(autotablePath)) {
        const pkg = JSON.parse(fs.readFileSync(path.join(autotablePath, 'package.json'), 'utf8'));
        console.log(`OK jspdf-autotable - versión ${pkg.version}`);
    } else {
        errors.push('jspdf-autotable no encontrado en node_modules');
    }
} catch (e) {
    warnings.push(`jspdf-autotable: ${e.message}`);
}

// Verificar @types/html2canvas
try {
    const typesPath = path.join(__dirname, 'node_modules', '@types', 'html2canvas');
    if (fs.existsSync(typesPath)) {
        const pkg = JSON.parse(fs.readFileSync(path.join(typesPath, 'package.json'), 'utf8'));
        console.log(`OK @types/html2canvas - versión ${pkg.version}`);
    } else {
        warnings.push('@types/html2canvas no encontrado (opcional para desarrollo)');
    }
} catch (e) {
    warnings.push(`@types/html2canvas: ${e.message}`);
}

if (errors.length > 0) {
    console.error('ERRORES:', errors.join(', '));
    process.exit(1);
}

if (warnings.length > 0) {
    console.warn('ADVERTENCIAS:', warnings.join(', '));
}
'@

    $testScriptPath = Join-Path (Get-Location) "verify-pdf-deps.js"
    
    try {
        $testScript | Out-File -FilePath $testScriptPath -Encoding UTF8
        $output = & node $testScriptPath 2>&1
        $output | ForEach-Object { 
            if ($_ -is [System.Management.Automation.ErrorRecord]) {
                Write-Host $_.ToString() -ForegroundColor Yellow
            } else {
                Write-Host $_
            }
        }
        
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Algunas dependencias tienen problemas, pero se intentara reinstalar."
            $dependenciasFaltantes = @("jspdf", "html2canvas", "jspdf-autotable", "@types/html2canvas")
        } else {
            Write-Host "`nTodas las dependencias estan correctamente instaladas y funcionando." -ForegroundColor Green
            if (Test-Path $testScriptPath) {
                Remove-Item $testScriptPath -ErrorAction SilentlyContinue
            }
            Pop-Location
            Write-Host "`n=== SETUP COMPLETADO ===" -ForegroundColor Green
            Write-Host "Las bibliotecas PDF estan listas para usar." -ForegroundColor White
            exit 0
        }
    } catch {
        $errorMsg = if ($_.Exception.Message) { 
            $_.Exception.Message 
        } elseif ($_.ToString()) { 
            $_.ToString() 
        } else { 
            "Error desconocido" 
        }
        Write-Warning "No se pudo verificar las importaciones: $errorMsg"
    } finally {
        if (Test-Path $testScriptPath) {
            Remove-Item $testScriptPath -ErrorAction SilentlyContinue
        }
    }
}

# Instalar dependencias faltantes
if ($dependenciasFaltantes.Count -gt 0) {
    Write-Host "`nInstalando dependencias faltantes..." -ForegroundColor Cyan
    
    # Leer package.json para verificar qué dependencias están definidas
    $packageJsonPath = Join-Path (Get-Location) "package.json"
    $packageJson = $null
    if (Test-Path $packageJsonPath) {
        try {
            $packageJsonContent = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
            $packageJson = $packageJsonContent
        } catch {
            Write-Warning "No se pudo leer package.json, se instalaran todas las dependencias"
        }
    }
    
    # Separar dependencias que están en package.json de las que no
    $dependenciasEnPackage = @()
    $dependenciasFaltantesEnPackage = @()
    
    foreach ($dep in $dependenciasFaltantes) {
        $enPackage = $false
        if ($packageJson) {
            # Verificar en dependencies
            if ($packageJson.dependencies.PSObject.Properties.Name -contains $dep) {
                $enPackage = $true
            }
            # Verificar en devDependencies
            if (-not $enPackage -and $packageJson.devDependencies -and $packageJson.devDependencies.PSObject.Properties.Name -contains $dep) {
                $enPackage = $true
            }
        }
        
        if ($enPackage) {
            $dependenciasEnPackage += $dep
        } else {
            $dependenciasFaltantesEnPackage += $dep
        }
    }
    
    $originalErrorAction = $ErrorActionPreference
    
    # Cambiar ErrorActionPreference para no detener el script en errores de npm
    $ErrorActionPreference = 'Continue'
    
    # No usar try-catch, solo ejecutar y continuar
        # Si hay dependencias en package.json, instalar todas las dependencias primero
        if ($dependenciasEnPackage.Count -gt 0) {
            Write-Host "Instalando dependencias del package.json..." -ForegroundColor Cyan
            
            # Verificar si existe package-lock.json para usar npm ci
            $useCi = Test-Path "package-lock.json"
            
            $npmInstallSuccess = $false
            
            if ($useCi) {
                Write-Host "Usando npm ci (lockfile encontrado)..." -ForegroundColor Gray
                $null = & npm ci 2>&1 | ForEach-Object { 
                    if ($_ -is [System.Management.Automation.ErrorRecord]) {
                        Write-Host $_.ToString() -ForegroundColor Yellow
                    } else {
                        Write-Host $_
                    }
                }
                $exitCode = $LASTEXITCODE
                if ($exitCode -eq 0) {
                    $npmInstallSuccess = $true
                } else {
                    Write-Warning "npm ci fallo con código $exitCode, intentando con npm install..."
                }
                
                if (-not $npmInstallSuccess) {
                    Write-Host "Usando npm install como alternativa..." -ForegroundColor Gray
                    $null = & npm install 2>&1 | ForEach-Object { 
                        if ($_ -is [System.Management.Automation.ErrorRecord]) {
                            Write-Host $_.ToString() -ForegroundColor Yellow
                        } else {
                            Write-Host $_
                        }
                    }
                    $exitCode = $LASTEXITCODE
                    if ($exitCode -eq 0) {
                        $npmInstallSuccess = $true
                    }
                }
            } else {
                Write-Host "Usando npm install..." -ForegroundColor Gray
                $null = & npm install 2>&1 | ForEach-Object { 
                    if ($_ -is [System.Management.Automation.ErrorRecord]) {
                        Write-Host $_.ToString() -ForegroundColor Yellow
                    } else {
                        Write-Host $_
                    }
                }
                $exitCode = $LASTEXITCODE
                if ($exitCode -eq 0) {
                    $npmInstallSuccess = $true
                }
            }
            
            if (-not $npmInstallSuccess) {
                Write-Warning "npm install fallo, pero continuando con instalacion individual de dependencias faltantes..."
            }
        }
        
        # Instalar dependencias que no están en package.json
        if ($dependenciasFaltantesEnPackage.Count -gt 0) {
            Write-Host "`nInstalando dependencias faltantes que no estan en package.json..." -ForegroundColor Cyan
            foreach ($dep in $dependenciasFaltantesEnPackage) {
                Write-Host "  Instalando $dep..." -ForegroundColor Gray
                # Ejecutar npm install directamente sin pipe complejo
                & npm install $dep --save
                $exitCode = $LASTEXITCODE
                if ($exitCode -ne 0) {
                    Write-Warning "  Fallo al instalar $dep (código: $exitCode)"
                } else {
                    Write-Host "  [OK] $dep instalado" -ForegroundColor Green
                }
            }
        }
        
        Write-Host "`n[OK] Proceso de instalacion completado" -ForegroundColor Green
        
        # Verificar nuevamente si aún faltan dependencias después de la instalación
        Write-Host "`nVerificando dependencias instaladas..." -ForegroundColor Cyan
        $dependenciasAunFaltantes = @()
        foreach ($dep in $dependenciasFaltantes) {
            $depPath = if ($dep -eq "@types/html2canvas") {
                "node_modules/@types/html2canvas"
            } else {
                "node_modules/$dep"
            }
            if (-not (Test-Path $depPath)) {
                $dependenciasAunFaltantes += $dep
                Write-Host "  [X] $dep aun no esta instalado" -ForegroundColor Yellow
            } else {
                Write-Host "  [OK] $dep instalado" -ForegroundColor Green
            }
        }
        
        # Si aún faltan dependencias, instalarlas explícitamente
        if ($dependenciasAunFaltantes.Count -gt 0) {
            Write-Host "`nInstalando dependencias faltantes explicitamente..." -ForegroundColor Cyan
            foreach ($dep in $dependenciasAunFaltantes) {
                Write-Host "  Instalando $dep..." -ForegroundColor Gray
                # Ejecutar npm install directamente sin pipe complejo
                & npm install $dep --save
                $exitCode = $LASTEXITCODE
                if ($exitCode -ne 0) {
                    Write-Warning "  Fallo al instalar $dep (código: $exitCode)"
                } else {
                    Write-Host "  [OK] $dep instalado correctamente" -ForegroundColor Green
                }
            }
        }
    
    # Restaurar ErrorActionPreference
    $ErrorActionPreference = $originalErrorAction
    
    # Verificar nuevamente después de la instalación
    Write-Host "`nVerificando instalacion..." -ForegroundColor Cyan
    $todasInstaladas = $true
    
    if (-not (Test-Path "node_modules/jspdf")) {
        Write-Error "jspdf no se instalo correctamente"
        $todasInstaladas = $false
    } else {
        Write-Host "  jspdf instalado" -ForegroundColor Green
    }
    
    if (-not (Test-Path "node_modules/html2canvas")) {
        Write-Error "html2canvas no se instalo correctamente"
        $todasInstaladas = $false
    } else {
        Write-Host "  html2canvas instalado" -ForegroundColor Green
    }
    
    if (-not (Test-Path "node_modules/jspdf-autotable")) {
        Write-Error "jspdf-autotable no se instalo correctamente"
        $todasInstaladas = $false
    } else {
        Write-Host "  jspdf-autotable instalado" -ForegroundColor Green
    }
    
    if (-not (Test-Path "node_modules/@types/html2canvas")) {
        Write-Warning "  @types/html2canvas no se instalo (opcional para desarrollo)"
    } else {
        Write-Host "  @types/html2canvas instalado" -ForegroundColor Green
    }
    
    if (-not $todasInstaladas) {
        Write-Error "Algunas dependencias no se instalaron correctamente."
        Pop-Location
        exit 1
    }
}

Write-Host "`n=== SETUP COMPLETADO ===" -ForegroundColor Green
Write-Host "Las bibliotecas PDF estan listas para usar:" -ForegroundColor White
Write-Host "  - jspdf: para generar archivos PDF" -ForegroundColor Gray
Write-Host "  - html2canvas: para capturar el HTML como imagen" -ForegroundColor Gray
Write-Host "  - jspdf-autotable: para generar tablas en PDF" -ForegroundColor Gray
Write-Host "  - @types/html2canvas: tipos TypeScript (desarrollo)" -ForegroundColor Gray
Write-Host ""
Write-Host "Para usar en Docker, las dependencias se instalaran automaticamente" -ForegroundColor Yellow
Write-Host "  al reconstruir la imagen con docker-compose build frontend" -ForegroundColor Gray

Pop-Location

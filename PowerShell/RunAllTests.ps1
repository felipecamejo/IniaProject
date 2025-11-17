# Script para ejecutar todos los tests del proyecto INIA de forma integrada
# Ejecuta tests del Backend (Java), Middleware (Python) y opcionalmente Frontend (Angular)

param(
    [switch]$Backend,              # Ejecutar solo tests del backend
    [switch]$Middleware,            # Ejecutar solo tests del middleware
    [switch]$Frontend,              # Ejecutar solo tests del frontend
    [switch]$Coverage,              # Incluir reportes de cobertura
    [switch]$SkipFrontend,         # Omitir tests del frontend
    [switch]$Verbose,               # Salida detallada
    [switch]$Help                   # Mostrar ayuda
)

# Colores para output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"
$White = "White"

$ErrorActionPreference = "Continue"
$script:TotalTests = 0
$script:TotalPassed = 0
$script:TotalFailed = 0
$script:Results = @()

function Show-Help {
    Write-Host "========================================" -ForegroundColor $Cyan
    Write-Host "  Ejecutar Todos los Tests - Proyecto INIA" -ForegroundColor $Cyan
    Write-Host "========================================" -ForegroundColor $Cyan
    Write-Host ""
    Write-Host "Uso:" -ForegroundColor $Yellow
    Write-Host "  .\PowerShell\RunAllTests.ps1 [opciones]"
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor $Yellow
    Write-Host "  -Backend          Ejecutar solo tests del backend (Java/Maven)"
    Write-Host "  -Middleware       Ejecutar solo tests del middleware (Python/pytest)"
    Write-Host "  -Frontend         Ejecutar solo tests del frontend (Angular/Jasmine)"
    Write-Host "  -Coverage         Incluir reportes de cobertura"
    Write-Host "  -SkipFrontend     Omitir tests del frontend"
    Write-Host "  -Verbose          Salida detallada"
    Write-Host "  -Help             Mostrar esta ayuda"
    Write-Host ""
    Write-Host "Ejemplos:" -ForegroundColor $Yellow
    Write-Host "  .\PowerShell\RunAllTests.ps1"
    Write-Host "  .\PowerShell\RunAllTests.ps1 -Coverage"
    Write-Host "  .\PowerShell\RunAllTests.ps1 -Backend -Coverage"
    Write-Host "  .\PowerShell\RunAllTests.ps1 -Middleware -Verbose"
    Write-Host "  .\PowerShell\RunAllTests.ps1 -SkipFrontend"
    Write-Host ""
}

function Write-Section {
    param([string]$Message)
    Write-Host ""
    Write-Host "========================================" -ForegroundColor $Cyan
    Write-Host "  $Message" -ForegroundColor $Cyan
    Write-Host "========================================" -ForegroundColor $Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor $Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor $Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor $Yellow
}

function Test-Backend {
    Write-Section "Tests del Backend (Java/Maven)"
    
    if (-not (Test-Path "pom.xml")) {
        Write-Error "No se encontró pom.xml. Asegúrate de estar en el directorio raíz del proyecto."
        return $false
    }
    
    if (-not (Get-Command "mvn" -ErrorAction SilentlyContinue)) {
        Write-Error "Maven no está instalado o no está en el PATH."
        return $false
    }
    
    Write-Info "Ejecutando tests del backend con Maven..."
    
    $mvnCommand = "mvn clean test"
    if ($Coverage) {
        $mvnCommand += " jacoco:report"
    }
    
    if (-not $Verbose) {
        $mvnCommand += " -q"
    }
    
    try {
        $startTime = Get-Date
        Invoke-Expression $mvnCommand | Out-String | ForEach-Object {
            if ($Verbose) {
                Write-Host $_
            } else {
                # Filtrar solo líneas importantes
                if ($_ -match "Tests run:|BUILD SUCCESS|BUILD FAILURE|ERROR") {
                    Write-Host $_
                }
            }
        }
        
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalSeconds
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Tests del backend completados exitosamente (${duration}s)"
            
            if ($Coverage) {
                $reportPath = "target\site\jacoco\index.html"
                if (Test-Path $reportPath) {
                    Write-Info "Reporte de cobertura: $reportPath"
                }
            }
            
            $script:Results += @{
                Component = "Backend"
                Status = "Success"
                Duration = $duration
            }
            return $true
        } else {
            Write-Error "Tests del backend fallaron"
            $script:Results += @{
                Component = "Backend"
                Status = "Failed"
                Duration = $duration
            }
            return $false
        }
    } catch {
        Write-Error "Error ejecutando tests del backend: $_"
        $script:Results += @{
            Component = "Backend"
            Status = "Error"
            Duration = 0
        }
        return $false
    }
}

function Test-Middleware {
    Write-Section "Tests del Middleware (Python/pytest)"
    
    if (-not (Test-Path "middleware")) {
        Write-Error "No se encontró el directorio middleware."
        return $false
    }
    
    if (-not (Get-Command "pytest" -ErrorAction SilentlyContinue)) {
        Write-Info "pytest no encontrado. Intentando instalar dependencias..."
        Push-Location middleware
        try {
            pip install -r requirements.txt 2>&1 | Out-Null
        } catch {
            Write-Error "No se pudieron instalar las dependencias de Python."
            Pop-Location
            return $false
        }
        Pop-Location
    }
    
    Write-Info "Ejecutando tests del middleware con pytest..."
    
    Push-Location middleware
    
    try {
        $pytestCommand = "pytest"
        if ($Coverage) {
            $pytestCommand += " --cov=http_server --cov-report=html --cov-report=term"
        }
        if (-not $Verbose) {
            $pytestCommand += " -q"
        } else {
            $pytestCommand += " -v"
        }
        
        $startTime = Get-Date
        Invoke-Expression $pytestCommand | Out-String | ForEach-Object {
            if ($Verbose -or $_ -match "PASSED|FAILED|ERROR|passed|failed") {
                Write-Host $_
            }
        }
        
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalSeconds
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Tests del middleware completados exitosamente (${duration}s)"
            
            if ($Coverage) {
                $reportPath = "htmlcov\index.html"
                if (Test-Path $reportPath) {
                    Write-Info "Reporte de cobertura: middleware\$reportPath"
                }
            }
            
            $script:Results += @{
                Component = "Middleware"
                Status = "Success"
                Duration = $duration
            }
            Pop-Location
            return $true
        } else {
            Write-Error "Tests del middleware fallaron"
            $script:Results += @{
                Component = "Middleware"
                Status = "Failed"
                Duration = $duration
            }
            Pop-Location
            return $false
        }
    } catch {
        Write-Error "Error ejecutando tests del middleware: $_"
        $script:Results += @{
            Component = "Middleware"
            Status = "Error"
            Duration = 0
        }
        Pop-Location
        return $false
    }
}

function Test-Frontend {
    Write-Section "Tests del Frontend (Angular/Jasmine)"
    
    if (-not (Test-Path "frontend")) {
        Write-Error "No se encontró el directorio frontend."
        return $false
    }
    
    if (-not (Get-Command "npm" -ErrorAction SilentlyContinue)) {
        Write-Error "npm no está instalado o no está en el PATH."
        return $false
    }
    
    Write-Info "Ejecutando tests del frontend con Angular..."
    
    Push-Location frontend
    
    try {
        # Verificar que node_modules existe
        if (-not (Test-Path "node_modules")) {
            Write-Info "Instalando dependencias del frontend..."
            npm install 2>&1 | Out-Null
        }
        
        $startTime = Get-Date
        npm test -- --watch=false --browsers=ChromeHeadless 2>&1 | Out-String | ForEach-Object {
            if ($Verbose -or $_ -match "SUCCESS|FAILED|ERROR|Executed") {
                Write-Host $_
            }
        }
        
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalSeconds
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Tests del frontend completados exitosamente (${duration}s)"
            $script:Results += @{
                Component = "Frontend"
                Status = "Success"
                Duration = $duration
            }
            Pop-Location
            return $true
        } else {
            Write-Error "Tests del frontend fallaron"
            $script:Results += @{
                Component = "Frontend"
                Status = "Failed"
                Duration = $duration
            }
            Pop-Location
            return $false
        }
    } catch {
        Write-Error "Error ejecutando tests del frontend: $_"
        $script:Results += @{
            Component = "Frontend"
            Status = "Error"
            Duration = 0
        }
        Pop-Location
        return $false
    }
}

function Show-Summary {
    Write-Host ""
    Write-Section "Resumen de Ejecución"
    
    $totalDuration = ($script:Results | Measure-Object -Property Duration -Sum).Sum
    
    foreach ($result in $script:Results) {
        $statusColor = if ($result.Status -eq "Success") { $Green } else { $Red }
        $statusSymbol = if ($result.Status -eq "Success") { "✓" } else { "✗" }
        Write-Host "$statusSymbol $($result.Component): " -NoNewline
        Write-Host "$($result.Status) " -ForegroundColor $statusColor -NoNewline
        Write-Host "($([math]::Round($result.Duration, 2))s)"
    }
    
    Write-Host ""
    Write-Host "Tiempo total: $([math]::Round($totalDuration, 2))s" -ForegroundColor $Cyan
    
    $allPassed = ($script:Results | Where-Object { $_.Status -ne "Success" }).Count -eq 0
    
    if ($allPassed) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor $Green
        Write-Host "  Todos los tests pasaron exitosamente" -ForegroundColor $Green
        Write-Host "========================================" -ForegroundColor $Green
        return 0
    } else {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor $Red
        Write-Host "  Algunos tests fallaron" -ForegroundColor $Red
        Write-Host "========================================" -ForegroundColor $Red
        return 1
    }
}

# Main
if ($Help) {
    Show-Help
    exit 0
}

Write-Host ""
Write-Host "========================================" -ForegroundColor $Cyan
Write-Host "  Ejecutando Tests Integrados" -ForegroundColor $Cyan
Write-Host "  Proyecto INIA" -ForegroundColor $Cyan
Write-Host "========================================" -ForegroundColor $Cyan
Write-Host ""

# Determinar qué tests ejecutar
$runBackend = $Backend -or (-not $Middleware -and -not $Frontend)
$runMiddleware = $Middleware -or (-not $Backend -and -not $Frontend)
$runFrontend = $Frontend -or (-not $Backend -and -not $Middleware -and -not $SkipFrontend)

$overallSuccess = $true

# Ejecutar tests del backend
if ($runBackend) {
    if (-not (Test-Backend)) {
        $overallSuccess = $false
    }
}

# Ejecutar tests del middleware
if ($runMiddleware) {
    if (-not (Test-Middleware)) {
        $overallSuccess = $false
    }
}

# Ejecutar tests del frontend
if ($runFrontend -and -not $SkipFrontend) {
    if (-not (Test-Frontend)) {
        $overallSuccess = $false
    }
}

# Mostrar resumen
$exitCode = Show-Summary

Write-Host ""
Write-Host "Para más información, consulta:" -ForegroundColor $Cyan
Write-Host "  - GUIA-EJECUCION-TESTS.md" -ForegroundColor $White
Write-Host "  - middleware/FASTAPI-TESTS-README.md" -ForegroundColor $White
Write-Host "  - TESTCONTAINERS-README.md" -ForegroundColor $White
Write-Host ""

exit $exitCode


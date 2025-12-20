# Script para subir imagenes Docker a AWS ECR
# Ubicacion: IniaProject/scriptDockers/subir-imagenes-ecr.ps1
# Uso: .\scriptDockers\subir-imagenes-ecr.ps1 [-Service <nombre>] [-All] [-Build]

param(
    [string]$Service = "",
    [switch]$All = $false,
    [switch]$Build = $false,
    [string]$Tag = "latest",
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "Uso: .\scriptDockers\subir-imagenes-ecr.ps1 [opciones]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor Yellow
    Write-Host "  -Service <nombre>  Subir solo un servicio (backend, frontend, middleware)" -ForegroundColor White
    Write-Host "  -All               Subir todos los servicios" -ForegroundColor White
    Write-Host "  -Build             Construir imagenes antes de subir" -ForegroundColor White
    Write-Host "  -Tag <tag>         Tag para las imagenes (default: latest)" -ForegroundColor White
    Write-Host "  -Help              Mostrar esta ayuda" -ForegroundColor White
    Write-Host ""
    Write-Host "Ejemplos:" -ForegroundColor Yellow
    Write-Host "  .\scriptDockers\subir-imagenes-ecr.ps1 -All" -ForegroundColor Gray
    Write-Host "  .\scriptDockers\subir-imagenes-ecr.ps1 -Service backend" -ForegroundColor Gray
    Write-Host "  .\scriptDockers\subir-imagenes-ecr.ps1 -All -Build" -ForegroundColor Gray
    Write-Host "  .\scriptDockers\subir-imagenes-ecr.ps1 -Service frontend -Tag v1.0.0" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Prerequisitos:" -ForegroundColor Yellow
    Write-Host "  - Docker Desktop ejecutandose" -ForegroundColor White
    Write-Host "  - AWS CLI configurado con credenciales validas" -ForegroundColor White
    Write-Host "  - Terraform aplicado exitosamente (recursos ECR creados)" -ForegroundColor White
    Write-Host "  - Imagenes Docker locales construidas (o usar -Build)" -ForegroundColor White
    Write-Host ""
    Write-Host "NOTA: Este script requiere que la infraestructura AWS este desplegada" -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Subir Imagenes Docker a AWS ECR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuracion inicial del entorno
Write-Host "Configurando entorno..." -ForegroundColor Gray
$originalLocation = Get-Location
Set-Location C:\Github\IniaProject
$env:Path += ";$env:USERPROFILE\terraform"
Write-Host ""

# Funciones de utilidad
function Test-DockerRunning {
    try {
        $null = docker version 2>&1
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

function Test-AwsCli {
    try {
        $null = aws --version 2>&1
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

function Test-TerraformState {
    $tfStateFile = "terraform\terraform.tfstate"
    if (-not (Test-Path $tfStateFile)) {
        return $false
    }
    
    $content = Get-Content $tfStateFile -Raw | ConvertFrom-Json
    return ($content.resources.Count -gt 0)
}

function Get-EcrRepositoryUrl {
    param([string]$ServiceName)
    
    Push-Location terraform
    try {
        $output = terraform output -raw "ecr_${ServiceName}_repository_url" 2>&1
        if ($LASTEXITCODE -eq 0) {
            return $output.Trim()
        }
        return $null
    } catch {
        return $null
    } finally {
        Pop-Location
    }
}

function Test-AwsCredentialsExist {
    $credentialsPath = "$env:USERPROFILE\.aws\credentials"
    $configPath = "$env:USERPROFILE\.aws\config"
    
    $result = @{
        CredentialsFileExists = Test-Path $credentialsPath
        ConfigFileExists = Test-Path $configPath
        CredentialsPath = $credentialsPath
        ConfigPath = $configPath
    }
    
    if ($result.CredentialsFileExists) {
        try {
            $credContent = Get-Content $credentialsPath -Raw
            $result.HasAccessKey = $credContent -match "aws_access_key_id"
            $result.HasSecretKey = $credContent -match "aws_secret_access_key"
        } catch {
            $result.HasAccessKey = $false
            $result.HasSecretKey = $false
        }
    } else {
        $result.HasAccessKey = $false
        $result.HasSecretKey = $false
    }
    
    return $result
}

function Test-AwsCredentialsValid {
    try {
        $output = aws sts get-caller-identity --query Account --output text 2>&1
        if ($LASTEXITCODE -eq 0 -and $output -match "^\d+$") {
            return @{
                Valid = $true
                AccountId = $output.Trim()
                ErrorMessage = $null
            }
        } else {
            return @{
                Valid = $false
                AccountId = $null
                ErrorMessage = $output
            }
        }
    } catch {
        return @{
            Valid = $false
            AccountId = $null
            ErrorMessage = $_.Exception.Message
        }
    }
}

function Show-AwsCredentialsHelp {
    Write-Host ""
    Write-Host "===================================================" -ForegroundColor Yellow
    Write-Host "  Como Configurar Credenciales de AWS" -ForegroundColor Yellow
    Write-Host "===================================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opcion 1 - Usar aws configure (RECOMENDADO):" -ForegroundColor Cyan
    Write-Host "  aws configure" -ForegroundColor White
    Write-Host ""
    Write-Host "  Te pedira:" -ForegroundColor Gray
    Write-Host "    - AWS Access Key ID: [tu access key]" -ForegroundColor Gray
    Write-Host "    - AWS Secret Access Key: [tu secret key]" -ForegroundColor Gray
    Write-Host "    - Default region name: us-east-1" -ForegroundColor Gray
    Write-Host "    - Default output format: json" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Opcion 2 - Crear archivos manualmente:" -ForegroundColor Cyan
    Write-Host "  Archivo: $env:USERPROFILE\.aws\credentials" -ForegroundColor White
    Write-Host "  Contenido:" -ForegroundColor Gray
    Write-Host "    [default]" -ForegroundColor Gray
    Write-Host "    aws_access_key_id = TU_ACCESS_KEY" -ForegroundColor Gray
    Write-Host "    aws_secret_access_key = TU_SECRET_KEY" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Archivo: $env:USERPROFILE\.aws\config" -ForegroundColor White
    Write-Host "  Contenido:" -ForegroundColor Gray
    Write-Host "    [default]" -ForegroundColor Gray
    Write-Host "    region = us-east-1" -ForegroundColor Gray
    Write-Host "    output = json" -ForegroundColor Gray
    Write-Host ""
    Write-Host "NOTAS IMPORTANTES:" -ForegroundColor Yellow
    Write-Host "  - Para AWS normal: Solo necesitas Access Key y Secret Key" -ForegroundColor Gray
    Write-Host "  - Para AWS Academy: Tambien necesitas Session Token (expira cada 4 horas)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "===================================================" -ForegroundColor Yellow
    Write-Host ""
}

function Get-AwsAccountId {
    try {
        $output = aws sts get-caller-identity --query Account --output text 2>&1
        if ($LASTEXITCODE -eq 0) {
            return $output.Trim()
        }
        return $null
    } catch {
        return $null
    }
}

function Get-AwsRegion {
    Push-Location terraform
    try {
        $output = terraform output -raw aws_region 2>&1
        if ($LASTEXITCODE -eq 0) {
            return $output.Trim()
        }
        # Fallback a us-east-1
        return "us-east-1"
    } catch {
        return "us-east-1"
    } finally {
        Pop-Location
    }
}

function Test-EcrRepositoriesExist {
    param([string]$Region)
    
    try {
        $output = aws ecr describe-repositories --region $Region 2>&1
        if ($LASTEXITCODE -eq 0) {
            $repos = $output | ConvertFrom-Json
            $repoNames = $repos.repositories | ForEach-Object { $_.repositoryName }
            
            $hasBackend = $repoNames -contains "inia-prod-backend"
            $hasFrontend = $repoNames -contains "inia-prod-frontend"
            $hasMiddleware = $repoNames -contains "inia-prod-middleware"
            
            return @{
                Exist = $hasBackend -and $hasFrontend -and $hasMiddleware
                Backend = $hasBackend
                Frontend = $hasFrontend
                Middleware = $hasMiddleware
                Total = $repos.repositories.Count
            }
        }
        return @{
            Exist = $false
            Backend = $false
            Frontend = $false
            Middleware = $false
            Total = 0
        }
    } catch {
        return @{
            Exist = $false
            Backend = $false
            Frontend = $false
            Middleware = $false
            Total = 0
            Error = $_.Exception.Message
        }
    }
}

function Build-DockerImage {
    param([string]$ServiceName)
    
    Write-Host "  Construyendo imagen para: $ServiceName..." -ForegroundColor Yellow
    
    $composeFile = "docker-compose.ecs.yml"
    $buildCommand = "docker compose -f $composeFile --env-file .env build $ServiceName"
    
    Invoke-Expression $buildCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Imagen construida exitosamente" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  ERROR al construir imagen" -ForegroundColor Red
        return $false
    }
}

function Push-ImageToEcr {
    param(
        [string]$ServiceName,
        [string]$LocalImageName,
        [string]$EcrUrl,
        [string]$ImageTag
    )
    
    Write-Host ""
    Write-Host "[$ServiceName] Subiendo imagen a ECR..." -ForegroundColor Cyan
    Write-Host "  Imagen local: $LocalImageName" -ForegroundColor Gray
    Write-Host "  Repositorio ECR: $EcrUrl" -ForegroundColor Gray
    Write-Host "  Tag: $ImageTag" -ForegroundColor Gray
    Write-Host ""
    
    # Paso 1: Etiquetar imagen
    Write-Host "  [1/2] Etiquetando imagen..." -ForegroundColor Yellow
    $tagCommand = "docker tag ${LocalImageName}:${ImageTag} ${EcrUrl}:${ImageTag}"
    Invoke-Expression $tagCommand
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERROR al etiquetar imagen" -ForegroundColor Red
        return $false
    }
    Write-Host "  Imagen etiquetada correctamente" -ForegroundColor Green
    
    # Paso 2: Push a ECR
    Write-Host "  [2/2] Subiendo imagen a ECR..." -ForegroundColor Yellow
    $pushCommand = "docker push ${EcrUrl}:${ImageTag}"
    Invoke-Expression $pushCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Imagen subida exitosamente a ECR" -ForegroundColor Green
        Write-Host ""
        return $true
    } else {
        Write-Host "  ERROR al subir imagen a ECR" -ForegroundColor Red
        Write-Host ""
        return $false
    }
}

# Validaciones previas
Write-Host "[1/5] Validando prerequisitos..." -ForegroundColor Cyan
Write-Host ""

# Verificar Docker
if (-not (Test-DockerRunning)) {
    Write-Host "ERROR: Docker Desktop no esta ejecutandose" -ForegroundColor Red
    Write-Host "Por favor inicia Docker Desktop e intenta nuevamente" -ForegroundColor Yellow
    Set-Location $originalLocation
    exit 1
}
Write-Host "  Docker Desktop: OK" -ForegroundColor Green

# Verificar AWS CLI
if (-not (Test-AwsCli)) {
    Write-Host "ERROR: AWS CLI no esta instalado o no esta en el PATH" -ForegroundColor Red
    Write-Host "Instala AWS CLI desde: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    Set-Location $originalLocation
    exit 1
}
Write-Host "  AWS CLI: OK" -ForegroundColor Green

# Verificar estado de Terraform
if (-not (Test-TerraformState)) {
    Write-Host "ERROR: Terraform no ha sido aplicado o no hay estado" -ForegroundColor Red
    Write-Host "Ejecuta 'terraform apply' primero para crear los repositorios ECR" -ForegroundColor Yellow
    Set-Location $originalLocation
    exit 1
}
Write-Host "  Terraform State: OK" -ForegroundColor Green

# Verificar credenciales AWS
Write-Host ""
Write-Host "Verificando credenciales AWS..." -ForegroundColor Cyan

# Paso 1: Verificar si existen archivos de credenciales
$credsCheck = Test-AwsCredentialsExist
Write-Host "  Archivo credentials: " -NoNewline -ForegroundColor Gray
if ($credsCheck.CredentialsFileExists) {
    Write-Host "Encontrado" -ForegroundColor Green
    Write-Host "    Ubicacion: $($credsCheck.CredentialsPath)" -ForegroundColor Gray
    Write-Host "    Access Key configurada: " -NoNewline -ForegroundColor Gray
    if ($credsCheck.HasAccessKey) {
        Write-Host "Si" -ForegroundColor Green
    } else {
        Write-Host "No" -ForegroundColor Red
    }
    Write-Host "    Secret Key configurada: " -NoNewline -ForegroundColor Gray
    if ($credsCheck.HasSecretKey) {
        Write-Host "Si" -ForegroundColor Green
    } else {
        Write-Host "No" -ForegroundColor Red
    }
} else {
    Write-Host "NO ENCONTRADO" -ForegroundColor Red
    Write-Host "    Se esperaba en: $($credsCheck.CredentialsPath)" -ForegroundColor Gray
}
Write-Host ""

# Paso 2: Verificar si existen archivo de configuracion
Write-Host "  Archivo config: " -NoNewline -ForegroundColor Gray
if ($credsCheck.ConfigFileExists) {
    Write-Host "Encontrado" -ForegroundColor Green
    Write-Host "    Ubicacion: $($credsCheck.ConfigPath)" -ForegroundColor Gray
} else {
    Write-Host "NO ENCONTRADO" -ForegroundColor Yellow
    Write-Host "    Se esperaba en: $($credsCheck.ConfigPath)" -ForegroundColor Gray
}
Write-Host ""

# Paso 3: Validar que las credenciales funcionen
Write-Host "  Validando credenciales con AWS..." -ForegroundColor Gray
$validationResult = Test-AwsCredentialsValid

if ($validationResult.Valid) {
    Write-Host "  Credenciales AWS: VALIDAS" -ForegroundColor Green
    Write-Host "  AWS Account ID: $($validationResult.AccountId)" -ForegroundColor Green
    $accountId = $validationResult.AccountId
} else {
    Write-Host "  Credenciales AWS: INVALIDAS o EXPIRADAS" -ForegroundColor Red
    Write-Host ""
    
    if (-not $credsCheck.CredentialsFileExists) {
        Write-Host "  Problema detectado: No hay archivo de credenciales" -ForegroundColor Yellow
    } elseif (-not $credsCheck.HasAccessKey -or -not $credsCheck.HasSecretKey) {
        Write-Host "  Problema detectado: Credenciales incompletas" -ForegroundColor Yellow
    } else {
        Write-Host "  Problema detectado: Credenciales expiradas o invalidas" -ForegroundColor Yellow
        if ($validationResult.ErrorMessage -match "ExpiredToken") {
            Write-Host "  Nota: Si usas AWS Academy, las credenciales expiran cada 4 horas" -ForegroundColor Yellow
            Write-Host "        Obten nuevas credenciales desde el panel 'AWS Details'" -ForegroundColor Yellow
        }
    }
    
    Show-AwsCredentialsHelp
    Set-Location $originalLocation
    exit 1
}
Write-Host ""

# Obtener region
$region = Get-AwsRegion
Write-Host "  Region AWS: $region" -ForegroundColor Green
Write-Host ""

# Verificar que los repositorios ECR existan
Write-Host "Verificando repositorios ECR en AWS..." -ForegroundColor Cyan
$ecrCheck = Test-EcrRepositoriesExist -Region $region

Write-Host "  Total de repositorios ECR: $($ecrCheck.Total)" -ForegroundColor Gray
Write-Host "  Repositorio backend (inia-prod-backend): " -NoNewline -ForegroundColor Gray
if ($ecrCheck.Backend) {
    Write-Host "EXISTE" -ForegroundColor Green
} else {
    Write-Host "NO EXISTE" -ForegroundColor Red
}

Write-Host "  Repositorio frontend (inia-prod-frontend): " -NoNewline -ForegroundColor Gray
if ($ecrCheck.Frontend) {
    Write-Host "EXISTE" -ForegroundColor Green
} else {
    Write-Host "NO EXISTE" -ForegroundColor Red
}

Write-Host "  Repositorio middleware (inia-prod-middleware): " -NoNewline -ForegroundColor Gray
if ($ecrCheck.Middleware) {
    Write-Host "EXISTE" -ForegroundColor Green
} else {
    Write-Host "NO EXISTE" -ForegroundColor Red
}
Write-Host ""

if (-not $ecrCheck.Exist) {
    Write-Host "ERROR: Los repositorios ECR no existen en AWS" -ForegroundColor Red
    Write-Host ""
    Write-Host "Los repositorios ECR se crean ejecutando Terraform." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pasos para crear los repositorios:" -ForegroundColor Cyan
    Write-Host "  1. cd C:\Github\IniaProject\terraform" -ForegroundColor White
    Write-Host "  2. terraform apply" -ForegroundColor White
    Write-Host "  3. Escribe 'yes' cuando te lo pida" -ForegroundColor White
    Write-Host "  4. Espera 10-15 minutos a que se creen todos los recursos" -ForegroundColor White
    Write-Host ""
    Write-Host "Despues de ejecutar 'terraform apply', vuelve a ejecutar este script." -ForegroundColor Cyan
    Write-Host ""
    Set-Location $originalLocation
    exit 1
}

Write-Host "  Repositorios ECR: LISTOS" -ForegroundColor Green
Write-Host ""

# Definir servicios
$services = @()
if ($All) {
    $services = @("backend", "frontend", "middleware")
    Write-Host "Modo: Subir TODOS los servicios" -ForegroundColor Cyan
} elseif ($Service) {
    $validServices = @("backend", "frontend", "middleware")
    if ($validServices -contains $Service.ToLower()) {
        $services = @($Service.ToLower())
        Write-Host "Modo: Subir servicio individual ($Service)" -ForegroundColor Cyan
    } else {
        Write-Host "ERROR: Servicio invalido: $Service" -ForegroundColor Red
        Write-Host "Servicios validos: backend, frontend, middleware" -ForegroundColor Yellow
        Set-Location $originalLocation
        exit 1
    }
} else {
    Write-Host "ERROR: Debes especificar -Service <nombre> o -All" -ForegroundColor Red
    Write-Host "Usa -Help para ver las opciones disponibles" -ForegroundColor Yellow
    Set-Location $originalLocation
    exit 1
}
Write-Host ""

# Paso 2: Autenticacion en ECR
Write-Host "[2/5] Autenticando en AWS ECR..." -ForegroundColor Cyan
Write-Host ""

$ecrLoginCommand = "aws ecr get-login-password --region $region | docker login --username AWS --password-stdin ${accountId}.dkr.ecr.${region}.amazonaws.com"
Invoke-Expression $ecrLoginCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No se pudo autenticar en ECR" -ForegroundColor Red
    Write-Host "Verifica tus credenciales AWS" -ForegroundColor Yellow
    Set-Location $originalLocation
    exit 1
}
Write-Host ""
Write-Host "  Autenticacion exitosa en ECR" -ForegroundColor Green
Write-Host ""

# Paso 3: Construir imagenes (opcional)
if ($Build) {
    Write-Host "[3/5] Construyendo imagenes Docker..." -ForegroundColor Cyan
    Write-Host ""
    
    foreach ($svc in $services) {
        if (-not (Build-DockerImage -ServiceName $svc)) {
            Write-Host "ERROR: Fallo al construir imagen para $svc" -ForegroundColor Red
            Set-Location $originalLocation
            exit 1
        }
    }
    Write-Host ""
} else {
    Write-Host "[3/5] Construccion de imagenes: OMITIDA (usar -Build para construir)" -ForegroundColor Yellow
    Write-Host ""
}

# Paso 4: Obtener URLs de ECR
Write-Host "[4/5] Obteniendo URLs de repositorios ECR..." -ForegroundColor Cyan
Write-Host ""

$serviceInfo = @{}
foreach ($svc in $services) {
    $ecrUrl = Get-EcrRepositoryUrl -ServiceName $svc
    if (-not $ecrUrl) {
        Write-Host "ERROR: No se pudo obtener URL de ECR para $svc" -ForegroundColor Red
        Write-Host "Verifica que el repositorio exista en AWS" -ForegroundColor Yellow
        Set-Location $originalLocation
        exit 1
    }
    
    # Determinar nombre de imagen local
    $localImageName = switch ($svc) {
        "backend" { "inia-backend-ecs" }
        "frontend" { "inia-frontend-ecs" }
        "middleware" { "inia-middleware-ecs" }
    }
    
    $serviceInfo[$svc] = @{
        LocalImage = $localImageName
        EcrUrl = $ecrUrl
    }
    
    Write-Host "  [$svc] $ecrUrl" -ForegroundColor Green
}
Write-Host ""

# Paso 5: Subir imagenes
Write-Host "[5/5] Subiendo imagenes a ECR..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($svc in $services) {
    $info = $serviceInfo[$svc]
    
    $success = Push-ImageToEcr `
        -ServiceName $svc `
        -LocalImageName $info.LocalImage `
        -EcrUrl $info.EcrUrl `
        -ImageTag $Tag
    
    if ($success) {
        $successCount++
    } else {
        $failCount++
    }
}

# Resumen final
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Resumen de Subida" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Exitosas: $successCount" -ForegroundColor Green
Write-Host "  Fallidas:  $failCount" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "EXITO: Todas las imagenes fueron subidas correctamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximos pasos:" -ForegroundColor Cyan
    Write-Host "  1. Verifica las imagenes en AWS Console > ECR" -ForegroundColor White
    Write-Host "  2. Los servicios ECS se actualizaran automaticamente si ya estan corriendo" -ForegroundColor White
    Write-Host "  3. Si es la primera vez, espera a que ECS despliegue los servicios" -ForegroundColor White
    Write-Host ""
    Set-Location $originalLocation
    exit 0
} else {
    Write-Host "ADVERTENCIA: Algunas imagenes no pudieron subirse" -ForegroundColor Yellow
    Write-Host "Revisa los errores anteriores para mas detalles" -ForegroundColor Yellow
    Write-Host ""
    Set-Location $originalLocation
    exit 1
}

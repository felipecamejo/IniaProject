# Script de despliegue en AWS para Proyecto INIA
# Uso: .\deploy-aws.ps1

param(
    [switch]$SkipPlan = $false,
    [switch]$SkipInfrastructure = $false,
    [switch]$SkipImages = $false
)

$ErrorActionPreference = "Stop"

Write-Host "`n=== Despliegue en AWS - Proyecto INIA ===" -ForegroundColor Green
Write-Host "`nEste script realizará:" -ForegroundColor Cyan
Write-Host "1. Verificación de credenciales AWS" -ForegroundColor White
Write-Host "2. Planificación de infraestructura (Terraform plan)" -ForegroundColor White
Write-Host "3. Aplicación de infraestructura (Terraform apply)" -ForegroundColor White
Write-Host "4. Construcción y subida de imágenes Docker a ECR" -ForegroundColor White
Write-Host "5. Verificación del despliegue" -ForegroundColor White

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "main.tf")) {
    Write-Host "`n❌ Error: Este script debe ejecutarse desde el directorio terraform/" -ForegroundColor Red
    exit 1
}

# Verificar AWS CLI
Write-Host "`n[1/5] Verificando AWS CLI..." -ForegroundColor Yellow
try {
    $awsVersion = aws --version 2>&1
    Write-Host "✅ AWS CLI encontrado: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: AWS CLI no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}

# Verificar credenciales AWS
Write-Host "`n[1/5] Verificando credenciales AWS..." -ForegroundColor Yellow
try {
    $accountId = aws sts get-caller-identity --query Account --output text 2>&1
    $userId = aws sts get-caller-identity --query Arn --output text 2>&1
    Write-Host "✅ Credenciales válidas" -ForegroundColor Green
    Write-Host "   Account ID: $accountId" -ForegroundColor Gray
    Write-Host "   Usuario: $userId" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: No se pudieron verificar las credenciales AWS" -ForegroundColor Red
    Write-Host "   Asegúrate de tener configuradas las credenciales con 'aws configure'" -ForegroundColor Yellow
    exit 1
}

# Obtener región desde terraform.tfvars
Write-Host "`n[1/5] Obteniendo configuración..." -ForegroundColor Yellow
$region = "us-east-1"
if (Test-Path "terraform.tfvars") {
    $tfvarsContent = Get-Content "terraform.tfvars" -Raw
    if ($tfvarsContent -match 'aws_region\s*=\s*"([^"]+)"') {
        $region = $matches[1]
    }
}
Write-Host "✅ Región: $region" -ForegroundColor Green

# Verificar Terraform
Write-Host "`n[1/5] Verificando Terraform..." -ForegroundColor Yellow
try {
    $tfVersion = terraform version -json | ConvertFrom-Json | Select-Object -ExpandProperty terraform_version
    Write-Host "✅ Terraform encontrado: v$tfVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Terraform no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}

# Inicializar Terraform si es necesario
if (-not (Test-Path ".terraform")) {
    Write-Host "`n[1/5] Inicializando Terraform..." -ForegroundColor Yellow
    terraform init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al inicializar Terraform" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Terraform inicializado" -ForegroundColor Green
}

# Paso 2: Planificar infraestructura
if (-not $SkipPlan) {
    Write-Host "`n[2/5] Planificando infraestructura (terraform plan)..." -ForegroundColor Yellow
    Write-Host "   Esto puede tardar unos minutos..." -ForegroundColor Gray
    
    terraform plan -out=tfplan
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al planificar infraestructura" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "`n✅ Plan generado exitosamente" -ForegroundColor Green
    Write-Host "   Revisa el plan antes de continuar" -ForegroundColor Yellow
    
    $confirm = Read-Host "`n¿Deseas continuar con la aplicación? (yes/no)"
    if ($confirm -ne "yes") {
        Write-Host "Despliegue cancelado por el usuario" -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "`n[2/5] Saltando planificación (--SkipPlan)" -ForegroundColor Gray
}

# Paso 3: Aplicar infraestructura
if (-not $SkipInfrastructure) {
    Write-Host "`n[3/5] Aplicando infraestructura (terraform apply)..." -ForegroundColor Yellow
    Write-Host "   ⏱️  Esto puede tardar 15-20 minutos (principalmente por RDS)..." -ForegroundColor Gray
    
    if (Test-Path "tfplan") {
        terraform apply tfplan
    } else {
        terraform apply -auto-approve
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al aplicar infraestructura" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "`n✅ Infraestructura aplicada exitosamente" -ForegroundColor Green
} else {
    Write-Host "`n[3/5] Saltando aplicación de infraestructura (--SkipInfrastructure)" -ForegroundColor Gray
}

# Obtener outputs de Terraform
Write-Host "`n[4/5] Obteniendo URLs de ECR..." -ForegroundColor Yellow
$backendRepo = terraform output -raw ecr_backend_repository_url 2>&1
$frontendRepo = terraform output -raw ecr_frontend_repository_url 2>&1
$middlewareRepo = terraform output -raw ecr_middleware_repository_url 2>&1
$albDns = terraform output -raw alb_dns_name 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al obtener outputs de Terraform" -ForegroundColor Red
    Write-Host "   Asegúrate de que la infraestructura se haya aplicado correctamente" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ URLs obtenidas:" -ForegroundColor Green
Write-Host "   Backend: $backendRepo" -ForegroundColor Gray
Write-Host "   Frontend: $frontendRepo" -ForegroundColor Gray
Write-Host "   Middleware: $middlewareRepo" -ForegroundColor Gray
Write-Host "   ALB DNS: $albDns" -ForegroundColor Gray

# Paso 4: Autenticarse en ECR
Write-Host "`n[4/5] Autenticándose en ECR..." -ForegroundColor Yellow
$ecrRegistry = "$accountId.dkr.ecr.$region.amazonaws.com"
$loginCommand = "aws ecr get-login-password --region $region | docker login --username AWS --password-stdin $ecrRegistry"

try {
    $password = aws ecr get-login-password --region $region 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Error al obtener password de ECR"
    }
    $password | docker login --username AWS --password-stdin $ecrRegistry 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Error al autenticarse en ECR"
    }
    Write-Host "✅ Autenticado en ECR exitosamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al autenticarse en ECR: $_" -ForegroundColor Red
    exit 1
}

# Paso 5: Construir y subir imágenes
if (-not $SkipImages) {
    Write-Host "`n[5/5] Construyendo y subiendo imágenes Docker..." -ForegroundColor Yellow
    Write-Host "   ⏱️  Esto puede tardar 10-15 minutos..." -ForegroundColor Gray
    
    # Cambiar al directorio raíz del proyecto
    $projectRoot = Split-Path -Parent $PSScriptRoot
    Push-Location $projectRoot
    
    try {
        # Backend
        Write-Host "`n   [1/3] Construyendo backend..." -ForegroundColor Cyan
        docker build -f Dockerfile.backend -t inia-backend:latest . 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "Error al construir imagen backend"
        }
        docker tag inia-backend:latest "$backendRepo:latest" 2>&1 | Out-Null
        docker push "$backendRepo:latest" 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "Error al subir imagen backend"
        }
        Write-Host "   ✅ Backend construido y subido" -ForegroundColor Green
        
        # Frontend
        Write-Host "`n   [2/3] Construyendo frontend..." -ForegroundColor Cyan
        docker build -f Dockerfile.frontend -t inia-frontend:latest . 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "Error al construir imagen frontend"
        }
        docker tag inia-frontend:latest "$frontendRepo:latest" 2>&1 | Out-Null
        docker push "$frontendRepo:latest" 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "Error al subir imagen frontend"
        }
        Write-Host "   ✅ Frontend construido y subido" -ForegroundColor Green
        
        # Middleware
        Write-Host "`n   [3/3] Construyendo middleware..." -ForegroundColor Cyan
        docker build -f Dockerfile.middleware -t inia-middleware:latest . 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "Error al construir imagen middleware"
        }
        docker tag inia-middleware:latest "$middlewareRepo:latest" 2>&1 | Out-Null
        docker push "$middlewareRepo:latest" 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "Error al subir imagen middleware"
        }
        Write-Host "   ✅ Middleware construido y subido" -ForegroundColor Green
        
    } catch {
        Write-Host "`n❌ Error: $_" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    
    Pop-Location
    Write-Host "`n✅ Todas las imágenes construidas y subidas exitosamente" -ForegroundColor Green
} else {
    Write-Host "`n[5/5] Saltando construcción de imágenes (--SkipImages)" -ForegroundColor Gray
}

# Resumen final
Write-Host "`n=== Despliegue Completado ===" -ForegroundColor Green
Write-Host "`n📋 Información del despliegue:" -ForegroundColor Cyan
Write-Host "   ALB DNS: http://$albDns" -ForegroundColor White
if ($albDns -and -not $albDns.StartsWith("Error")) {
    Write-Host "`n🌐 URLs de acceso:" -ForegroundColor Cyan
    Write-Host "   Frontend: http://$albDns" -ForegroundColor Yellow
    Write-Host "   Backend API: http://$albDns/Inia/api/v1" -ForegroundColor Yellow
    Write-Host "   Middleware: http://$albDns/middleware" -ForegroundColor Yellow
}

Write-Host "`n📝 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Espera 2-3 minutos para que los servicios ECS se estabilicen" -ForegroundColor White
Write-Host "   2. Verifica el estado de los servicios con:" -ForegroundColor White
Write-Host "      aws ecs list-services --cluster inia-prod-cluster" -ForegroundColor Gray
Write-Host "   3. Si configuraste un dominio, actualiza el DNS para apuntar a: $albDns" -ForegroundColor White
Write-Host "   4. Verifica los logs en CloudWatch Logs si hay problemas" -ForegroundColor White

Write-Host "`n✅ ¡Despliegue completado exitosamente!" -ForegroundColor Green


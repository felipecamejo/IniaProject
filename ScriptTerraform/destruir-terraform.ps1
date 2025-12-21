# DESTRUIR INFRAESTRUCTURA
# Elimina TODOS los recursos de AWS
# Uso: .\ScriptTerraform\destruir-terraform.ps1
# Uso automatico: .\ScriptTerraform\destruir-terraform.ps1 -Force

param(
    [switch]$Force
)

Write-Host "========================================" -ForegroundColor Red
Write-Host "  DESTRUIR INFRAESTRUCTURA" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
Write-Host "ADVERTENCIA: Se eliminaran TODOS los recursos" -ForegroundColor Yellow
Write-Host "  - Base de datos (datos perdidos)" -ForegroundColor White
Write-Host "  - Servidores y servicios" -ForegroundColor White
Write-Host "  - Redes y balanceadores" -ForegroundColor White
Write-Host "  - Bucket S3 del state de Terraform" -ForegroundColor White
Write-Host "  - Tabla DynamoDB de locks" -ForegroundColor White
Write-Host ""

# Pedir confirmacion si no es Force
if (-not $Force) {
    Write-Host "Escribe 'DESTRUIR' para confirmar: " -NoNewline -ForegroundColor Yellow
    $confirmacion = Read-Host

    if ($confirmacion -ne "DESTRUIR") {
        Write-Host ""
        Write-Host "Cancelado" -ForegroundColor Green
        exit 0
    }
} else {
    Write-Host "Modo automatico (Force): Confirmacion omitida" -ForegroundColor Yellow
}

Write-Host ""

# Configurar entorno
cd C:\Github\IniaProject\terraform
$env:Path += ";$env:USERPROFILE\terraform"

# ==============================================================================
# PASO 1: Destruir recursos principales (excepto backend)
# ==============================================================================

Write-Host "[1/3] Destruyendo recursos principales..." -ForegroundColor Cyan
Write-Host ""

# Intentar destruccion normal primero
terraform destroy -auto-approve 2>&1 | Tee-Object -Variable terraformOutput

$destroyFailed = $LASTEXITCODE -ne 0

# Si fallo por recursos protegidos, destruir todo excepto S3 y DynamoDB
if ($destroyFailed -and ($terraformOutput -match "prevent_destroy")) {
    Write-Host ""
    Write-Host "Recursos con proteccion detectados. Destruyendo en 2 pasos..." -ForegroundColor Yellow
    Write-Host ""
    
    # Lista de todos los recursos excepto S3 y DynamoDB del backend
    Write-Host "  Obteniendo lista de recursos..." -ForegroundColor Gray
    $allResources = terraform state list
    
    $resourcesToDestroy = $allResources | Where-Object { 
        $_ -notmatch "aws_s3_bucket.terraform_state" -and 
        $_ -notmatch "aws_dynamodb_table.terraform_locks" -and
        $_ -notmatch "aws_s3_bucket_versioning.terraform_state" -and
        $_ -notmatch "aws_s3_bucket_server_side_encryption_configuration.terraform_state" -and
        $_ -notmatch "aws_s3_bucket_public_access_block.terraform_state" -and
        $_ -notmatch "aws_s3_bucket_lifecycle_configuration.terraform_state"
    }
    
    if ($resourcesToDestroy.Count -gt 0) {
        Write-Host "  Destruyendo $($resourcesToDestroy.Count) recursos..." -ForegroundColor Gray
        
        # Construir comando con targets
        $targetArgs = $resourcesToDestroy | ForEach-Object { "-target=$_" }
        $targetArgs += "-auto-approve"
        
        & terraform destroy @targetArgs
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "  Recursos principales eliminados" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "  ERROR: Fallo al destruir recursos principales" -ForegroundColor Red
        }
    } else {
        Write-Host "  No hay recursos adicionales para destruir" -ForegroundColor Gray
    }
} else {
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "  Todos los recursos eliminados exitosamente" -ForegroundColor Green
        Write-Host ""
        Write-Host "Infraestructura eliminada" -ForegroundColor Green
        Write-Host "Costos detenidos" -ForegroundColor Green
        Write-Host ""
        exit 0
    }
}

Write-Host ""

# ==============================================================================
# PASO 2: Eliminar recursos protegidos del backend (S3 y DynamoDB)
# ==============================================================================

Write-Host "[2/3] Eliminando recursos de Terraform Backend..." -ForegroundColor Cyan
Write-Host ""

# Verificar si los recursos todavia existen
$remainingResources = terraform state list 2>&1
$hasS3 = $remainingResources -match "aws_s3_bucket.terraform_state"
$hasDynamoDB = $remainingResources -match "aws_dynamodb_table.terraform_locks"

if (-not $hasS3 -and -not $hasDynamoDB) {
    Write-Host "  No hay recursos de backend para eliminar" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Infraestructura completamente eliminada" -ForegroundColor Green
    Write-Host "Costos detenidos" -ForegroundColor Green
    Write-Host ""
    exit 0
}

Write-Host "Recursos protegidos detectados:" -ForegroundColor Yellow
if ($hasS3) { Write-Host "  - Bucket S3: inia-terraform-state" -ForegroundColor White }
if ($hasDynamoDB) { Write-Host "  - Tabla DynamoDB: inia-terraform-locks" -ForegroundColor White }
Write-Host ""

Write-Host "Estos recursos estan protegidos contra eliminacion accidental." -ForegroundColor Yellow
Write-Host ""

# Preguntar como eliminar o usar opcion 1 si es Force
if (-not $Force) {
    Write-Host "Como deseas eliminarlos?" -ForegroundColor Cyan
    Write-Host "  1. Eliminar con AWS CLI (recomendado, rapido)" -ForegroundColor White
    Write-Host "  2. Saltar eliminacion (mantener S3 y DynamoDB)" -ForegroundColor White
    Write-Host ""
    Write-Host "Opcion (1 o 2): " -NoNewline -ForegroundColor Yellow
    $opcion = Read-Host
} else {
    Write-Host "Modo automatico (Force): Eliminando con AWS CLI (opcion 1)" -ForegroundColor Yellow
    $opcion = "1"
}

Write-Host ""

if ($opcion -eq "1") {
    # ==============================================================================
    # OPCION 1: Eliminar con AWS CLI
    # ==============================================================================
    
    Write-Host "[3/3] Eliminando con AWS CLI..." -ForegroundColor Cyan
    Write-Host ""
    
    # Eliminar objetos del bucket S3 primero
    if ($hasS3) {
        Write-Host "  Vaciando bucket S3..." -ForegroundColor Gray
        
        # Eliminar todas las versiones de objetos
        aws s3api list-object-versions `
            --bucket inia-terraform-state `
            --query "Versions[].{Key:Key,VersionId:VersionId}" `
            --output json 2>$null | ConvertFrom-Json | ForEach-Object {
                aws s3api delete-object --bucket inia-terraform-state --key $_.Key --version-id $_.VersionId 2>&1 | Out-Null
            }
        
        # Eliminar markers de eliminacion
        aws s3api list-object-versions `
            --bucket inia-terraform-state `
            --query "DeleteMarkers[].{Key:Key,VersionId:VersionId}" `
            --output json 2>$null | ConvertFrom-Json | ForEach-Object {
                aws s3api delete-object --bucket inia-terraform-state --key $_.Key --version-id $_.VersionId 2>&1 | Out-Null
            }
        
        Write-Host "  Bucket vaciado" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "  Eliminando bucket S3..." -ForegroundColor Gray
        aws s3api delete-bucket --bucket inia-terraform-state --region us-east-1 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Bucket S3 eliminado" -ForegroundColor Green
            
            # Remover del state de Terraform
            terraform state rm aws_s3_bucket.terraform_state 2>&1 | Out-Null
            terraform state rm aws_s3_bucket_versioning.terraform_state 2>&1 | Out-Null
            terraform state rm aws_s3_bucket_server_side_encryption_configuration.terraform_state 2>&1 | Out-Null
            terraform state rm aws_s3_bucket_public_access_block.terraform_state 2>&1 | Out-Null
            terraform state rm aws_s3_bucket_lifecycle_configuration.terraform_state 2>&1 | Out-Null
        } else {
            Write-Host "  Error al eliminar bucket (puede no existir)" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    
    # Eliminar tabla DynamoDB
    if ($hasDynamoDB) {
        Write-Host "  Eliminando tabla DynamoDB..." -ForegroundColor Gray
        aws dynamodb delete-table --table-name inia-terraform-locks --region us-east-1 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Tabla DynamoDB eliminada" -ForegroundColor Green
            
            # Remover del state de Terraform
            terraform state rm aws_dynamodb_table.terraform_locks 2>&1 | Out-Null
        } else {
            Write-Host "  Error al eliminar tabla (puede no existir)" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "Recursos de backend eliminados" -ForegroundColor Green
    
} elseif ($opcion -eq "2") {
    Write-Host "  Manteniendo recursos de backend (S3 y DynamoDB)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  NOTA: Estos recursos tienen costo minimo:" -ForegroundColor Yellow
    Write-Host "    - S3: ~$0.023/GB/mes" -ForegroundColor Gray
    Write-Host "    - DynamoDB: ~$0.25/GB/mes" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "  Opcion invalida. Saliendo..." -ForegroundColor Red
    exit 1
}

# ==============================================================================
# PASO 4: Limpieza de recursos que Terraform no elimina automaticamente
# ==============================================================================

Write-Host ""
Write-Host "[4/5] Limpiando recursos residuales..." -ForegroundColor Cyan
Write-Host ""

# 4.1 - Manejar RDS con proteccion de eliminacion
Write-Host "  Verificando instancias RDS..." -ForegroundColor Gray
$rdsInstances = aws rds describe-db-instances --region us-east-1 --query "DBInstances[?contains(DBInstanceIdentifier, 'inia')].DBInstanceIdentifier" --output text 2>&1

if ($rdsInstances -and $rdsInstances -ne "" -and $rdsInstances -notmatch "DBInstanceNotFound") {
    foreach ($rdsId in $rdsInstances -split '\s+') {
        if ($rdsId -and $rdsId -ne "") {
            Write-Host "    Encontrado: $rdsId" -ForegroundColor Yellow
            
            # Verificar proteccion
            $deletionProtection = aws rds describe-db-instances --region us-east-1 --db-instance-identifier $rdsId --query "DBInstances[0].DeletionProtection" --output text 2>&1
            
            if ($deletionProtection -eq "True" -or $deletionProtection -eq "true") {
                Write-Host "    Desactivando proteccion de eliminacion..." -ForegroundColor Yellow
                aws rds modify-db-instance --db-instance-identifier $rdsId --no-deletion-protection --apply-immediately --region us-east-1 2>&1 | Out-Null
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "    Proteccion desactivada" -ForegroundColor Green
                    Start-Sleep -Seconds 15
                }
            }
            
            Write-Host "    Eliminando RDS database..." -ForegroundColor Yellow
            aws rds delete-db-instance --db-instance-identifier $rdsId --skip-final-snapshot --delete-automated-backups --region us-east-1 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "    RDS en proceso de eliminacion (5-10 minutos)" -ForegroundColor Green
            } else {
                Write-Host "    Error al eliminar RDS (puede estar eliminandose)" -ForegroundColor Yellow
            }
        }
    }
} else {
    Write-Host "    No hay instancias RDS del proyecto" -ForegroundColor Gray
}

Write-Host ""

# 4.2 - Eliminar repositorios ECR (con imagenes)
Write-Host "  Verificando repositorios ECR..." -ForegroundColor Gray
$ecrRepos = aws ecr describe-repositories --region us-east-1 --query "repositories[?contains(repositoryName, 'inia')].repositoryName" --output text 2>&1

if ($ecrRepos -and $ecrRepos -ne "" -and $ecrRepos -notmatch "RepositoryNotFoundException") {
    foreach ($repo in $ecrRepos -split '\s+') {
        if ($repo -and $repo -ne "") {
            Write-Host "    Eliminando repositorio: $repo" -ForegroundColor Yellow
            aws ecr delete-repository --repository-name $repo --force --region us-east-1 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "    $repo eliminado (con imagenes)" -ForegroundColor Green
            } else {
                Write-Host "    Error al eliminar $repo" -ForegroundColor Yellow
            }
        }
    }
} else {
    Write-Host "    No hay repositorios ECR del proyecto" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Limpieza de recursos residuales completada" -ForegroundColor Green

# ==============================================================================
# PASO 5: Verificacion final de recursos
# ==============================================================================

Write-Host ""
Write-Host "[5/5] Verificacion final..." -ForegroundColor Cyan
Write-Host ""

$warnings = @()
$infoMessages = @()

# Verificar ECS
$ecs = aws ecs list-clusters --region us-east-1 --query "clusterArns[?contains(@, 'inia')]" --output text 2>&1
if ($ecs -and $ecs -ne "") { 
    $warnings += "  - ECS Clusters todavia activos"
}

# Verificar RDS
$rds = aws rds describe-db-instances --region us-east-1 --query "DBInstances[?contains(DBInstanceIdentifier, 'inia')].[DBInstanceIdentifier,DBInstanceStatus]" --output text 2>&1
if ($rds -and $rds -ne "" -and $rds -notmatch "DBInstanceNotFound") {
    if ($rds -match "deleting") {
        $infoMessages += "  - RDS: Eliminandose (5-10 minutos restantes)"
    } else {
        $warnings += "  - RDS Database todavia activa"
    }
}

# Verificar ALB
$alb = aws elbv2 describe-load-balancers --region us-east-1 --query "LoadBalancers[?contains(LoadBalancerName, 'inia')].LoadBalancerName" --output text 2>&1
if ($alb -and $alb -ne "" -and $alb -notmatch "LoadBalancerNotFound") {
    $warnings += "  - Load Balancers todavia activos"
}

# Verificar ECR
$ecr = aws ecr describe-repositories --region us-east-1 --query "repositories[?contains(repositoryName, 'inia')].repositoryName" --output text 2>&1
if ($ecr -and $ecr -ne "" -and $ecr -notmatch "RepositoryNotFoundException") {
    $warnings += "  - ECR Repositories todavia existen"
}

# Verificar VPCs
$vpc = aws ec2 describe-vpcs --region us-east-1 --filters "Name=tag:Project,Values=IniaProject" --query "Vpcs[*].VpcId" --output text 2>&1
if ($vpc -and $vpc -ne "") {
    $infoMessages += "  - VPCs: Se eliminaran automaticamente cuando RDS termine"
}

# Mostrar resultados
if ($warnings.Count -gt 0) {
    Write-Host "ADVERTENCIA: Recursos que requieren atencion:" -ForegroundColor Yellow
    Write-Host ""
    foreach ($w in $warnings) {
        Write-Host $w -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Ejecuta este comando para verificar manualmente:" -ForegroundColor Cyan
    Write-Host "  aws ecs list-clusters --region us-east-1" -ForegroundColor White
    Write-Host "  aws rds describe-db-instances --region us-east-1" -ForegroundColor White
    Write-Host ""
}

if ($infoMessages.Count -gt 0) {
    Write-Host "Recursos en proceso de eliminacion:" -ForegroundColor Cyan
    Write-Host ""
    foreach ($m in $infoMessages) {
        Write-Host $m -ForegroundColor Gray
    }
    Write-Host ""
}

if ($warnings.Count -eq 0 -and $infoMessages.Count -eq 0) {
    Write-Host "Todos los recursos principales eliminados exitosamente" -ForegroundColor Green
    Write-Host ""
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DESTRUCCION COMPLETADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Infraestructura eliminada" -ForegroundColor Green
Write-Host "Costos principales detenidos" -ForegroundColor Green
Write-Host ""

if ($infoMessages.Count -gt 0) {
    Write-Host "Nota: RDS tarda naturalmente 5-10 minutos en eliminarse completamente" -ForegroundColor Gray
    Write-Host ""
}

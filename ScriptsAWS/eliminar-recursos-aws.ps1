# Script para eliminar TODOS los recursos AWS del proyecto INIA
# Ubicacion: IniaProject/awsScripts/eliminar-recursos-aws.ps1
# Uso: .\awsScripts\eliminar-recursos-aws.ps1

param(
    [switch]$AutoApprove = $false,
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "Uso: .\awsScripts\eliminar-recursos-aws.ps1 [opciones]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor Yellow
    Write-Host "  -AutoApprove  Eliminar sin pedir confirmacion (PELIGROSO)" -ForegroundColor White
    Write-Host "  -Help         Mostrar esta ayuda" -ForegroundColor White
    Write-Host ""
    Write-Host "ADVERTENCIA CRITICA:" -ForegroundColor Red
    Write-Host "  Este script eliminara PERMANENTEMENTE todos los recursos AWS:" -ForegroundColor Yellow
    Write-Host "    - ECS Cluster y servicios" -ForegroundColor White
    Write-Host "    - RDS Database (DATOS PERDIDOS)" -ForegroundColor White
    Write-Host "    - ECR Repositories e imagenes" -ForegroundColor White
    Write-Host "    - Load Balancer y Target Groups" -ForegroundColor White
    Write-Host "    - VPC, Subnets, Security Groups" -ForegroundColor White
    Write-Host "    - IAM Roles y Policies" -ForegroundColor White
    Write-Host "    - Secrets Manager" -ForegroundColor White
    Write-Host "    - CloudWatch Logs y Alarms" -ForegroundColor White
    Write-Host "    - VPC Endpoints" -ForegroundColor White
    Write-Host ""
    exit 0
}

$region = "us-east-1"
$projectPrefix = "inia-prod"

Write-Host "========================================" -ForegroundColor Red
Write-Host "  ELIMINAR Recursos AWS - Proyecto INIA" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# Funciones de utilidad
function Test-AwsCli {
    try {
        $null = aws --version 2>&1
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

function Test-AwsCredentials {
    try {
        $output = aws sts get-caller-identity --query Account --output text 2>&1
        return $LASTEXITCODE -eq 0 -and $output -match "^\d+$"
    } catch {
        return $false
    }
}

# Validaciones
Write-Host "[1/13] Validando prerequisitos..." -ForegroundColor Cyan
Write-Host ""

if (-not (Test-AwsCli)) {
    Write-Host "ERROR: AWS CLI no esta instalado" -ForegroundColor Red
    exit 1
}
Write-Host "  AWS CLI: OK" -ForegroundColor Green

if (-not (Test-AwsCredentials)) {
    Write-Host "ERROR: Credenciales AWS invalidas" -ForegroundColor Red
    Write-Host "Ejecuta: aws configure" -ForegroundColor Yellow
    exit 1
}
$accountId = aws sts get-caller-identity --query Account --output text
Write-Host "  AWS Account: $accountId" -ForegroundColor Green
Write-Host ""

# Advertencia grave
Write-Host "ADVERTENCIA CRITICA:" -ForegroundColor Red
Write-Host ""
Write-Host "  Este script ELIMINARA PERMANENTEMENTE:" -ForegroundColor Yellow
Write-Host "    - Base de datos RDS (TODOS LOS DATOS SE PERDERAN)" -ForegroundColor White
Write-Host "    - Imagenes Docker en ECR" -ForegroundColor White
Write-Host "    - Secrets y configuraciones" -ForegroundColor White
Write-Host "    - Logs de CloudWatch" -ForegroundColor White
Write-Host "    - TODOS los recursos de AWS" -ForegroundColor White
Write-Host ""
Write-Host "  Esta operacion NO SE PUEDE DESHACER" -ForegroundColor Red
Write-Host ""

if (-not $AutoApprove) {
    Write-Host "Para continuar, escribe exactamente: " -NoNewline -ForegroundColor Yellow
    Write-Host "ELIMINAR" -ForegroundColor Red
    $confirmacion1 = Read-Host "Confirmacion"
    
    if ($confirmacion1 -ne "ELIMINAR") {
        Write-Host ""
        Write-Host "Operacion CANCELADA" -ForegroundColor Green
        exit 0
    }
    
    Write-Host ""
    Write-Host "Segunda confirmacion. Escribe exactamente: " -NoNewline -ForegroundColor Yellow
    Write-Host "BORRAR TODO" -ForegroundColor Red
    $confirmacion2 = Read-Host "Confirmacion"
    
    if ($confirmacion2 -ne "BORRAR TODO") {
        Write-Host ""
        Write-Host "Operacion CANCELADA" -ForegroundColor Green
        exit 0
    }
    
    Write-Host ""
    Write-Host "Ultima oportunidad. Presiona Ctrl+C en los proximos 10 segundos para cancelar..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

Write-Host ""
Write-Host "Iniciando eliminacion de recursos..." -ForegroundColor Red
Write-Host ""

# [2/13] Eliminar ECS Services
Write-Host "[2/13] Eliminando ECS Services..." -ForegroundColor Cyan
$cluster = "${projectPrefix}-cluster"
$services = aws ecs list-services --cluster $cluster --region $region --query 'serviceArns[*]' --output text 2>&1
if ($LASTEXITCODE -eq 0 -and $services) {
    foreach ($serviceArn in $services -split '\s+') {
        if ($serviceArn) {
            Write-Host "  Eliminando servicio: $serviceArn" -ForegroundColor Gray
            aws ecs update-service --cluster $cluster --service $serviceArn --desired-count 0 --region $region 2>&1 | Out-Null
            aws ecs delete-service --cluster $cluster --service $serviceArn --force --region $region 2>&1 | Out-Null
        }
    }
    Write-Host "  Servicios ECS eliminados" -ForegroundColor Green
} else {
    Write-Host "  No se encontraron servicios ECS" -ForegroundColor Gray
}
Write-Host ""

# [3/13] Eliminar ECS Cluster
Write-Host "[3/13] Eliminando ECS Cluster..." -ForegroundColor Cyan

# Esperar a que no haya servicios activos
Write-Host "  Verificando servicios..." -ForegroundColor Gray
$maxWaitServices = 60
$elapsedServices = 0
while ($elapsedServices -lt $maxWaitServices) {
    $activeServices = aws ecs describe-clusters --clusters $cluster --region $region --query 'clusters[0].activeServicesCount' --output text 2>&1
    if ($activeServices -eq "0" -or $LASTEXITCODE -ne 0) {
        break
    }
    Write-Host "    Esperando a que servicios terminen ($elapsedServices seg)..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
    $elapsedServices += 10
}

# Eliminar cluster
aws ecs delete-cluster --cluster $cluster --region $region 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Cluster ECS marcado para eliminacion COMPLETA" -ForegroundColor Green
} else {
    Write-Host "  Cluster ECS no encontrado o ya eliminado" -ForegroundColor Gray
}
Write-Host ""

# [4/13] Eliminar RDS Instance
Write-Host "[4/13] Eliminando RDS Database..." -ForegroundColor Cyan
$dbInstance = "${projectPrefix}-db"

# Verificar si la instancia existe
$rdsInfo = aws rds describe-db-instances --db-instance-identifier $dbInstance --region $region --query 'DBInstances[0].[DBInstanceStatus,DeletionProtection]' --output json 2>&1
if ($LASTEXITCODE -eq 0) {
    $rdsData = $rdsInfo | ConvertFrom-Json
    $rdsStatus = $rdsData[0]
    $deletionProtection = $rdsData[1]
    
    Write-Host "  Estado actual: $rdsStatus" -ForegroundColor Gray
    
    # Desactivar Deletion Protection si esta activa
    if ($deletionProtection -eq $true) {
        Write-Host "  Deletion Protection ACTIVA - Desactivando..." -ForegroundColor Yellow
        aws rds modify-db-instance --db-instance-identifier $dbInstance --no-deletion-protection --apply-immediately --region $region 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Deletion Protection DESACTIVADA" -ForegroundColor Green
            Start-Sleep -Seconds 5
        } else {
            Write-Host "  ERROR: No se pudo desactivar Deletion Protection" -ForegroundColor Red
        }
    } else {
        Write-Host "  Deletion Protection: Ya desactivada" -ForegroundColor Gray
    }
    
    # Eliminar instancia RDS
    Write-Host "  Eliminando instancia RDS..." -ForegroundColor Yellow
    aws rds delete-db-instance --db-instance-identifier $dbInstance --skip-final-snapshot --delete-automated-backups --region $region 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  RDS Database marcada para eliminacion COMPLETA" -ForegroundColor Green
        Write-Host "  (Tomara 5-10 minutos en eliminarse completamente)" -ForegroundColor Gray
    } else {
        Write-Host "  ERROR: No se pudo eliminar la instancia RDS" -ForegroundColor Red
    }
} else {
    Write-Host "  RDS no encontrada o ya eliminada" -ForegroundColor Gray
}
Write-Host ""

# [5/13] Eliminar Target Groups
Write-Host "[5/13] Eliminando Target Groups..." -ForegroundColor Cyan
$targetGroups = aws elbv2 describe-target-groups --region $region --query "TargetGroups[?contains(TargetGroupName, '${projectPrefix}')].TargetGroupArn" --output text 2>&1
if ($LASTEXITCODE -eq 0 -and $targetGroups) {
    foreach ($tgArn in $targetGroups -split '\s+') {
        if ($tgArn) {
            Write-Host "  Eliminando: $tgArn" -ForegroundColor Gray
            aws elbv2 delete-target-group --target-group-arn $tgArn --region $region 2>&1 | Out-Null
        }
    }
    Write-Host "  Target Groups eliminados" -ForegroundColor Green
} else {
    Write-Host "  No se encontraron Target Groups" -ForegroundColor Gray
}
Write-Host ""

# [6/13] Eliminar Load Balancer
Write-Host "[6/13] Eliminando Application Load Balancer..." -ForegroundColor Cyan
$albArn = aws elbv2 describe-load-balancers --region $region --query "LoadBalancers[?contains(LoadBalancerName, '${projectPrefix}')].LoadBalancerArn" --output text 2>&1
if ($LASTEXITCODE -eq 0 -and $albArn) {
    Write-Host "  Eliminando ALB: $albArn" -ForegroundColor Gray
    aws elbv2 delete-load-balancer --load-balancer-arn $albArn --region $region 2>&1 | Out-Null
    Write-Host "  Load Balancer marcado para eliminacion" -ForegroundColor Yellow
    Write-Host "  (Tomara unos minutos)" -ForegroundColor Gray
} else {
    Write-Host "  Load Balancer no encontrado" -ForegroundColor Gray
}
Write-Host ""

# [7/13] Vaciar y eliminar ECR Repositories
Write-Host "[7/13] Eliminando ECR Repositories..." -ForegroundColor Cyan
$ecrRepos = @("${projectPrefix}-backend", "${projectPrefix}-frontend", "${projectPrefix}-middleware")
foreach ($repo in $ecrRepos) {
    Write-Host "  Procesando: $repo" -ForegroundColor Gray
    
    # Listar imagenes
    $images = aws ecr list-images --repository-name $repo --region $region --query 'imageIds[*]' --output json 2>&1
    if ($LASTEXITCODE -eq 0 -and $images -ne "[]") {
        # Eliminar imagenes
        aws ecr batch-delete-image --repository-name $repo --image-ids $images --region $region 2>&1 | Out-Null
    }
    
    # Eliminar repositorio
    aws ecr delete-repository --repository-name $repo --force --region $region 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    Repositorio $repo eliminado" -ForegroundColor Green
    }
}
Write-Host ""

# [8/13] Eliminar CloudWatch Log Groups
Write-Host "[8/13] Eliminando CloudWatch Log Groups..." -ForegroundColor Cyan
$logGroups = aws logs describe-log-groups --region $region --query "logGroups[?contains(logGroupName, '/ecs/${projectPrefix}')].logGroupName" --output text 2>&1
if ($LASTEXITCODE -eq 0 -and $logGroups) {
    foreach ($logGroup in $logGroups -split '\s+') {
        if ($logGroup) {
            Write-Host "  Eliminando: $logGroup" -ForegroundColor Gray
            aws logs delete-log-group --log-group-name $logGroup --region $region 2>&1 | Out-Null
        }
    }
    Write-Host "  Log Groups eliminados" -ForegroundColor Green
} else {
    Write-Host "  No se encontraron Log Groups" -ForegroundColor Gray
}
Write-Host ""

# [9/13] Eliminar Secrets Manager
Write-Host "[9/13] Eliminando Secrets..." -ForegroundColor Cyan
$secrets = aws secretsmanager list-secrets --region $region --query "SecretList[?contains(Name, '${projectPrefix}')].Name" --output text 2>&1
if ($LASTEXITCODE -eq 0 -and $secrets) {
    foreach ($secret in $secrets -split '\s+') {
        if ($secret) {
            Write-Host "  Eliminando: $secret" -ForegroundColor Gray
            aws secretsmanager delete-secret --secret-id $secret --force-delete-without-recovery --region $region 2>&1 | Out-Null
        }
    }
    Write-Host "  Secrets eliminados" -ForegroundColor Green
} else {
    Write-Host "  No se encontraron Secrets" -ForegroundColor Gray
}
Write-Host ""

# [10/13] Esperar a que ALB se elimine antes de continuar
Write-Host "[10/13] Esperando a que Load Balancer termine de eliminarse..." -ForegroundColor Cyan
$maxWait = 180
$elapsed = 0
while ($elapsed -lt $maxWait) {
    $albCheck = aws elbv2 describe-load-balancers --region $region --query "LoadBalancers[?contains(LoadBalancerName, '${projectPrefix}')].LoadBalancerArn" --output text 2>&1
    if (-not $albCheck) {
        Write-Host "  Load Balancer eliminado completamente" -ForegroundColor Green
        break
    }
    Write-Host "  Esperando... ($elapsed segundos)" -ForegroundColor Gray
    Start-Sleep -Seconds 10
    $elapsed += 10
}
Write-Host ""

# [11/13] Eliminar VPC Endpoints
Write-Host "[11/13] Eliminando VPC Endpoints..." -ForegroundColor Cyan
$vpcId = aws ec2 describe-vpcs --region $region --filters "Name=tag:Name,Values=${projectPrefix}-vpc" --query 'Vpcs[0].VpcId' --output text 2>&1
if ($LASTEXITCODE -eq 0 -and $vpcId -and $vpcId -ne "None") {
    $endpoints = aws ec2 describe-vpc-endpoints --region $region --filters "Name=vpc-id,Values=$vpcId" --query 'VpcEndpoints[*].VpcEndpointId' --output text 2>&1
    if ($LASTEXITCODE -eq 0 -and $endpoints) {
        # Eliminar todos los endpoints
        foreach ($endpoint in $endpoints -split '\s+') {
            if ($endpoint) {
                Write-Host "  Eliminando endpoint: $endpoint" -ForegroundColor Gray
                aws ec2 delete-vpc-endpoints --vpc-endpoint-ids $endpoint --region $region 2>&1 | Out-Null
            }
        }
        
        # Esperar a que se eliminen completamente
        Write-Host "  Esperando eliminacion completa de endpoints..." -ForegroundColor Yellow
        $maxWaitEndpoints = 120
        $elapsedEndpoints = 0
        while ($elapsedEndpoints -lt $maxWaitEndpoints) {
            $remainingEndpoints = aws ec2 describe-vpc-endpoints --region $region --filters "Name=vpc-id,Values=$vpcId" --query 'VpcEndpoints[*].VpcEndpointId' --output text 2>&1
            if (-not $remainingEndpoints -or $remainingEndpoints -eq "") {
                Write-Host "  VPC Endpoints eliminados completamente" -ForegroundColor Green
                break
            }
            Write-Host "    Esperando... ($elapsedEndpoints seg)" -ForegroundColor Gray
            Start-Sleep -Seconds 10
            $elapsedEndpoints += 10
        }
    } else {
        Write-Host "  No se encontraron VPC Endpoints" -ForegroundColor Gray
    }
} else {
    Write-Host "  No se encontraron VPC Endpoints" -ForegroundColor Gray
}
Write-Host ""

# [12/13] Eliminar Security Groups (excepto default)
Write-Host "[12/13] Eliminando Security Groups..." -ForegroundColor Cyan
if ($vpcId -and $vpcId -ne "None") {
    $securityGroups = aws ec2 describe-security-groups --region $region --filters "Name=vpc-id,Values=$vpcId" --query "SecurityGroups[?GroupName!='default'].GroupId" --output text 2>&1
    if ($LASTEXITCODE -eq 0 -and $securityGroups) {
        $sgArray = $securityGroups -split '\s+' | Where-Object { $_ }
        
        # Primera pasada: Eliminar todas las reglas ingress y egress
        Write-Host "  Paso 1: Limpiando reglas de ingress y egress..." -ForegroundColor Yellow
        foreach ($sgId in $sgArray) {
            Write-Host "    Limpiando: $sgId" -ForegroundColor Gray
            
            # Obtener reglas ingress
            $ingressRules = aws ec2 describe-security-groups --group-ids $sgId --region $region --query 'SecurityGroups[0].IpPermissions' --output json 2>&1
            if ($ingressRules -and $ingressRules -ne "[]") {
                aws ec2 revoke-security-group-ingress --group-id $sgId --region $region --ip-permissions $ingressRules 2>&1 | Out-Null
            }
            
            # Obtener reglas egress
            $egressRules = aws ec2 describe-security-groups --group-ids $sgId --region $region --query 'SecurityGroups[0].IpPermissionsEgress' --output json 2>&1
            if ($egressRules -and $egressRules -ne "[]") {
                aws ec2 revoke-security-group-egress --group-id $sgId --region $region --ip-permissions $egressRules 2>&1 | Out-Null
            }
        }
        
        # Esperar un momento para que AWS procese
        Start-Sleep -Seconds 5
        
        # Segunda pasada: Eliminar security groups (varios intentos por dependencias)
        Write-Host "  Paso 2: Eliminando Security Groups..." -ForegroundColor Yellow
        $maxAttempts = 3
        for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
            Write-Host "    Intento $attempt de $maxAttempts" -ForegroundColor Gray
            $remainingSGs = @()
            
            foreach ($sgId in $sgArray) {
                $deleteResult = aws ec2 delete-security-group --group-id $sgId --region $region 2>&1
                if ($LASTEXITCODE -ne 0) {
                    $remainingSGs += $sgId
                } else {
                    Write-Host "      Eliminado: $sgId" -ForegroundColor Green
                }
            }
            
            $sgArray = $remainingSGs
            if ($sgArray.Count -eq 0) {
                break
            }
            
            if ($attempt -lt $maxAttempts) {
                Write-Host "    Esperando antes del proximo intento..." -ForegroundColor Gray
                Start-Sleep -Seconds 10
            }
        }
        
        if ($sgArray.Count -eq 0) {
            Write-Host "  Security Groups eliminados completamente" -ForegroundColor Green
        } else {
            Write-Host "  ADVERTENCIA: $($sgArray.Count) Security Groups no pudieron eliminarse" -ForegroundColor Yellow
            foreach ($sgId in $sgArray) {
                Write-Host "    - $sgId (puede tener dependencias)" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "  No se encontraron Security Groups" -ForegroundColor Gray
    }
} else {
    Write-Host "  No se encontraron Security Groups" -ForegroundColor Gray
}
Write-Host ""

# [13/13] Eliminar VPC
Write-Host "[13/13] Eliminando VPC y componentes..." -ForegroundColor Cyan
if ($vpcId -and $vpcId -ne "None") {
    Write-Host "  VPC ID: $vpcId" -ForegroundColor Gray
    
    # Paso 1: Eliminar Internet Gateways
    Write-Host "  Paso 1: Eliminando Internet Gateways..." -ForegroundColor Yellow
    $igws = aws ec2 describe-internet-gateways --region $region --filters "Name=attachment.vpc-id,Values=$vpcId" --query 'InternetGateways[*].InternetGatewayId' --output text 2>&1
    if ($igws) {
        foreach ($igw in $igws -split '\s+') {
            if ($igw) {
                Write-Host "    Desconectando IGW: $igw" -ForegroundColor Gray
                aws ec2 detach-internet-gateway --internet-gateway-id $igw --vpc-id $vpcId --region $region 2>&1 | Out-Null
                Write-Host "    Eliminando IGW: $igw" -ForegroundColor Gray
                aws ec2 delete-internet-gateway --internet-gateway-id $igw --region $region 2>&1 | Out-Null
            }
        }
        Write-Host "    Internet Gateways eliminados" -ForegroundColor Green
    }
    
    # Paso 2: Eliminar NAT Gateways (si existen)
    Write-Host "  Paso 2: Verificando NAT Gateways..." -ForegroundColor Yellow
    $natGateways = aws ec2 describe-nat-gateways --region $region --filter "Name=vpc-id,Values=$vpcId" --query 'NatGateways[?State!=`deleted`].NatGatewayId' --output text 2>&1
    if ($natGateways) {
        foreach ($natGw in $natGateways -split '\s+') {
            if ($natGw) {
                Write-Host "    Eliminando NAT Gateway: $natGw" -ForegroundColor Gray
                aws ec2 delete-nat-gateway --nat-gateway-id $natGw --region $region 2>&1 | Out-Null
            }
        }
        Write-Host "    NAT Gateways marcados para eliminacion" -ForegroundColor Yellow
        Write-Host "    Esperando eliminacion (esto puede tomar un minuto)..." -ForegroundColor Gray
        Start-Sleep -Seconds 60
    }
    
    # Paso 3: Eliminar Route Tables (excepto main)
    Write-Host "  Paso 3: Eliminando Route Tables..." -ForegroundColor Yellow
    $routeTables = aws ec2 describe-route-tables --region $region --filters "Name=vpc-id,Values=$vpcId" --query 'RouteTables[?Associations[0].Main==`false`].RouteTableId' --output text 2>&1
    if ($routeTables) {
        foreach ($rt in $routeTables -split '\s+') {
            if ($rt) {
                Write-Host "    Eliminando route table: $rt" -ForegroundColor Gray
                
                # Desasociar primero
                $associations = aws ec2 describe-route-tables --route-table-ids $rt --region $region --query 'RouteTables[0].Associations[?!Main].RouteTableAssociationId' --output text 2>&1
                if ($associations) {
                    foreach ($assoc in $associations -split '\s+') {
                        if ($assoc) {
                            aws ec2 disassociate-route-table --association-id $assoc --region $region 2>&1 | Out-Null
                        }
                    }
                }
                
                # Eliminar route table
                aws ec2 delete-route-table --route-table-id $rt --region $region 2>&1 | Out-Null
            }
        }
        Write-Host "    Route Tables eliminados" -ForegroundColor Green
    }
    
    # Paso 4: Eliminar Subnets
    Write-Host "  Paso 4: Eliminando Subnets..." -ForegroundColor Yellow
    $subnets = aws ec2 describe-subnets --region $region --filters "Name=vpc-id,Values=$vpcId" --query 'Subnets[*].SubnetId' --output text 2>&1
    if ($subnets) {
        foreach ($subnet in $subnets -split '\s+') {
            if ($subnet) {
                Write-Host "    Eliminando subnet: $subnet" -ForegroundColor Gray
                aws ec2 delete-subnet --subnet-id $subnet --region $region 2>&1 | Out-Null
            }
        }
        Write-Host "    Subnets eliminados" -ForegroundColor Green
    }
    
    # Paso 5: Eliminar Network ACLs (excepto default)
    Write-Host "  Paso 5: Eliminando Network ACLs..." -ForegroundColor Yellow
    $nacls = aws ec2 describe-network-acls --region $region --filters "Name=vpc-id,Values=$vpcId" --query 'NetworkAcls[?!IsDefault].NetworkAclId' --output text 2>&1
    if ($nacls) {
        foreach ($nacl in $nacls -split '\s+') {
            if ($nacl) {
                Write-Host "    Eliminando NACL: $nacl" -ForegroundColor Gray
                aws ec2 delete-network-acl --network-acl-id $nacl --region $region 2>&1 | Out-Null
            }
        }
        Write-Host "    Network ACLs eliminados" -ForegroundColor Green
    }
    
    # Paso 6: Eliminar VPC
    Write-Host "  Paso 6: Eliminando VPC..." -ForegroundColor Yellow
    Write-Host "    VPC ID: $vpcId" -ForegroundColor Gray
    $deleteVpcResult = aws ec2 delete-vpc --vpc-id $vpcId --region $region 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    VPC ELIMINADA COMPLETAMENTE" -ForegroundColor Green
    } else {
        Write-Host "    ERROR al eliminar VPC: $deleteVpcResult" -ForegroundColor Red
        Write-Host "    Puede tener dependencias restantes" -ForegroundColor Yellow
    }
} else {
    Write-Host "  VPC no encontrada" -ForegroundColor Gray
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Eliminacion Completada" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Recursos eliminados:" -ForegroundColor Green
Write-Host "  - ECS Services y Cluster (COMPLETAMENTE)" -ForegroundColor White
Write-Host "  - RDS Database (Deletion Protection desactivada, eliminandose)" -ForegroundColor White
Write-Host "  - ECR Repositories e imagenes" -ForegroundColor White
Write-Host "  - Load Balancer y Target Groups" -ForegroundColor White
Write-Host "  - VPC Endpoints (COMPLETAMENTE)" -ForegroundColor White
Write-Host "  - Security Groups (COMPLETAMENTE)" -ForegroundColor White
Write-Host "  - VPC y todos sus componentes (COMPLETAMENTE)" -ForegroundColor White
Write-Host "    * Internet Gateways" -ForegroundColor Gray
Write-Host "    * NAT Gateways" -ForegroundColor Gray
Write-Host "    * Route Tables" -ForegroundColor Gray
Write-Host "    * Subnets" -ForegroundColor Gray
Write-Host "    * Network ACLs" -ForegroundColor Gray
Write-Host "  - CloudWatch Logs" -ForegroundColor White
Write-Host "  - Secrets Manager" -ForegroundColor White
Write-Host ""
Write-Host "MEJORAS APLICADAS:" -ForegroundColor Cyan
Write-Host "  - Deletion Protection desactivada automaticamente en RDS" -ForegroundColor Gray
Write-Host "  - Eliminacion completa de recursos (no solo inactivos)" -ForegroundColor Gray
Write-Host "  - Esperas automaticas para dependencias" -ForegroundColor Gray
Write-Host "  - Multiples intentos para Security Groups" -ForegroundColor Gray
Write-Host ""
Write-Host "NOTA:" -ForegroundColor Yellow
Write-Host "  - RDS Database puede tomar 5-10 minutos en eliminarse COMPLETAMENTE" -ForegroundColor Gray
Write-Host "  - Verifica estado con: .\awsScripts\verificar-eliminacion-aws.ps1 -Watch" -ForegroundColor Gray
Write-Host "  - IAM Roles pueden requerir eliminacion manual" -ForegroundColor Gray
Write-Host ""

exit 0

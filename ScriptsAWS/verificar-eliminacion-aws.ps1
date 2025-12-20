# Script para verificar el estado de eliminacion de recursos AWS
# Ubicacion: IniaProject/awsScripts/verificar-eliminacion-aws.ps1
# Uso: .\awsScripts\verificar-eliminacion-aws.ps1

param(
    [switch]$Watch = $false,
    [int]$Interval = 30,
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "Uso: .\awsScripts\verificar-eliminacion-aws.ps1 [opciones]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor Yellow
    Write-Host "  -Watch      Modo continuo: actualiza cada N segundos" -ForegroundColor White
    Write-Host "  -Interval   Segundos entre actualizaciones (default: 30)" -ForegroundColor White
    Write-Host "  -Help       Mostrar esta ayuda" -ForegroundColor White
    Write-Host ""
    Write-Host "Ejemplos:" -ForegroundColor Yellow
    Write-Host "  .\awsScripts\verificar-eliminacion-aws.ps1" -ForegroundColor White
    Write-Host "  .\awsScripts\verificar-eliminacion-aws.ps1 -Watch" -ForegroundColor White
    Write-Host "  .\awsScripts\verificar-eliminacion-aws.ps1 -Watch -Interval 15" -ForegroundColor White
    Write-Host ""
    exit 0
}

$region = "us-east-1"
$projectPrefix = "inia-prod"

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

function Get-RdsStatus {
    $dbInstance = "${projectPrefix}-db"
    $status = aws rds describe-db-instances --db-instance-identifier $dbInstance --region $region --query 'DBInstances[0].[DBInstanceStatus,DeletionProtection,DBInstanceIdentifier]' --output json 2>&1
    
    if ($LASTEXITCODE -ne 0 -or $status -match "DBInstanceNotFound") {
        return @{
            Exists = $false
            Status = "ELIMINADO"
            DeletionProtection = $false
            Progress = 100
        }
    }
    
    $statusObj = $status | ConvertFrom-Json
    $dbStatus = $statusObj[0]
    $deletionProtection = $statusObj[1]
    
    $progress = switch ($dbStatus) {
        "available" { 0 }
        "deleting" { 50 }
        "deleted" { 100 }
        default { 25 }
    }
    
    return @{
        Exists = $true
        Status = $dbStatus.ToUpper()
        DeletionProtection = $deletionProtection
        Progress = $progress
    }
}

function Get-AlbStatus {
    $albArn = aws elbv2 describe-load-balancers --region $region --query "LoadBalancers[?contains(LoadBalancerName, '${projectPrefix}')].{Arn:LoadBalancerArn,State:State.Code}" --output json 2>&1
    
    if ($LASTEXITCODE -ne 0 -or $albArn -eq "[]") {
        return @{
            Exists = $false
            Status = "ELIMINADO"
            Progress = 100
        }
    }
    
    $albObj = ($albArn | ConvertFrom-Json)[0]
    $state = $albObj.State
    
    $progress = switch ($state) {
        "active" { 0 }
        "provisioning" { 25 }
        "active_impaired" { 30 }
        "failed" { 100 }
        default { 50 }
    }
    
    return @{
        Exists = $true
        Status = $state.ToUpper()
        Progress = $progress
    }
}

function Get-EcsStatus {
    $cluster = "${projectPrefix}-cluster"
    $clusterInfo = aws ecs describe-clusters --clusters $cluster --region $region --query 'clusters[0].[status,registeredContainerInstancesCount,runningTasksCount,pendingTasksCount,activeServicesCount]' --output json 2>&1
    
    if ($LASTEXITCODE -ne 0 -or $clusterInfo -match "MISSING") {
        return @{
            Exists = $false
            Status = "ELIMINADO"
            Services = 0
            Tasks = 0
            Progress = 100
        }
    }
    
    $info = $clusterInfo | ConvertFrom-Json
    $status = $info[0]
    $runningTasks = $info[2]
    $pendingTasks = $info[3]
    $activeServices = $info[4]
    
    $totalTasks = $runningTasks + $pendingTasks
    
    return @{
        Exists = $true
        Status = $status.ToUpper()
        Services = $activeServices
        Tasks = $totalTasks
        Progress = if ($activeServices -eq 0 -and $totalTasks -eq 0) { 75 } else { 25 }
    }
}

function Get-VpcStatus {
    $vpcId = aws ec2 describe-vpcs --region $region --filters "Name=tag:Name,Values=${projectPrefix}-vpc" --query 'Vpcs[0].VpcId' --output text 2>&1
    
    if ($LASTEXITCODE -ne 0 -or $vpcId -eq "None" -or -not $vpcId) {
        return @{
            Exists = $false
            VpcId = $null
            Subnets = 0
            SecurityGroups = 0
            Endpoints = 0
            Progress = 100
        }
    }
    
    # Contar subnets
    $subnets = aws ec2 describe-subnets --region $region --filters "Name=vpc-id,Values=$vpcId" --query 'Subnets[*].SubnetId' --output text 2>&1
    $subnetCount = if ($subnets) { ($subnets -split '\s+').Count } else { 0 }
    
    # Contar security groups (excepto default)
    $sgs = aws ec2 describe-security-groups --region $region --filters "Name=vpc-id,Values=$vpcId" --query "SecurityGroups[?GroupName!='default'].GroupId" --output text 2>&1
    $sgCount = if ($sgs) { ($sgs -split '\s+').Count } else { 0 }
    
    # Contar endpoints
    $endpoints = aws ec2 describe-vpc-endpoints --region $region --filters "Name=vpc-id,Values=$vpcId" --query 'VpcEndpoints[*].VpcEndpointId' --output text 2>&1
    $endpointCount = if ($endpoints) { ($endpoints -split '\s+').Count } else { 0 }
    
    return @{
        Exists = $true
        VpcId = $vpcId
        Subnets = $subnetCount
        SecurityGroups = $sgCount
        Endpoints = $endpointCount
        Progress = 0
    }
}

function Get-EcrStatus {
    $repos = @("${projectPrefix}-backend", "${projectPrefix}-frontend", "${projectPrefix}-middleware")
    $existingRepos = @()
    
    foreach ($repo in $repos) {
        $repoInfo = aws ecr describe-repositories --repository-names $repo --region $region 2>&1
        if ($LASTEXITCODE -eq 0) {
            $existingRepos += $repo
        }
    }
    
    return @{
        Exists = $existingRepos.Count -gt 0
        Repositories = $existingRepos
        Count = $existingRepos.Count
        Progress = if ($existingRepos.Count -eq 0) { 100 } else { 0 }
    }
}

function Get-TargetGroupStatus {
    $tgs = aws elbv2 describe-target-groups --region $region --query "TargetGroups[?contains(TargetGroupName, '${projectPrefix}')].TargetGroupName" --output text 2>&1
    $tgCount = if ($tgs -and $LASTEXITCODE -eq 0) { ($tgs -split '\s+').Count } else { 0 }
    
    return @{
        Exists = $tgCount -gt 0
        Count = $tgCount
        Progress = if ($tgCount -eq 0) { 100 } else { 0 }
    }
}

function Get-SecretsStatus {
    $secrets = aws secretsmanager list-secrets --region $region --query "SecretList[?contains(Name, '${projectPrefix}')].Name" --output text 2>&1
    $secretCount = if ($secrets -and $LASTEXITCODE -eq 0) { ($secrets -split '\s+').Count } else { 0 }
    
    return @{
        Exists = $secretCount -gt 0
        Count = $secretCount
        Progress = if ($secretCount -eq 0) { 100 } else { 0 }
    }
}

function Get-LogGroupsStatus {
    $logs = aws logs describe-log-groups --region $region --query "logGroups[?contains(logGroupName, '/ecs/${projectPrefix}')].logGroupName" --output text 2>&1
    $logCount = if ($logs -and $LASTEXITCODE -eq 0) { ($logs -split '\s+').Count } else { 0 }
    
    return @{
        Exists = $logCount -gt 0
        Count = $logCount
        Progress = if ($logCount -eq 0) { 100 } else { 0 }
    }
}

function Show-ProgressBar {
    param(
        [int]$Progress,
        [int]$Width = 40
    )
    
    $completed = [Math]::Floor($Width * $Progress / 100)
    $remaining = $Width - $completed
    
    $bar = ""
    if ($completed -gt 0) {
        $bar += "=" * $completed
    }
    if ($remaining -gt 0) {
        $bar += "-" * $remaining
    }
    
    $color = if ($Progress -eq 100) { "Green" } elseif ($Progress -gt 50) { "Yellow" } else { "Red" }
    
    Write-Host "[" -NoNewline
    Write-Host $bar -ForegroundColor $color -NoNewline
    Write-Host "] " -NoNewline
    Write-Host ("{0,3}%" -f $Progress) -ForegroundColor $color
}

function Show-ResourceStatus {
    param(
        [string]$ResourceName,
        [hashtable]$Status,
        [switch]$Detailed = $false
    )
    
    Write-Host ""
    Write-Host "  $ResourceName" -ForegroundColor Cyan
    Write-Host "  " -NoNewline
    Show-ProgressBar -Progress $Status.Progress
    
    if (-not $Status.Exists) {
        Write-Host "    Estado: ELIMINADO" -ForegroundColor Green
    } else {
        Write-Host "    Estado: $($Status.Status)" -ForegroundColor Yellow
        
        if ($Detailed) {
            foreach ($key in $Status.Keys) {
                if ($key -notin @("Exists", "Progress", "Status")) {
                    $value = $Status[$key]
                    if ($value -is [array]) {
                        Write-Host "    $key : $($value -join ', ')" -ForegroundColor Gray
                    } elseif ($null -ne $value -and $value -ne "") {
                        Write-Host "    $key : $value" -ForegroundColor Gray
                    }
                }
            }
        }
    }
}

function Get-EstimatedTimeRemaining {
    param([hashtable[]]$AllStatus)
    
    $maxProgress = ($AllStatus | Measure-Object -Property Progress -Minimum).Minimum
    
    if ($maxProgress -eq 100) {
        return 0
    }
    
    # RDS: 5-10 min, ALB: 2-3 min, Otros: 1-2 min
    $rdsStatus = $AllStatus | Where-Object { $_.ResourceType -eq "RDS" } | Select-Object -First 1
    $albStatus = $AllStatus | Where-Object { $_.ResourceType -eq "ALB" } | Select-Object -First 1
    
    $timeRemaining = 0
    
    if ($rdsStatus.Exists) {
        $timeRemaining = [Math]::Max($timeRemaining, 600) # 10 min
    }
    
    if ($albStatus.Exists) {
        $timeRemaining = [Math]::Max($timeRemaining, 180) # 3 min
    }
    
    return $timeRemaining
}

# Validaciones
if (-not (Test-AwsCli)) {
    Write-Host "ERROR: AWS CLI no esta instalado" -ForegroundColor Red
    exit 1
}

if (-not (Test-AwsCredentials)) {
    Write-Host "ERROR: Credenciales AWS invalidas" -ForegroundColor Red
    exit 1
}

$accountId = aws sts get-caller-identity --query Account --output text

# Loop principal
$iteration = 0
do {
    Clear-Host
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Estado de Eliminacion AWS - INIA" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "AWS Account: $accountId" -ForegroundColor Gray
    Write-Host "Region: $region" -ForegroundColor Gray
    Write-Host "Hora: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Gray
    if ($Watch) {
        Write-Host "Actualizando cada $Interval segundos (Ctrl+C para salir)" -ForegroundColor Gray
    }
    Write-Host ""
    
    # Obtener estados
    Write-Host "Verificando recursos..." -ForegroundColor Yellow
    Write-Host ""
    
    $rdsStatus = Get-RdsStatus
    $rdsStatus.ResourceType = "RDS"
    Show-ResourceStatus -ResourceName "RDS Database (PostgreSQL)" -Status $rdsStatus -Detailed
    
    $albStatus = Get-AlbStatus
    $albStatus.ResourceType = "ALB"
    Show-ResourceStatus -ResourceName "Application Load Balancer" -Status $albStatus
    
    $ecsStatus = Get-EcsStatus
    $ecsStatus.ResourceType = "ECS"
    Show-ResourceStatus -ResourceName "ECS Cluster" -Status $ecsStatus -Detailed
    
    $vpcStatus = Get-VpcStatus
    $vpcStatus.ResourceType = "VPC"
    Show-ResourceStatus -ResourceName "VPC y Componentes" -Status $vpcStatus -Detailed
    
    $ecrStatus = Get-EcrStatus
    $ecrStatus.ResourceType = "ECR"
    Show-ResourceStatus -ResourceName "ECR Repositories" -Status $ecrStatus -Detailed
    
    $tgStatus = Get-TargetGroupStatus
    $tgStatus.ResourceType = "TG"
    Show-ResourceStatus -ResourceName "Target Groups" -Status $tgStatus -Detailed
    
    $secretsStatus = Get-SecretsStatus
    $secretsStatus.ResourceType = "Secrets"
    Show-ResourceStatus -ResourceName "Secrets Manager" -Status $secretsStatus -Detailed
    
    $logsStatus = Get-LogGroupsStatus
    $logsStatus.ResourceType = "Logs"
    Show-ResourceStatus -ResourceName "CloudWatch Log Groups" -Status $logsStatus -Detailed
    
    # Calcular progreso total
    $allStatuses = @($rdsStatus, $albStatus, $ecsStatus, $vpcStatus, $ecrStatus, $tgStatus, $secretsStatus, $logsStatus)
    $totalProgress = ($allStatuses | Measure-Object -Property Progress -Average).Average
    $allDeleted = ($allStatuses | Where-Object { $_.Exists -eq $true }).Count -eq 0
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Progreso Total" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  " -NoNewline
    Show-ProgressBar -Progress ([Math]::Round($totalProgress))
    Write-Host ""
    
    if ($allDeleted) {
        Write-Host "TODOS LOS RECURSOS HAN SIDO ELIMINADOS" -ForegroundColor Green
        Write-Host ""
        break
    } else {
        $resourcesRemaining = ($allStatuses | Where-Object { $_.Exists -eq $true }).Count
        Write-Host "  Recursos restantes: $resourcesRemaining" -ForegroundColor Yellow
        
        # Mostrar tiempo estimado
        $timeRemaining = Get-EstimatedTimeRemaining -AllStatus $allStatuses
        if ($timeRemaining -gt 0) {
            $minutes = [Math]::Floor($timeRemaining / 60)
            $seconds = $timeRemaining % 60
            Write-Host "  Tiempo estimado: ~$minutes min $seconds seg" -ForegroundColor Yellow
        }
        
        # Advertencias especiales
        if ($rdsStatus.Exists) {
            Write-Host ""
            Write-Host "  RDS Database en proceso de eliminacion" -ForegroundColor Yellow
            Write-Host "  Esto puede tomar 5-10 minutos..." -ForegroundColor Gray
        }
        
        if ($rdsStatus.DeletionProtection) {
            Write-Host ""
            Write-Host "  ADVERTENCIA: RDS tiene Deletion Protection activada" -ForegroundColor Red
            Write-Host "  Desactivala en AWS Console para poder eliminarla" -ForegroundColor Yellow
        }
        
        Write-Host ""
    }
    
    if ($Watch) {
        Write-Host "Proxima actualizacion en $Interval segundos..." -ForegroundColor Gray
        Start-Sleep -Seconds $Interval
        $iteration++
    }
    
} while ($Watch)

Write-Host "Verificacion completada" -ForegroundColor Green
Write-Host ""

exit 0

# Script para eliminar SOLO la base de datos RDS
# Ubicacion: IniaProject/awsScripts/eliminar-rds.ps1
# Uso: .\awsScripts\eliminar-rds.ps1

param(
    [switch]$AutoApprove = $false,
    [switch]$CreateSnapshot = $false,
    [string]$SnapshotName = "",
    [switch]$Help = $false
)

if ($Help) {
    Write-Host "Uso: .\awsScripts\eliminar-rds.ps1 [opciones]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor Yellow
    Write-Host "  -AutoApprove      Eliminar sin pedir confirmacion" -ForegroundColor White
    Write-Host "  -CreateSnapshot   Crear snapshot final antes de eliminar" -ForegroundColor White
    Write-Host "  -SnapshotName     Nombre del snapshot (default: inia-prod-db-final-TIMESTAMP)" -ForegroundColor White
    Write-Host "  -Help             Mostrar esta ayuda" -ForegroundColor White
    Write-Host ""
    Write-Host "Ejemplos:" -ForegroundColor Yellow
    Write-Host "  .\awsScripts\eliminar-rds.ps1" -ForegroundColor White
    Write-Host "  .\awsScripts\eliminar-rds.ps1 -CreateSnapshot" -ForegroundColor White
    Write-Host "  .\awsScripts\eliminar-rds.ps1 -CreateSnapshot -SnapshotName 'backup-2024-12'" -ForegroundColor White
    Write-Host "  .\awsScripts\eliminar-rds.ps1 -AutoApprove" -ForegroundColor White
    Write-Host ""
    exit 0
}

$region = "us-east-1"
$dbInstance = "inia-prod-db"

Write-Host "========================================" -ForegroundColor Red
Write-Host "  ELIMINAR RDS Database - Proyecto INIA" -ForegroundColor Red
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

function Get-RdsInfo {
    $info = aws rds describe-db-instances --db-instance-identifier $dbInstance --region $region --query 'DBInstances[0].[DBInstanceStatus,DeletionProtection,DBInstanceClass,Engine,EngineVersion,AllocatedStorage,Endpoint.Address]' --output json 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        return $null
    }
    
    $data = $info | ConvertFrom-Json
    return @{
        Status = $data[0]
        DeletionProtection = $data[1]
        InstanceClass = $data[2]
        Engine = $data[3]
        EngineVersion = $data[4]
        Storage = $data[5]
        Endpoint = $data[6]
    }
}

# Validaciones
Write-Host "Validando prerequisitos..." -ForegroundColor Cyan
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

# Verificar si existe la instancia RDS
Write-Host "Verificando instancia RDS..." -ForegroundColor Cyan
$rdsInfo = Get-RdsInfo

if ($null -eq $rdsInfo) {
    Write-Host ""
    Write-Host "La instancia RDS '$dbInstance' NO EXISTE" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Posibles razones:" -ForegroundColor Gray
    Write-Host "  - Ya fue eliminada previamente" -ForegroundColor Gray
    Write-Host "  - El nombre es incorrecto" -ForegroundColor Gray
    Write-Host "  - Esta en otra region" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Verifica con:" -ForegroundColor Cyan
    Write-Host "  aws rds describe-db-instances --region $region" -ForegroundColor White
    Write-Host ""
    exit 0
}

# Mostrar información de la instancia
Write-Host ""
Write-Host "Instancia RDS encontrada:" -ForegroundColor Green
Write-Host ""
Write-Host "  Identificador:         $dbInstance" -ForegroundColor White
Write-Host "  Estado:                $($rdsInfo.Status)" -ForegroundColor $(if ($rdsInfo.Status -eq "available") { "Green" } else { "Yellow" })
Write-Host "  Deletion Protection:   $($rdsInfo.DeletionProtection)" -ForegroundColor $(if ($rdsInfo.DeletionProtection) { "Red" } else { "Green" })
Write-Host "  Clase:                 $($rdsInfo.InstanceClass)" -ForegroundColor Gray
Write-Host "  Motor:                 $($rdsInfo.Engine) $($rdsInfo.EngineVersion)" -ForegroundColor Gray
Write-Host "  Almacenamiento:        $($rdsInfo.Storage) GB" -ForegroundColor Gray
Write-Host "  Endpoint:              $($rdsInfo.Endpoint)" -ForegroundColor Gray
Write-Host ""

# Advertencia
Write-Host "ADVERTENCIA:" -ForegroundColor Red
Write-Host ""
Write-Host "  Esta operacion eliminara PERMANENTEMENTE:" -ForegroundColor Yellow
Write-Host "    - Base de datos: $dbInstance" -ForegroundColor White
Write-Host "    - TODOS los datos almacenados" -ForegroundColor White
Write-Host "    - Tablas, registros, configuraciones" -ForegroundColor White
Write-Host ""

if ($CreateSnapshot) {
    Write-Host "  Se creara un SNAPSHOT final para backup" -ForegroundColor Green
    if ($SnapshotName -eq "") {
        $timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
        $SnapshotName = "$dbInstance-final-$timestamp"
    }
    Write-Host "  Nombre del snapshot: $SnapshotName" -ForegroundColor Cyan
} else {
    Write-Host "  NO se creara snapshot de backup" -ForegroundColor Red
    Write-Host "  (usa -CreateSnapshot para crear backup)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "  Esta operacion NO SE PUEDE DESHACER" -ForegroundColor Red
Write-Host ""

# Confirmación
if (-not $AutoApprove) {
    Write-Host "Para continuar, escribe el nombre de la instancia: " -NoNewline -ForegroundColor Yellow
    Write-Host "$dbInstance" -ForegroundColor Red
    $confirmacion = Read-Host "Confirmacion"
    
    if ($confirmacion -ne $dbInstance) {
        Write-Host ""
        Write-Host "Operacion CANCELADA" -ForegroundColor Green
        exit 0
    }
    
    Write-Host ""
    Write-Host "Ultima oportunidad. Presiona Ctrl+C en los proximos 5 segundos para cancelar..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

Write-Host ""
Write-Host "Iniciando eliminacion de RDS..." -ForegroundColor Red
Write-Host ""

# Paso 1: Desactivar Deletion Protection si está activa
if ($rdsInfo.DeletionProtection -eq $true) {
    Write-Host "[1/2] Desactivando Deletion Protection..." -ForegroundColor Cyan
    Write-Host "  Deletion Protection ACTIVA - Desactivando..." -ForegroundColor Yellow
    
    $modifyResult = aws rds modify-db-instance --db-instance-identifier $dbInstance --no-deletion-protection --apply-immediately --region $region 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Deletion Protection DESACTIVADA exitosamente" -ForegroundColor Green
        Start-Sleep -Seconds 5
    } else {
        Write-Host "  ERROR: No se pudo desactivar Deletion Protection" -ForegroundColor Red
        Write-Host "  $modifyResult" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Solucion:" -ForegroundColor Yellow
        Write-Host "  1. Ve a AWS Console -> RDS" -ForegroundColor White
        Write-Host "  2. Selecciona la instancia $dbInstance" -ForegroundColor White
        Write-Host "  3. Modify -> Desactiva 'Enable deletion protection'" -ForegroundColor White
        Write-Host "  4. Apply immediately" -ForegroundColor White
        Write-Host ""
        exit 1
    }
} else {
    Write-Host "[1/2] Verificando Deletion Protection..." -ForegroundColor Cyan
    Write-Host "  Deletion Protection: Ya desactivada" -ForegroundColor Green
}
Write-Host ""

# Paso 2: Eliminar instancia RDS
Write-Host "[2/2] Eliminando instancia RDS..." -ForegroundColor Cyan

if ($CreateSnapshot) {
    Write-Host "  Creando snapshot final: $SnapshotName" -ForegroundColor Yellow
    Write-Host "  (Esto puede tomar varios minutos dependiendo del tamano de la BD)" -ForegroundColor Gray
    $deleteResult = aws rds delete-db-instance --db-instance-identifier $dbInstance --final-db-snapshot-identifier $SnapshotName --region $region 2>&1
} else {
    Write-Host "  Eliminando sin snapshot final..." -ForegroundColor Yellow
    $deleteResult = aws rds delete-db-instance --db-instance-identifier $dbInstance --skip-final-snapshot --delete-automated-backups --region $region 2>&1
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "  RDS Database marcada para ELIMINACION COMPLETA" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Estado: DELETING" -ForegroundColor Yellow
    Write-Host "  Tiempo estimado: 5-10 minutos" -ForegroundColor Gray
    Write-Host ""
    
    if ($CreateSnapshot) {
        Write-Host "  Snapshot creado: $SnapshotName" -ForegroundColor Green
        Write-Host "  Puedes restaurar desde este snapshot si es necesario" -ForegroundColor Gray
        Write-Host ""
        Write-Host "  Restaurar:" -ForegroundColor Cyan
        Write-Host "    aws rds restore-db-instance-from-db-snapshot \\" -ForegroundColor White
        Write-Host "      --db-instance-identifier nueva-instancia \\" -ForegroundColor White
        Write-Host "      --db-snapshot-identifier $SnapshotName \\" -ForegroundColor White
        Write-Host "      --region $region" -ForegroundColor White
        Write-Host ""
    }
} else {
    Write-Host ""
    Write-Host "  ERROR: No se pudo eliminar la instancia RDS" -ForegroundColor Red
    Write-Host "  $deleteResult" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Proceso Iniciado Exitosamente" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Monitorear progreso:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Opcion 1 - Script de verificacion:" -ForegroundColor Yellow
Write-Host "    .\awsScripts\verificar-eliminacion-aws.ps1 -Watch" -ForegroundColor White
Write-Host ""
Write-Host "  Opcion 2 - AWS CLI:" -ForegroundColor Yellow
Write-Host "    aws rds describe-db-instances --db-instance-identifier $dbInstance --region $region" -ForegroundColor White
Write-Host ""
Write-Host "  Opcion 3 - AWS Console:" -ForegroundColor Yellow
Write-Host "    https://console.aws.amazon.com/rds/" -ForegroundColor White
Write-Host ""
Write-Host "Estados posibles:" -ForegroundColor Gray
Write-Host "  available -> deleting -> deleted" -ForegroundColor White
Write-Host ""
Write-Host "Cuando este eliminada completamente:" -ForegroundColor Yellow
Write-Host "  ERROR: DBInstanceNotFound" -ForegroundColor Green
Write-Host ""

# Información de costos
Write-Host "Ahorro de costos estimado:" -ForegroundColor Cyan
Write-Host "  RDS $($rdsInfo.InstanceClass): ~$15-25/mes" -ForegroundColor White
Write-Host "  (Dependiendo del uso y horas activas)" -ForegroundColor Gray
Write-Host ""

exit 0

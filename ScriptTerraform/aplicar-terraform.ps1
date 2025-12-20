# APLICAR CAMBIOS CON TERRAFORM
# Crea o actualiza la infraestructura en AWS
# Uso: .\ScriptTerraform\aplicar-terraform.ps1

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  APLICAR CAMBIOS EN AWS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Esto creara recursos en AWS (~$109/mes)" -ForegroundColor Yellow
Write-Host "Tiempo estimado: 10-15 minutos" -ForegroundColor Gray
Write-Host ""

# Configurar entorno
cd C:\Github\IniaProject\terraform
$env:Path += ";$env:USERPROFILE\terraform"

# Aplicar cambios
terraform apply

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Infraestructura creada exitosamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ver informacion importante:" -ForegroundColor Cyan
    terraform output
    Write-Host ""
    Write-Host "Proximo paso:" -ForegroundColor Cyan
    Write-Host "  .\scriptDockers\subir-imagenes-ecr.ps1 -All" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERROR: Fallo al aplicar cambios" -ForegroundColor Red
    Write-Host ""
    exit 1
}

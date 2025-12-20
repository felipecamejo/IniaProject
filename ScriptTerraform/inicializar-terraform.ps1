# INICIALIZAR TERRAFORM
# Prepara Terraform para trabajar (ejecutar PRIMERO)
# Uso: .\ScriptTerraform\inicializar-terraform.ps1

Write-Host "Inicializando Terraform..." -ForegroundColor Cyan
Write-Host ""

# Configurar entorno
cd C:\Github\IniaProject\terraform
$env:Path += ";$env:USERPROFILE\terraform"

# Inicializar
terraform init

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Terraform inicializado correctamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximo paso:" -ForegroundColor Cyan
    Write-Host "  .\ScriptTerraform\planear-terraform.ps1" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERROR: Fallo al inicializar" -ForegroundColor Red
    Write-Host ""
    exit 1
}

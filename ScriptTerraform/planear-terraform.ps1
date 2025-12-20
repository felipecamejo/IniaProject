# VER PLAN DE TERRAFORM
# Muestra que cambios se haran SIN aplicarlos
# Uso: .\ScriptTerraform\planear-terraform.ps1

Write-Host "Generando plan de Terraform..." -ForegroundColor Cyan
Write-Host ""

# Configurar entorno
cd C:\Github\IniaProject\terraform
$env:Path += ";$env:USERPROFILE\terraform"

# Ver plan
terraform plan

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Plan generado correctamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximo paso:" -ForegroundColor Cyan
    Write-Host "  .\ScriptTerraform\aplicar-terraform.ps1" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERROR: Fallo al generar plan" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Script para construir y desplegar el backend en AWS ECS
# Ejecutar: .\deploy-backend-aws.ps1

Write-Host "=== Construyendo imagen del backend ===" -ForegroundColor Cyan
docker-compose -f docker-compose.ecs.yml build --no-cache backend

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al construir la imagen. Verifica que Docker Desktop esté corriendo." -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Etiquetando imagen para ECR ===" -ForegroundColor Cyan
docker tag iniaproject-backend:latest 089491951360.dkr.ecr.us-east-1.amazonaws.com/inia-prod-backend:latest

Write-Host "`n=== Subiendo imagen a ECR ===" -ForegroundColor Cyan
docker push 089491951360.dkr.ecr.us-east-1.amazonaws.com/inia-prod-backend:latest

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al subir la imagen a ECR." -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Forzando nuevo despliegue en ECS ===" -ForegroundColor Cyan
aws ecs update-service --cluster inia-prod-cluster --service inia-prod-backend-service --force-new-deployment --region us-east-1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al actualizar el servicio ECS." -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Despliegue iniciado exitosamente ===" -ForegroundColor Green
Write-Host "El servicio ECS está actualizando las tareas con la nueva imagen." -ForegroundColor Yellow
Write-Host "Puedes monitorear el progreso con:" -ForegroundColor Yellow
Write-Host "  aws ecs describe-services --cluster inia-prod-cluster --services inia-prod-backend-service --region us-east-1" -ForegroundColor Gray


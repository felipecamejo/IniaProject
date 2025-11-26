## Documentación de Comandos para Desplegar en AWS (CLI + PowerShell) - Proyecto INIA

**Objetivo:** Tener en un solo lugar **todos los comandos necesarios** para levantar la infraestructura y la aplicación INIA en AWS usando **AWS CLI**, **Terraform** y **PowerShell** (incluyendo Docker).

---

## 1. Requisitos Previos

Ejecutar en PowerShell:

```powershell
# Verificar AWS CLI
aws --version
aws sts get-caller-identity

# Verificar Terraform
terraform version

# Verificar Docker
docker --version
```

Configurar credenciales y región (solo una vez):

```powershell
aws configure
# Después, opcionalmente:
aws configure set region us-east-1   # o la región que uses en terraform.tfvars
```

---

## 2. Despliegue Completo con Script PowerShell (`deploy-aws.ps1`)

Este es el camino más directo usando el script ya preparado.

Desde el directorio `terraform/`:

```powershell
cd terraform

# Opcional: copiar archivo de variables
cp terraform.tfvars.example terraform.tfvars
# Editar terraform.tfvars con tus valores (db_password, jwt_secret, etc.)

# Ejecutar despliegue completo (plan + apply + imágenes Docker)
.\deploy-aws.ps1

# Opcional: saltar partes específicas
.\deploy-aws.ps1 -SkipPlan           # si ya revisaste el plan
.\deploy-aws.ps1 -SkipInfrastructure # solo construir/subir imágenes
.\deploy-aws.ps1 -SkipImages         # solo infraestructura
```

El script hace automáticamente:
- Verificación de AWS CLI y credenciales.
- `terraform init / plan / apply`.
- Login en ECR.
- `docker build / tag / push` de backend, frontend y middleware.
- Muestra al final el DNS del ALB y URLs de acceso.

---

## 3. Despliegue Manual de Infraestructura con Terraform (CLI)

### 3.1 Preparar variables

Desde `terraform/`:

```powershell
cd terraform

cp terraform.tfvars.example terraform.tfvars
# Editar terraform.tfvars (db_password, jwt_secret, etc.)
```

### 3.2 Inicializar, validar y planificar

```powershell
terraform init
terraform validate

# Plan básico
terraform plan

# O guardar plan en archivo
terraform plan -out=tfplan
```

### 3.3 Aplicar la infraestructura

```powershell
# Usando el plan guardado
terraform apply tfplan

# O directamente (pide confirmación)
terraform apply
```

### 3.4 Ver outputs útiles

```powershell
terraform output alb_dns_name
terraform output ecr_backend_repository_url
terraform output ecr_frontend_repository_url
terraform output ecr_middleware_repository_url
terraform output rds_endpoint
terraform output ecs_cluster_name
terraform output ecs_backend_service_name
terraform output ecs_frontend_service_name
terraform output ecs_middleware_service_name
```

---

## 4. Construir y Subir Imágenes Docker a ECR (CLI + PowerShell)

### 4.1 Autenticarse en ECR

Desde `terraform/` para reutilizar outputs:

```powershell
$region    = terraform output -raw aws_region 2>$null
if (-not $region) { $region = "us-east-1" }
$accountId = aws sts get-caller-identity --query Account --output text
$registry  = "$accountId.dkr.ecr.$region.amazonaws.com"

aws ecr get-login-password --region $region | docker login --username AWS --password-stdin $registry
```

### 4.2 Obtener URLs de repositorios ECR

```powershell
$backendRepo    = terraform output -raw ecr_backend_repository_url
$frontendRepo   = terraform output -raw ecr_frontend_repository_url
$middlewareRepo = terraform output -raw ecr_middleware_repository_url

Write-Host "Backend:    $backendRepo"
Write-Host "Frontend:   $frontendRepo"
Write-Host "Middleware: $middlewareRepo"
```

### 4.3 Construir y subir imágenes (desde raíz del proyecto)

```powershell
cd ..   # si estabas en terraform/

# Backend
docker build -f Dockerfile.backend   -t inia-backend:latest .
docker tag   inia-backend:latest   "$backendRepo:latest"
docker push  "$backendRepo:latest"

# Frontend
docker build -f Dockerfile.frontend  -t inia-frontend:latest .
docker tag   inia-frontend:latest  "$frontendRepo:latest"
docker push  "$frontendRepo:latest"

# Middleware
docker build -f Dockerfile.middleware -t inia-middleware:latest .
docker tag   inia-middleware:latest "$middlewareRepo:latest"
docker push  "$middlewareRepo:latest"
```

---

## 5. Verificar Servicios ECS y Estado del Despliegue (AWS CLI)

### 5.1 Ver servicios ECS

```powershell
$cluster = terraform output -raw ecs_cluster_name

aws ecs list-services --cluster $cluster

aws ecs describe-services `
  --cluster  $cluster `
  --services (terraform output -raw ecs_backend_service_name) `
  --query "services[0].{Status:status,Running:runningCount,Desired:desiredCount}"

aws ecs describe-services `
  --cluster  $cluster `
  --services (terraform output -raw ecs_frontend_service_name) `
  --query "services[0].{Status:status,Running:runningCount,Desired:desiredCount}"

aws ecs describe-services `
  --cluster  $cluster `
  --services (terraform output -raw ecs_middleware_service_name) `
  --query "services[0].{Status:status,Running:runningCount,Desired:desiredCount}"
```

### 5.2 Ver health de Target Groups / ALB

```powershell
$albDns = terraform output -raw alb_dns_name
Write-Host "ALB DNS: $albDns"

# Comprobar health endpoints (desde tu máquina)
curl -I "http://$albDns/health"                  # Frontend o check simple
curl -I "http://$albDns/Inia/actuator/health"   # Backend
curl -I "http://$albDns/middleware/health"      # Middleware
```

Si necesitas inspeccionar Target Groups directamente (nombres pueden variar según Terraform):

```powershell
aws elbv2 describe-target-groups --region us-east-1

# Ejemplo para ver estado de un TG concreto
$tgArn = aws elbv2 describe-target-groups `
  --names inia-prod-frontend-tg `
  --query "TargetGroups[0].TargetGroupArn" `
  --output text

aws elbv2 describe-target-health --target-group-arn $tgArn
```

### 5.3 Ver logs en CloudWatch

```powershell
# Backend
aws logs tail /ecs/inia-prod-backend --since 10m

# Frontend
aws logs tail /ecs/inia-prod-frontend --since 10m

# Middleware
aws logs tail /ecs/inia-prod-middleware --since 10m
```

---

## 6. Actualizar Versión de la Aplicación

### 6.1 Opción A: Cambiar tag y aplicar con Terraform

En `terraform/terraform.tfvars`:

```hcl
image_tag = "v1.1.0"
```

Construir y subir imágenes con el nuevo tag:

```powershell
# Ejemplo backend
docker build -f Dockerfile.backend -t inia-backend:v1.1.0 .
docker tag  inia-backend:v1.1.0 "$backendRepo:v1.1.0"
docker push "$backendRepo:v1.1.0"
```

Aplicar cambios:

```powershell
cd terraform
terraform apply
```

### 6.2 Opción B: Forzar redeploy sin cambiar Task Definition

```powershell
$cluster = terraform output -raw ecs_cluster_name

aws ecs update-service `
  --cluster  $cluster `
  --service (terraform output -raw ecs_backend_service_name) `
  --force-new-deployment

aws ecs update-service `
  --cluster  $cluster `
  --service (terraform output -raw ecs_frontend_service_name) `
  --force-new-deployment

aws ecs update-service `
  --cluster  $cluster `
  --service (terraform output -raw ecs_middleware_service_name) `
  --force-new-deployment
```

---

## 7. Inicializar Base de Datos con `init.sql` (Opcional)

```powershell
cd terraform
$rdsEndpoint = terraform output -raw rds_endpoint
$rdsHost     = $rdsEndpoint.Split(':')[0]
$dbPassword  = (Get-Content terraform.tfvars | Select-String "db_password" | ForEach-Object { $_.ToString().Split('"')[1] })

cd ..

# Requiere psql instalado
$env:PGPASSWORD = $dbPassword
psql -h $rdsHost -U postgres -d Inia -f .\init.sql
```

---

## 8. Destruir Infraestructura (Cleanup)

**Advertencia:** esto elimina TODA la infraestructura (incluida la BD).

```powershell
cd terraform

# Ver qué se va a destruir
terraform plan -destroy

# Destruir
terraform destroy
```

---

**Resumen:**  
Con estos comandos tienes el flujo completo para:
- Crear infraestructura con Terraform (CLI).
- Desplegar imágenes en ECS usando AWS CLI + Docker.
- O ejecutar todo con un solo script PowerShell (`deploy-aws.ps1`).  
Puedes copiar este archivo tal cual a tu documentación de operaciones o runbooks internos.



# Guía de Despliegue Paso a Paso

Esta guía te llevará paso a paso a través del proceso completo de despliegue de la infraestructura INIA en AWS.

## 📋 Checklist Pre-Despliegue

- [ ] AWS CLI instalado y configurado
- [ ] Terraform >= 1.0 instalado
- [ ] Docker instalado y funcionando
- [ ] Credenciales AWS con permisos suficientes
- [ ] Acceso a la cuenta AWS donde desplegar

## 🚀 Proceso Completo de Despliegue

### Fase 1: Preparación

#### 1.1 Verificar Prerrequisitos

```bash
# Verificar AWS CLI
aws --version
aws sts get-caller-identity

# Verificar Terraform
terraform version

# Verificar Docker
docker --version
```

#### 1.2 Configurar Variables

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edita `terraform.tfvars` con valores seguros:

```hcl
aws_region = "us-east-1"
project_name = "inia"
environment = "prod"

vpc_cidr = "10.0.0.0/16"

db_instance_class = "db.t3.micro"
db_allocated_storage = 20
db_name = "Inia"
db_username = "postgres"
db_password = "GENERA_UNA_PASSWORD_SEGURA_AQUI"  # ⚠️ Cambiar esto
jwt_secret = "GENERA_UN_SECRET_SEGURO_AQUI"      # ⚠️ Cambiar esto

image_tag = "latest"

desired_count_backend = 2
desired_count_frontend = 2
desired_count_middleware = 2

cpu_backend = 512
memory_backend = 1024
cpu_frontend = 256
memory_frontend = 512
cpu_middleware = 512
memory_middleware = 1024
```

**Generar valores seguros:**

```bash
# Para db_password (32 caracteres)
openssl rand -base64 32

# Para jwt_secret (64 caracteres)
openssl rand -base64 64
```

### Fase 2: Crear Infraestructura con Terraform

#### 2.1 Inicializar Terraform

```bash
terraform init
```

Deberías ver:
```
Initializing the backend...
Initializing provider plugins...
Terraform has been successfully initialized!
```

#### 2.2 Validar Configuración

```bash
terraform validate
```

#### 2.3 Planificar Despliegue

```bash
terraform plan -out=tfplan
```

Revisa cuidadosamente el plan. Deberías ver:
- 1 VPC
- 4 Subnets (2 públicas, 2 privadas)
- 1 Internet Gateway
- 2 NAT Gateways
- 3 Security Groups
- 3 ECR Repositories
- 2 IAM Roles
- 1 RDS Instance
- 1 ECS Cluster
- 1 Application Load Balancer
- 3 Target Groups
- 3 Task Definitions
- 3 ECS Services
- 3 CloudWatch Log Groups

**⏱️ Tiempo estimado de revisión**: 5-10 minutos

#### 2.4 Aplicar Infraestructura

```bash
terraform apply tfplan
```

O simplemente:

```bash
terraform apply
```

Confirma con `yes` cuando se solicite.

**⏱️ Tiempo estimado**: 15-20 minutos

**Lo que está pasando:**
1. Se crea la VPC y networking (2-3 min)
2. Se crean Security Groups (1 min)
3. Se crean repositorios ECR (1 min)
4. Se crean roles IAM (1 min)
5. Se crea RDS (15-20 min) ⏳ **Más lento**
6. Se crea ECS Cluster (1 min)
7. Se crea ALB y Target Groups (2-3 min)
8. Se crean Task Definitions (1 min)
9. Se crean ECS Services (2-3 min)

#### 2.5 Guardar Outputs

```bash
# Guardar outputs en archivo
terraform output -json > outputs.json

# O ver outputs individuales
terraform output alb_dns_name
terraform output ecr_backend_repository_url
terraform output ecr_frontend_repository_url
terraform output ecr_middleware_repository_url
```

### Fase 3: Construir y Subir Imágenes Docker

#### 3.1 Autenticarse en ECR

```bash
# Obtener región desde terraform
REGION=$(terraform output -raw aws_region 2>/dev/null || echo "us-east-1")
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Autenticarse
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com
```

#### 3.2 Obtener URLs de ECR

```bash
BACKEND_REPO=$(terraform output -raw ecr_backend_repository_url)
FRONTEND_REPO=$(terraform output -raw ecr_frontend_repository_url)
MIDDLEWARE_REPO=$(terraform output -raw ecr_middleware_repository_url)

echo "Backend: $BACKEND_REPO"
echo "Frontend: $FRONTEND_REPO"
echo "Middleware: $MIDDLEWARE_REPO"
```

#### 3.3 Construir y Subir Backend

```bash
# Desde la raíz del proyecto (no desde terraform/)
cd ..

# Construir imagen
docker build -f Dockerfile.backend -t inia-backend:latest .

# Tag para ECR
docker tag inia-backend:latest $BACKEND_REPO:latest

# Subir
docker push $BACKEND_REPO:latest

echo "✅ Backend subido"
```

#### 3.4 Construir y Subir Frontend

```bash
docker build -f Dockerfile.frontend -t inia-frontend:latest .
docker tag inia-frontend:latest $FRONTEND_REPO:latest
docker push $FRONTEND_REPO:latest

echo "✅ Frontend subido"
```

#### 3.5 Construir y Subir Middleware

```bash
docker build -f Dockerfile.middleware -t inia-middleware:latest .
docker tag inia-middleware:latest $MIDDLEWARE_REPO:latest
docker push $MIDDLEWARE_REPO:latest

echo "✅ Middleware subido"
```

**⏱️ Tiempo estimado**: 10-15 minutos (depende del tamaño de imágenes y velocidad de internet)

### Fase 4: Verificar Despliegue

#### 4.1 Verificar Servicios ECS

```bash
CLUSTER_NAME=$(terraform output -raw ecs_cluster_name)

# Listar servicios
aws ecs list-services --cluster $CLUSTER_NAME

# Ver estado de cada servicio
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $(terraform output -raw ecs_backend_service_name) \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount}'

aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $(terraform output -raw ecs_frontend_service_name) \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount}'

aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $(terraform output -raw ecs_middleware_service_name) \
  --query 'services[0].{Status:status,Running:runningCount,Desired:desiredCount}'
```

#### 4.2 Verificar Health Checks

```bash
ALB_DNS=$(terraform output -raw alb_dns_name)

# Frontend
curl -I http://$ALB_DNS/health

# Backend
curl -I http://$ALB_DNS/Inia/actuator/health

# Middleware
curl -I http://$ALB_DNS/middleware/health
```

#### 4.3 Verificar Target Groups

```bash
# Ver targets saludables en cada Target Group
aws elbv2 describe-target-health \
  --target-group-arn $(aws elbv2 describe-target-groups \
    --names inia-prod-frontend-tg \
    --query 'TargetGroups[0].TargetGroupArn' \
    --output text) \
  --query 'TargetHealthDescriptions[*].{Target:Target.Id,Port:Target.Port,Health:TargetHealth.State}'
```

#### 4.4 Verificar Logs

```bash
# Ver últimos logs del backend
aws logs tail /ecs/inia-prod-backend --since 10m

# Ver últimos logs del frontend
aws logs tail /ecs/inia-prod-frontend --since 10m

# Ver últimos logs del middleware
aws logs tail /ecs/inia-prod-middleware --since 10m
```

#### 4.5 Acceder a la Aplicación

```bash
ALB_DNS=$(terraform output -raw alb_dns_name)
echo "🌐 Aplicación disponible en: http://$ALB_DNS"
```

Abre la URL en tu navegador.

### Fase 5: Post-Despliegue

#### 5.1 Inicializar Base de Datos

Si necesitas ejecutar el script `init.sql`:

```bash
# Obtener endpoint de RDS
RDS_ENDPOINT=$(terraform output -raw rds_endpoint | cut -d: -f1)
DB_PASSWORD=$(grep db_password terraform.tfvars | cut -d'"' -f2)

# Conectar y ejecutar init.sql (requiere psql instalado)
PGPASSWORD=$DB_PASSWORD psql -h $RDS_ENDPOINT -U postgres -d Inia -f ../init.sql
```

#### 5.2 Configurar DNS (Opcional)

Si tienes un dominio, crea un registro CNAME apuntando al ALB:

```bash
ALB_DNS=$(terraform output -raw alb_dns_name)
echo "Crea un CNAME apuntando a: $ALB_DNS"
```

#### 5.3 Configurar HTTPS (Opcional)

1. Solicitar certificado en ACM
2. Actualizar ALB listener para usar HTTPS
3. Agregar listener rule para redirigir HTTP a HTTPS

## 🔄 Actualizar Aplicación

### Actualizar Imágenes

```bash
# 1. Construir nueva imagen
docker build -f Dockerfile.backend -t inia-backend:v1.1.0 .

# 2. Tag y push
docker tag inia-backend:v1.1.0 $BACKEND_REPO:v1.1.0
docker push $BACKEND_REPO:v1.1.0

# 3. Actualizar terraform.tfvars
# image_tag = "v1.1.0"

# 4. Aplicar cambios
terraform apply
```

### Forzar Nuevo Despliegue (sin cambiar imagen)

```bash
CLUSTER_NAME=$(terraform output -raw ecs_cluster_name)

# Backend
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $(terraform output -raw ecs_backend_service_name) \
  --force-new-deployment

# Frontend
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $(terraform output -raw ecs_frontend_service_name) \
  --force-new-deployment

# Middleware
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $(terraform output -raw ecs_middleware_service_name) \
  --force-new-deployment
```

## 🐛 Troubleshooting Común

### Problema: Tasks no inician

**Síntomas**: `runningCount = 0` en servicios ECS

**Solución**:
```bash
# Ver eventos del servicio
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $(terraform output -raw ecs_backend_service_name) \
  --query 'services[0].events[:5]'

# Ver logs de CloudWatch
aws logs tail /ecs/inia-prod-backend --follow
```

### Problema: Health checks fallan

**Síntomas**: Targets en Target Group muestran "unhealthy"

**Solución**:
1. Verificar que los health check paths sean correctos
2. Verificar Security Groups permiten tráfico
3. Verificar logs de la aplicación

### Problema: No puedo acceder a la aplicación

**Síntomas**: Timeout o error al acceder al ALB

**Solución**:
```bash
# Verificar que ALB esté activo
aws elbv2 describe-load-balancers \
  --names inia-prod-alb \
  --query 'LoadBalancers[0].State.Code'

# Verificar Security Group del ALB
aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=inia-prod-alb-sg" \
  --query 'SecurityGroups[0].IpPermissions'
```

## 📊 Monitoreo

### Ver Métricas en CloudWatch

```bash
# CPU de tasks
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=inia-prod-backend-service \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

### Ver Logs en Tiempo Real

```bash
# Backend
aws logs tail /ecs/inia-prod-backend --follow

# Filtrar errores
aws logs tail /ecs/inia-prod-backend --follow | grep -i error
```

## 🗑️ Limpieza (Destruir Infraestructura)

**⚠️ ADVERTENCIA**: Esto eliminará TODOS los recursos.

```bash
# 1. Verificar qué se eliminará
terraform plan -destroy

# 2. Destruir
terraform destroy

# 3. Confirmar con 'yes'
```

**Nota**: Se creará un snapshot final de RDS antes de eliminarlo.

## ✅ Checklist Post-Despliegue

- [ ] Infraestructura creada exitosamente
- [ ] Imágenes Docker subidas a ECR
- [ ] Servicios ECS ejecutándose
- [ ] Health checks pasando
- [ ] Aplicación accesible vía ALB
- [ ] Logs visibles en CloudWatch
- [ ] Base de datos inicializada (si aplica)
- [ ] Documentación actualizada

---

**Tiempo total estimado del despliegue completo**: 30-45 minutos


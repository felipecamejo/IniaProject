# Documentación de Infraestructura AWS con Terraform - Proyecto INIA

Esta documentación describe la infraestructura completa de AWS creada con Terraform para el proyecto INIA, utilizando Amazon ECS (Elastic Container Service) con Fargate.

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura](#arquitectura)
- [Componentes de la Infraestructura](#componentes-de-la-infraestructura)
- [Prerrequisitos](#prerrequisitos)
- [Configuración Inicial](#configuración-inicial)
- [Despliegue](#despliegue)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Variables de Configuración](#variables-de-configuración)
- [Outputs](#outputs)
- [Mantenimiento y Operaciones](#mantenimiento-y-operaciones)
- [Troubleshooting](#troubleshooting)

## 🎯 Descripción General

Esta infraestructura despliega una aplicación completa de tres capas en AWS:

1. **Frontend**: Aplicación Angular servida con Nginx
2. **Backend**: Aplicación Spring Boot (Java)
3. **Middleware**: API FastAPI (Python)
4. **Base de Datos**: PostgreSQL en RDS

Todos los servicios se ejecutan en contenedores Docker gestionados por Amazon ECS con Fargate, proporcionando escalabilidad automática y alta disponibilidad.

## 🏗️ Arquitectura

```
Internet
   │
   ▼
Application Load Balancer (ALB)
   │
   ├─── Frontend (Nginx/Angular) - Puerto 80
   ├─── Backend (Spring Boot) - Puerto 8080 (/Inia/*)
   └─── Middleware (FastAPI) - Puerto 9099 (/middleware/*)
         │
         ▼
   ECS Cluster (Fargate)
         │
         ├─── Subnets Privadas
         └─── Security Groups
                │
                ▼
         RDS PostgreSQL (Subnets Privadas)
```

### Componentes de Red

- **VPC**: Red virtual aislada con CIDR 10.0.0.0/16
- **Subnets Públicas**: Para el Application Load Balancer (2 AZs)
- **Subnets Privadas**: Para ECS tasks y RDS (2 AZs)
- **Internet Gateway**: Para acceso público al ALB
- **NAT Gateways**: Para acceso saliente de recursos en subnets privadas
- **Route Tables**: Configuración de enrutamiento para subnets públicas y privadas

## 📦 Componentes de la Infraestructura

### 1. Módulo VPC (`modules/vpc`)

Crea la red base de la infraestructura:

- **VPC** con DNS habilitado
- **2 Subnets Públicas** (una por AZ)
- **2 Subnets Privadas** (una por AZ)
- **Internet Gateway** para acceso público
- **2 NAT Gateways** (uno por AZ) para acceso saliente desde subnets privadas
- **Route Tables** configuradas para enrutamiento correcto

### 2. Módulo Security Groups (`modules/security-groups`)

Define las reglas de firewall:

- **ALB Security Group**: Permite tráfico HTTP (80) y HTTPS (443) desde Internet
- **ECS Security Group**: Permite tráfico desde ALB y comunicación interna entre tasks
- **RDS Security Group**: Permite conexiones PostgreSQL (5432) solo desde ECS tasks

### 3. Módulo ECR (`modules/ecr`)

Repositorios de contenedores Docker:

- **Backend Repository**: Para imágenes del backend Spring Boot
- **Frontend Repository**: Para imágenes del frontend Angular
- **Middleware Repository**: Para imágenes del middleware FastAPI
- **Lifecycle Policies**: Mantiene solo las últimas 10 imágenes para optimizar costos

### 4. Módulo IAM (`modules/iam`)

Roles y permisos:

- **ECS Task Execution Role**: Permite a ECS descargar imágenes de ECR y escribir logs en CloudWatch
- **ECS Task Role**: Permite a las aplicaciones escribir logs en CloudWatch

### 5. Módulo RDS (`modules/rds`)

Base de datos PostgreSQL:

- **DB Instance**: PostgreSQL 16.1 en subnets privadas
- **DB Subnet Group**: Agrupa las subnets privadas para RDS
- **Parameter Group**: Configuraciones optimizadas de PostgreSQL
- **Enhanced Monitoring**: Monitoreo avanzado habilitado
- **Backups Automáticos**: Retención de 7 días
- **Encryption**: Almacenamiento encriptado

### 6. Módulo ECS (`modules/ecs`)

Orquestación de contenedores:

- **ECS Cluster**: Cluster Fargate con Container Insights habilitado
- **Application Load Balancer**: Distribuye tráfico a los servicios
- **Target Groups**: Grupos de destino para cada servicio con health checks
- **Task Definitions**: Definiciones de tareas para cada servicio con:
  - Variables de entorno
  - Configuración de logs en CloudWatch
  - Health checks
  - Recursos de CPU y memoria
- **ECS Services**: Servicios que mantienen las tareas en ejecución
- **CloudWatch Log Groups**: Grupos de logs para cada servicio

## 🔧 Prerrequisitos

1. **AWS CLI** instalado y configurado
   ```bash
   aws --version
   aws configure
   ```

2. **Terraform** >= 1.0 instalado
   ```bash
   terraform version
   ```

3. **Docker** instalado (para construir y subir imágenes)

4. **Credenciales AWS** con permisos suficientes para:
   - Crear y gestionar VPCs, subnets, route tables
   - Crear y gestionar ECS clusters, services, task definitions
   - Crear y gestionar RDS instances
   - Crear y gestionar ECR repositories
   - Crear y gestionar IAM roles y policies
   - Crear y gestionar Application Load Balancers
   - Crear y gestionar Security Groups
   - Crear y gestionar CloudWatch Log Groups

## ⚙️ Configuración Inicial

### 1. Clonar y Navegar al Directorio

```bash
cd terraform
```

### 2. Configurar Variables

Copia el archivo de ejemplo y edita los valores:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edita `terraform.tfvars` con tus valores:

```hcl
aws_region = "us-east-1"
project_name = "inia"
environment = "prod"

# VPC Configuration
vpc_cidr = "10.0.0.0/16"

# Database Configuration
db_instance_class = "db.t3.micro"
db_allocated_storage = 20
db_name = "Inia"
db_username = "postgres"
db_password = "TU_PASSWORD_SEGURO_AQUI"

# Application Configuration
jwt_secret = "TU_JWT_SECRET_SEGURO_AQUI"
image_tag = "latest"

# ECS Service Scaling
desired_count_backend = 2
desired_count_frontend = 2
desired_count_middleware = 2

# ECS Task Resources
cpu_backend = 512
memory_backend = 1024

cpu_frontend = 256
memory_frontend = 512

cpu_middleware = 512
memory_middleware = 1024
```

**⚠️ IMPORTANTE**: 
- Cambia `db_password` y `jwt_secret` por valores seguros
- No subas `terraform.tfvars` al repositorio (debe estar en `.gitignore`)

### 3. Inicializar Terraform

```bash
terraform init
```

Este comando descarga los providers necesarios (AWS) y prepara el entorno.

## 🚀 Despliegue

### Paso 1: Planificar el Despliegue

Revisa los cambios que Terraform realizará:

```bash
terraform plan
```

Este comando muestra todos los recursos que se crearán sin aplicarlos realmente.

### Paso 2: Aplicar la Infraestructura

Si el plan se ve correcto, aplica los cambios:

```bash
terraform apply
```

Terraform te pedirá confirmación. Escribe `yes` para continuar.

**⏱️ Tiempo estimado**: 15-20 minutos (principalmente por RDS)

### Paso 3: Construir y Subir Imágenes Docker

Una vez creada la infraestructura, necesitas construir y subir las imágenes a ECR:

#### Obtener URLs de ECR

```bash
terraform output ecr_backend_repository_url
terraform output ecr_frontend_repository_url
terraform output ecr_middleware_repository_url
```

#### Autenticarse en ECR

```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
```

#### Construir y Subir Backend

```bash
# Desde la raíz del proyecto
docker build -f Dockerfile.backend -t inia-prod-backend:latest .
docker tag inia-prod-backend:latest <ECR_BACKEND_URL>:latest
docker push <ECR_BACKEND_URL>:latest
```

#### Construir y Subir Frontend

```bash
docker build -f Dockerfile.frontend -t inia-prod-frontend:latest .
docker tag inia-prod-frontend:latest <ECR_FRONTEND_URL>:latest
docker push <ECR_FRONTEND_URL>:latest
```

#### Construir y Subir Middleware

```bash
docker build -f Dockerfile.middleware -t inia-prod-middleware:latest .
docker tag inia-prod-middleware:latest <ECR_MIDDLEWARE_URL>:latest
docker push <ECR_MIDDLEWARE_URL>:latest
```

### Paso 4: Verificar el Despliegue

Obtén la URL del Load Balancer:

```bash
terraform output alb_dns_name
```

Accede a la aplicación en: `http://<alb_dns_name>`

## 📁 Estructura del Proyecto

```
terraform/
├── main.tf                    # Configuración principal y módulos
├── variables.tf               # Variables de entrada
├── outputs.tf                 # Valores de salida
├── terraform.tfvars.example  # Ejemplo de configuración
├── terraform.tfvars          # Tu configuración (no versionar)
└── modules/
    ├── vpc/
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    ├── security-groups/
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    ├── ecr/
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    ├── iam/
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    ├── rds/
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    └── ecs/
        ├── main.tf
        ├── variables.tf
        └── outputs.tf
```

## 🔑 Variables de Configuración

### Variables Principales

| Variable | Descripción | Default | Requerido |
|----------|-------------|---------|-----------|
| `aws_region` | Región de AWS | `us-east-1` | No |
| `project_name` | Nombre del proyecto | `inia` | No |
| `environment` | Ambiente (dev/staging/prod) | `prod` | No |
| `vpc_cidr` | CIDR de la VPC | `10.0.0.0/16` | No |
| `db_instance_class` | Tipo de instancia RDS | `db.t3.micro` | No |
| `db_allocated_storage` | Almacenamiento RDS (GB) | `20` | No |
| `db_name` | Nombre de la base de datos | `Inia` | No |
| `db_username` | Usuario de BD | `postgres` | Sí |
| `db_password` | Contraseña de BD | - | Sí |
| `jwt_secret` | Secret para JWT | - | Sí |
| `image_tag` | Tag de imágenes Docker | `latest` | No |
| `desired_count_*` | Número de tareas por servicio | `2` | No |
| `cpu_*` | CPU para cada task (1024=1vCPU) | Varia | No |
| `memory_*` | Memoria para cada task (MB) | Varia | No |

## 📤 Outputs

Después del despliegue, puedes obtener información importante:

```bash
# URL del Load Balancer (punto de entrada)
terraform output alb_dns_name

# URLs de los repositorios ECR
terraform output ecr_backend_repository_url
terraform output ecr_frontend_repository_url
terraform output ecr_middleware_repository_url

# Endpoint de RDS
terraform output rds_endpoint

# Nombres de servicios ECS
terraform output ecs_cluster_name
terraform output ecs_backend_service_name
terraform output ecs_frontend_service_name
terraform output ecs_middleware_service_name
```

## 🔄 Mantenimiento y Operaciones

### Actualizar Imágenes Docker

1. Construir nueva imagen
2. Subir a ECR con nuevo tag
3. Actualizar `image_tag` en `terraform.tfvars`
4. Aplicar cambios: `terraform apply`

O forzar actualización de servicios:

```bash
aws ecs update-service --cluster inia-prod-cluster --service inia-prod-backend-service --force-new-deployment
```

### Escalar Servicios

Edita `terraform.tfvars`:

```hcl
desired_count_backend = 4
desired_count_frontend = 3
desired_count_middleware = 4
```

Luego: `terraform apply`

### Ver Logs

```bash
# Backend
aws logs tail /ecs/inia-prod-backend --follow

# Frontend
aws logs tail /ecs/inia-prod-frontend --follow

# Middleware
aws logs tail /ecs/inia-prod-middleware --follow
```

### Ver Estado de Servicios ECS

```bash
aws ecs list-services --cluster inia-prod-cluster
aws ecs describe-services --cluster inia-prod-cluster --services inia-prod-backend-service
```

### Health Checks

- **Frontend**: `http://<alb_dns>/health`
- **Backend**: `http://<alb_dns>/Inia/actuator/health`
- **Middleware**: `http://<alb_dns>/middleware/health`

## 🐛 Troubleshooting

### Problema: Tasks no inician

1. Verifica logs en CloudWatch
2. Verifica que las imágenes estén en ECR
3. Verifica Security Groups
4. Verifica que las subnets tengan NAT Gateway

### Problema: No puedo conectar a la base de datos

1. Verifica Security Group de RDS permite tráfico desde ECS
2. Verifica que RDS esté en subnets privadas
3. Verifica variables de entorno en Task Definition

### Problema: ALB devuelve 502

1. Verifica que los Target Groups tengan targets saludables
2. Verifica Security Groups entre ALB y ECS
3. Verifica health checks en Task Definitions

### Problema: Imágenes no se suben a ECR

1. Verifica autenticación: `aws ecr get-login-password`
2. Verifica permisos IAM
3. Verifica que los repositorios existan

## 💰 Estimación de Costos

**Recursos principales y costos aproximados (us-east-1):**

- **NAT Gateway**: ~$32/mes por gateway (2 gateways = ~$64/mes)
- **RDS db.t3.micro**: ~$15/mes
- **ECS Fargate**: 
  - Backend (2 tasks × 0.5 vCPU × 1GB): ~$30/mes
  - Frontend (2 tasks × 0.25 vCPU × 0.5GB): ~$15/mes
  - Middleware (2 tasks × 0.5 vCPU × 1GB): ~$30/mes
- **ALB**: ~$16/mes
- **ECR**: Gratis (primeros 500MB/mes)
- **CloudWatch Logs**: ~$5/mes

**Total estimado**: ~$175/mes

**💡 Recomendaciones para reducir costos:**
- Usar 1 NAT Gateway en desarrollo
- Reducir número de tasks en desarrollo
- Usar instancias más pequeñas en desarrollo

## 🔒 Seguridad

### Buenas Prácticas Implementadas

✅ Contenedores en subnets privadas (sin IPs públicas)
✅ Security Groups con reglas mínimas necesarias
✅ RDS en subnets privadas, solo accesible desde ECS
✅ Encriptación en repositorios ECR
✅ Encriptación en RDS
✅ IAM roles con permisos mínimos necesarios
✅ CloudWatch Logs para auditoría

### Mejoras Recomendadas

- [ ] Habilitar HTTPS en ALB con certificado ACM
- [ ] Usar AWS Secrets Manager para contraseñas
- [ ] Habilitar WAF en ALB
- [ ] Configurar VPC Flow Logs
- [ ] Habilitar GuardDuty
- [ ] Configurar backups automáticos adicionales

## 🗑️ Destruir la Infraestructura

**⚠️ ADVERTENCIA**: Esto eliminará TODOS los recursos, incluyendo la base de datos.

```bash
terraform destroy
```

**Nota**: RDS tiene `skip_final_snapshot = false`, por lo que se creará un snapshot final antes de eliminar.

## 📚 Recursos Adicionales

- [Documentación de Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Documentación de Amazon ECS](https://docs.aws.amazon.com/ecs/)
- [Documentación de Amazon RDS](https://docs.aws.amazon.com/rds/)
- [Documentación de Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/)

## 📝 Notas Importantes

1. **Primera ejecución**: La creación de RDS puede tardar 15-20 minutos
2. **NAT Gateways**: Son costosos, considera usar 1 en desarrollo
3. **Backups RDS**: Se crean automáticamente en la ventana configurada
4. **Imágenes Docker**: Debes construirlas y subirlas manualmente después de crear la infraestructura
5. **Variables sensibles**: Nunca subas `terraform.tfvars` con valores reales al repositorio

## 🤝 Soporte

Para problemas o preguntas sobre esta infraestructura, consulta:
- Logs de CloudWatch
- Documentación de AWS
- Estado de Terraform: `terraform show`

---

**Última actualización**: Enero 2025
**Versión de Terraform**: >= 1.0
**Versión de AWS Provider**: ~> 5.0


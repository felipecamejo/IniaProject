# Configuración de despliegue ECS - Proyecto INIA

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
db_password = "Inia2024SecurePass!" # ⚠️ CAMBIAR EN PRODUCCIÓN

# Application Configuration
jwt_secret = "inia-jwt-secret-key-2024-change-in-production" # ⚠️ CAMBIAR EN PRODUCCIÓN
image_tag = "latest"

# ECS Service Scaling (mínimo funcional: 1 task por servicio)
desired_count_backend = 1
desired_count_frontend = 1
desired_count_middleware = 1

# ECS Task Resources
cpu_backend = 512
memory_backend = 1024

cpu_frontend = 256
memory_frontend = 512

cpu_middleware = 512
memory_middleware = 1024

# Domain and SSL Configuration
# Nota: Si tienes un certificado SSL en ACM, actualiza el ARN aquí
domain_name = "zimmzimmgames.com"
ssl_certificate_arn = "" # ⚠️ Actualizar con el ARN del certificado ACM si existe
# Para obtener el ARN: aws acm list-certificates --region us-east-1 --query "CertificateSummaryList[?DomainName=='zimmzimmgames.com'].CertificateArn" --output text
create_route53_record = true
route53_zone_id = "" # Se creará automáticamente si está vacío, o usar el ID existente si ya tienes la zona

# IAM Roles (existing roles - NO se crearán nuevos roles)
# ⚠️ IMPORTANTE: Usar roles existentes que puedan ser asumidos por ecs-tasks.amazonaws.com
# 
# Usando LabRole que tiene permisos de ECR y otros servicios
# Si LabRole no puede ser asumido por ECS, necesitarás actualizar estos valores
# con nombres de roles existentes que tengan el trust relationship correcto
ecs_task_execution_role_name = "LabRole" # Rol existente con permisos de ECR
ecs_task_role_name = "LabRole" # Mismo rol para tasks (puede ser diferente si tienes otro)
rds_monitoring_role_name = "" # Dejar vacío para deshabilitar monitoring de RDS


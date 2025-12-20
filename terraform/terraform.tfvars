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

# RDS Protection and Backup
rds_deletion_protection = true  # Protección contra eliminación accidental
rds_backup_retention_period = 7  # Retención de backups por 7 días
rds_enable_multi_az = false  # Multi-AZ deshabilitado para reducir costos

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
# Usando DNS del ALB directamente (sin dominio personalizado)
domain_name = "" # Vacío para usar DNS del ALB directamente
ssl_certificate_arn = "" # Sin certificado SSL - usando HTTP solamente
# El ALB funcionará con HTTP solamente usando su DNS name
# Ejemplo: http://inia-prod-alb-1531354287.us-east-1.elb.amazonaws.com
create_route53_record = false # No crear registros DNS
route53_zone_id = "" # No aplica

# VPC Endpoints (Reduce costos eliminando NAT Gateway)
enable_vpc_endpoints = true  # Habilitar VPC endpoints
enable_s3_endpoint = true  # S3 Gateway Endpoint (sin costo)
enable_ecr_endpoints = true  # ECR Interface Endpoints (~$14/mes por 2 endpoints)
enable_logs_endpoint = true  # CloudWatch Logs Endpoint (~$7/mes)
enable_secretsmanager_endpoint = true  # Secrets Manager Endpoint (~$7/mes)
# Total VPC Endpoints: ~$28/mes, pero elimina NAT Gateway (~$32/mes)
# Ahorro neto: ~$4/mes + ahorro en transferencia de datos

# Auto Scaling Configuration
enable_autoscaling = true
# Backend Auto Scaling
backend_min_capacity = 1
backend_max_capacity = 5
backend_cpu_target = 70
backend_memory_target = 75
# Frontend Auto Scaling
frontend_min_capacity = 1
frontend_max_capacity = 3
frontend_cpu_target = 70
# Middleware Auto Scaling
middleware_min_capacity = 1
middleware_max_capacity = 5
middleware_cpu_target = 70
middleware_memory_target = 75

# IAM Roles Configuration
# Opcion 1: Crear roles nuevos con permisos minimos (RECOMENDADO)
create_iam_roles = false  # Cambiar a true para crear roles propios
# Si create_iam_roles = true, los siguientes valores se ignoran

# Opcion 2: Usar roles existentes (para entornos tipo AWS Academy)
# Solo se usa si create_iam_roles = false
ecs_task_execution_role_name = "LabRole"
ecs_task_role_name = "LabRole"

# RDS Monitoring Role (opcional)
rds_monitoring_role_name = ""  # Dejar vacío para deshabilitar monitoring

# CloudWatch Alarms
enable_cloudwatch_alarms = true
alarm_notification_email = ""  # Agregar email para recibir notificaciones de alarmas

# Middleware Configuration (ajustado para 512 CPU / 1GB RAM)
middleware_uvicorn_workers = "2"  # 2 workers para 512 CPU
middleware_max_concurrent_requests = "50"  # Reducido de 200
middleware_max_request_timeout = "300"  # 5 minutos
middleware_rate_limit_requests = "100"  # Reducido de 200
middleware_rate_limit_window = "60"
middleware_thread_pool_workers = "10"  # Reducido de 50
middleware_db_pool_size = "10"  # Reducido de 30
middleware_db_max_overflow = "20"  # Reducido de 50
middleware_log_level = "info"

# Deployment Circuit Breaker
enable_circuit_breaker = true  # Previene despliegues fallidos
enable_circuit_breaker_rollback = true  # Rollback automatico en caso de fallo

# CloudWatch Logs Retention
log_retention_days = 30  # 30 dias de retencion para auditorias y debugging


variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "inia"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# Database variables
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "Inia"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "postgres"
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

# Application variables
variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

variable "image_tag" {
  description = "Docker image tag"
  type        = string
  default     = "latest"
}

# ECS Service scaling
variable "desired_count_backend" {
  description = "Desired number of backend tasks"
  type        = number
  default     = 2
}

variable "desired_count_frontend" {
  description = "Desired number of frontend tasks"
  type        = number
  default     = 2
}

variable "desired_count_middleware" {
  description = "Desired number of middleware tasks"
  type        = number
  default     = 2
}

# ECS Task CPU and Memory
variable "cpu_backend" {
  description = "CPU units for backend task (1024 = 1 vCPU)"
  type        = number
  default     = 512
}

variable "memory_backend" {
  description = "Memory for backend task in MB"
  type        = number
  default     = 1024
}

variable "cpu_frontend" {
  description = "CPU units for frontend task (1024 = 1 vCPU)"
  type        = number
  default     = 256
}

variable "memory_frontend" {
  description = "Memory for frontend task in MB"
  type        = number
  default     = 512
}

variable "cpu_middleware" {
  description = "CPU units for middleware task (1024 = 1 vCPU)"
  type        = number
  default     = 512
}

variable "memory_middleware" {
  description = "Memory for middleware task in MB"
  type        = number
  default     = 1024
}

# Domain and SSL Configuration
variable "domain_name" {
  description = "Domain name for the application (e.g., zimmzimmgames.com)"
  type        = string
  default     = ""
}

variable "ssl_certificate_arn" {
  description = "ARN of existing SSL certificate in ACM (leave empty to create new certificate)"
  type        = string
  default     = ""
}

variable "create_acm_certificate" {
  description = "Whether to create a new ACM certificate (if ssl_certificate_arn is empty and domain_name is set)"
  type        = bool
  default     = false
}

variable "subject_alternative_names" {
  description = "Additional domain names for the certificate (e.g., www.example.com)"
  type        = list(string)
  default     = []
}

variable "create_route53_record" {
  description = "Whether to create Route53 record for the domain"
  type        = bool
  default     = false
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID (required if create_route53_record is true)"
  type        = string
  default     = ""
}

# IAM Roles Configuration
variable "create_iam_roles" {
  description = "Create new IAM roles with minimum permissions (recommended) or use existing roles"
  type        = bool
  default     = false
}

variable "ecs_task_execution_role_name" {
  description = "Name of existing IAM role for ECS task execution (only used if create_iam_roles is false)"
  type        = string
  default     = ""
}

variable "ecs_task_role_name" {
  description = "Name of existing IAM role for ECS tasks (only used if create_iam_roles is false)"
  type        = string
  default     = ""
}

variable "rds_monitoring_role_name" {
  description = "Name of existing IAM role for RDS enhanced monitoring (leave empty to disable monitoring)"
  type        = string
  default     = ""
}

variable "rds_deletion_protection" {
  description = "Enable deletion protection for RDS instance (recommended for production)"
  type        = bool
  default     = true
}

variable "rds_backup_retention_period" {
  description = "Number of days to retain RDS backups (1-35, recommended 7-30 for production)"
  type        = number
  default     = 7
}

variable "rds_enable_multi_az" {
  description = "Enable Multi-AZ deployment for RDS (increases cost but provides high availability)"
  type        = bool
  default     = false
}

# VPC Endpoints Configuration
variable "enable_vpc_endpoints" {
  description = "Enable VPC endpoints to eliminate NAT Gateway costs"
  type        = bool
  default     = true
}

variable "enable_s3_endpoint" {
  description = "Enable S3 VPC endpoint (Gateway - no cost)"
  type        = bool
  default     = true
}

variable "enable_ecr_endpoints" {
  description = "Enable ECR VPC endpoints (Interface - has cost ~$7/month per endpoint)"
  type        = bool
  default     = true
}

variable "enable_logs_endpoint" {
  description = "Enable CloudWatch Logs VPC endpoint (Interface - has cost)"
  type        = bool
  default     = true
}

variable "enable_secretsmanager_endpoint" {
  description = "Enable Secrets Manager VPC endpoint (Interface - has cost)"
  type        = bool
  default     = true
}

# Auto Scaling Configuration
variable "enable_autoscaling" {
  description = "Enable auto-scaling for ECS services"
  type        = bool
  default     = true
}

variable "backend_min_capacity" {
  description = "Minimum number of backend tasks for auto-scaling"
  type        = number
  default     = 1
}

variable "backend_max_capacity" {
  description = "Maximum number of backend tasks for auto-scaling"
  type        = number
  default     = 5
}

variable "backend_cpu_target" {
  description = "Target CPU utilization percentage for backend"
  type        = number
  default     = 70
}

variable "backend_memory_target" {
  description = "Target memory utilization percentage for backend"
  type        = number
  default     = 75
}

variable "frontend_min_capacity" {
  description = "Minimum number of frontend tasks for auto-scaling"
  type        = number
  default     = 1
}

variable "frontend_max_capacity" {
  description = "Maximum number of frontend tasks for auto-scaling"
  type        = number
  default     = 3
}

variable "frontend_cpu_target" {
  description = "Target CPU utilization percentage for frontend"
  type        = number
  default     = 70
}

variable "middleware_min_capacity" {
  description = "Minimum number of middleware tasks for auto-scaling"
  type        = number
  default     = 1
}

variable "middleware_max_capacity" {
  description = "Maximum number of middleware tasks for auto-scaling"
  type        = number
  default     = 5
}

variable "middleware_cpu_target" {
  description = "Target CPU utilization percentage for middleware"
  type        = number
  default     = 70
}

variable "middleware_memory_target" {
  description = "Target memory utilization percentage for middleware"
  type        = number
  default     = 75
}

# CloudWatch Alarms Configuration
variable "enable_cloudwatch_alarms" {
  description = "Enable CloudWatch alarms for monitoring"
  type        = bool
  default     = true
}

variable "alarm_notification_email" {
  description = "Email address to receive alarm notifications (leave empty to disable email notifications)"
  type        = string
  default     = ""
}

# Middleware Configuration
variable "middleware_uvicorn_workers" {
  description = "Number of Uvicorn workers for middleware (2-4 for 512 CPU, 4-8 for 1024 CPU)"
  type        = string
  default     = "2"
}

variable "middleware_max_concurrent_requests" {
  description = "Maximum concurrent requests for middleware"
  type        = string
  default     = "50"
}

variable "middleware_max_request_timeout" {
  description = "Maximum request timeout in seconds for middleware"
  type        = string
  default     = "300"
}

variable "middleware_rate_limit_requests" {
  description = "Rate limit requests per window for middleware"
  type        = string
  default     = "100"
}

variable "middleware_rate_limit_window" {
  description = "Rate limit window in seconds for middleware"
  type        = string
  default     = "60"
}

variable "middleware_thread_pool_workers" {
  description = "Number of thread pool workers for middleware (5-10 for 512 CPU, 10-20 for 1024 CPU)"
  type        = string
  default     = "10"
}

variable "middleware_db_pool_size" {
  description = "Database connection pool size for middleware (5-10 for 512 CPU, 10-20 for 1024 CPU)"
  type        = string
  default     = "10"
}

variable "middleware_db_max_overflow" {
  description = "Database connection pool max overflow for middleware"
  type        = string
  default     = "20"
}

variable "middleware_log_level" {
  description = "Log level for middleware (debug, info, warning, error)"
  type        = string
  default     = "info"
}

# Deployment Circuit Breaker Configuration
variable "enable_circuit_breaker" {
  description = "Enable deployment circuit breaker for ECS services (prevents failed deployments)"
  type        = bool
  default     = true
}

variable "enable_circuit_breaker_rollback" {
  description = "Enable automatic rollback when circuit breaker triggers"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "Number of days to retain CloudWatch logs (1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653)"
  type        = number
  default     = 30
}


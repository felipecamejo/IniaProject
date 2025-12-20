variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs"
  type        = list(string)
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs"
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "Security Group ID for ALB"
  type        = string
}

variable "ecs_security_group_id" {
  description = "Security Group ID for ECS"
  type        = string
}

variable "ecs_task_execution_role" {
  description = "ARN of the ECS task execution role"
  type        = string
}

variable "ecs_task_role" {
  description = "ARN of the ECS task role"
  type        = string
}

variable "backend_image_uri" {
  description = "Backend Docker image URI"
  type        = string
}

variable "frontend_image_uri" {
  description = "Frontend Docker image URI"
  type        = string
}

variable "middleware_image_uri" {
  description = "Middleware Docker image URI"
  type        = string
}

variable "db_endpoint" {
  description = "RDS database endpoint"
  type        = string
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "db_username" {
  description = "Database username"
  type        = string
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

variable "desired_count_backend" {
  description = "Desired number of backend tasks"
  type        = number
}

variable "desired_count_frontend" {
  description = "Desired number of frontend tasks"
  type        = number
}

variable "desired_count_middleware" {
  description = "Desired number of middleware tasks"
  type        = number
}

variable "cpu_backend" {
  description = "CPU units for backend task"
  type        = number
}

variable "memory_backend" {
  description = "Memory for backend task in MB"
  type        = number
}

variable "cpu_frontend" {
  description = "CPU units for frontend task"
  type        = number
}

variable "memory_frontend" {
  description = "Memory for frontend task in MB"
  type        = number
}

variable "cpu_middleware" {
  description = "CPU units for middleware task"
  type        = number
}

variable "memory_middleware" {
  description = "Memory for middleware task in MB"
  type        = number
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = ""
}

variable "ssl_certificate_arn" {
  description = "ARN of the SSL certificate in ACM"
  type        = string
  default     = ""
}

variable "create_route53_record" {
  description = "Whether to create Route53 record for the domain"
  type        = bool
  default     = false
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID"
  type        = string
  default     = ""
}

variable "cors_origins" {
  description = "Comma-separated list of CORS origins for middleware (defaults to production domain)"
  type        = string
  default     = ""
}

variable "db_password_secret_arn" {
  description = "ARN of the database password secret in Secrets Manager"
  type        = string
  sensitive   = true
}

variable "jwt_secret_arn" {
  description = "ARN of the JWT secret in Secrets Manager"
  type        = string
  sensitive   = true
}

# Middleware Configuration Variables
variable "middleware_uvicorn_workers" {
  description = "Number of Uvicorn workers for middleware"
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
  description = "Number of thread pool workers for middleware"
  type        = string
  default     = "10"
}

variable "middleware_db_pool_size" {
  description = "Database connection pool size for middleware"
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
  description = "Enable deployment circuit breaker for ECS services"
  type        = bool
  default     = true
}

variable "enable_circuit_breaker_rollback" {
  description = "Enable automatic rollback when circuit breaker triggers"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "Number of days to retain CloudWatch logs"
  type        = number
  default     = 30
}


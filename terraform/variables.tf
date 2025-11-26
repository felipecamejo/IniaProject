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
  description = "ARN of the SSL certificate in ACM (required if domain_name is set)"
  type        = string
  default     = ""
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

# IAM Roles (existing roles to use)
variable "ecs_task_execution_role_name" {
  description = "Name of existing IAM role for ECS task execution (must exist)"
  type        = string
}

variable "ecs_task_role_name" {
  description = "Name of existing IAM role for ECS tasks (must exist)"
  type        = string
}

variable "rds_monitoring_role_name" {
  description = "Name of existing IAM role for RDS enhanced monitoring (leave empty to disable monitoring)"
  type        = string
  default     = ""
}


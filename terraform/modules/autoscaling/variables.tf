variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "cluster_name" {
  description = "ECS cluster name"
  type        = string
}

variable "backend_service_name" {
  description = "Backend ECS service name"
  type        = string
}

variable "frontend_service_name" {
  description = "Frontend ECS service name"
  type        = string
}

variable "middleware_service_name" {
  description = "Middleware ECS service name"
  type        = string
}

variable "enable_autoscaling" {
  description = "Enable auto-scaling for ECS services"
  type        = bool
  default     = true
}

# Backend Auto Scaling Configuration
variable "backend_min_capacity" {
  description = "Minimum number of backend tasks"
  type        = number
  default     = 1
}

variable "backend_max_capacity" {
  description = "Maximum number of backend tasks"
  type        = number
  default     = 5
}

variable "backend_cpu_target" {
  description = "Target CPU utilization percentage for backend auto-scaling"
  type        = number
  default     = 70
}

variable "backend_memory_target" {
  description = "Target memory utilization percentage for backend auto-scaling"
  type        = number
  default     = 75
}

# Frontend Auto Scaling Configuration
variable "frontend_min_capacity" {
  description = "Minimum number of frontend tasks"
  type        = number
  default     = 1
}

variable "frontend_max_capacity" {
  description = "Maximum number of frontend tasks"
  type        = number
  default     = 3
}

variable "frontend_cpu_target" {
  description = "Target CPU utilization percentage for frontend auto-scaling"
  type        = number
  default     = 70
}

# Middleware Auto Scaling Configuration
variable "middleware_min_capacity" {
  description = "Minimum number of middleware tasks"
  type        = number
  default     = 1
}

variable "middleware_max_capacity" {
  description = "Maximum number of middleware tasks"
  type        = number
  default     = 5
}

variable "middleware_cpu_target" {
  description = "Target CPU utilization percentage for middleware auto-scaling"
  type        = number
  default     = 70
}

variable "middleware_memory_target" {
  description = "Target memory utilization percentage for middleware auto-scaling"
  type        = number
  default     = 75
}

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "account_id" {
  description = "AWS Account ID"
  type        = string
}

variable "ecs_task_execution_role_name" {
  description = "Name of existing IAM role for ECS task execution"
  type        = string
}

variable "ecs_task_role_name" {
  description = "Name of existing IAM role for ECS tasks"
  type        = string
}


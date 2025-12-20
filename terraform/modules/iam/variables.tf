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

variable "secrets_arns" {
  description = "List of Secrets Manager ARNs that ECS tasks need to access"
  type        = list(string)
  default     = []
}

variable "create_iam_roles" {
  description = "Whether to create new IAM roles (true) or use existing ones (false)"
  type        = bool
  default     = false
}


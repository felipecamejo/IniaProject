output "ecs_task_execution_role_arn" {
  description = "ARN of the ECS task execution role"
  value       = data.aws_iam_role.ecs_task_execution.arn
}

output "ecs_task_role_arn" {
  description = "ARN of the ECS task role"
  value       = data.aws_iam_role.ecs_task.arn
}


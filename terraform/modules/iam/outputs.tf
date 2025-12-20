output "ecs_task_execution_role_arn" {
  description = "ARN of the ECS task execution role"
  value       = var.create_iam_roles ? aws_iam_role.ecs_task_execution[0].arn : data.aws_iam_role.ecs_task_execution_existing[0].arn
}

output "ecs_task_role_arn" {
  description = "ARN of the ECS task role"
  value       = var.create_iam_roles ? aws_iam_role.ecs_task[0].arn : data.aws_iam_role.ecs_task_existing[0].arn
}

output "ecs_task_execution_role_name" {
  description = "Name of the ECS task execution role"
  value       = var.create_iam_roles ? aws_iam_role.ecs_task_execution[0].name : data.aws_iam_role.ecs_task_execution_existing[0].name
}

output "ecs_task_role_name" {
  description = "Name of the ECS task role"
  value       = var.create_iam_roles ? aws_iam_role.ecs_task[0].name : data.aws_iam_role.ecs_task_existing[0].name
}


# Data source to get existing ECS Task Execution Role
data "aws_iam_role" "ecs_task_execution" {
  name = var.ecs_task_execution_role_name
}

# Data source to get existing ECS Task Role
data "aws_iam_role" "ecs_task" {
  name = var.ecs_task_role_name
}


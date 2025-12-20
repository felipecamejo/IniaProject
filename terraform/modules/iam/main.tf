# Condicion: usar roles existentes o crear nuevos
data "aws_iam_role" "ecs_task_execution_existing" {
  count = var.create_iam_roles ? 0 : 1
  name  = var.ecs_task_execution_role_name
}

data "aws_iam_role" "ecs_task_existing" {
  count = var.create_iam_roles ? 0 : 1
  name  = var.ecs_task_role_name
}

# ECS Task Execution Role (nuevo)
resource "aws_iam_role" "ecs_task_execution" {
  count = var.create_iam_roles ? 1 : 0
  name  = "${var.project_name}-${var.environment}-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-task-execution-role"
  }
}

# Attach AWS managed policy for ECS Task Execution
resource "aws_iam_role_policy_attachment" "ecs_task_execution_policy" {
  count      = var.create_iam_roles ? 1 : 0
  role       = aws_iam_role.ecs_task_execution[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ECS Task Role (nuevo)
resource "aws_iam_role" "ecs_task" {
  count = var.create_iam_roles ? 1 : 0
  name  = "${var.project_name}-${var.environment}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-task-role"
  }
}

# Policy para acceso a ECR (solo si se crean roles)
resource "aws_iam_policy" "ecr_access" {
  count       = var.create_iam_roles ? 1 : 0
  name        = "${var.project_name}-${var.environment}-ecr-access"
  description = "Policy to allow ECS tasks to pull images from ECR"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecr_access" {
  count      = var.create_iam_roles ? 1 : 0
  role       = aws_iam_role.ecs_task_execution[0].name
  policy_arn = aws_iam_policy.ecr_access[0].arn
}

# IAM Policy for Secrets Manager access
resource "aws_iam_policy" "secrets_manager_access" {
  count       = length(var.secrets_arns) > 0 ? 1 : 0
  name        = "${var.project_name}-${var.environment}-secrets-manager-access"
  description = "Policy to allow ECS tasks to read secrets from Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = var.secrets_arns
      }
    ]
  })
}

# Attach policy to ECS Task Execution Role
resource "aws_iam_role_policy_attachment" "secrets_manager_access" {
  count      = length(var.secrets_arns) > 0 ? 1 : 0
  role       = var.create_iam_roles ? aws_iam_role.ecs_task_execution[0].name : data.aws_iam_role.ecs_task_execution_existing[0].name
  policy_arn = aws_iam_policy.secrets_manager_access[0].arn
}

# Policy para CloudWatch Logs (solo si se crean roles)
resource "aws_iam_policy" "cloudwatch_logs" {
  count       = var.create_iam_roles ? 1 : 0
  name        = "${var.project_name}-${var.environment}-cloudwatch-logs"
  description = "Policy to allow ECS tasks to write to CloudWatch Logs"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:${var.account_id}:log-group:/ecs/${var.project_name}-${var.environment}-*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "cloudwatch_logs" {
  count      = var.create_iam_roles ? 1 : 0
  role       = aws_iam_role.ecs_task_execution[0].name
  policy_arn = aws_iam_policy.cloudwatch_logs[0].arn
}


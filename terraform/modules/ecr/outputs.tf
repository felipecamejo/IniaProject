output "backend_repository_url" {
  description = "URL of the backend ECR repository"
  value       = aws_ecr_repository.backend.repository_url
}

output "frontend_repository_url" {
  description = "URL of the frontend ECR repository"
  value       = aws_ecr_repository.frontend.repository_url
}

output "middleware_repository_url" {
  description = "URL of the middleware ECR repository"
  value       = aws_ecr_repository.middleware.repository_url
}

output "backend_repository_arn" {
  description = "ARN of the backend ECR repository"
  value       = aws_ecr_repository.backend.arn
}

output "frontend_repository_arn" {
  description = "ARN of the frontend ECR repository"
  value       = aws_ecr_repository.frontend.arn
}

output "middleware_repository_arn" {
  description = "ARN of the middleware ECR repository"
  value       = aws_ecr_repository.middleware.arn
}


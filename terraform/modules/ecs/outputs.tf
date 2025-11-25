output "cluster_name" {
  description = "ECS Cluster name"
  value       = aws_ecs_cluster.main.name
}

output "cluster_id" {
  description = "ECS Cluster ID"
  value       = aws_ecs_cluster.main.id
}

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "Zone ID of the Application Load Balancer"
  value       = aws_lb.main.zone_id
}

output "alb_arn" {
  description = "ARN of the Application Load Balancer"
  value       = aws_lb.main.arn
}

output "backend_service_name" {
  description = "Backend ECS service name"
  value       = aws_ecs_service.backend.name
}

output "frontend_service_name" {
  description = "Frontend ECS service name"
  value       = aws_ecs_service.frontend.name
}

output "middleware_service_name" {
  description = "Middleware ECS service name"
  value       = aws_ecs_service.middleware.name
}

output "domain_name" {
  description = "Domain name configured for the ALB"
  value       = var.domain_name != "" ? var.domain_name : null
}

output "application_url" {
  description = "URL of the application"
  value       = var.domain_name != "" ? (var.ssl_certificate_arn != "" ? "https://${var.domain_name}" : "http://${var.domain_name}") : "http://${aws_lb.main.dns_name}"
}


output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.ecs.alb_dns_name
}

output "alb_zone_id" {
  description = "Zone ID of the Application Load Balancer"
  value       = module.ecs.alb_zone_id
}

output "ecr_backend_repository_url" {
  description = "ECR repository URL for backend"
  value       = module.ecr.backend_repository_url
}

output "ecr_frontend_repository_url" {
  description = "ECR repository URL for frontend"
  value       = module.ecr.frontend_repository_url
}

output "ecr_middleware_repository_url" {
  description = "ECR repository URL for middleware"
  value       = module.ecr.middleware_repository_url
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = module.rds.db_endpoint
  sensitive   = true
}

output "ecs_cluster_name" {
  description = "ECS Cluster name"
  value       = module.ecs.cluster_name
}

output "ecs_backend_service_name" {
  description = "ECS Backend service name"
  value       = module.ecs.backend_service_name
}

output "ecs_frontend_service_name" {
  description = "ECS Frontend service name"
  value       = module.ecs.frontend_service_name
}

output "ecs_middleware_service_name" {
  description = "ECS Middleware service name"
  value       = module.ecs.middleware_service_name
}

output "application_url" {
  description = "URL of the application"
  value       = module.ecs.application_url
}

output "domain_name" {
  description = "Domain name configured"
  value       = module.ecs.domain_name
}

output "route53_zone_id" {
  description = "Route53 hosted zone ID (created or existing)"
  value       = module.ecs.route53_zone_id
}

output "route53_name_servers" {
  description = "Route53 name servers for the hosted zone (if created). Update your domain registrar with these nameservers."
  value       = module.ecs.route53_name_servers
}


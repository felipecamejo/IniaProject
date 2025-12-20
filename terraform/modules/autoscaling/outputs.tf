output "backend_autoscaling_target_id" {
  description = "ID of the backend auto-scaling target"
  value       = var.enable_autoscaling ? aws_appautoscaling_target.backend[0].id : null
}

output "frontend_autoscaling_target_id" {
  description = "ID of the frontend auto-scaling target"
  value       = var.enable_autoscaling ? aws_appautoscaling_target.frontend[0].id : null
}

output "middleware_autoscaling_target_id" {
  description = "ID of the middleware auto-scaling target"
  value       = var.enable_autoscaling ? aws_appautoscaling_target.middleware[0].id : null
}

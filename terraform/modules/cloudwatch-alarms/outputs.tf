output "sns_topic_arn" {
  description = "ARN of the SNS topic for alarms"
  value       = var.enable_alarms && var.alarm_email != "" ? aws_sns_topic.alarms[0].arn : null
}

output "alarm_names" {
  description = "List of created alarm names"
  value = var.enable_alarms ? [
    aws_cloudwatch_metric_alarm.backend_cpu_high[0].alarm_name,
    aws_cloudwatch_metric_alarm.backend_memory_high[0].alarm_name,
    aws_cloudwatch_metric_alarm.middleware_cpu_high[0].alarm_name,
    aws_cloudwatch_metric_alarm.middleware_memory_high[0].alarm_name,
    aws_cloudwatch_metric_alarm.alb_5xx_errors[0].alarm_name,
    aws_cloudwatch_metric_alarm.alb_high_latency[0].alarm_name,
    aws_cloudwatch_metric_alarm.alb_unhealthy_targets[0].alarm_name,
    aws_cloudwatch_metric_alarm.rds_cpu_high[0].alarm_name,
    aws_cloudwatch_metric_alarm.rds_connections_high[0].alarm_name,
    aws_cloudwatch_metric_alarm.rds_storage_low[0].alarm_name,
    aws_cloudwatch_metric_alarm.rds_memory_low[0].alarm_name,
  ] : []
}

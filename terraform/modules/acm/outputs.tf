output "certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = var.domain_name != "" && var.create_certificate ? aws_acm_certificate.main[0].arn : ""
}

output "certificate_domain_validation_options" {
  description = "Domain validation options for manual DNS validation"
  value       = var.domain_name != "" && var.create_certificate ? aws_acm_certificate.main[0].domain_validation_options : []
}

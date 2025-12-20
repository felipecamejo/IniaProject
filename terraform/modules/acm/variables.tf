variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the SSL certificate (e.g., zimmzimmgames.com)"
  type        = string
  default     = ""
}

variable "subject_alternative_names" {
  description = "Additional domain names for the certificate (e.g., www.zimmzimmgames.com)"
  type        = list(string)
  default     = []
}

variable "create_certificate" {
  description = "Whether to create a new certificate in ACM"
  type        = bool
  default     = false
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID for DNS validation"
  type        = string
  default     = ""
}

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "IniaProject"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Data sources
# Limitar a 2 AZs para configuración mínima (reduce costos de NAT Gateway)
data "aws_availability_zones" "available" {
  state = "available"
  filter {
    name   = "region-name"
    values = [var.aws_region]
  }
}

data "aws_caller_identity" "current" {}

# Módulos
module "vpc" {
  source = "./modules/vpc"

  project_name     = var.project_name
  environment      = var.environment
  vpc_cidr         = var.vpc_cidr
  availability_zones = data.aws_availability_zones.available.names
}

module "vpc_endpoints" {
  source = "./modules/vpc-endpoints"

  project_name               = var.project_name
  environment                = var.environment
  vpc_id                     = module.vpc.vpc_id
  vpc_cidr                   = module.vpc.vpc_cidr
  private_subnet_ids         = module.vpc.private_subnet_ids
  private_route_table_ids    = module.vpc.private_route_table_ids
  aws_region                 = var.aws_region
  enable_s3_endpoint         = var.enable_s3_endpoint
  enable_ecr_endpoints       = var.enable_ecr_endpoints
  enable_logs_endpoint       = var.enable_logs_endpoint
  enable_secretsmanager_endpoint = var.enable_secretsmanager_endpoint
}

module "security_groups" {
  source = "./modules/security-groups"

  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id
}

module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
  environment  = var.environment
}

module "secrets" {
  source = "./modules/secrets"

  project_name = var.project_name
  environment  = var.environment
  db_password  = var.db_password
  jwt_secret   = var.jwt_secret
}

module "acm" {
  source = "./modules/acm"

  project_name              = var.project_name
  environment               = var.environment
  domain_name               = var.domain_name
  subject_alternative_names = var.subject_alternative_names
  create_certificate        = var.create_acm_certificate
  route53_zone_id           = var.route53_zone_id
}

module "iam" {
  source = "./modules/iam"

  project_name                = var.project_name
  environment                 = var.environment
  account_id                  = data.aws_caller_identity.current.account_id
  create_iam_roles            = var.create_iam_roles
  ecs_task_execution_role_name = var.ecs_task_execution_role_name
  ecs_task_role_name          = var.ecs_task_role_name
  secrets_arns                = [
    module.secrets.db_password_arn,
    module.secrets.jwt_secret_arn
  ]
}

module "rds" {
  source = "./modules/rds"

  project_name           = var.project_name
  environment            = var.environment
  vpc_id                 = module.vpc.vpc_id
  private_subnet_ids     = module.vpc.private_subnet_ids
  db_security_group_id   = module.security_groups.rds_security_group_id
  db_instance_class      = var.db_instance_class
  db_allocated_storage   = var.db_allocated_storage
  db_name                = var.db_name
  db_username              = var.db_username
  db_password              = var.db_password
  rds_monitoring_role_name = var.rds_monitoring_role_name
  deletion_protection      = var.rds_deletion_protection
  backup_retention_period  = var.rds_backup_retention_period
  enable_multi_az          = var.rds_enable_multi_az
}

module "ecs" {
  source = "./modules/ecs"

  project_name              = var.project_name
  environment              = var.environment
  vpc_id                   = module.vpc.vpc_id
  public_subnet_ids         = module.vpc.public_subnet_ids
  private_subnet_ids        = module.vpc.private_subnet_ids
  alb_security_group_id     = module.security_groups.alb_security_group_id
  ecs_security_group_id     = module.security_groups.ecs_security_group_id
  ecs_task_execution_role   = module.iam.ecs_task_execution_role_arn
  ecs_task_role            = module.iam.ecs_task_role_arn
  backend_image_uri         = "${module.ecr.backend_repository_url}:${var.image_tag}"
  frontend_image_uri        = "${module.ecr.frontend_repository_url}:${var.image_tag}"
  middleware_image_uri      = "${module.ecr.middleware_repository_url}:${var.image_tag}"
  db_endpoint               = module.rds.db_endpoint
  db_name                   = var.db_name
  db_username               = var.db_username
  db_password               = var.db_password
  jwt_secret                = var.jwt_secret
  desired_count_backend     = var.desired_count_backend
  desired_count_frontend    = var.desired_count_frontend
  desired_count_middleware  = var.desired_count_middleware
  cpu_backend               = var.cpu_backend
  memory_backend            = var.memory_backend
  cpu_frontend              = var.cpu_frontend
  memory_frontend           = var.memory_frontend
  cpu_middleware            = var.cpu_middleware
  memory_middleware         = var.memory_middleware
  domain_name               = var.domain_name
  ssl_certificate_arn       = var.ssl_certificate_arn != "" ? var.ssl_certificate_arn : module.acm.certificate_arn
  create_route53_record     = var.create_route53_record
  route53_zone_id                  = var.route53_zone_id
  db_password_secret_arn           = module.secrets.db_password_arn
  jwt_secret_arn                   = module.secrets.jwt_secret_arn
  middleware_uvicorn_workers       = var.middleware_uvicorn_workers
  middleware_max_concurrent_requests = var.middleware_max_concurrent_requests
  middleware_max_request_timeout   = var.middleware_max_request_timeout
  middleware_rate_limit_requests   = var.middleware_rate_limit_requests
  middleware_rate_limit_window     = var.middleware_rate_limit_window
  middleware_thread_pool_workers   = var.middleware_thread_pool_workers
  middleware_db_pool_size          = var.middleware_db_pool_size
  middleware_db_max_overflow       = var.middleware_db_max_overflow
  middleware_log_level             = var.middleware_log_level
  enable_circuit_breaker           = var.enable_circuit_breaker
  enable_circuit_breaker_rollback  = var.enable_circuit_breaker_rollback
  log_retention_days               = var.log_retention_days
}

module "autoscaling" {
  source = "./modules/autoscaling"

  project_name             = var.project_name
  environment              = var.environment
  cluster_name             = module.ecs.cluster_name
  backend_service_name     = module.ecs.backend_service_name
  frontend_service_name    = module.ecs.frontend_service_name
  middleware_service_name  = module.ecs.middleware_service_name
  enable_autoscaling       = var.enable_autoscaling
  backend_min_capacity     = var.backend_min_capacity
  backend_max_capacity     = var.backend_max_capacity
  backend_cpu_target       = var.backend_cpu_target
  backend_memory_target    = var.backend_memory_target
  frontend_min_capacity    = var.frontend_min_capacity
  frontend_max_capacity    = var.frontend_max_capacity
  frontend_cpu_target      = var.frontend_cpu_target
  middleware_min_capacity  = var.middleware_min_capacity
  middleware_max_capacity  = var.middleware_max_capacity
  middleware_cpu_target    = var.middleware_cpu_target
  middleware_memory_target = var.middleware_memory_target

  depends_on = [module.ecs]
}

module "cloudwatch_alarms" {
  source = "./modules/cloudwatch-alarms"

  project_name                    = var.project_name
  environment                     = var.environment
  enable_alarms                   = var.enable_cloudwatch_alarms
  alarm_email                     = var.alarm_notification_email
  cluster_name                    = module.ecs.cluster_name
  backend_service_name            = module.ecs.backend_service_name
  middleware_service_name         = module.ecs.middleware_service_name
  alb_arn_suffix                  = module.ecs.alb_arn_suffix
  backend_target_group_arn_suffix = module.ecs.backend_target_group_arn_suffix
  db_instance_identifier          = module.rds.db_instance_identifier

  depends_on = [module.ecs, module.rds]
}


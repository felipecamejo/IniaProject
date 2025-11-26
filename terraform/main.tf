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

module "iam" {
  source = "./modules/iam"

  project_name                = var.project_name
  environment                 = var.environment
  account_id                  = data.aws_caller_identity.current.account_id
  ecs_task_execution_role_name = var.ecs_task_execution_role_name
  ecs_task_role_name          = var.ecs_task_role_name
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
  db_username            = var.db_username
  db_password            = var.db_password
  rds_monitoring_role_name = var.rds_monitoring_role_name
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
  ssl_certificate_arn       = var.ssl_certificate_arn
  create_route53_record     = var.create_route53_record
  route53_zone_id           = var.route53_zone_id
}


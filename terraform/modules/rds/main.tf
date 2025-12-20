# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.project_name}-${var.environment}-db-subnet-group"
  }
}

# RDS Parameter Group (configuración mínima - usar default si no se necesitan parámetros personalizados)
# Comentado para usar el parameter group por defecto y reducir complejidad
# resource "aws_db_parameter_group" "main" {
#   name   = "${var.project_name}-${var.environment}-postgres-params"
#   family = "postgres15"
# 
#   tags = {
#     Name = "${var.project_name}-${var.environment}-postgres-params"
#   }
# }

# RDS Instance
resource "aws_db_instance" "main" {
  identifier             = "${var.project_name}-${var.environment}-db"
  engine                 = "postgres"
  engine_version         = "15.15"
  instance_class         = var.db_instance_class
  allocated_storage      = var.db_allocated_storage
  max_allocated_storage  = var.db_allocated_storage * 2
  storage_type           = "gp2"  # gp3 puede no estar disponible en todas las instancias
  storage_encrypted      = true
  publicly_accessible    = false  # Importante para seguridad
  multi_az               = var.enable_multi_az

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.db_security_group_id]
  # Usar parameter group por defecto para configuración mínima
  # parameter_group_name   = aws_db_parameter_group.main.name

  # Backup configuration
  backup_retention_period = var.backup_retention_period
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"

  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.project_name}-${var.environment}-db-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"
  deletion_protection       = var.deletion_protection

  # CloudWatch logs deshabilitados para configuración mínima (reduce costos)
  # enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  # Performance Insights deshabilitado para db.t3.micro (no disponible en instancias pequeñas)
  performance_insights_enabled    = false
  
  # Monitoring solo si hay rol configurado, de lo contrario usar 0 para deshabilitar
  monitoring_interval = var.rds_monitoring_role_name != "" ? 60 : 0
  monitoring_role_arn = var.rds_monitoring_role_name != "" ? data.aws_iam_role.rds_enhanced_monitoring[0].arn : null

  tags = {
    Name = "${var.project_name}-${var.environment}-db"
  }
}

# Data source to get existing RDS Enhanced Monitoring Role (optional)
data "aws_iam_role" "rds_enhanced_monitoring" {
  count = var.rds_monitoring_role_name != "" ? 1 : 0
  name  = var.rds_monitoring_role_name
}


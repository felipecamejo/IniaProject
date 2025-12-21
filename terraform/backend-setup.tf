# Recursos para configurar el backend remoto de Terraform
# Este archivo crea el bucket S3 y la tabla DynamoDB necesarios para el backend remoto
# 
# INSTRUCCIONES:
# 1. Ejecutar: terraform apply -target=aws_s3_bucket.terraform_state -target=aws_dynamodb_table.terraform_locks
# 2. Descomentar el bloque backend en backend.tf
# 3. Ejecutar: terraform init -migrate-state
# 4. Comentar o eliminar este archivo (ya no sera necesario)

# S3 Bucket para almacenar el estado de Terraform
resource "aws_s3_bucket" "terraform_state" {
  bucket = "${var.project_name}-terraform-state"

  # Prevenir eliminacion accidental del bucket
  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name        = "${var.project_name}-terraform-state"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Purpose     = "Terraform State Storage"
  }
}

# Habilitar versionamiento en el bucket
resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Habilitar cifrado del bucket
resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Bloquear acceso publico al bucket
resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Politica de ciclo de vida para versiones antiguas
resource "aws_s3_bucket_lifecycle_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    id     = "delete-old-versions"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }

  rule {
    id     = "abort-incomplete-uploads"
    status = "Enabled"

    filter {}

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

# Tabla DynamoDB para lock de estado
resource "aws_dynamodb_table" "terraform_locks" {
  name           = "${var.project_name}-terraform-locks"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  # Prevenir eliminacion accidental de la tabla
  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name        = "${var.project_name}-terraform-locks"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Purpose     = "Terraform State Locking"
  }
}

# Outputs para confirmar la creacion
output "terraform_state_bucket" {
  description = "Nombre del bucket S3 para el estado de Terraform"
  value       = aws_s3_bucket.terraform_state.id
}

output "terraform_locks_table" {
  description = "Nombre de la tabla DynamoDB para locks de Terraform"
  value       = aws_dynamodb_table.terraform_locks.id
}

output "backend_config" {
  description = "Configuracion del backend para copiar en backend.tf"
  value = <<-EOT
    terraform {
      backend "s3" {
        bucket         = "${aws_s3_bucket.terraform_state.id}"
        key            = "${var.environment}/terraform.tfstate"
        region         = "${var.aws_region}"
        dynamodb_table = "${aws_dynamodb_table.terraform_locks.id}"
        encrypt        = true
      }
    }
  EOT
}

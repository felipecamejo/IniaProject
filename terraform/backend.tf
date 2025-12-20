# Backend remoto de Terraform con S3 y DynamoDB
# Para habilitar el backend remoto:
# 1. Crear el bucket S3 y la tabla DynamoDB (ver backend-setup.tf)
# 2. Descomentar el bloque backend "s3" a continuacion
# 3. Ejecutar: terraform init -migrate-state

# terraform {
#   backend "s3" {
#     bucket         = "inia-terraform-state"
#     key            = "prod/terraform.tfstate"
#     region         = "us-east-1"
#     dynamodb_table = "inia-terraform-locks"
#     encrypt        = true
#   }
# }

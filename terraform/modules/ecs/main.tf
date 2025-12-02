# Local values for URL construction
locals {
  # Determine the hostname (domain or ALB DNS)
  hostname = var.domain_name != "" ? var.domain_name : aws_lb.main.dns_name
  
  # Determine the protocol (HTTPS if SSL cert exists, otherwise HTTP)
  protocol = var.ssl_certificate_arn != "" ? "https" : "http"
  
  # Construct base URLs
  backend_base_url    = "${local.protocol}://${local.hostname}/Inia"
  middleware_base_url = "${local.protocol}://${local.hostname}/middleware"
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.project_name}-${var.environment}-backend"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-backend-logs"
  }
}

resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/ecs/${var.project_name}-${var.environment}-frontend"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-frontend-logs"
  }
}

resource "aws_cloudwatch_log_group" "middleware" {
  name              = "/ecs/${var.project_name}-${var.environment}-middleware"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-middleware-logs"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-${var.environment}-cluster"

  # Container Insights deshabilitado para configuración mínima (reduce costos)
  # setting {
  #   name  = "containerInsights"
  #   value = "enabled"
  # }

  tags = {
    Name = "${var.project_name}-${var.environment}-cluster"
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = false
  enable_http2              = true
  enable_cross_zone_load_balancing = true

  tags = {
    Name = "${var.project_name}-${var.environment}-alb"
  }
}

# Target Group for Backend
resource "aws_lb_target_group" "backend" {
  name        = "${var.project_name}-${var.environment}-backend-tg"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/Inia/actuator/health"
    matcher             = "200"
    protocol            = "HTTP"
  }

  deregistration_delay = 30

  tags = {
    Name = "${var.project_name}-${var.environment}-backend-tg"
  }
}

# Target Group for Middleware
resource "aws_lb_target_group" "middleware" {
  name        = "${var.project_name}-${var.environment}-middleware-tg"
  port        = 9099
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/middleware/health"
    matcher             = "200"
    protocol            = "HTTP"
  }

  deregistration_delay = 30

  tags = {
    Name = "${var.project_name}-${var.environment}-middleware-tg"
  }
}

# Target Group for Frontend
resource "aws_lb_target_group" "frontend" {
  name        = "${var.project_name}-${var.environment}-frontend-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
    protocol            = "HTTP"
  }

  deregistration_delay = 30

  tags = {
    Name = "${var.project_name}-${var.environment}-frontend-tg"
  }
}

# ALB Listener HTTP - Redirect to HTTPS (only if SSL is configured)
resource "aws_lb_listener" "http_redirect" {
  count             = var.ssl_certificate_arn != "" ? 1 : 0
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# ALB Listener HTTP - Forward to frontend (only if SSL is NOT configured)
resource "aws_lb_listener" "http_forward" {
  count             = var.ssl_certificate_arn == "" ? 1 : 0
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

# ALB Listener HTTPS (only created if SSL certificate is provided)
resource "aws_lb_listener" "https" {
  count             = var.ssl_certificate_arn != "" ? 1 : 0
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn  = var.ssl_certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

# ALB Listener Rule for Swagger (HTTPS if SSL, otherwise HTTP)
# Prioridad 90 - Mayor prioridad para rutas específicas de Swagger
resource "aws_lb_listener_rule" "swagger" {
  listener_arn = var.ssl_certificate_arn != "" ? aws_lb_listener.https[0].arn : aws_lb_listener.http_forward[0].arn
  priority     = 90

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/Inia/swagger*", "/Inia/swagger/*", "/Inia/v3/api-docs*", "/Inia/v3/api-docs/*", "/Inia/swagger-resources*"]
    }
  }
}

# ALB Listener Rule for Backend (HTTPS if SSL, otherwise HTTP)
# Prioridad 100 - Rutas generales del backend
resource "aws_lb_listener_rule" "backend" {
  listener_arn = var.ssl_certificate_arn != "" ? aws_lb_listener.https[0].arn : aws_lb_listener.http_forward[0].arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/Inia/*"]
    }
  }
}

# ALB Listener Rule for Health Check (HTTPS if SSL, otherwise HTTP)
# Prioridad 110 - Health check específico del backend
resource "aws_lb_listener_rule" "backend_health" {
  listener_arn = var.ssl_certificate_arn != "" ? aws_lb_listener.https[0].arn : aws_lb_listener.http_forward[0].arn
  priority     = 110

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/Inia/actuator/health*"]
    }
  }
}

# ALB Listener Rule for Middleware (HTTPS if SSL, otherwise HTTP)
# Prioridad 200 - Rutas del middleware
resource "aws_lb_listener_rule" "middleware" {
  listener_arn = var.ssl_certificate_arn != "" ? aws_lb_listener.https[0].arn : aws_lb_listener.http_forward[0].arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.middleware.arn
  }

  condition {
    path_pattern {
      values = ["/middleware/*"]
    }
  }
}

# Route53 Hosted Zone (created if route53_zone_id is empty and create_route53_record is true)
resource "aws_route53_zone" "main" {
  count = var.create_route53_record && var.domain_name != "" && var.route53_zone_id == "" ? 1 : 0
  name  = var.domain_name

  tags = {
    Name = "${var.project_name}-${var.environment}-route53-zone"
  }
}

# Data source to get existing Route53 zone if zone_id is provided
data "aws_route53_zone" "existing" {
  count   = var.create_route53_record && var.domain_name != "" && var.route53_zone_id != "" ? 1 : 0
  zone_id = var.route53_zone_id
}

# Route53 Record (optional, only if create_route53_record is true)
resource "aws_route53_record" "main" {
  count   = var.create_route53_record && var.domain_name != "" ? 1 : 0
  zone_id = var.route53_zone_id != "" ? var.route53_zone_id : aws_route53_zone.main[0].zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}

# ECS Task Definition - Backend
resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_name}-${var.environment}-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu_backend
  memory                   = var.memory_backend
  execution_role_arn       = var.ecs_task_execution_role
  task_role_arn            = var.ecs_task_role

  container_definitions = jsonencode([{
    name  = "backend"
    image = var.backend_image_uri

    portMappings = [{
      containerPort = 8080
      protocol      = "tcp"
    }]

    environment = [
      {
        name  = "SPRING_DATASOURCE_URL"
        value = "jdbc:postgresql://${var.db_endpoint}/${var.db_name}"
      },
      {
        name  = "DB_USER"
        value = var.db_username
      },
      {
        name  = "DB_PASS"
        value = var.db_password
      },
      {
        name  = "JWT_SECRET"
        value = var.jwt_secret
      },
      {
        name  = "JWT_EXPIRATION"
        value = "86400000"
      },
      {
        name  = "SPRING_PROFILES_ACTIVE"
        value = "prod"
      },
      {
        name  = "SERVER_PORT"
        value = "8080"
      },
      {
        name  = "PYTHON_MIDDLEWARE_BASE_URL"
        value = local.middleware_base_url
      }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.backend.name
        "awslogs-region"        = data.aws_region.current.name
        "awslogs-stream-prefix" = "ecs"
      }
    }

    healthCheck = {
      command     = ["CMD-SHELL", "curl -f http://localhost:8080/actuator/health || exit 1"]
      interval    = 30
      timeout     = 5
      retries     = 3
      startPeriod = 60
    }
  }])

  tags = {
    Name = "${var.project_name}-${var.environment}-backend-task"
  }
}

# ECS Task Definition - Frontend
resource "aws_ecs_task_definition" "frontend" {
  family                   = "${var.project_name}-${var.environment}-frontend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu_frontend
  memory                   = var.memory_frontend
  execution_role_arn       = var.ecs_task_execution_role
  task_role_arn            = var.ecs_task_role

  container_definitions = jsonencode([{
    name  = "frontend"
    image = var.frontend_image_uri

    portMappings = [{
      containerPort = 80
      protocol      = "tcp"
    }]

    environment = [
      {
        name  = "USE_ECS_NGINX"
        value = "true"
      },
      {
        name  = "BACKEND_URL"
        value = local.backend_base_url
      },
      {
        name  = "MIDDLEWARE_URL"
        value = local.middleware_base_url
      }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.frontend.name
        "awslogs-region"        = data.aws_region.current.name
        "awslogs-stream-prefix" = "ecs"
      }
    }

    healthCheck = {
      command     = ["CMD-SHELL", "wget --quiet --tries=1 --spider http://localhost/health || exit 1"]
      interval    = 30
      timeout     = 5
      retries     = 3
      startPeriod = 30
    }
  }])

  tags = {
    Name = "${var.project_name}-${var.environment}-frontend-task"
  }
}

# ECS Task Definition - Middleware
resource "aws_ecs_task_definition" "middleware" {
  family                   = "${var.project_name}-${var.environment}-middleware"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu_middleware
  memory                   = var.memory_middleware
  execution_role_arn       = var.ecs_task_execution_role
  task_role_arn            = var.ecs_task_role

  container_definitions = jsonencode([{
    name  = "middleware"
    image = var.middleware_image_uri

    portMappings = [{
      containerPort = 9099
      protocol      = "tcp"
    }]

    environment = [
      {
        name  = "DB_USER"
        value = var.db_username
      },
      {
        name  = "DB_PASSWORD"
        value = var.db_password
      },
      {
        name  = "DB_HOST"
        value = split(":", var.db_endpoint)[0]
      },
      {
        name  = "DB_PORT"
        value = "5432"
      },
      {
        name  = "DB_NAME"
        value = var.db_name
      },
      {
        name  = "DATABASE_URL"
        value = "postgresql://${var.db_username}:${var.db_password}@${split(":", var.db_endpoint)[0]}:5432/${var.db_name}"
      },
      {
        name  = "PYTHONPATH"
        value = "/app"
      },
      {
        name  = "PYTHONUNBUFFERED"
        value = "1"
      },
      {
        name  = "UVICORN_WORKERS"
        value = "8"
      },
      {
        name  = "MAX_CONCURRENT_REQUESTS"
        value = "200"
      },
      {
        name  = "MAX_REQUEST_TIMEOUT"
        value = "600"
      },
      {
        name  = "RATE_LIMIT_REQUESTS"
        value = "200"
      },
      {
        name  = "RATE_LIMIT_WINDOW"
        value = "60"
      },
      {
        name  = "THREAD_POOL_WORKERS"
        value = "50"
      },
      {
        name  = "DB_POOL_SIZE"
        value = "30"
      },
      {
        name  = "DB_MAX_OVERFLOW"
        value = "50"
      },
      {
        name  = "DB_POOL_RECYCLE"
        value = "3600"
      },
      {
        name  = "PY_MIDDLEWARE_PORT"
        value = "9099"
      },
      {
        name  = "LOG_LEVEL"
        value = "info"
      },
      {
        name  = "CORS_ORIGINS"
        value = var.cors_origins != "" ? var.cors_origins : "https://zimmzimmgames.com,https://www.zimmzimmgames.com"
      }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.middleware.name
        "awslogs-region"        = data.aws_region.current.name
        "awslogs-stream-prefix" = "ecs"
      }
    }

    healthCheck = {
      command     = ["CMD-SHELL", "python -c 'import requests; r=requests.get(\"http://localhost:9099/health\", timeout=2); exit(0 if r.status_code==200 else 1)' || exit 1"]
      interval    = 30
      timeout     = 5
      retries     = 3
      startPeriod = 60
    }
  }])

  tags = {
    Name = "${var.project_name}-${var.environment}-middleware-task"
  }
}

# Data source for current region
data "aws_region" "current" {}

# ECS Service - Backend
resource "aws_ecs_service" "backend" {
  name            = "${var.project_name}-${var.environment}-backend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = var.desired_count_backend
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend.arn
    container_name   = "backend"
    container_port   = 8080
  }

  depends_on = [
    aws_lb_listener_rule.swagger,
    aws_lb_listener_rule.backend,
    aws_lb_listener_rule.backend_health,
    aws_lb_listener.http_redirect,
    aws_lb_listener.http_forward,
    aws_lb_listener.https
  ]

  tags = {
    Name = "${var.project_name}-${var.environment}-backend-service"
  }
}

# ECS Service - Frontend
resource "aws_ecs_service" "frontend" {
  name            = "${var.project_name}-${var.environment}-frontend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = var.desired_count_frontend
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip  = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend"
    container_port   = 80
  }

  depends_on = [
    aws_lb_listener.http_redirect,
    aws_lb_listener.http_forward,
    aws_lb_listener.https
  ]

  tags = {
    Name = "${var.project_name}-${var.environment}-frontend-service"
  }
}

# ECS Service - Middleware
resource "aws_ecs_service" "middleware" {
  name            = "${var.project_name}-${var.environment}-middleware-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.middleware.arn
  desired_count   = var.desired_count_middleware
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.middleware.arn
    container_name   = "middleware"
    container_port   = 9099
  }

  depends_on = [
    aws_lb_listener_rule.middleware,
    aws_lb_listener.http_redirect,
    aws_lb_listener.http_forward,
    aws_lb_listener.https
  ]

  tags = {
    Name = "${var.project_name}-${var.environment}-middleware-service"
  }
}


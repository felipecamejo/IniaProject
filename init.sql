-- Script de inicialización de la base de datos PostgreSQL para INIA
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor de la base de datos

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Configurar encoding y locale
SET client_encoding = 'UTF8';
SET default_text_search_config = 'pg_catalog.spanish';

-- Crear esquema si no existe
CREATE SCHEMA IF NOT EXISTS inia;

-- Configurar contraseña del usuario postgres para el middleware
-- El usuario postgres ya existe por defecto en PostgreSQL
ALTER USER postgres WITH PASSWORD '897888fg2';

-- Configurar permisos para inia_user
GRANT ALL PRIVILEGES ON DATABASE "Inia" TO inia_user;
GRANT ALL PRIVILEGES ON SCHEMA inia TO inia_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA inia TO inia_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA inia TO inia_user;

-- Configurar permisos para postgres (usado por el middleware)
GRANT ALL PRIVILEGES ON DATABASE "Inia" TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA inia TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA inia TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA inia TO postgres;

-- Configurar secuencias por defecto
ALTER DEFAULT PRIVILEGES IN SCHEMA inia GRANT ALL ON TABLES TO inia_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA inia GRANT ALL ON SEQUENCES TO inia_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA inia GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA inia GRANT ALL ON SEQUENCES TO postgres;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Base de datos INIA inicializada correctamente';
END $$;

# Documentación del Sistema INIA - Análisis de Semillas

## Tabla de Contenidos
1. [Propósito del Proyecto](#propósito-del-proyecto)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Casos de Uso](#casos-de-uso)
4. [Solución al Problema de la Cliente](#solución-al-problema-de-la-cliente)
5. [Funcionalidades del Sistema](#funcionalidades-del-sistema)
6. [Tecnologías Utilizadas](#tecnologías-utilizadas)
7. [Estructura del Proyecto](#estructura-del-proyecto)
8. [Configuración y Despliegue](#configuración-y-despliegue)

---

## Propósito del Proyecto

El **Sistema INIA** es una aplicación web integral diseñada para la gestión y análisis de semillas en laboratorios especializados. El proyecto surge de la necesidad de digitalizar y automatizar los procesos de análisis de calidad de semillas que tradicionalmente se realizaban de forma manual.

### Objetivos Principales:
- **Digitalización de procesos**: Transformar los análisis manuales de semillas en procesos digitales automatizados
- **Gestión integral**: Centralizar la administración de lotes, recibos y análisis de semillas
- **Trazabilidad completa**: Mantener un registro detallado de todo el proceso de análisis
- **Estandarización**: Aplicar protocolos internacionales (ISTA) en los análisis
- **Colaboración**: Permitir el trabajo colaborativo entre diferentes roles de usuarios
- **Reportes y exportación**: Generar reportes y exportar datos para análisis posteriores

---

## Arquitectura del Sistema

El sistema está construido con una arquitectura de tres capas que garantiza escalabilidad, mantenibilidad y separación de responsabilidades:

### 1. Frontend (Angular)
- **Tecnología**: Angular 20.3.1 con TypeScript
- **UI Framework**: PrimeNG para componentes de interfaz
- **Estilos**: PrimeFlex para layout responsivo
- **Puerto**: 4200 (desarrollo)

### 2. Backend (Spring Boot)
- **Tecnología**: Spring Boot 3.4.4 con Java 21
- **Base de datos**: PostgreSQL
- **Seguridad**: JWT (JSON Web Tokens) con Spring Security
- **API**: RESTful con documentación Swagger
- **Puerto**: 8080

### 3. Middleware (Python)
- **Tecnología**: FastAPI con Python
- **Funcionalidad**: Inserción masiva, exportación/importación de datos
- **ORM**: SQLAlchemy
- **Puerto**: 9099

### Diagrama de Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Middleware    │
│   (Angular)     │◄──►│  (Spring Boot)  │◄──►│   (FastAPI)     │
│   Puerto: 4200  │    │   Puerto: 8080  │    │   Puerto: 9099  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Navegador     │    │   PostgreSQL    │    │   Archivos      │
│   Web           │    │   Base de Datos │    │   Excel/CSV     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Casos de Uso

### 1. Gestión de Usuarios
**Actor**: Administrador del sistema
**Descripción**: Crear, editar, eliminar y gestionar usuarios del sistema con diferentes roles
**Flujo**:
1. El administrador accede al módulo de usuarios
2. Puede crear nuevos usuarios asignando roles (ADMIN, ANALISTA, OBSERVADOR)
3. Editar información de usuarios existentes
4. Activar/desactivar usuarios
5. Gestionar permisos y accesos

### 2. Gestión de Lotes
**Actor**: Analista/Administrador
**Descripción**: Crear y gestionar lotes de semillas para análisis
**Flujo**:
1. Crear un nuevo lote con información básica
2. Asignar usuarios responsables del lote
3. Definir fechas de inicio y finalización
4. Gestionar el estado del lote (activo/inactivo)

### 3. Proceso de Recibo de Muestras
**Actor**: Analista
**Descripción**: Registrar la recepción de muestras de semillas para análisis
**Flujo**:
1. Crear un recibo asociado a un lote
2. Registrar información de la muestra (especie, cultivar, origen, etc.)
3. Especificar los análisis solicitados
4. Definir el estado del recibo (Recibido, En análisis, Completado)

### 4. Análisis de Semillas
**Actor**: Analista
**Descripción**: Realizar diferentes tipos de análisis de calidad de semillas

#### 4.1 Análisis PMS (Peso de Mil Semillas)
- Medir el peso de mil semillas
- Calcular humedad porcentual
- Aplicar métodos estándar (ISTA)

#### 4.2 Análisis DOSN (Determinación de Otras Semillas por Número)
- Contar semillas de otras especies
- Identificar malezas con tolerancia cero
- Determinar presencia de Brassica y Cuscuta

#### 4.3 Análisis de Pureza
- Separar semilla pura de material inerte
- Identificar otros cultivos y malezas
- Calcular porcentajes de pureza

#### 4.4 Análisis de Germinación
- Realizar pruebas de germinación en condiciones controladas
- Registrar conteos en diferentes fechas
- Calcular porcentajes de germinación normal y anormal

#### 4.5 Análisis Sanitario
- Detectar presencia de hongos patógenos
- Identificar tipos de hongos presentes
- Evaluar estado sanitario de las semillas

#### 4.6 Análisis de Tetrazolio
- Evaluar viabilidad de semillas mediante tinción
- Determinar vigor y daños mecánicos
- Calcular porcentajes de viabilidad

### 5. Gestión de Catálogos
**Actor**: Administrador/Analista
**Descripción**: Mantener catálogos de referencia para los análisis
**Elementos**:
- Hongos patógenos
- Malezas
- Cultivos
- Depósitos
- Métodos de análisis

### 6. Reportes y Exportación
**Actor**: Analista/Administrador
**Descripción**: Generar reportes y exportar datos para análisis externos
**Funcionalidades**:
- Exportar datos a Excel/CSV
- Generar reportes por lote o recibo
- Inserción masiva de datos de prueba

---

## Solución al Problema de la Cliente

### Problema Identificado
La cliente (INIA) enfrentaba los siguientes desafíos en su proceso de análisis de semillas:

1. **Procesos manuales**: Los análisis se realizaban en papel, generando pérdida de información y errores
2. **Falta de trazabilidad**: No había un sistema centralizado para rastrear el estado de los análisis
3. **Gestión ineficiente**: Dificultad para coordinar múltiples análisis simultáneos
4. **Reportes limitados**: Generación manual de reportes consumía tiempo valioso
5. **Colaboración limitada**: Dificultad para compartir información entre analistas
6. **Cumplimiento normativo**: Necesidad de aplicar estándares internacionales (ISTA)

### Solución Implementada

#### 1. Digitalización Completa
- **Sistema web integrado**: Reemplaza completamente los procesos en papel
- **Formularios digitales**: Captura estructurada de todos los datos de análisis
- **Validaciones automáticas**: Previene errores de entrada de datos

#### 2. Trazabilidad Total
- **Flujo de trabajo definido**: Lote → Recibo → Análisis → Reportes
- **Estados de proceso**: Seguimiento en tiempo real del progreso
- **Historial completo**: Registro de todas las modificaciones y acciones

#### 3. Gestión Eficiente
- **Interfaz intuitiva**: Diseño centrado en el usuario para facilitar el trabajo diario
- **Navegación contextual**: Acceso rápido a análisis relacionados
- **Búsquedas avanzadas**: Localización rápida de información específica

#### 4. Reportes Automatizados
- **Exportación flexible**: Múltiples formatos (Excel, CSV)
- **Inserción masiva**: Carga de datos de prueba para validación
- **Middleware especializado**: Herramientas Python para operaciones complejas

#### 5. Colaboración Mejorada
- **Roles diferenciados**: ADMIN, ANALISTA, OBSERVADOR con permisos específicos
- **Acceso controlado**: Sistema de autenticación JWT seguro
- **Trabajo concurrente**: Múltiples usuarios pueden trabajar simultáneamente

#### 6. Cumplimiento Normativo
- **Estándares ISTA**: Implementación de protocolos internacionales
- **Validaciones específicas**: Aplicación de reglas de negocio del sector
- **Auditoría**: Registro completo de todas las operaciones

---

## Funcionalidades del Sistema

### Módulos Principales

#### 1. Autenticación y Autorización
- **Login seguro**: Autenticación con JWT
- **Roles de usuario**: ADMIN, ANALISTA, OBSERVADOR
- **Gestión de sesiones**: Tokens con expiración configurable
- **Protección de rutas**: Acceso basado en roles

#### 2. Gestión de Usuarios
- **CRUD completo**: Crear, leer, actualizar, eliminar usuarios
- **Gestión de roles**: Asignación y modificación de permisos
- **Estados de usuario**: Activo/inactivo
- **Validaciones**: Email único, contraseñas seguras

#### 3. Gestión de Lotes
- **Creación de lotes**: Información básica y fechas
- **Asignación de usuarios**: Responsables del lote
- **Estados de lote**: Activo/inactivo
- **Navegación contextual**: Acceso a análisis del lote

#### 4. Gestión de Recibos
- **Registro de muestras**: Información detallada de la muestra
- **Análisis solicitados**: Selección múltiple de tipos de análisis
- **Estados de recibo**: Recibido, En análisis, Completado
- **Trazabilidad**: Vinculación con lote y análisis

#### 5. Análisis de Semillas

##### 5.1 PMS (Peso de Mil Semillas)
- **Medición de peso**: Registro de peso de mil semillas
- **Cálculo de humedad**: Porcentaje de humedad
- **Métodos estándar**: Aplicación de protocolos ISTA
- **Observaciones**: Notas adicionales del análisis

##### 5.2 DOSN (Determinación de Otras Semillas por Número)
- **Conteo de semillas**: Identificación de otras especies
- **Malezas tolerancia cero**: Detección de malezas críticas
- **Determinaciones específicas**: Brassica y Cuscuta
- **Análisis completo/reducido**: Diferentes niveles de detalle

##### 5.3 Pureza
- **Separación de componentes**: Semilla pura, material inerte, otros cultivos
- **Identificación de malezas**: Conteo y clasificación
- **Cálculos automáticos**: Porcentajes de pureza
- **Estándares aplicables**: Cumplimiento normativo

##### 5.4 Pureza P. Notatum
- **Análisis específico**: Para semillas de Paspalum notatum
- **Parámetros especializados**: Métodos específicos para esta especie
- **Cálculos diferenciados**: Fórmulas específicas

##### 5.5 Germinación
- **Pruebas de germinación**: Condiciones controladas
- **Conteos múltiples**: Registro en diferentes fechas
- **Clasificación de semillas**: Normal, anormal, dura, fresca, muerta
- **Cálculos de porcentajes**: Germinación y vigor

##### 5.6 Sanitario
- **Detección de hongos**: Identificación de patógenos
- **Métodos de análisis**: Papel filtro, condiciones específicas
- **Clasificación de hongos**: Tipos y severidad
- **Evaluación de estado**: Apto/no apto

##### 5.7 Tetrazolio
- **Prueba de viabilidad**: Tinción con tetrazolio
- **Evaluación de vigor**: Clasificación de daños
- **Conteos detallados**: Viables, no viables, daños mecánicos
- **Cálculos de viabilidad**: Porcentajes finales

#### 6. Gestión de Catálogos
- **Hongos**: Base de datos de patógenos
- **Malezas**: Catálogo de malezas comunes
- **Cultivos**: Especies y cultivares
- **Depósitos**: Ubicaciones de almacenamiento
- **Métodos**: Protocolos de análisis

#### 7. Reportes y Exportación
- **Exportación a Excel**: Datos estructurados
- **Exportación a CSV**: Para análisis externos
- **Inserción masiva**: Carga de datos de prueba
- **Filtros avanzados**: Selección específica de datos

#### 8. Middleware Python
- **API FastAPI**: Servicios especializados
- **Inserción masiva**: 35,000+ registros de prueba
- **Exportación flexible**: Múltiples formatos
- **Importación de datos**: Desde archivos externos

---

## Tecnologías Utilizadas

### Frontend
- **Angular 20.3.1**: Framework principal
- **TypeScript 5.8.2**: Lenguaje de programación
- **PrimeNG 20.1.2**: Biblioteca de componentes UI
- **PrimeFlex 3.3.1**: Sistema de layout
- **PrimeIcons 7.0.0**: Iconografía
- **RxJS 7.8.0**: Programación reactiva
- **Zone.js 0.15.0**: Detección de cambios

#### Detalle Tecnologías Frontend
- **Angular 20**
  - Por qué: Soporte a componentes standalone, router moderno y rendimiento estable.
  - Clave: DI, HttpClient, routing, formularios reactivos, i18n.
  - Compatibilidad: Node 18+, TypeScript ~5.8, PrimeNG 20.
  - Alternativas: React, Vue; se eligió Angular por opinionado y DX integral.
- **PrimeNG/PrimeFlex**
  - Por qué: Velocidad para construir UI con componentes accesibles.
  - Clave: DataTable, Dialog, Form inputs, utilidades CSS responsivas.
  - Compatibilidad: Versionado alineado con Angular mayor.
  - Alternativas: Angular Material, NG-Zorro.

### Backend
- **Spring Boot 3.4.4**: Framework principal
- **Java 21**: Lenguaje de programación
- **Spring Security**: Autenticación y autorización
- **Spring Data JPA**: Persistencia de datos
- **Hibernate**: ORM
- **PostgreSQL**: Base de datos
- **JWT (jjwt 0.9.1)**: Tokens de autenticación
- **SpringDoc OpenAPI 2.7.0**: Documentación de API
- **Lombok 1.18.38**: Reducción de código boilerplate
- **Jackson**: Serialización JSON
- **Spring Mail**: Envío de correos

#### Detalle Tecnologías Backend
- **Spring Boot 3.4 + Java 21**
  - Por qué: LTS moderno, mejoras de rendimiento y seguridad.
  - Clave: Autoconfiguración, perfiles, Actuator (opcional), maven plugin.
  - Compatibilidad: Jakarta EE 10, Hibernate 6, Spring Security 6.
- **Spring Security + JWT (jjwt)**
  - Por qué: Protección de endpoints, control fino por roles.
  - Clave: Filtros, `@Secured`, expiración configurable.
  - Alternativas: OAuth2/OIDC (Keycloak), Auth0.
- **JPA/Hibernate + PostgreSQL**
  - Por qué: Productivo, consultas tipadas, transacciones.
  - Clave: `ddl-auto=update` (desarrollo), dialecto PostgreSQL.
  - Alternativas: MySQL/MariaDB, Exposed, jOOQ.
- **SpringDoc OpenAPI**
  - Por qué: Swagger UI y generación de contratos.
  - Clave: Descubrimiento automático de endpoints y esquemas.

### Middleware
- **Python 3.x**: Lenguaje de programación
- **FastAPI**: Framework web
- **SQLAlchemy**: ORM
- **psycopg2-binary**: Driver PostgreSQL
- **uvicorn**: Servidor ASGI
- **openpyxl**: Manipulación Excel
- **pandas**: Análisis de datos
- **faker**: Generación de datos de prueba
- **pydantic**: Validación de datos

#### Detalle Tecnologías Middleware
- **FastAPI + Uvicorn**
  - Por qué: Alto rendimiento, tipado con Pydantic, docs automáticas.
  - Clave: Validación de entrada/salida, asíncrono, OpenAPI built-in.
- **SQLAlchemy + psycopg2**
  - Por qué: ORM maduro y estable para PostgreSQL.
  - Clave: Declarative ORM, sesiones, mapeo robusto.
- **openpyxl / pandas**
  - Por qué: Exportación e importación Excel/CSV y transformaciones.
  - Clave: Estilos/celdas (openpyxl) y operaciones tabulares (pandas).

### Base de Datos
- **PostgreSQL**: Sistema de gestión de base de datos
- **Puerto**: 5432
- **Base de datos**: Inia

### Herramientas de Desarrollo
- **Maven**: Gestión de dependencias Java
- **npm**: Gestión de dependencias Node.js
- **Angular CLI**: Herramientas de desarrollo Angular
- **Git**: Control de versiones
- **PowerShell**: Scripts de automatización

### Servicios y Puertos
- **Frontend**: http://localhost:4200
- **Backend**: http://localhost:8080/Inia
- **Middleware**: http://localhost:9099
- **Swagger UI**: http://localhost:8080/Inia/swagger-ui/index.html
- **Base de datos**: localhost:5432

---

## Estrategia de Pruebas y Calidad

### Objetivo
Garantizar correctitud funcional, estabilidad entre capas y rendimiento aceptable.

### Backend (Spring Boot)
- Unitarias/Integración: JUnit 5, Spring Boot Test, Mockito, Spring Security Test.
- API/HTTP: RestAssured para contratos y flujos; Testcontainers (PostgreSQL) para DB efímera.
- Stubs externos: WireMock para simular el middleware Python.
- Cobertura: JaCoCo; Calidad: SonarQube.

### Frontend (Angular)
- Unitarias: Jasmine + Karma existentes o Jest para mayor velocidad.
- Utilidades: Angular Testing Library, `HttpClientTestingModule` para mocks HTTP.
- E2E: Playwright (recomendado) o Cypress.

### Middleware (FastAPI)
- Unitarias/Integración: pytest, httpx/FastAPI TestClient, pytest-asyncio.
- Datos: Hypothesis (property-based) y `openpyxl`/`pandas.testing` para validar exportaciones.
- Contenedores: testcontainers-python para PostgreSQL, si aplica.

### Contratos y E2E entre capas
- Contratos: Pact (Frontend↔Backend, Backend↔Middleware).
- Validación OpenAPI: Schemathesis o Dredd contra `swagger` del backend.
- Carga: k6 o Locust para endpoints críticos (exportaciones, listados).

### CI/CD sugerido
- Pipelines con: build + unitarias (tres capas), integración con Testcontainers, E2E nocturnos, métricas de cobertura, análisis SonarQube y escaneo de dependencias (OWASP DC/Snyk).


## Estructura del Proyecto

```
IniaProject/
├── frontend/                          # Aplicación Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/            # Componentes de la aplicación
│   │   │   │   ├── home/             # Página principal
│   │   │   │   ├── login/            # Autenticación
│   │   │   │   ├── lote/             # Gestión de lotes
│   │   │   │   ├── recibo/           # Gestión de recibos
│   │   │   │   ├── pms/              # Análisis PMS
│   │   │   │   ├── dosn/             # Análisis DOSN
│   │   │   │   ├── pureza/           # Análisis de pureza
│   │   │   │   ├── germinacion/      # Análisis de germinación
│   │   │   │   ├── sanitario/        # Análisis sanitario
│   │   │   │   ├── tetrazolio/       # Análisis de tetrazolio
│   │   │   │   └── listado-*/        # Listados de entidades
│   │   │   ├── models/               # DTOs y modelos
│   │   │   ├── services/             # Servicios HTTP
│   │   │   └── utils/                # Utilidades
│   │   └── assets/                   # Recursos estáticos
│   ├── package.json                  # Dependencias Node.js
│   └── angular.json                  # Configuración Angular
├── src/main/java/ti/proyectoinia/    # Código Java Spring Boot
│   ├── api/controllers/              # Controladores REST
│   ├── business/entities/            # Entidades JPA
│   ├── business/dtos/                # DTOs
│   ├── services/                     # Lógica de negocio
│   ├── security/                     # Configuración de seguridad
│   └── utils/                        # Utilidades
├── src/main/resources/               # Recursos de configuración
│   └── application.properties        # Configuración de la aplicación
├── middleware/                       # Middleware Python
│   ├── MassiveInsertFiles.py         # Inserción masiva de datos
│   ├── ExportExcel.py                # Exportación a Excel
│   ├── ImportExcel.py                # Importación desde Excel
│   ├── http_server.py                # Servidor FastAPI
│   └── requirements.txt              # Dependencias Python
├── pom.xml                           # Configuración Maven
└── Documentation.md                  # Este archivo
```

---

## Configuración y Despliegue

### Requisitos del Sistema
- **Java 21**: Para el backend Spring Boot
- **Node.js 18+**: Para el frontend Angular
- **Python 3.x**: Para el middleware
- **PostgreSQL**: Base de datos
- **Maven**: Gestión de dependencias Java
- **npm**: Gestión de dependencias Node.js

### Variables de Entorno
```bash
# Base de datos
DB_USER=postgres
DB_PASS=897888fg2

# JWT
JWT_SECRET=clave_secreta_jwt
JWT_EXPIRATION=28800000  # 8 horas en milisegundos
```

### Instalación y Configuración

#### 1. Backend (Spring Boot)
```bash
# Compilar el proyecto
mvn clean install

# Ejecutar la aplicación
mvn spring-boot:run
```

#### 2. Frontend (Angular)
```bash
# Instalar dependencias
cd frontend
npm install

# Ejecutar en modo desarrollo
npm start
```

#### 3. Middleware (Python)
```bash
# Instalación automática
cd middleware
.\SetupMiddleware.ps1

# Ejecutar servidor
.\run_middleware.ps1 server
```

### Acceso al Sistema
- **Aplicación web**: http://localhost:4200
- **API Backend**: http://localhost:8080/Inia
- **Documentación API**: http://localhost:8080/Inia/swagger-ui/index.html
- **Middleware API**: http://localhost:9099

### Usuarios por Defecto
- **Administrador**: admin@inia.com / admin123
- **Analista**: analista@inia.com / analista123

---

## Conclusiones

El Sistema INIA representa una solución integral y moderna para la gestión de análisis de semillas, transformando procesos manuales en un sistema digital eficiente y escalable. La arquitectura de tres capas garantiza la separación de responsabilidades, mientras que las tecnologías modernas aseguran un rendimiento óptimo y una experiencia de usuario superior.

El sistema no solo resuelve los problemas inmediatos de la cliente, sino que también proporciona una base sólida para futuras expansiones y mejoras, cumpliendo con los estándares internacionales del sector y facilitando la colaboración entre diferentes roles de usuarios.

La implementación de JWT para seguridad, la integración con middleware Python para operaciones especializadas, y la interfaz Angular moderna, hacen de este sistema una herramienta poderosa y confiable para laboratorios de análisis de semillas.

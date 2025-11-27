## Documentación de Pruebas del Sistema (sin Testcontainers) - Proyecto INIA

**Fecha de actualización:** 2025-01-27  
**Estado:** Todos los tests pasando  

---

## 1. Alcance de las Pruebas

Este documento describe las pruebas realizadas sobre los distintos componentes del sistema INIA, **excluyendo específicamente todo lo relacionado con Testcontainers**.  

Se cubren tres áreas principales:

- **Middleware Python (FastAPI + pytest)**
- **Backend Java (Spring Boot + Spring Security)**
- **Pruebas de rendimiento y carga (JMeter)**

El objetivo es dejar trazabilidad clara de **qué se probó, cómo se probó y qué resultados se esperaban**.

---

## 2. Pruebas del Middleware (FastAPI / pytest)

### 2.1 Health Check y Metadatos de la Aplicación

- **Verificación de existencia de la aplicación**
  - **Objetivo:** Confirmar que la aplicación FastAPI se instancia correctamente.
  - **Validaciones:**
    - La instancia `app` no es `None`.
    - La aplicación expone el atributo `routes` (ruteo inicializado).

- **Verificación de metadatos (título y versión)**
  - **Objetivo:** Asegurar que la app está configurada con la identidad esperada.
  - **Validaciones:**
    - `app.title == "INIA Python Middleware"`.
    - `app.version == "1.0.0"`.

---

### 2.2 Endpoint `/insertar`

- **Existencia y respuesta básica**
  - **Objetivo:** Verificar que el endpoint está registrado y responde.
  - **Acción:** `POST /insertar`.
  - **Resultados esperados:**
    - `200 OK`: Inserción correcta.
    - `500 Internal Server Error`: Error al insertar.
    - `503 Service Unavailable`: BD no disponible.
    - Nunca `404 Not Found`.

- **Método HTTP no permitido**
  - **Objetivo:** Comprobar que solo se permite `POST`.
  - **Acción:** `GET /insertar`.
  - **Resultado esperado:**
    - `405 Method Not Allowed`.

---

### 2.3 Endpoint `/exportar`

- **Existencia y respuesta básica**
  - **Objetivo:** Verificar que el endpoint está operativo.
  - **Acción:** `POST /exportar`.
  - **Resultados esperados:**
    - `200 OK`: Exportación exitosa.
    - `400 Bad Request`: Parámetros faltantes o inválidos.
    - `500 Internal Server Error`: Error en la exportación.
    - `503 Service Unavailable`: BD no disponible.

- **Formato de exportación inválido**
  - **Objetivo:** Asegurar que se rechazan formatos no soportados.
  - **Acción:** `POST /exportar?formato=invalid`.
  - **Resultados esperados:**
    - `400 Bad Request` (validación manual), o
    - `422 Unprocessable Entity` (validación automática de FastAPI).

- **Formato de exportación válido (xlsx / csv)**
  - **Objetivo:** Confirmar aceptación de formatos permitidos.
  - **Acciones:**
    - `POST /exportar?formato=xlsx`.
    - `POST /exportar?formato=csv`.
  - **Resultados esperados:**
    - Códigos en `[200, 400, 500, 503]`, sin errores por formato.

---

### 2.4 Endpoint `/importar`

- **Existencia y validación sin archivo**
  - **Objetivo:** Verificar que el endpoint existe y exige archivo obligatorio.
  - **Acción:** `POST /importar` sin archivo.
  - **Resultado esperado:**
    - `400 Bad Request`.

- **Importación sin archivo (estructura de error)**
  - **Objetivo:** Validar la forma estándar de las respuestas de error.
  - **Acción:** `POST /importar` sin archivo.
  - **Resultados esperados:**
    - Código `400`.
    - Cuerpo JSON con:
      - `exitoso: false`.
      - `mensaje` mencionando “archivo” o “file”.
      - `codigo: 400`.

- **Importación con archivo vacío**
  - **Objetivo:** Comprobar que un CSV vacío no se procesa como válido.
  - **Acción:** Subir archivo `empty.csv` vacío a `/importar`.
  - **Resultados esperados:**
    - Código `400` o `500`.
    - `exitoso == false`.

- **Importación con CSV válido**
  - **Objetivo:** Validar el flujo completo de importación.
  - **Acción:** Subir archivo CSV con datos de prueba y parámetros correctos.
  - **Resultados esperados:**
    - Código en `[200, 400, 500, 503]` según escenario.
    - Siempre presente el campo `exitoso` en la respuesta.

---

### 2.5 Endpoint `/analizar`

- **Existencia y validación sin archivo**
  - **Objetivo:** Confirmar la presencia del endpoint y la validación de archivo obligatorio.
  - **Acción:** `POST /analizar` sin archivo.
  - **Resultados esperados:**
    - `400 Bad Request` (validación manual) o
    - `422 Unprocessable Entity` (validación automática).

- **Análisis sin archivo (estructura de error)**
  - **Objetivo:** Validar la forma de la respuesta de error.
  - **Resultados esperados:**
    - Si `422` → el cuerpo incluye `detail`.
    - Si `400` → incluye `exitoso == false`.

- **Análisis con formato inválido (CSV en vez de Excel)**
  - **Objetivo:** Rechazar archivos no Excel.
  - **Acción:** Enviar CSV a `/analizar`.
  - **Resultados esperados:**
    - `400` o `422`.
    - Si `400` → `exitoso == false`.

- **Formato de salida inválido**
  - **Objetivo:** Asegurar que solo se aceptan formatos de salida `texto` o `json`.
  - **Acción:** `POST /analizar?formato=invalid` con Excel válido.
  - **Resultados esperados:**
    - `400` o `422`.
    - En caso de 400, `exitoso == false`.

---

### 2.6 Manejo de Errores y Estructura de Respuestas

- **Endpoint inexistente**
  - **Acción:** `GET /nonexistent`.
  - **Resultado esperado:** `404 Not Found`.

- **Método HTTP no permitido**
  - **Acción:** `GET /insertar` (endpoint solo POST).
  - **Resultado esperado:** `405 Method Not Allowed`.

- **Estructura de respuesta de error**
  - **Acción:** Forzar error (ej. `POST /importar` sin archivo).
  - **Resultado esperado:**
    - Campos: `exitoso`, `mensaje`, `codigo`.
    - `exitoso == false`, `codigo` entero.

- **Estructura de respuesta exitosa**
  - **Objetivo:** Garantizar una estructura homogénea en respuestas OK y de error.
  - **Resultado esperado:**
    - Campos estándar: `exitoso`, `mensaje`, `codigo`.

- **Campo opcional `detalles`**
  - **Objetivo:** Permitir información adicional de error sin romper el contrato.
  - **Resultado esperado:**
    - Si existe `detalles`, es de tipo `string`.

---

## 3. Pruebas del Backend (Spring Boot)

### 3.1 Seguridad en Controladores (Spring Security)

- **Acceso con rol correcto**
  - **Protecciones:**
    - Crear/editar: `@Secured({"ADMIN", "ANALISTA"})`.
    - Listar/obtener por ID: `@Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})`.
  - **Acción:** Usar `@WithMockUser` con roles permitidos (`ADMIN`, `ANALISTA`, `OBSERVADOR`).
  - **Resultado esperado:**
    - `200 OK` (o el código correcto del endpoint).

- **Acceso con rol inexistente**
  - **Acción:** `@WithMockUser(roles = "GUEST")`.
  - **Resultado esperado:**
    - `403 Forbidden`.

- **Acceso sin autorización**
  - **Acción:** Ejecutar petición sin `@WithMockUser`.
  - **Resultado esperado:**
    - `401 Unauthorized` gestionado por el Entry Point de Spring Security.

---

### 3.2 Obtención por ID (GET /{id})

- **ID inexistente**
  - **Acción:** Solicitar recurso con ID que no existe (ej. 99999).
  - **Resultado esperado:**
    - `404 Not Found`.
    - Mensaje indicando que el recurso no existe.

- **ID con formato inválido**
  - **Acción:** Usar un string en vez de Long (ej. `"abc"` o `"123abc"`).
  - **Resultado esperado:**
    - `400 Bad Request` por error de conversión.

- **Caso exitoso**
  - **Acción:** Solicitar un recurso con ID válido existente.
  - **Resultado esperado:**
    - `200 OK` y objeto con estructura correcta.

---

### 3.3 Creación y Edición (POST / PUT / PATCH)

- **Campos obligatorios null o vacíos**
  - **Acción:** Enviar campos requeridos como `null` o `""`.
  - **Resultado esperado:**
    - `400 Bad Request`.
    - Mensajes de validación indicando los campos inválidos.

- **Editar con ID inexistente**
  - **Acción:** Enviar PUT/PATCH con ID inexistente.
  - **Resultado esperado:**
    - `404 Not Found`.
    - Mensaje indicando recurso no encontrado.

- **Crear recurso (caso exitoso)**
  - **Acción:** Enviar POST con datos válidos y completos.
  - **Resultado esperado:**
    - `201 Created`.
    - Recurso persistido en BD con ID asignado.

- **Editar recurso (caso exitoso)**
  - **Acción:** Enviar PUT/PATCH con datos válidos e ID existente.
  - **Resultado esperado:**
    - `200 OK`.
    - Recurso actualizado correctamente.

---

### 3.4 Listado (GET /listar)

- **Caso exitoso**
  - **Acción:** `GET /listar`.
  - **Resultados esperados:**
    - `200 OK`.
    - Lista JSON válida (posiblemente vacía o con elementos).
    - Cada elemento con la estructura esperada.

---

### 3.5 Eliminación (DELETE /{id})

- **ID con formato inválido**
  - **Acción:** Enviar ID no numérico.
  - **Resultado esperado:**
    - `400 Bad Request`.

- **ID inexistente**
  - **Acción:** Intentar eliminar un recurso que no existe.
  - **Resultado esperado:**
    - `404 Not Found`.

- **Caso exitoso**
  - **Acción:** Eliminar un recurso con ID válido existente.
  - **Resultados esperados:**
    - `200 OK` o `204 No Content`.
    - Recurso efectivamente eliminado de la base.

---

## 4. Pruebas de Rendimiento y Carga (JMeter)

### 4.1 Flujo funcional probado

- **Login**
  - **Endpoint:** `POST /Inia/api/seguridad/login`.
  - **Acción:** Usuarios envían email y contraseña correctos.
  - **Resultado esperado:** `200 OK` con token válido.

- **Listar usuarios**
  - **Endpoint:** `GET /Inia/api/v1/usuario/listar`.
  - **Acción:** Usar el token obtenido en login.
  - **Resultado esperado:** `200 OK` con lista de usuarios.

- **Obtener usuario por email**
  - **Endpoint:** `GET /Inia/api/v1/usuario/perfil/{email}`.
  - **Acción:** Llamar con token válido.
  - **Resultado esperado:** `200 OK` con datos del usuario.

---

### 4.2 Escenarios de carga

- **Load Test (carga normal)**
  - **Objetivo:** Medir desempeño con carga típica.
  - **Configuración:**
    - Threads: 50 usuarios.
    - Ramp-Up: 10 segundos.
    - Loop Count: 1.

- **Stress Test (máxima carga)**
  - **Objetivo:** Observar comportamiento al llevar la API a su límite.
  - **Configuración:**
    - Threads: 300.
    - Ramp-Up: 20 segundos.
    - Loop Count: 5.

- **Concurrency Test (usuarios simultáneos)**
  - **Objetivo:** Evaluar concurrencia sobre el mismo flujo.
  - **Configuración:**
    - Threads: 100.
    - Ramp-Up: 0 segundos.
    - Loop Count: 1–5.

---

## 5. Conclusiones Generales

- El **middleware FastAPI** cumple con las validaciones de endpoints, manejo de formatos, estructura de respuestas y manejo de errores.
- El **backend Spring Boot** tiene pruebas de seguridad, validación de datos, manejo de errores y CRUD con distintos escenarios (exitosos y de fallo).
- Las **pruebas de carga y concurrencia con JMeter** demostraron que la API mantiene un comportamiento correcto en carga normal, máxima y concurrente, sin requerir cambios de código.

---

**Documento generado a partir de las pruebas existentes, excluyendo escenarios con Testcontainers.**



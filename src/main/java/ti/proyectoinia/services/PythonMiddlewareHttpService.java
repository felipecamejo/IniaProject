package ti.proyectoinia.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import ti.proyectoinia.api.responses.MiddlewareResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class PythonMiddlewareHttpService {

    private static final Logger logger = LoggerFactory.getLogger(PythonMiddlewareHttpService.class);
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${python.middleware.base-url:http://localhost:9099}")
    private String baseUrl;

    public PythonMiddlewareHttpService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Ejecuta inserción masiva de datos en el servidor Python.
     * 
     * @return MiddlewareResponse con el resultado de la operación
     */
    public MiddlewareResponse triggerInsertar() {
        String url = baseUrl + "/insertar";
        try {
            logger.info("Ejecutando inserción masiva en servidor Python: {}", url);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>("{}", headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                try {
                    MiddlewareResponse middlewareResponse = objectMapper.readValue(
                        response.getBody(), 
                        MiddlewareResponse.class
                    );
                    logger.info("Inserción masiva completada. Exitoso: {}", middlewareResponse.esExitoso());
                    return middlewareResponse;
                } catch (Exception jsonError) {
                    logger.error("Error parseando respuesta JSON del servidor Python: {}", jsonError.getMessage());
                    return crearRespuestaError(
                        "Error parseando respuesta del servidor Python",
                        jsonError.getMessage()
                    );
                }
            }
            
            return crearRespuestaError(
                "El servidor Python no respondió correctamente",
                "Status: " + response.getStatusCode()
            );
        } catch (HttpClientErrorException ex) {
            logger.error("Error HTTP llamando a Python /insertar: {} - {}", ex.getStatusCode(), ex.getMessage());
            return parsearErrorHttp(ex);
        } catch (HttpServerErrorException ex) {
            logger.error("Error HTTP llamando a Python /insertar: {} - {}", ex.getStatusCode(), ex.getMessage());
            return parsearErrorHttp(ex);
        } catch (RestClientException ex) {
            logger.error("Error de conexión llamando a Python /insertar: {}", ex.getMessage());
            String mensajeDetalle = ex.getMessage();
            if (mensajeDetalle != null && mensajeDetalle.contains("Connection refused")) {
                mensajeDetalle = "El servidor Python no está ejecutándose. " +
                               "Inicia el servidor con: python middleware/http_server.py o ejecuta: .\\run_middleware.ps1 server";
            }
            return crearRespuestaError(
                "No se pudo conectar al servidor Python",
                mensajeDetalle
            );
        }
    }

    /**
     * Descarga un archivo ZIP con las tablas exportadas.
     * 
     * @param tablasCsv Lista de tablas separadas por comas (null para todas)
     * @param formato Formato de exportación (xlsx o csv)
     * @param analisisIds IDs de análisis a exportar (formato: "tipo:id1,id2;tipo2:id3,id4")
     * @param fechaDesde Fecha de inicio del rango (formato: YYYY-MM-DD)
     * @param fechaHasta Fecha de fin del rango (formato: YYYY-MM-DD)
     * @param campoFecha Campo de fecha a usar para filtrado (fecha_inia, fecha_inase, fecha_analisis, fecha_germinacion, auto)
     * @return byte[] con el contenido del ZIP, o null si hubo error
     */
    public byte[] descargarExportZip(String tablasCsv, String formato, 
                                     String analisisIds, String fechaDesde, 
                                     String fechaHasta, String campoFecha) {
        StringBuilder urlBuilder = new StringBuilder(baseUrl + "/exportar");
        java.util.List<String> params = new java.util.ArrayList<>();
        
        // Formato (requerido, default xlsx)
        if (formato != null && !formato.isBlank()) {
            params.add("formato=" + URLEncoder.encode(formato, StandardCharsets.UTF_8));
        } else {
            params.add("formato=xlsx");
        }
        
        // Tablas específicas (opcional)
        if (tablasCsv != null && !tablasCsv.isBlank()) {
            params.add("tablas=" + URLEncoder.encode(tablasCsv, StandardCharsets.UTF_8));
        }
        
        // IDs de análisis (opcional) - puede contener caracteres especiales como : y ;
        if (analisisIds != null && !analisisIds.isBlank()) {
            params.add("analisis_ids=" + URLEncoder.encode(analisisIds, StandardCharsets.UTF_8));
        }
        
        // Fecha desde (opcional)
        if (fechaDesde != null && !fechaDesde.isBlank()) {
            params.add("fecha_desde=" + URLEncoder.encode(fechaDesde, StandardCharsets.UTF_8));
        }
        
        // Fecha hasta (opcional)
        if (fechaHasta != null && !fechaHasta.isBlank()) {
            params.add("fecha_hasta=" + URLEncoder.encode(fechaHasta, StandardCharsets.UTF_8));
        }
        
        // Campo de fecha (opcional, default auto)
        if (campoFecha != null && !campoFecha.isBlank() && !campoFecha.equals("auto")) {
            params.add("campo_fecha=" + URLEncoder.encode(campoFecha, StandardCharsets.UTF_8));
        }
        
        String url = urlBuilder.toString();
        if (!params.isEmpty()) {
            url += "?" + String.join("&", params);
        }
        
        try {
            logger.info("═══════════════════════════════════════════════════════════════");
            logger.info("INICIANDO EXPORTACIÓN DESDE SERVIDOR PYTHON");
            logger.info("═══════════════════════════════════════════════════════════════");
            logger.info("URL: {}", url);
            logger.info("Parámetros de exportación:");
            logger.info("  - Tablas: {}", tablasCsv != null && !tablasCsv.isBlank() ? tablasCsv : "TODAS (no especificadas)");
            logger.info("  - Formato: {}", formato != null && !formato.isBlank() ? formato : "xlsx (default)");
            
            if (analisisIds != null || fechaDesde != null || fechaHasta != null) {
                logger.info("FILTROS APLICADOS:");
                if (analisisIds != null && !analisisIds.isBlank()) {
                    logger.info("  ✓ IDs de análisis: {}", analisisIds);
                }
                if (fechaDesde != null && !fechaDesde.isBlank()) {
                    logger.info("  ✓ Fecha desde: {}", fechaDesde);
                }
                if (fechaHasta != null && !fechaHasta.isBlank()) {
                    logger.info("  ✓ Fecha hasta: {}", fechaHasta);
                }
                if (campoFecha != null && !campoFecha.isBlank() && !campoFecha.equals("auto")) {
                    logger.info("  ✓ Campo de fecha: {}", campoFecha);
                } else {
                    logger.info("  ✓ Campo de fecha: auto (detección automática)");
                }
            } else {
                logger.info("Filtros: NINGUNO (exportación completa)");
            }
            
            logger.info("Realizando petición POST al servidor Python...");
            ResponseEntity<byte[]> response = restTemplate.exchange(url, HttpMethod.POST, null, byte[].class);
            byte[] body = response.getBody();
            
            logger.info("Respuesta recibida del servidor Python:");
            logger.info("  - Status HTTP: {}", response.getStatusCode());
            logger.info("  - Body presente: {}", body != null ? "SÍ" : "NO");
            
            if (response.getStatusCode().is2xxSuccessful() && body != null) {
                logger.info("═══════════════════════════════════════════════════════════════");
                logger.info("✓ EXPORTACIÓN COMPLETADA EXITOSAMENTE");
                logger.info("═══════════════════════════════════════════════════════════════");
                logger.info("Tamaño del archivo ZIP: {} bytes ({} MB)", 
                           body.length, 
                           String.format("%.2f", body.length / (1024.0 * 1024.0)));
                return body;
            }
            
            logger.error("═══════════════════════════════════════════════════════════════");
            logger.error("✗ ERROR EN EXPORTACIÓN");
            logger.error("═══════════════════════════════════════════════════════════════");
            logger.error("Status HTTP: {}", response.getStatusCode());
            logger.error("Body null: {}", body == null);
            logger.error("URL utilizada: {}", url);
            if (body == null) {
                logger.error("PROBLEMA: El servidor Python no retornó datos en el body de la respuesta");
            } else {
                logger.error("PROBLEMA: El servidor Python retornó un status no exitoso: {}", response.getStatusCode());
            }
            return null;
        } catch (HttpClientErrorException ex) {
            logger.error("═══════════════════════════════════════════════════════════════");
            logger.error("✗ ERROR HTTP 4xx (CLIENTE) EN EXPORTACIÓN");
            logger.error("═══════════════════════════════════════════════════════════════");
            logger.error("Status HTTP: {}", ex.getStatusCode());
            logger.error("Mensaje: {}", ex.getMessage());
            logger.error("URL utilizada: {}", url);
            String responseBody = ex.getResponseBodyAsString();
            if (responseBody != null && !responseBody.isBlank()) {
                logger.error("Respuesta del servidor Python:");
                logger.error("{}", responseBody);
                if (responseBody.contains("exitoso") || responseBody.contains("mensaje")) {
                    logger.error("NOTA: El servidor Python retornó un error estructurado. Revisa el mensaje arriba.");
                }
            } else {
                logger.error("PROBLEMA: El servidor Python no retornó detalles del error");
            }
            logger.error("POSIBLES CAUSAS:");
            logger.error("  - Parámetros inválidos (fechas mal formateadas, IDs incorrectos)");
            logger.error("  - Validación fallida en el servidor Python");
            logger.error("  - Formato de parámetros incorrecto");
            return null;
        } catch (HttpServerErrorException ex) {
            logger.error("═══════════════════════════════════════════════════════════════");
            logger.error("✗ ERROR HTTP 5xx (SERVIDOR) EN EXPORTACIÓN");
            logger.error("═══════════════════════════════════════════════════════════════");
            logger.error("Status HTTP: {}", ex.getStatusCode());
            logger.error("Mensaje: {}", ex.getMessage());
            logger.error("URL utilizada: {}", url);
            String responseBody = ex.getResponseBodyAsString();
            if (responseBody != null && !responseBody.isBlank()) {
                logger.error("Respuesta del servidor Python:");
                logger.error("{}", responseBody);
            } else {
                logger.error("PROBLEMA: El servidor Python no retornó detalles del error");
            }
            logger.error("POSIBLES CAUSAS:");
            logger.error("  - Error en la base de datos (conexión, consulta, timeout)");
            logger.error("  - Error interno del servidor Python");
            logger.error("  - Problemas de memoria o recursos");
            logger.error("  - Circuit breaker activado");
            return null;
        } catch (RestClientException ex) {
            logger.error("═══════════════════════════════════════════════════════════════");
            logger.error("✗ ERROR DE CONEXIÓN CON SERVIDOR PYTHON");
            logger.error("═══════════════════════════════════════════════════════════════");
            logger.error("Mensaje: {}", ex.getMessage());
            logger.error("URL intentada: {}", url);
            logger.error("Base URL configurada: {}", baseUrl);
            
            if (ex.getMessage() != null && ex.getMessage().contains("Connection refused")) {
                logger.error("PROBLEMA DETECTADO: El servidor Python no está ejecutándose");
                logger.error("SOLUCIÓN:");
                logger.error("  1. Verifica que el servidor Python esté corriendo en: {}", baseUrl);
                logger.error("  2. Inicia el servidor con uno de estos comandos:");
                logger.error("     - python middleware/http_server.py");
                logger.error("     - .\\run_middleware.ps1 server");
                logger.error("  3. Verifica que el puerto {} esté disponible", baseUrl.contains(":") ? baseUrl.split(":")[2] : "9099");
            } else if (ex.getMessage() != null && ex.getMessage().contains("timeout")) {
                logger.error("PROBLEMA DETECTADO: Timeout al conectar con el servidor Python");
                logger.error("SOLUCIÓN:");
                logger.error("  - Verifica que el servidor Python esté respondiendo");
                logger.error("  - Aumenta el timeout si la exportación es muy grande");
            } else {
                logger.error("PROBLEMA DETECTADO: No se pudo establecer conexión con el servidor Python");
                logger.error("SOLUCIÓN:");
                logger.error("  - Verifica la conectividad de red");
                logger.error("  - Verifica que el servidor Python esté ejecutándose");
                logger.error("  - Verifica la configuración de baseUrl: {}", baseUrl);
            }
            return null;
        } catch (Exception ex) {
            logger.error("═══════════════════════════════════════════════════════════════");
            logger.error("✗ ERROR INESPERADO EN EXPORTACIÓN");
            logger.error("═══════════════════════════════════════════════════════════════");
            logger.error("Tipo de error: {}", ex.getClass().getName());
            logger.error("Mensaje: {}", ex.getMessage());
            logger.error("URL utilizada: {}", url);
            logger.error("Stack trace:", ex);
            return null;
        }
    }
    
    /**
     * Descarga un archivo ZIP con las tablas exportadas (método sobrecargado para compatibilidad hacia atrás).
     * 
     * @param tablasCsv Lista de tablas separadas por comas (null para todas)
     * @param formato Formato de exportación (xlsx o csv)
     * @return byte[] con el contenido del ZIP, o null si hubo error
     */
    public byte[] descargarExportZip(String tablasCsv, String formato) {
        return descargarExportZip(tablasCsv, formato, null, null, null, null);
    }

    /**
     * Importa múltiples archivos Excel/CSV a la base de datos.
     * 
     * @param table Nombre de la tabla destino (opcional, se detecta automáticamente)
     * @param upsert Si es true, actualiza registros existentes
     * @param keepIds Si es true, mantiene los IDs del archivo
     * @param files Array de archivos MultipartFile
     * @return MiddlewareResponse con el resultado de la operación
     */
    public MiddlewareResponse importarMultiplesTablas(String table, boolean upsert, boolean keepIds, org.springframework.web.multipart.MultipartFile[] files) {
        String url = baseUrl + "/importar";
        try {
            logger.info("Importando {} archivos en servidor Python", files.length);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            if (table != null && !table.isBlank()) {
                body.add("table", table);
            }
            body.add("upsert", String.valueOf(upsert));
            body.add("keep_ids", String.valueOf(keepIds));

            // Agregar todos los archivos usando "files" (el servidor Python acepta "file" o "files")
            for (org.springframework.web.multipart.MultipartFile file : files) {
                if (file != null && !file.isEmpty()) {
                    String originalFilename = file.getOriginalFilename();
                    final String filename = (originalFilename == null || originalFilename.isBlank()) 
                            ? "archivo.xlsx" 
                            : originalFilename;
                    final byte[] fileBytes = file.getBytes();
                    
                    ByteArrayResource fileResource = new ByteArrayResource(fileBytes) {
                        @Override
                        public String getFilename() {
                            return filename;
                        }
                    };
                    body.add("files", fileResource);
                    logger.info("  - Archivo agregado: {} ({} bytes)", filename, file.getSize());
                }
            }

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                try {
                    MiddlewareResponse middlewareResponse = objectMapper.readValue(
                        response.getBody(), 
                        MiddlewareResponse.class
                    );
                    logger.info("Importación masiva completada. Exitoso: {}", middlewareResponse.esExitoso());
                    return middlewareResponse;
                } catch (Exception jsonError) {
                    logger.error("Error parseando respuesta JSON del servidor Python: {}", jsonError.getMessage());
                    return crearRespuestaError(
                        "Error parseando respuesta del servidor Python",
                        jsonError.getMessage()
                    );
                }
            }
            
            return crearRespuestaError(
                "El servidor Python no respondió correctamente",
                "Status: " + response.getStatusCode()
            );
        } catch (HttpClientErrorException ex) {
            logger.error("Error HTTP llamando a Python /importar: {} - {}", ex.getStatusCode(), ex.getMessage());
            logger.error("Respuesta del servidor: {}", ex.getResponseBodyAsString());
            return parsearErrorHttp(ex);
        } catch (HttpServerErrorException ex) {
            logger.error("Error HTTP llamando a Python /importar: {} - {}", ex.getStatusCode(), ex.getMessage());
            logger.error("Respuesta del servidor: {}", ex.getResponseBodyAsString());
            return parsearErrorHttp(ex);
        } catch (RestClientException ex) {
            logger.error("Error de conexión llamando a Python /importar: {}", ex.getMessage());
            String mensajeDetalle = ex.getMessage();
            if (mensajeDetalle != null && mensajeDetalle.contains("Connection refused")) {
                mensajeDetalle = "El servidor Python no está ejecutándose. " +
                               "Inicia el servidor con: python middleware/http_server.py o ejecuta: .\\run_middleware.ps1 server";
            }
            return crearRespuestaError(
                "No se pudo conectar al servidor Python",
                mensajeDetalle
            );
        } catch (Exception ex) {
            logger.error("Error inesperado durante importación masiva: {}", ex.getMessage(), ex);
            return crearRespuestaError(
                "Error inesperado durante la importación masiva",
                ex.getMessage()
            );
        }
    }

    /**
     * Importa un archivo Excel/CSV a la base de datos.
     * 
     * @param table Nombre de la tabla destino
     * @param upsert Si es true, actualiza registros existentes
     * @param keepIds Si es true, mantiene los IDs del archivo
     * @param filename Nombre del archivo
     * @param fileBytes Contenido del archivo
     * @return MiddlewareResponse con el resultado de la operación
     */
    public MiddlewareResponse importarTabla(String table, boolean upsert, boolean keepIds, String filename, byte[] fileBytes) {
        String url = baseUrl + "/importar";
        try {
            logger.info("Importando archivo {} a tabla {} en servidor Python", filename, table);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("table", table);
            body.add("upsert", String.valueOf(upsert));
            body.add("keep_ids", String.valueOf(keepIds));

            ByteArrayResource fileResource = new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() {
                    if (filename != null && !filename.isBlank()) {
                        return filename;
                    }
                    return "data.xlsx";
                }
            };
            body.add("file", fileResource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                try {
                    MiddlewareResponse middlewareResponse = objectMapper.readValue(
                        response.getBody(), 
                        MiddlewareResponse.class
                    );
                    logger.info("Importación completada. Exitoso: {}", middlewareResponse.esExitoso());
                    return middlewareResponse;
                } catch (Exception jsonError) {
                    logger.error("Error parseando respuesta JSON del servidor Python: {}", jsonError.getMessage());
                    return crearRespuestaError(
                        "Error parseando respuesta del servidor Python",
                        jsonError.getMessage()
                    );
                }
            }
            
            return crearRespuestaError(
                "El servidor Python no respondió correctamente",
                "Status: " + response.getStatusCode()
            );
        } catch (HttpClientErrorException ex) {
            logger.error("Error HTTP llamando a Python /importar: {} - {}", ex.getStatusCode(), ex.getMessage());
            logger.error("Respuesta del servidor: {}", ex.getResponseBodyAsString());
            return parsearErrorHttp(ex);
        } catch (HttpServerErrorException ex) {
            logger.error("Error HTTP llamando a Python /importar: {} - {}", ex.getStatusCode(), ex.getMessage());
            logger.error("Respuesta del servidor: {}", ex.getResponseBodyAsString());
            return parsearErrorHttp(ex);
        } catch (RestClientException ex) {
            logger.error("Error de conexión llamando a Python /importar: {}", ex.getMessage());
            String mensajeDetalle = ex.getMessage();
            if (mensajeDetalle != null && mensajeDetalle.contains("Connection refused")) {
                mensajeDetalle = "El servidor Python no está ejecutándose. " +
                               "Inicia el servidor con: python middleware/http_server.py o ejecuta: .\\run_middleware.ps1 server";
            }
            return crearRespuestaError(
                "No se pudo conectar al servidor Python",
                mensajeDetalle
            );
        }
    }
    
    /**
     * Analiza un archivo Excel y genera un mapeo de datos.
     * 
     * @param filename Nombre del archivo Excel
     * @param fileBytes Contenido del archivo Excel
     * @param formato Formato de salida ("json" o "texto")
     * @param contrastarBd Si es true, contrasta el mapeo con la base de datos
     * @param umbralCoincidencia Porcentaje mínimo de coincidencia requerido
     * @return MiddlewareResponse con el resultado del análisis
     */
    public MiddlewareResponse analizarExcel(String filename, byte[] fileBytes, String formato, 
                                           Boolean contrastarBd, Double umbralCoincidencia) {
        String url = baseUrl + "/analizar?formato=" + (formato == null ? "json" : formato);
        if (contrastarBd != null) {
            url += "&contrastar_bd=" + contrastarBd;
        }
        if (umbralCoincidencia != null) {
            url += "&umbral_coincidencia=" + umbralCoincidencia;
        }
        try {
            logger.info("Analizando archivo Excel {} en servidor Python", filename);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource fileResource = new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() {
                    if (filename != null && !filename.isBlank()) {
                        return filename;
                    }
                    return "archivo.xlsx";
                }
            };
            body.add("file", fileResource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                try {
                    MiddlewareResponse middlewareResponse = objectMapper.readValue(
                        response.getBody(), 
                        MiddlewareResponse.class
                    );
                    logger.info("Análisis completado. Exitoso: {}", middlewareResponse.esExitoso());
                    return middlewareResponse;
                } catch (Exception jsonError) {
                    logger.error("Error parseando respuesta JSON del servidor Python: {}", jsonError.getMessage());
                    return crearRespuestaError(
                        "Error parseando respuesta del servidor Python",
                        jsonError.getMessage()
                    );
                }
            }
            
            return crearRespuestaError(
                "El servidor Python no respondió correctamente",
                "Status: " + response.getStatusCode()
            );
        } catch (HttpClientErrorException ex) {
            logger.error("Error HTTP llamando a Python /analizar: {} - {}", ex.getStatusCode(), ex.getMessage());
            logger.error("Respuesta del servidor: {}", ex.getResponseBodyAsString());
            return parsearErrorHttp(ex);
        } catch (HttpServerErrorException ex) {
            logger.error("Error HTTP llamando a Python /analizar: {} - {}", ex.getStatusCode(), ex.getMessage());
            logger.error("Respuesta del servidor: {}", ex.getResponseBodyAsString());
            return parsearErrorHttp(ex);
        } catch (RestClientException ex) {
            logger.error("Error de conexión llamando a Python /analizar: {}", ex.getMessage());
            String mensajeDetalle = ex.getMessage();
            if (mensajeDetalle != null && mensajeDetalle.contains("Connection refused")) {
                mensajeDetalle = "El servidor Python no está ejecutándose. " +
                               "Inicia el servidor con: python middleware/http_server.py o ejecuta: .\\run_middleware.ps1 server";
            }
            return crearRespuestaError(
                "No se pudo conectar al servidor Python",
                mensajeDetalle
            );
        }
    }
    
    /**
     * Crea una respuesta de error estándar.
     */
    private MiddlewareResponse crearRespuestaError(String mensaje, String detalles) {
        MiddlewareResponse response = new MiddlewareResponse();
        response.setExitoso(false);
        response.setMensaje(mensaje);
        response.setCodigo(500);
        response.setDetalles(detalles);
        return response;
    }
    
    /**
     * Parsea un error HTTP y lo convierte en MiddlewareResponse.
     * Proporciona mensajes de error claros y detallados.
     */
    private MiddlewareResponse parsearErrorHttp(Exception ex) {
        int statusCode = 500;
        String responseBody = null;
        
        try {
            if (ex instanceof HttpClientErrorException) {
                HttpClientErrorException httpEx = (HttpClientErrorException) ex;
                responseBody = httpEx.getResponseBodyAsString();
                statusCode = httpEx.getStatusCode().value();
            } else if (ex instanceof HttpServerErrorException) {
                HttpServerErrorException httpEx = (HttpServerErrorException) ex;
                responseBody = httpEx.getResponseBodyAsString();
                statusCode = httpEx.getStatusCode().value();
            }
            
            // Log detallado del cuerpo de la respuesta
            logger.info("Cuerpo de respuesta del servidor Python (Status {}): {}", statusCode, responseBody);
            
            if (responseBody != null && !responseBody.isEmpty()) {
                try {
                    // FastAPI puede retornar el error en formato {"detail": {...}} o {"detail": "mensaje"}
                    // Intentar parsear primero como MiddlewareResponse directo
                    MiddlewareResponse response = objectMapper.readValue(responseBody, MiddlewareResponse.class);
                    
                    // Validar que la respuesta tiene valores válidos
                    if (response.getExitoso() != null || response.getMensaje() != null || response.getCodigo() != null) {
                        logger.info("Respuesta parseada correctamente: exitoso={}, mensaje={}, codigo={}", 
                                   response.getExitoso(), response.getMensaje(), response.getCodigo());
                        return response;
                    } else {
                        logger.warn("Respuesta parseada pero con valores null. Intentando parsear formato FastAPI...");
                    }
                } catch (Exception parseError) {
                    logger.warn("No se pudo parsear como MiddlewareResponse directo: {}", parseError.getMessage());
                }
                
                // Intentar parsear como formato FastAPI {"detail": {...}}
                try {
                    
                    java.util.Map<String, Object> jsonMap = objectMapper.readValue(
                        responseBody, 
                        objectMapper.getTypeFactory().constructMapType(
                            java.util.Map.class, 
                            String.class, 
                            Object.class
                        )
                    );
                    
                    if (jsonMap.containsKey("detail")) {
                        Object detail = jsonMap.get("detail");
                        
                        // Si detail es un diccionario (nuestra respuesta estructurada)
                        if (detail instanceof java.util.Map) {
                            @SuppressWarnings("unchecked")
                            java.util.Map<String, Object> detailMap = (java.util.Map<String, Object>) detail;
                            
                            MiddlewareResponse response = new MiddlewareResponse();
                            response.setExitoso((Boolean) detailMap.get("exitoso"));
                            response.setMensaje((String) detailMap.get("mensaje"));
                            response.setCodigo(detailMap.get("codigo") != null ? 
                                             ((Number) detailMap.get("codigo")).intValue() : statusCode);
                            response.setDetalles((String) detailMap.get("detalles"));
                            @SuppressWarnings("unchecked")
                            java.util.Map<String, Object> datos = (java.util.Map<String, Object>) detailMap.get("datos");
                            response.setDatos(datos);
                            
                            logger.info("Respuesta parseada desde formato FastAPI detail: exitoso={}, mensaje={}", 
                                       response.getExitoso(), response.getMensaje());
                            return response;
                        } 
                        // Si detail es un string
                        else if (detail instanceof String) {
                            return crearRespuestaError(
                                "Error en el servidor Python",
                                String.format("Status: %d, Detalle: %s", statusCode, detail)
                            );
                        }
                    }
                    
                    // Si no tiene "detail", intentar mapear directamente
                    MiddlewareResponse response = new MiddlewareResponse();
                    response.setExitoso((Boolean) jsonMap.get("exitoso"));
                    response.setMensaje((String) jsonMap.get("mensaje"));
                    if (jsonMap.get("codigo") != null) {
                        response.setCodigo(((Number) jsonMap.get("codigo")).intValue());
                    } else {
                        response.setCodigo(statusCode);
                    }
                    response.setDetalles((String) jsonMap.get("detalles"));
                    @SuppressWarnings("unchecked")
                    java.util.Map<String, Object> datos = (java.util.Map<String, Object>) jsonMap.get("datos");
                    response.setDatos(datos);
                    
                    // Validar que tiene al menos un campo válido
                    if (response.getExitoso() != null || response.getMensaje() != null) {
                        logger.info("Respuesta parseada desde JSON genérico: exitoso={}, mensaje={}", 
                                   response.getExitoso(), response.getMensaje());
                        return response;
                    }
                } catch (Exception mapError) {
                    logger.error("Error parseando JSON del servidor Python: {}", mapError.getMessage());
                    logger.error("Cuerpo de respuesta que no se pudo parsear: {}", responseBody);
                }
            } else {
                logger.warn("El servidor Python retornó un cuerpo de respuesta vacío o null");
            }
        } catch (Exception e) {
            logger.error("Error obteniendo cuerpo de respuesta del servidor Python: {}", e.getMessage(), e);
        }
        
        // Si llegamos aquí, crear una respuesta de error genérica pero clara
        String mensajeDetalle = ex.getMessage();
        if (responseBody != null && !responseBody.isEmpty()) {
            // Limitar el tamaño del mensaje para evitar respuestas muy largas
            String cuerpoResumido = responseBody.length() > 500 
                ? responseBody.substring(0, 500) + "..." 
                : responseBody;
            mensajeDetalle = String.format("Status: %d, Mensaje: %s. Respuesta del servidor: %s", 
                                         statusCode, ex.getMessage(), cuerpoResumido);
        } else {
            mensajeDetalle = String.format("Status: %d, Mensaje: %s", statusCode, ex.getMessage());
        }
        
        return crearRespuestaError(
            "Error en el servidor Python",
            mensajeDetalle
        );
    }
}



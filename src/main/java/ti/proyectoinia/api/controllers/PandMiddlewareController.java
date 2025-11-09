package ti.proyectoinia.api.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import ti.proyectoinia.services.PandMiddlewareService;
import ti.proyectoinia.services.PythonMiddlewareHttpService;
import ti.proyectoinia.api.responses.MiddlewareResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Controlador REST para manejar operaciones del middleware de pandas/SQLAlchemy.
 * 
 * Este controlador proporciona endpoints para:
 * - Exportar tablas a Excel usando el servidor HTTP Python
 * - Importar datos desde archivos Excel automáticamente
 * - Analizar archivos Excel y generar mapeo de datos
 * - Insertar datos masivos de prueba usando MassiveInsertFiles.py
 * 
 * Todos los endpoints requieren permisos de ADMIN para su ejecución.
 * 
 * @author Sistema INIA
 * @version 1.0
 */
@RestController
@RequestMapping("api/pandmiddleware")
@Tag(name = "PandMiddleware", description = "Endpoints para ejecutar el middleware de pandas/SQLAlchemy")
public class PandMiddlewareController {

    private static final Logger logger = LoggerFactory.getLogger(PandMiddlewareController.class);
    private final PandMiddlewareService pandMiddlewareService;
    private final PythonMiddlewareHttpService pythonHttpService;

    /**
     * Constructor del controlador.
     * 
     * @param pandMiddlewareService Servicio que maneja la ejecución de scripts de Python
     * @param pythonHttpService Servicio que maneja la comunicación HTTP con el servidor Python
     */
    public PandMiddlewareController(PandMiddlewareService pandMiddlewareService,
                                    PythonMiddlewareHttpService pythonHttpService) {
        this.pandMiddlewareService = pandMiddlewareService;
        this.pythonHttpService = pythonHttpService;
    }

  
    @PostMapping("/http/exportar")
    @Secured({"ADMIN"})
    @Operation(summary = "Exportar tablas (HTTP Python)", description = "Exporta todas las tablas a Excel y descarga automáticamente el archivo ZIP - Solo ADMIN")
    public ResponseEntity<?> httpExportar() {
        try {
            logger.info("Iniciando exportación de tablas desde el backend");
            
            // Exportar todas las tablas sin especificar tabla específica
            byte[] zip = pythonHttpService.descargarExportZip(null, "xlsx");
            
            if (zip == null) {
                logger.error("El servicio Python no respondió o retornó null");
                MiddlewareResponse errorResponse = new MiddlewareResponse();
                errorResponse.setExitoso(false);
                errorResponse.setMensaje("Error en la exportación");
                errorResponse.setCodigo(500);
                errorResponse.setDetalles("El servicio Python no respondió o retornó null. " +
                                         "Verifica que el servidor Python esté ejecutándose en http://localhost:9099. " +
                                         "Inicia el servidor con: python middleware/http_server.py o ejecuta: .\\run_middleware.ps1 server");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(errorResponse);
            }
            
            if (zip.length == 0) {
                logger.error("Se generó un archivo ZIP vacío");
                MiddlewareResponse errorResponse = new MiddlewareResponse();
                errorResponse.setExitoso(false);
                errorResponse.setMensaje("Error en la exportación");
                errorResponse.setCodigo(500);
                errorResponse.setDetalles("Se generó un archivo ZIP vacío. No se exportaron tablas.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(errorResponse);
            }
            
            logger.info("Exportación completada exitosamente. Tamaño del ZIP: {} bytes", zip.length);
            
            // Configurar headers para descarga automática del archivo ZIP
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "export_tablas.xlsx.zip");
            headers.setContentLength(zip.length);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(zip);
        } catch (Exception e) {
            logger.error("Error inesperado durante la exportación: {}", e.getMessage(), e);
            MiddlewareResponse errorResponse = new MiddlewareResponse();
            errorResponse.setExitoso(false);
            errorResponse.setMensaje("Error durante la exportación");
            errorResponse.setCodigo(500);
            errorResponse.setDetalles(String.format("Error: %s (Tipo: %s)", e.getMessage(), e.getClass().getSimpleName()));
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorResponse);
        }
    }

    

    @PostMapping(value = "/http/importar", consumes = {"multipart/form-data"})
    @Secured({"ADMIN"})
    @Operation(summary = "Importar Excel automático", description = "Carga archivo Excel automáticamente a la base de datos - Solo ADMIN")
    public ResponseEntity<MiddlewareResponse> httpImportar(
            @RequestPart("file") MultipartFile file) {
        try {
            logger.info("Iniciando importación de archivo desde el backend");
            
            // Validar archivo
            if (file == null || file.isEmpty()) {
                logger.warn("Intento de importar archivo vacío");
                MiddlewareResponse errorResponse = new MiddlewareResponse();
                errorResponse.setExitoso(false);
                errorResponse.setMensaje("Archivo vacío");
                errorResponse.setCodigo(400);
                errorResponse.setDetalles("Debe proporcionar un archivo para importar");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            // Verificar que sea un archivo Excel
            String nombreArchivo = file.getOriginalFilename();
            if (nombreArchivo == null || (!nombreArchivo.toLowerCase().endsWith(".xlsx") && 
                    !nombreArchivo.toLowerCase().endsWith(".xls") && 
                    !nombreArchivo.toLowerCase().endsWith(".csv"))) {
                logger.warn("Intento de importar archivo con formato no válido: {}", nombreArchivo);
                MiddlewareResponse errorResponse = new MiddlewareResponse();
                errorResponse.setExitoso(false);
                errorResponse.setMensaje("Formato de archivo no válido");
                errorResponse.setCodigo(400);
                errorResponse.setDetalles("Solo se permiten archivos Excel (.xlsx o .xls) o CSV (.csv)");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            logger.info("Archivo recibido: {}, Tamaño: {} bytes", nombreArchivo, file.getSize());
            
            byte[] bytes = file.getBytes();
            
            // Determinar automáticamente la tabla basándose en el nombre del archivo
            // Por ejemplo, si el archivo se llama "usuarios.xlsx", la tabla será "usuarios"
            String tabla = determinarTablaDesdeNombre(nombreArchivo);
            logger.info("Tabla determinada automáticamente: {}", tabla);
            
            // Importar con configuración automática (upsert=false, keep_ids=false por defecto)
            MiddlewareResponse respuesta = pythonHttpService.importarTabla(tabla, false, false, nombreArchivo, bytes);
            
            if (respuesta == null) {
                logger.error("Sin respuesta del middleware Python");
                MiddlewareResponse errorResponse = new MiddlewareResponse();
                errorResponse.setExitoso(false);
                errorResponse.setMensaje("Sin respuesta del middleware Python");
                errorResponse.setCodigo(500);
                errorResponse.setDetalles("El servidor Python no respondió. " +
                                         "Verifica que el servidor esté ejecutándose en http://localhost:9099. " +
                                         "Inicia el servidor con: python middleware/http_server.py o ejecuta: .\\run_middleware.ps1 server");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
            }
            
            // Retornar respuesta estructurada
            HttpStatus status = respuesta.esExitoso() ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR;
            if (respuesta.getCodigo() != null) {
                if (respuesta.getCodigo() >= 400 && respuesta.getCodigo() < 500) {
                    status = HttpStatus.BAD_REQUEST;
                } else if (respuesta.getCodigo() >= 500) {
                    status = HttpStatus.INTERNAL_SERVER_ERROR;
                }
            }
            
            logger.info("Importación completada. Exitoso: {}, Mensaje: {}", 
                       respuesta.esExitoso(), respuesta.getMensaje());
            
            return ResponseEntity.status(status).body(respuesta);
        } catch (Exception e) {
            logger.error("Error inesperado durante la importación: {}", e.getMessage(), e);
            MiddlewareResponse errorResponse = new MiddlewareResponse();
            errorResponse.setExitoso(false);
            errorResponse.setMensaje("Error enviando importación");
            errorResponse.setCodigo(500);
            errorResponse.setDetalles(String.format("Error: %s (Tipo: %s)", e.getMessage(), e.getClass().getSimpleName()));
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Endpoint para analizar un archivo Excel y generar un mapeo de datos.
     * 
     * Este endpoint analiza un archivo Excel y genera un mapeo que muestra
     * qué datos contiene y a qué entidades pertenecen.
     * 
     * @param file Archivo Excel (.xlsx o .xls) a analizar
     * @param formato Formato de salida ("json" o "texto")
     * @return ResponseEntity<MiddlewareResponse> Respuesta con el mapeo de datos
     */
    @PostMapping(value = "/http/analizar", consumes = {"multipart/form-data"})
    @Secured({"ADMIN"})
    @Operation(summary = "Analizar archivo Excel", description = "Analiza un archivo Excel y genera un mapeo de datos que muestra qué datos contiene y a qué entidades pertenecen. Contrasta con la base de datos para identificar tablas reales - Solo ADMIN")
    public ResponseEntity<MiddlewareResponse> httpAnalizar(
            @RequestPart("file") MultipartFile file,
            @org.springframework.web.bind.annotation.RequestParam(value = "formato", required = false, defaultValue = "json") String formato,
            @org.springframework.web.bind.annotation.RequestParam(value = "contrastar_bd", required = false, defaultValue = "true") Boolean contrastarBd,
            @org.springframework.web.bind.annotation.RequestParam(value = "umbral_coincidencia", required = false, defaultValue = "30.0") Double umbralCoincidencia) {
        try {
            logger.info("Iniciando análisis de archivo Excel desde el backend");
            
            // Validar archivo
            if (file == null || file.isEmpty()) {
                logger.warn("Intento de analizar archivo vacío");
                MiddlewareResponse errorResponse = new MiddlewareResponse();
                errorResponse.setExitoso(false);
                errorResponse.setMensaje("Archivo vacío");
                errorResponse.setCodigo(400);
                errorResponse.setDetalles("Debe proporcionar un archivo Excel para analizar");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            // Verificar que sea un archivo Excel
            String nombreArchivo = file.getOriginalFilename();
            if (nombreArchivo == null || (!nombreArchivo.toLowerCase().endsWith(".xlsx") && 
                    !nombreArchivo.toLowerCase().endsWith(".xls"))) {
                logger.warn("Intento de analizar archivo con formato no válido: {}", nombreArchivo);
                MiddlewareResponse errorResponse = new MiddlewareResponse();
                errorResponse.setExitoso(false);
                errorResponse.setMensaje("Formato de archivo no válido");
                errorResponse.setCodigo(400);
                errorResponse.setDetalles("Solo se permiten archivos Excel (.xlsx o .xls)");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            // Validar formato de salida
            if (formato != null && !formato.equals("json") && !formato.equals("texto")) {
                logger.warn("Formato de salida no válido: {}", formato);
                MiddlewareResponse errorResponse = new MiddlewareResponse();
                errorResponse.setExitoso(false);
                errorResponse.setMensaje("Formato de salida no válido");
                errorResponse.setCodigo(400);
                errorResponse.setDetalles("El formato debe ser 'json' o 'texto'");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }
            
            logger.info("Archivo recibido: {}, Tamaño: {} bytes, Formato salida: {}, Contrastar BD: {}, Umbral: {}%", 
                       nombreArchivo, file.getSize(), formato, contrastarBd, umbralCoincidencia);
            
            byte[] bytes = file.getBytes();
            
            // Analizar el archivo Excel
            MiddlewareResponse respuesta = pythonHttpService.analizarExcel(nombreArchivo, bytes, formato, contrastarBd, umbralCoincidencia);
            
            if (respuesta == null) {
                logger.error("Sin respuesta del middleware Python");
                MiddlewareResponse errorResponse = new MiddlewareResponse();
                errorResponse.setExitoso(false);
                errorResponse.setMensaje("Sin respuesta del middleware Python");
                errorResponse.setCodigo(500);
                errorResponse.setDetalles("El servidor Python no respondió. " +
                                         "Verifica que el servidor esté ejecutándose en http://localhost:9099. " +
                                         "Inicia el servidor con: python middleware/http_server.py o ejecuta: .\\run_middleware.ps1 server");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
            }
            
            // Retornar respuesta estructurada
            HttpStatus status = respuesta.esExitoso() ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR;
            if (respuesta.getCodigo() != null) {
                if (respuesta.getCodigo() >= 400 && respuesta.getCodigo() < 500) {
                    status = HttpStatus.BAD_REQUEST;
                } else if (respuesta.getCodigo() >= 500) {
                    status = HttpStatus.INTERNAL_SERVER_ERROR;
                }
            }
            
            logger.info("Análisis completado. Exitoso: {}, Mensaje: {}", 
                       respuesta.esExitoso(), respuesta.getMensaje());
            
            return ResponseEntity.status(status).body(respuesta);
        } catch (Exception e) {
            logger.error("Error inesperado durante el análisis: {}", e.getMessage(), e);
            MiddlewareResponse errorResponse = new MiddlewareResponse();
            errorResponse.setExitoso(false);
            errorResponse.setMensaje("Error enviando análisis");
            errorResponse.setCodigo(500);
            errorResponse.setDetalles(String.format("Error: %s (Tipo: %s)", e.getMessage(), e.getClass().getSimpleName()));
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Determina automáticamente el nombre de la tabla basándose en el nombre del archivo.
     * Remueve la extensión y convierte a minúsculas.
     * 
     * @param nombreArchivo Nombre del archivo Excel
     * @return Nombre de la tabla sugerido
     */
    private String determinarTablaDesdeNombre(String nombreArchivo) {
        if (nombreArchivo == null) {
            return "mi_tabla"; // Tabla por defecto
        }
        
        // Remover extensión
        String nombreSinExtension = nombreArchivo;
        if (nombreArchivo.toLowerCase().endsWith(".xlsx")) {
            nombreSinExtension = nombreArchivo.substring(0, nombreArchivo.length() - 5);
        } else if (nombreArchivo.toLowerCase().endsWith(".xls")) {
            nombreSinExtension = nombreArchivo.substring(0, nombreArchivo.length() - 4);
        }
        
        // Convertir a minúsculas y reemplazar espacios/guiones con guiones bajos
        return nombreSinExtension.toLowerCase()
                .replaceAll("\\s+", "_")
                .replaceAll("-", "_")
                .replaceAll("[^a-z0-9_]", "");
    }

    

    /**
     * Endpoint para insertar datos masivos de prueba.
     * 
     * Este endpoint inserta datos en todas las tablas del sistema
     * usando el script MassiveInsertFiles.py con configuración interna.
     * 
     * @return ResponseEntity<String> Respuesta con el resultado de la inserción
     */
    @PostMapping("/insertar-datos-masivos")
    @Secured({"ADMIN"})
    @Operation(summary = "Insertar datos masivos", description = "Inserta datos en todas las tablas del sistema usando MassiveInsertFiles.py - Solo ADMIN")
    public ResponseEntity<String> insertarDatosMasivos() {
        String salida = pandMiddlewareService.ejecutarInsertarDatosMasivos(5000);

        if (salida == null || salida.isBlank()) {
            return ResponseEntity.status(500).body("Sin salida del proceso de Python");
        }

        String normalized = salida.trim();

        if (normalized.contains("No se encontró el script")
                || normalized.contains("Error ejecutando MassiveInsertFiles.py")
                || normalized.contains("Ejecución interrumpida")) {
            return ResponseEntity.status(500).body(salida);
        }

        if (normalized.contains("ExitCode:") && !normalized.endsWith("ExitCode: 0")) {
            return ResponseEntity.status(500).body(salida);
        }

        return ResponseEntity.ok(salida);
    }

    /**
     * Endpoint para insertar datos masivos de prueba con cantidad personalizada.
     * 
     * Este endpoint permite especificar la cantidad de registros a insertar
     * en todas las tablas del sistema (excepto usuarios que recibe 20 registros).
     * 
     * @param numRows Número de registros a insertar (entre 1 y 100,000)
     * @return ResponseEntity<String> Respuesta con el resultado de la inserción
     *         - 200 OK: Si la inserción fue exitosa
     *         - 400 Bad Request: Si el número de filas está fuera del rango permitido
     *         - 500 Internal Server Error: Si hubo errores en la ejecución
     */
    
}



package ti.proyectoinia.api.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import ti.proyectoinia.services.PandMiddlewareService;
import ti.proyectoinia.services.PythonMiddlewareHttpService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ContentDisposition;

/**
 * Controlador REST para manejar operaciones del middleware de pandas/SQLAlchemy.
 * 
 * Este controlador proporciona endpoints para:
 * - Crear tablas en la base de datos usando scripts de Python
 * - Cargar datos desde archivos Excel
 * - Insertar datos masivos de prueba
 * - Ejecutar scripts de inserción con parámetros personalizados
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

    private final PandMiddlewareService pandMiddlewareService;
    private final PythonMiddlewareHttpService pythonHttpService;

    /**
     * Constructor del controlador.
     * 
     * @param pandMiddlewareService Servicio que maneja la ejecución de scripts de Python
     */
    public PandMiddlewareController(PandMiddlewareService pandMiddlewareService,
                                    PythonMiddlewareHttpService pythonHttpService) {
        this.pandMiddlewareService = pandMiddlewareService;
        this.pythonHttpService = pythonHttpService;
    }

  
    @PostMapping("/http/exportar")
    @Secured({"ADMIN"})
    @Operation(summary = "Exportar tablas (HTTP Python)", description = "Descarga ZIP exportado por el middleware Python - Solo ADMIN")
    public ResponseEntity<byte[]> httpExportar(
            @RequestParam(required = false) String tablas,
            @RequestParam(required = false, defaultValue = "xlsx") String formato) {
        byte[] zip = pythonHttpService.descargarExportZip(tablas, formato);
        if (zip == null || zip.length == 0) {
            return ResponseEntity.status(500).build();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDisposition(ContentDisposition.attachment().filename("export_inia.zip").build());
        return ResponseEntity.ok().headers(headers).body(zip);
    }

    

    /**
     * Endpoint para cargar datos desde un archivo Excel a la tabla mi_tabla.
     * 
     * Este endpoint permite subir un archivo Excel y procesarlo usando el script
     * pandaAlchemy.py para insertar los datos en la base de datos.
     * 
     * @param file Archivo Excel (.xlsx) que contiene los datos a cargar
     * @return ResponseEntity<String> Respuesta con el resultado de la carga
     *         - 200 OK: Si la carga fue exitosa
     *         - 400 Bad Request: Si el archivo está vacío o es inválido
     *         - 500 Internal Server Error: Si hubo errores en el procesamiento
     */
    @PostMapping(value = "/cargar-excel", consumes = {"multipart/form-data"})
    @Secured({"ADMIN"})
    @Operation(summary = "Cargar Excel a mi_talbla", description = "Sube un Excel y lo inserta en la tabla mi_talbla usando pandaAlchemy.py - Solo ADMIN")
    public ResponseEntity<String> cargarExcel(@RequestPart("file") MultipartFile file) {
        try {
            // Validar que el archivo no esté vacío
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("Archivo vacío");
            }

            // Crear directorio temporal en la carpeta Middleware para evitar problemas de rutas
            java.nio.file.Path tempDir = java.nio.file.Paths.get(System.getProperty("user.dir"), "Middleware");
            java.nio.file.Files.createDirectories(tempDir);
            
            // Crear archivo temporal con el contenido del Excel
            java.nio.file.Path tempFile = java.nio.file.Files.createTempFile(tempDir, "excel_", ".xlsx");
            file.transferTo(tempFile.toFile());

            // Ejecutar el script de Python para procesar el Excel
            String salida = pandMiddlewareService.ejecutarInsertarDesdeExcel(tempFile.toString());

            String normalized = salida == null ? "" : salida.trim();
            
            // Verificar errores en la ejecución del script
            if (normalized.contains("No se encontró el script")
                    || normalized.contains("Error ejecutando pandaAlchemy.py")
                    || normalized.contains("Ejecución interrumpida")
                    || (normalized.contains("ExitCode:") && !normalized.endsWith("ExitCode: 0"))) {
                return ResponseEntity.status(500).body(salida);
            }

            return ResponseEntity.ok(salida);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error procesando archivo: " + e.getMessage());
        }
    }

    /**
     * Endpoint para insertar datos masivos de prueba con cantidad por defecto.
     * 
     * Este endpoint inserta 5000 registros en todas las tablas del sistema
     * (excepto usuarios que recibe 20 registros) usando el script InsertTablesHere.py.
     * 
     * @return ResponseEntity<String> Respuesta con el resultado de la inserción
     */
    @PostMapping("/insertar-datos-masivos")
    @Secured({"ADMIN"})
    @Operation(summary = "Insertar datos masivos", description = "Inserta 5000 registros en todas las tablas excepto usuarios (20 registros) usando InsertTablesHere.py - Solo ADMIN")
    public ResponseEntity<String> insertarDatosMasivos() {
        String salida = pandMiddlewareService.ejecutarInsertarDatosMasivos(5000);

        if (salida == null || salida.isBlank()) {
            return ResponseEntity.status(500).body("Sin salida del proceso de Python");
        }

        String normalized = salida.trim();

        if (normalized.contains("No se encontró el script")
                || normalized.contains("Error ejecutando InsertTablesHere.py")
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



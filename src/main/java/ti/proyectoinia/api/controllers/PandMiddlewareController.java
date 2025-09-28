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

    /**
     * Constructor del controlador.
     * 
     * @param pandMiddlewareService Servicio que maneja la ejecución de scripts de Python
     */
    public PandMiddlewareController(PandMiddlewareService pandMiddlewareService) {
        this.pandMiddlewareService = pandMiddlewareService;
    }

    /**
     * Endpoint para crear tablas en la base de datos usando el script pandaAlchemy.py.
     * 
     * Este endpoint ejecuta el script de Python que utiliza pandas y SQLAlchemy
     * para crear las tablas necesarias en la base de datos del sistema.
     * 
     * @return ResponseEntity<String> Respuesta con el resultado de la ejecución del script
     *         - 200 OK: Si la ejecución fue exitosa
     *         - 500 Internal Server Error: Si hubo errores en la ejecución
     */
    @PostMapping("/crear-tabla")
    @Secured({"ADMIN"})
    @Operation(summary = "Crear tabla con pandaAlchemy", description = "Ejecuta el script pandaAlchemy.py para crear la tabla en BD - Solo ADMIN")
    public ResponseEntity<String> crearTabla() {
        // Ejecutar el script de Python para crear tablas
        String salida = pandMiddlewareService.ejecutarCrearTabla();
        
        // Validar que se obtuvo una respuesta del script
        if (salida == null || salida.isBlank()) {
            return ResponseEntity.status(500).body("Sin salida del proceso de Python");
        }

        String normalized = salida.trim();
        
        // Verificar errores obvios en la salida del script
        if (normalized.contains("No se encontró el script")
                || normalized.contains("Error ejecutando pandaAlchemy.py")
                || normalized.contains("Ejecución interrumpida")) {
            return ResponseEntity.status(500).body(salida);
        }

        // Verificar si el proceso terminó con código de error
        if (normalized.contains("ExitCode:") && !normalized.endsWith("ExitCode: 0")) {
            return ResponseEntity.status(500).body(salida);
        }

        // Si todo salió bien, devolver la salida del script
        return ResponseEntity.ok(salida);
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
        return insertarDatosMasivos(5000);
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
    @PostMapping("/insertar-datos-masivos/{numRows}")
    @Secured({"ADMIN"})
    @Operation(summary = "Insertar datos masivos personalizado", description = "Inserta la cantidad especificada de registros en todas las tablas excepto usuarios (20 registros) usando InsertTablesHere.py - Solo ADMIN")
    public ResponseEntity<String> insertarDatosMasivos(@RequestParam int numRows) {
        // Validar que el número de filas esté dentro del rango permitido
        if (numRows < 1 || numRows > 100000) {
            return ResponseEntity.badRequest().body("El número de filas debe estar entre 1 y 100,000");
        }

        // Ejecutar el script de Python para insertar datos masivos
        String salida = pandMiddlewareService.ejecutarInsertarDatosMasivos(numRows);
        
        // Validar que se obtuvo una respuesta del script
        if (salida == null || salida.isBlank()) {
            return ResponseEntity.status(500).body("Sin salida del proceso de Python");
        }

        String normalized = salida.trim();
        
        // Verificar errores obvios en la salida del script
        if (normalized.contains("No se encontró el script")
                || normalized.contains("Error ejecutando InsertTablesHere.py")
                || normalized.contains("Ejecución interrumpida")) {
            return ResponseEntity.status(500).body(salida);
        }

        // Verificar si el proceso terminó con código de error
        if (normalized.contains("ExitCode:") && !normalized.endsWith("ExitCode: 0")) {
            return ResponseEntity.status(500).body(salida);
        }

        // Si todo salió bien, devolver la salida del script
        return ResponseEntity.ok(salida);
    }

    /**
     * Endpoint para ejecutar el script InsertTablesHere.py con parámetros personalizados.
     * 
     * Este endpoint permite ejecutar el script de inserción de datos con configuraciones
     * específicas como número de filas, tablas específicas a procesar, o tablas a omitir.
     * 
     * @param rows Número de registros a insertar (por defecto 5000, entre 1 y 100,000)
     * @param onlyTables Lista de tablas específicas a procesar (opcional)
     * @param skipTables Lista de tablas a omitir durante el procesamiento (opcional)
     * @return ResponseEntity<String> Respuesta con el resultado de la ejecución
     *         - 200 OK: Si la ejecución fue exitosa
     *         - 400 Bad Request: Si los parámetros son inválidos
     *         - 500 Internal Server Error: Si hubo errores en la ejecución
     */
    @PostMapping("/ejecutar-insert-script")
    @Secured({"ADMIN"})
    @Operation(summary = "Ejecutar script InsertTablesHere.py con parámetros", 
               description = "Ejecuta el script InsertTablesHere.py con parámetros personalizados - Solo ADMIN")
    public ResponseEntity<String> ejecutarInsertScript(
            @RequestParam(defaultValue = "5000") int rows,
            @RequestParam(required = false) String onlyTables,
            @RequestParam(required = false) String skipTables) {
        
        // Validar que el número de filas esté dentro del rango permitido
        if (rows < 1 || rows > 100000) {
            return ResponseEntity.badRequest().body("El número de filas debe estar entre 1 y 100,000");
        }

        // Ejecutar el script de Python con los parámetros especificados
        String salida = pandMiddlewareService.ejecutarInsertScriptConParametros(rows, onlyTables, skipTables);
        
        // Validar que se obtuvo una respuesta del script
        if (salida == null || salida.isBlank()) {
            return ResponseEntity.status(500).body("Sin salida del proceso de Python");
        }

        String normalized = salida.trim();
        
        // Verificar errores obvios en la salida del script
        if (normalized.contains("No se encontró el script")
                || normalized.contains("Error ejecutando InsertTablesHere.py")
                || normalized.contains("Ejecución interrumpida")) {
            return ResponseEntity.status(500).body(salida);
        }

        // Verificar si el proceso terminó con código de error
        if (normalized.contains("ExitCode:") && !normalized.endsWith("ExitCode: 0")) {
            return ResponseEntity.status(500).body(salida);
        }

        // Si todo salió bien, devolver la salida del script
        return ResponseEntity.ok(salida);
    }
}



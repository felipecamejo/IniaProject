package ti.proyectoinia.api.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
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

/**
 * Controlador REST para manejar operaciones del middleware de pandas/SQLAlchemy.
 * 
 * Este controlador proporciona endpoints para:
 * - Exportar tablas a Excel usando el servidor HTTP Python
 * - Importar datos desde archivos Excel automáticamente
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
    @Operation(summary = "Exportar tablas (HTTP Python)", description = "Exporta todas las tablas a Excel y descarga automáticamente el archivo ZIP - Solo ADMIN")
    public ResponseEntity<byte[]> httpExportar() {
        try {
            // Exportar todas las tablas sin especificar tabla específica
            byte[] zip = pythonHttpService.descargarExportZip(null, "xlsx");
            if (zip == null) {
                return ResponseEntity.status(500).body("Error en la exportación - el servicio Python no respondió o retornó null".getBytes());
            }
            if (zip.length == 0) {
                return ResponseEntity.status(500).body("Error en la exportación - se generó un archivo vacío".getBytes());
            }
            
            // Configurar headers para descarga automática del archivo ZIP
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "export_tablas.xlsx.zip");
            headers.setContentLength(zip.length);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(zip);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(("Error durante la exportación: " + e.getMessage() + 
                    " (Tipo: " + e.getClass().getSimpleName() + ")").getBytes());
        }
    }

    

    @PostMapping(value = "/http/importar", consumes = {"multipart/form-data"})
    @Secured({"ADMIN"})
    @Operation(summary = "Importar Excel automático", description = "Carga archivo Excel automáticamente a la base de datos - Solo ADMIN")
    public ResponseEntity<String> httpImportar(
            @RequestPart("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("Archivo vacío");
            }
            
            // Verificar que sea un archivo Excel
            String nombreArchivo = file.getOriginalFilename();
            if (nombreArchivo == null || (!nombreArchivo.toLowerCase().endsWith(".xlsx") && !nombreArchivo.toLowerCase().endsWith(".xls"))) {
                return ResponseEntity.badRequest().body("Solo se permiten archivos Excel (.xlsx o .xls)");
            }
            
            byte[] bytes = file.getBytes();
            
            // Determinar automáticamente la tabla basándose en el nombre del archivo
            // Por ejemplo, si el archivo se llama "usuarios.xlsx", la tabla será "usuarios"
            String tabla = determinarTablaDesdeNombre(nombreArchivo);
            
            // Importar con configuración automática (upsert=false, keep_ids=false por defecto)
            String respuesta = pythonHttpService.importarTabla(tabla, false, false, nombreArchivo, bytes);
            if (respuesta == null || respuesta.isBlank()) {
                return ResponseEntity.status(500).body("Sin respuesta del middleware Python");
            }
            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error enviando importación: " + e.getMessage());
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



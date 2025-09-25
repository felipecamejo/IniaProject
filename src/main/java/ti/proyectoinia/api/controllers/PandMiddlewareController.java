package ti.proyectoinia.api.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import ti.proyectoinia.services.PandMiddlewareService;

@RestController
@RequestMapping("api/pandmiddleware")
@Tag(name = "PandMiddleware", description = "Endpoints para ejecutar el middleware de pandas/SQLAlchemy")
public class PandMiddlewareController {

    private final PandMiddlewareService pandMiddlewareService;

    public PandMiddlewareController(PandMiddlewareService pandMiddlewareService) {
        this.pandMiddlewareService = pandMiddlewareService;
    }

    @PostMapping("/crear-tabla")
    @Operation(summary = "Crear tabla con pandaAlchemy", description = "Ejecuta el script pandaAlchemy.py para crear la tabla en BD")
    public ResponseEntity<String> crearTabla() {
        String salida = pandMiddlewareService.ejecutarCrearTabla();
        if (salida == null || salida.isBlank()) {
            return ResponseEntity.status(500).body("Sin salida del proceso de Python");
        }

        String normalized = salida.trim();
        // Errores obvios: script no encontrado o fallas de ejecución
        if (normalized.contains("No se encontró el script")
                || normalized.contains("Error ejecutando pandaAlchemy.py")
                || normalized.contains("Ejecución interrumpida")) {
            return ResponseEntity.status(500).body(salida);
        }

        // Si el proceso devolvió un ExitCode distinto de 0, responder 500
        if (normalized.contains("ExitCode:") && !normalized.endsWith("ExitCode: 0")) {
            return ResponseEntity.status(500).body(salida);
        }

        return ResponseEntity.ok(salida);
    }

    @PostMapping(value = "/cargar-excel", consumes = {"multipart/form-data"})
    @Operation(summary = "Cargar Excel a mi_talbla", description = "Sube un Excel y lo inserta en la tabla mi_talbla usando pandaAlchemy.py")
    public ResponseEntity<String> cargarExcel(@RequestPart("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("Archivo vacío");
            }

            // Guardar temporalmente el archivo en el directorio del script para evitar problemas de rutas
            java.nio.file.Path tempDir = java.nio.file.Paths.get(System.getProperty("user.dir"), "Middleware");
            java.nio.file.Files.createDirectories(tempDir);
            java.nio.file.Path tempFile = java.nio.file.Files.createTempFile(tempDir, "excel_", ".xlsx");
            file.transferTo(tempFile.toFile());

            String salida = pandMiddlewareService.ejecutarInsertarDesdeExcel(tempFile.toString());

            String normalized = salida == null ? "" : salida.trim();
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

    @PostMapping("/insertar-datos-masivos")
    @Operation(summary = "Insertar datos masivos", description = "Inserta 5000 registros en todas las tablas excepto usuarios (20 registros) usando InsertTablesHere.py")
    public ResponseEntity<String> insertarDatosMasivos() {
        String salida = pandMiddlewareService.ejecutarInsertarDatosMasivos();
        if (salida == null || salida.isBlank()) {
            return ResponseEntity.status(500).body("Sin salida del proceso de Python");
        }

        String normalized = salida.trim();
        // Errores obvios: script no encontrado o fallas de ejecución
        if (normalized.contains("No se encontró el script")
                || normalized.contains("Error ejecutando InsertTablesHere.py")
                || normalized.contains("Ejecución interrumpida")) {
            return ResponseEntity.status(500).body(salida);
        }

        // Si el proceso devolvió un ExitCode distinto de 0, responder 500
        if (normalized.contains("ExitCode:") && !normalized.endsWith("ExitCode: 0")) {
            return ResponseEntity.status(500).body(salida);
        }

        return ResponseEntity.ok(salida);
    }
}



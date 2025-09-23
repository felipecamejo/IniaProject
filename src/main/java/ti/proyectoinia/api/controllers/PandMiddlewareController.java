package ti.proyectoinia.api.controllers;

import org.springframework.http.ResponseEntity;
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
}



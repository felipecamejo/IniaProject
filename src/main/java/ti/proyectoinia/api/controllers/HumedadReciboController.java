package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import lombok.Generated;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectoinia.dtos.HumedadReciboDto;
import ti.proyectoinia.services.HumedadReciboService;
import java.util.List;

@RestController
@RequestMapping({"api/v1/humedadRecibo"})
public class HumedadReciboController {

    @Generated
    private final HumedadReciboService humedadReciboService;

    public HumedadReciboController(HumedadReciboService humedadReciboService) {
        this.humedadReciboService = humedadReciboService;
    }

    @PostMapping({"/crear"})
    @Secured({"ADMIN"})
    @Operation(description = "Crea una nueva HumedadRecibo")
    public ResponseEntity<String> crearHumedadRecibo(@RequestBody HumedadReciboDto dto) {
        if (dto.getLugar() == null || dto.getNumero() == null) {
            return new ResponseEntity<>("Lugar y número son obligatorios", HttpStatus.BAD_REQUEST);
        }
        dto.setId(null);
        String response = humedadReciboService.crearHumedadRecibo(dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping({"/listar"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    public ResponseEntity<List<HumedadReciboDto>> listarHumedades() {
        List<HumedadReciboDto> lista = humedadReciboService.listarHumedades();
        return new ResponseEntity<>(lista, HttpStatus.OK);
    }

    @GetMapping("/recibo/{reciboId}")
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(description = "Obtiene todas las humedades asociadas a un recibo")
    public ResponseEntity<List<HumedadReciboDto>> getHumedadesPorRecibo(@PathVariable Long reciboId) {
        List<HumedadReciboDto> lista = humedadReciboService.obtenerHumedadesPorRecibo(reciboId);
        return new ResponseEntity<>(lista, HttpStatus.OK);
    }

    @PostMapping("/crear-multiple")
    @Secured({"ADMIN"})
    @Operation(description = "Crea múltiples HumedadRecibo en una sola llamada")
    public ResponseEntity<Object> crearMultiplesHumedades(@RequestBody List<HumedadReciboDto> dtos) {
        // Validar cada dto: lugar y numero son obligatorios para crear
        List<HumedadReciboDto> validos = new java.util.ArrayList<>();
        List<java.util.Map<String, Object>> errores = new java.util.ArrayList<>();

        for (int i = 0; i < dtos.size(); i++) {
            HumedadReciboDto dto = dtos.get(i);
            if (dto.getLugar() == null || dto.getNumero() == null) {
                java.util.Map<String, Object> err = new java.util.HashMap<>();
                err.put("index", i);
                err.put("message", "Lugar y número son obligatorios");
                err.put("dto", dto);
                errores.add(err);
            } else {
                dto.setId(null);
                validos.add(dto);
            }
        }

        List<HumedadReciboDto> creadas = humedadReciboService.crearMultiplesHumedades(validos);

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("created", creadas);
        response.put("errors", errores);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping({"/editar"})
    @Secured({"ADMIN"})
    @Operation(description = "Edita una HumedadRecibo existente")
    public ResponseEntity<String> editarHumedadRecibo(@RequestBody HumedadReciboDto dto) {
        if (dto.getId() == null) {
            return new ResponseEntity<>("El id de la HumedadRecibo es obligatorio para editar", HttpStatus.BAD_REQUEST);
        }
        String response = humedadReciboService.editarHumedadRecibo(dto);
        if (response.contains("correctamente")) {
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/editar-multiple")
    @Secured({"ADMIN"})
    @Operation(description = "Edita múltiples HumedadRecibo en una sola llamada")
    public ResponseEntity<Object> editarMultiplesHumedades(@RequestBody List<HumedadReciboDto> dtos) {
        // Validación previa: cada dto debe tener lugar y numero.
        // No exigimos id: si viene null, el servicio lo tratará como creación.
        List<HumedadReciboDto> validos = new java.util.ArrayList<>();
        List<java.util.Map<String, Object>> errores = new java.util.ArrayList<>();

        for (int i = 0; i < dtos.size(); i++) {
            HumedadReciboDto dto = dtos.get(i);
            if (dto.getLugar() == null || dto.getNumero() == null) {
                java.util.Map<String, Object> err = new java.util.HashMap<>();
                err.put("index", i);
                err.put("message", "Lugar y número son obligatorios");
                err.put("dto", dto);
                errores.add(err);
            } else {
                // Aceptar el DTO aunque su id sea null; el servicio decidirá crear o editar
                validos.add(dto);
            }
        }

        // Llamar al servicio para procesar los válidos
        java.util.Map<String, Object> serviceResult = humedadReciboService.editarMultiplesHumedades(validos);

        // Obtener listas devueltas por el servicio
        java.util.List<HumedadReciboDto> editadas = (java.util.List<HumedadReciboDto>) serviceResult.getOrDefault("edited", new java.util.ArrayList<>());
        java.util.List<HumedadReciboDto> creadas = (java.util.List<HumedadReciboDto>) serviceResult.getOrDefault("created", new java.util.ArrayList<>());
        java.util.List<java.util.Map<String, Object>> serviceErrors = (java.util.List<java.util.Map<String, Object>>) serviceResult.getOrDefault("errors", new java.util.ArrayList<>());

        // Combinar errores de validación y errores devueltos por el servicio
        java.util.List<Object> allErrors = new java.util.ArrayList<>();
        allErrors.addAll(errores);
        allErrors.addAll(serviceErrors);

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("edited", editadas);
        response.put("created", creadas);
        response.put("errors", allErrors);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/eliminar-multiple")
    @Secured({"ADMIN"})
    @Operation(description = "Elimina múltiples HumedadRecibo (soft-delete) en una sola llamada")
    public ResponseEntity<Object> eliminarMultiples(@RequestBody List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return new ResponseEntity<>(java.util.Collections.singletonMap("message", "No se recibieron ids"), HttpStatus.BAD_REQUEST);
        }

        java.util.Map<String, Object> result = humedadReciboService.eliminarMultiplesHumedades(ids);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}

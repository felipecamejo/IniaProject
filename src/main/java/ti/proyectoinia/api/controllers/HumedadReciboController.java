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

    @GetMapping("/recibo/{reciboId}")
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(description = "Obtiene todas las humedades asociadas a un recibo")
    public ResponseEntity<List<HumedadReciboDto>> getHumedadesPorRecibo(@PathVariable Long reciboId) {
        List<HumedadReciboDto> lista = humedadReciboService.obtenerHumedadesPorRecibo(reciboId);
        return new ResponseEntity<>(lista, HttpStatus.OK);
    }

    @PutMapping("/actualizar-humedades/{reciboId}")
    @Secured({"ADMIN", "ANALISTA"})
    @Operation(description = "Reemplaza todas las HumedadRecibo de un recibo: borra físicamente las existentes y crea las recibidas")
    public ResponseEntity<Object> actualizarHumedades(@PathVariable Long reciboId, @RequestBody List<HumedadReciboDto> dtos) {
        // Validar cada dto: lugar y numero son obligatorios para crear
        List<HumedadReciboDto> validos = new java.util.ArrayList<>();
        List<java.util.Map<String, Object>> errores = new java.util.ArrayList<>();

        if (dtos != null) {
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
                    dto.setReciboId(reciboId);
                    validos.add(dto);
                }
            }
        }

        try {
            // Borra físicamente todas las humedades del recibo y crea las nuevas válidas
            humedadReciboService.actualizarHumedadesCompleto(reciboId, validos);

            // Recuperar las creadas para devolverlas en la respuesta
            List<HumedadReciboDto> creadas = humedadReciboService.obtenerHumedadesPorRecibo(reciboId);

            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("created", creadas);
            response.put("errors", errores);

            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al actualizar humedades: " + e.getMessage());
        }
    }

}

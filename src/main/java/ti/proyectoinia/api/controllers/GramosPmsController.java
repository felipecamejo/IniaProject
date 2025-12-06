package ti.proyectoinia.api.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import ti.proyectoinia.dtos.GramosPmsDto;
import ti.proyectoinia.services.GramosPmsService;

@RestController
@RequestMapping("api/v1/gramos-pms")
public class GramosPmsController {

    @Autowired
    private GramosPmsService gramosPmsService;

    @GetMapping("/pms/{pmsId}")
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(description = "Obtiene todos los gramos asociados a un PMS")
    public ResponseEntity<List<GramosPmsDto>> getGramosPorPms(@PathVariable Long pmsId) {
        List<GramosPmsDto> lista = gramosPmsService.obtenerGramosPorPms(pmsId);
        return new ResponseEntity<>(lista, HttpStatus.OK);
    }

    @PostMapping("/crear-multiple")
    @Secured({"ADMIN", "ANALISTA"})
    @Operation(description = "Crea múltiples GramosPms en una sola llamada")
    public ResponseEntity<Object> crearMultiples(@RequestBody List<GramosPmsDto> dtos) {
        List<GramosPmsDto> validos = new java.util.ArrayList<>();
        List<Map<String, Object>> errores = new java.util.ArrayList<>();

        for (int i = 0; i < dtos.size(); i++) {
            GramosPmsDto dto = dtos.get(i);
            if (dto.getPmsId() == null) {
                Map<String, Object> err = new java.util.HashMap<>();
                err.put("index", i);
                err.put("message", "pmsId es obligatorio");
                err.put("dto", dto);
                errores.add(err);
            } else {
                dto.setId(null);
                validos.add(dto);
            }
        }

        List<GramosPmsDto> creadas = gramosPmsService.crearMultiplesGramos(validos);

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("created", creadas);
        response.put("errors", errores);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

}

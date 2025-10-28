package ti.proyectoinia.api.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import ti.proyectoinia.dtos.ViabilidadRepsTetrazolioDto;
import ti.proyectoinia.services.ViabilidadRepsTetrazolioService;

@RestController
@RequestMapping("api/v1/viabilidad-reps-tetrazolio")
public class ViabilidadRepsTetrazolioController {

    @Autowired
    private ViabilidadRepsTetrazolioService viabilidadRepsTetrazolioService;

    @GetMapping("/tetrazolio/{tetrazolioId}")
    //@Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(description = "Obtiene todos los viabilidades asociados a un Tetrazolio")
    public ResponseEntity<List<ViabilidadRepsTetrazolioDto>> getViabilidadPorTetrazolio(@PathVariable Long tetrazolioId) {
        List<ViabilidadRepsTetrazolioDto> lista = viabilidadRepsTetrazolioService.obtenerViabilidadPorTetrazolio(tetrazolioId);
        return new ResponseEntity<>(lista, HttpStatus.OK);
    }

    @PostMapping("/crear-multiple")
    //@Secured({"ADMIN"})
    @Operation(description = "Crea múltiples ViabilidadRepsTetrazolio en una sola llamada")
    public ResponseEntity<Object> crearMultiples(@RequestBody List<ViabilidadRepsTetrazolioDto> dtos) {
        List<ViabilidadRepsTetrazolioDto> validos = new java.util.ArrayList<>();
        List<Map<String, Object>> errores = new java.util.ArrayList<>();

        for (int i = 0; i < dtos.size(); i++) {
            ViabilidadRepsTetrazolioDto dto = dtos.get(i);
            if (dto.getTetrazolioId() == null) {
                Map<String, Object> err = new java.util.HashMap<>();
                err.put("index", i);
                err.put("message", "tetrazolioId es obligatorio");
                err.put("dto", dto);
                errores.add(err);
            } else {
                dto.setId(null);
                dto.setActivo(true);
                validos.add(dto);
            }
        }

        List<ViabilidadRepsTetrazolioDto> creadas = viabilidadRepsTetrazolioService.crearMultiplesViabilidad(validos);

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("created", creadas);
        response.put("errors", errores);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/editar-multiple")
    //Secured({"ADMIN"})
    @Operation(description = "Edita múltiples ViabilidadRepsTetrazolio en una sola llamada")
    public ResponseEntity<Object> editarMultiples(@RequestBody List<ViabilidadRepsTetrazolioDto> dtos) {
        List<ViabilidadRepsTetrazolioDto> validos = new java.util.ArrayList<>();
        List<Map<String, Object>> errores = new java.util.ArrayList<>();

        for (int i = 0; i < dtos.size(); i++) {
            ViabilidadRepsTetrazolioDto dto = dtos.get(i);
            if (dto.getTetrazolioId() == null) {
                Map<String, Object> err = new java.util.HashMap<>();
                err.put("index", i);
                err.put("message", "tetrazolioId es obligatorio");
                err.put("dto", dto);
                errores.add(err);
            } else {
                validos.add(dto);
            }
        }

        java.util.Map<String, Object> serviceResult = viabilidadRepsTetrazolioService.editarMultiplesViabilidad(validos);

        @SuppressWarnings("unchecked")
        java.util.List<ViabilidadRepsTetrazolioDto> editadas = (java.util.List<ViabilidadRepsTetrazolioDto>) serviceResult.getOrDefault("edited", new java.util.ArrayList<>());
        @SuppressWarnings("unchecked")
        java.util.List<ViabilidadRepsTetrazolioDto> creadas = (java.util.List<ViabilidadRepsTetrazolioDto>) serviceResult.getOrDefault("created", new java.util.ArrayList<>());
        @SuppressWarnings("unchecked")
        java.util.List<java.util.Map<String, Object>> serviceErrors = (java.util.List<java.util.Map<String, Object>>) serviceResult.getOrDefault("errors", new java.util.ArrayList<>());

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
    //@Secured({"ADMIN"})
    @Operation(description = "Elimina múltiples ViabilidadRepsTetrazolio (soft-delete) en una sola llamada")
    public ResponseEntity<Object> eliminarMultiples(@RequestBody List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return new ResponseEntity<>(java.util.Collections.singletonMap("message", "No se recibieron ids"), HttpStatus.BAD_REQUEST);
        }

        java.util.Map<String, Object> result = viabilidadRepsTetrazolioService.eliminarMultiplesViabilidad(ids);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @PutMapping("/actualizar-completo/{tetrazolioId}")
    //@Secured({"ADMIN"})
    @Operation(description = "Sincroniza todas las repeticiones de un Tetrazolio (upsert + soft-delete)")
    public ResponseEntity<Object> actualizarCompleto(
            @PathVariable Long tetrazolioId,
            @RequestBody java.util.List<ViabilidadRepsTetrazolioDto> dtos) {

        java.util.Map<String, Object> res = viabilidadRepsTetrazolioService.actualizarRepeticionesCompleto(tetrazolioId, dtos);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }
}

package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectoinia.dtos.ConteoGerminacionDto;
import ti.proyectoinia.dtos.NormalPorConteoDto;
import ti.proyectoinia.dtos.RepeticionFinalDto;
import ti.proyectoinia.services.GerminacionMatrizService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/v1/germinacion/tablas")
public class GerminacionTablasController {

    private final GerminacionMatrizService service;

    public GerminacionTablasController(GerminacionMatrizService service) {
        this.service = service;
    }

    @PostMapping("/{germinacionId}/conteos")
    @Secured({"ADMIN"})
    @Operation(description = "Crea un nuevo conteo para la germinación indicada. Si no se indica numeroConteo, se asigna el siguiente correlativo.")
    public ResponseEntity<?> crearConteo(@PathVariable Long germinacionId, @RequestBody(required = false) ConteoGerminacionDto body) {
        try {
            ConteoGerminacionDto creado = service.addConteo(germinacionId, body);
            return new ResponseEntity<>(creado, HttpStatus.CREATED);
        } catch (IllegalArgumentException | IllegalStateException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al crear conteo: " + ex.getMessage());
        }
    }

    @GetMapping("/{germinacionId}/conteos")
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(description = "Lista los conteos de una germinación ordenados por numeroConteo asc.")
    public ResponseEntity<List<ConteoGerminacionDto>> listarConteos(@PathVariable Long germinacionId) {
        List<ConteoGerminacionDto> lista = service.listConteos(germinacionId);
        return ResponseEntity.ok(lista);
    }

    @PutMapping("/normales/{tabla}")
    @Secured({"ADMIN"})
    @Operation(description = "Crea o actualiza el valor 'normal' para una repetición en un conteo específico. Tabla: SIN_CURAR | CURADA_PLANTA | CURADA_LABORATORIO.")
    public ResponseEntity<?> upsertNormal(@PathVariable String tabla, @RequestBody NormalPorConteoDto body) {
        try {
            NormalPorConteoDto saved = service.upsertNormal(tabla, body);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al guardar normal: " + ex.getMessage());
        }
    }

    @PutMapping("/finales/{tabla}")
    @Secured({"ADMIN"})
    @Operation(description = "Crea o actualiza los valores finales (anormal, duras, frescas, muertas) para una repetición. Tabla: SIN_CURAR | CURADA_PLANTA | CURADA_LABORATORIO.")
    public ResponseEntity<?> upsertFinales(@PathVariable String tabla, @RequestBody RepeticionFinalDto body) {
        try {
            RepeticionFinalDto saved = service.upsertRepeticionFinal(tabla, body);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al guardar finales: " + ex.getMessage());
        }
    }

    @GetMapping("/{germinacionId}/resumen")
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(description = "Devuelve un resumen estructurado para la germinación: lista de conteos, normales por conteo para cada tratamiento y finales por repetición.")
    public ResponseEntity<Map<String, Object>> obtenerResumen(@PathVariable Long germinacionId) {
        Map<String, Object> matriz = service.listMatriz(germinacionId);
        return ResponseEntity.ok(matriz);
    }

    @PostMapping("/{germinacionId}/celdas/{tabla}/repeticiones/{numeroRepeticion}")
    @Secured({"ADMIN"})
    @Operation(description = "Crea (si no existe) la repetición finales para la tabla dada y genera sus celdas 'normal' (NormalPorConteo) en todos los conteos existentes. Si no hay conteos, crea el Conteo 1. Si envías 0 como numeroRepeticion, el backend asigna el siguiente correlativo.")
    public ResponseEntity<?> agregarRepeticionATodosLosConteos(
            @PathVariable Long germinacionId,
            @PathVariable String tabla,
            @PathVariable Integer numeroRepeticion
    ) {
        try {
            Map<String, Object> res = service.addRepeticionAcrossConteos(germinacionId, tabla, numeroRepeticion);
            return new ResponseEntity<>(res, HttpStatus.CREATED);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al agregar repetición: " + ex.getMessage());
        }
    }

    @PostMapping("/{germinacionId}/celdas/{tabla}/repeticiones")
    @Secured({"ADMIN"})
    @Operation(description = "Crea (si no existe) la repetición finales AUTO-NUMERADA para la tabla dada y genera sus celdas 'normal' (NormalPorConteo) en todos los conteos existentes. Si no hay conteos, crea el Conteo 1.")
    public ResponseEntity<?> agregarRepeticionAutoNumerada(
            @PathVariable Long germinacionId,
            @PathVariable String tabla
    ) {
        try {
            Map<String, Object> res = service.addRepeticionAcrossConteos(germinacionId, tabla, null);
            return new ResponseEntity<>(res, HttpStatus.CREATED);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al agregar repetición: " + ex.getMessage());
        }
    }
}

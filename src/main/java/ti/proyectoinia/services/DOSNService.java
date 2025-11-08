package ti.proyectoinia.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.ErrorResponse;
import org.springframework.web.server.ResponseStatusException;
import ti.proyectoinia.api.responses.ResponseListadoDOSN;
import ti.proyectoinia.api.responses.ResponseListadoPurezas;
import ti.proyectoinia.business.entities.Cultivo;
import ti.proyectoinia.business.entities.DOSN;
import ti.proyectoinia.business.repositories.CultivoRepository;
import ti.proyectoinia.business.repositories.DOSNRepository;
import ti.proyectoinia.business.repositories.MalezaRepository;
import ti.proyectoinia.dtos.CantidadItemDto;
import java.util.HashSet;
import java.util.Set;
import ti.proyectoinia.dtos.DOSNDto;


@Service
public class DOSNService {

    private final DOSNRepository dosnRepository;
    private final MapsDtoEntityService mapsDtoEntityService;

    @Autowired
    private CultivoRepository cultivoRepository;

    @Autowired
    private MalezaRepository malezaRepository;

    public DOSNService(DOSNRepository dosnRepository, MapsDtoEntityService mapsDtoEntityService) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.dosnRepository = dosnRepository;
    }

    public Long crearDOSN(DOSNDto dosnDto) {
        // Validaciones para arrays de IDs actuales (compatibilidad)
        if (dosnDto.getCultivosINIAId() != null) {
            for (Long cultivoId : dosnDto.getCultivosINIAId()) {
                if (cultivoId == null || !cultivoRepository.existsById(cultivoId)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El cultivo con id " + cultivoId + " no existe (INIA)");
                }
            }
        }
        if (dosnDto.getCultivosINASEId() != null) {
            for (Long cultivoId : dosnDto.getCultivosINASEId()) {
                if (cultivoId == null || !cultivoRepository.existsById(cultivoId)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El cultivo con id " + cultivoId + " no existe (INASE)");
                }
            }
        }

        // Validaciones para las nuevas colecciones con cantidades
        validateCultivosCantidad(dosnDto.getCultivosINIA(), "INIA");
        validateCultivosCantidad(dosnDto.getCultivosINASE(), "INASE");

        validateMalezasCantidad(dosnDto.getMalezasNormalesINIA(), "INIA", "NORMAL");
        validateMalezasCantidad(dosnDto.getMalezasToleradasINIA(), "INIA", "TOLERADA");
        validateMalezasCantidad(dosnDto.getMalezasToleranciaCeroINIA(), "INIA", "CERO");

        validateMalezasCantidad(dosnDto.getMalezasNormalesINASE(), "INASE", "NORMAL");
        validateMalezasCantidad(dosnDto.getMalezasToleradasINASE(), "INASE", "TOLERADA");
        validateMalezasCantidad(dosnDto.getMalezasToleranciaCeroINASE(), "INASE", "CERO");
        return this.dosnRepository.save(mapsDtoEntityService.mapToEntityDOSN(dosnDto)).getId();
    }

    public DOSNDto obtenerDOSNPorId(Long id) {
        DOSN DOSN = this.dosnRepository.findById(id).orElse(null);
        if (DOSN == null || !DOSN.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoDOSN(DOSN);
    }

    public String eliminarDOSN(Long id) {
        if (id != null) {
            this.dosnRepository.findById(id).ifPresent(dosn -> {
                dosn.setActivo(false);
                this.dosnRepository.save(dosn);
            });
        }
        return "DOSN eliminada correctamente ID:" + id;
    }

    public String editarDOSN(DOSNDto dosnDto) {
        // Validaciones para arrays de IDs actuales (compatibilidad)
        if (dosnDto.getCultivosINIAId() != null) {
            for (Long cultivoId : dosnDto.getCultivosINIAId()) {
                if (cultivoId == null || cultivoId == 0 || !cultivoRepository.existsById(cultivoId)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El cultivo con id " + cultivoId + " no existe (INIA).");
                }
            }
        }
        if (dosnDto.getCultivosINASEId() != null) {
            for (Long cultivoId : dosnDto.getCultivosINASEId()) {
                if (cultivoId == null || cultivoId == 0 || !cultivoRepository.existsById(cultivoId)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El cultivo con id " + cultivoId + " no existe (INASE).");
                }
            }
        }
        // Validaciones para las nuevas colecciones con cantidades
        validateCultivosCantidad(dosnDto.getCultivosINIA(), "INIA");
        validateCultivosCantidad(dosnDto.getCultivosINASE(), "INASE");

        validateMalezasCantidad(dosnDto.getMalezasNormalesINIA(), "INIA", "NORMAL");
        validateMalezasCantidad(dosnDto.getMalezasToleradasINIA(), "INIA", "TOLERADA");
        validateMalezasCantidad(dosnDto.getMalezasToleranciaCeroINIA(), "INIA", "CERO");

        validateMalezasCantidad(dosnDto.getMalezasNormalesINASE(), "INASE", "NORMAL");
        validateMalezasCantidad(dosnDto.getMalezasToleradasINASE(), "INASE", "TOLERADA");
        validateMalezasCantidad(dosnDto.getMalezasToleranciaCeroINASE(), "INASE", "CERO");

        DOSN dosn = mapsDtoEntityService.mapToEntityDOSN(dosnDto);
        this.dosnRepository.save(dosn);
        return "DOSN actualizada correctamente ID:" + dosn.getId();
    }

    public ResponseEntity<ResponseListadoDOSN> listadoDOSNporRecibo(Long id) {
        var activos = this.dosnRepository.findByActivoTrueAndReciboIdAndReciboActivoTrue(id);
        var dtos = activos.stream()
                .map(mapsDtoEntityService::mapToDtoDOSN)
                .toList();
        ResponseListadoDOSN responseListadoDOSN = new ResponseListadoDOSN(dtos);
        return ResponseEntity.ok(responseListadoDOSN);
    }
    // --- Métodos privados de validación ---
    private void validateCultivosCantidad(java.util.List<CantidadItemDto> items, String organismo) {
        if (items == null || items.isEmpty()) return;
        Set<Long> vistos = new HashSet<>();
        for (CantidadItemDto it : items) {
            if (it == null) continue;
            Long id = it.getId();
            if (id == null || id == 0 || !cultivoRepository.existsById(id)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "El cultivo con id " + id + " no existe (" + organismo + ").");
            }
            Integer cantidad = it.getCantidad();
            if (cantidad != null && cantidad < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "La cantidad para cultivo id " + id + " no puede ser negativa (" + organismo + ").");
            }
            if (!vistos.add(id)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Cultivo id " + id + " repetido dentro de la misma lista (" + organismo + ").");
            }
        }
    }

    private void validateMalezasCantidad(java.util.List<CantidadItemDto> items, String organismo, String categoria) {
        if (items == null || items.isEmpty()) return;
        Set<Long> vistos = new HashSet<>();
        for (CantidadItemDto it : items) {
            if (it == null) continue;
            Long id = it.getId();
            if (id == null || id == 0 || !malezaRepository.existsById(id)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "La maleza con id " + id + " no existe (" + organismo + ", " + categoria + ").");
            }
            Integer cantidad = it.getCantidad();
            if (cantidad != null && cantidad < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "La cantidad para maleza id " + id + " no puede ser negativa (" + organismo + ", " + categoria + ").");
            }
            if (!vistos.add(id)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Maleza id " + id + " repetida en la misma lista (" + organismo + ", " + categoria + ").");
            }
        }
    }
}


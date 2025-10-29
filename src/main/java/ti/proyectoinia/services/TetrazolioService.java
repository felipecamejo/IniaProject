package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadoTetrazolio;
import ti.proyectoinia.business.entities.Tetrazolio;
import ti.proyectoinia.business.entities.ViabilidadRepsTetrazolio;
import ti.proyectoinia.business.repositories.TetrazolioRepository;
import ti.proyectoinia.business.repositories.ViabilidadRepsTetrazolioRepository;
import ti.proyectoinia.dtos.TetrazolioDto;
import ti.proyectoinia.dtos.RepeticionTetrazolioDto;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;


@Service
public class TetrazolioService {

    private final TetrazolioRepository tetrazolioRepository;
    private final MapsDtoEntityService mapsDtoEntityService;
    private final ViabilidadRepsTetrazolioRepository repeticionRepository;

    public TetrazolioService(TetrazolioRepository tetrazolioRepository, 
                           MapsDtoEntityService mapsDtoEntityService,
                           ViabilidadRepsTetrazolioRepository repeticionRepository) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.tetrazolioRepository = tetrazolioRepository;
        this.repeticionRepository = repeticionRepository;
    }

    public String crearTetrazolio(TetrazolioDto tetrazolioDto) {
        return "Tetrazolio creada correctamente ID:" + this.tetrazolioRepository.save(mapsDtoEntityService.mapToEntityTetrazolio(tetrazolioDto)).getId();
    }

    public TetrazolioDto obtenerTetrazolioPorId(Long id) {
        Tetrazolio tetrazolio = this.tetrazolioRepository.findById(id).orElse(null);
        if (tetrazolio == null || !tetrazolio.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoTetrazolio(tetrazolio);
    }

    public String eliminarTetrazolio(Long id) {
        if (id != null) {
            this.tetrazolioRepository.findById(id).ifPresent(tetrazolio -> {
                tetrazolio.setActivo(false);
                this.tetrazolioRepository.save(tetrazolio);
            });
        }
        return "Tetrazolio eliminada correctamente ID:" + id;
    }

    public String editarTetrazolio(TetrazolioDto tetrazolioDto) {
        this.tetrazolioRepository.save(mapsDtoEntityService.mapToEntityTetrazolio(tetrazolioDto));
        return "Tetrazolio actualizada correctamente ID:" + tetrazolioDto.getId();
    }

    public ResponseEntity<ResponseListadoTetrazolio> listadoTetrazolioPorReciboId(Long id) {
        var activos = this.tetrazolioRepository.findByActivoTrueAndReciboIdAndReciboActivoTrue(id);
        var dtos = activos.stream()
                .map(mapsDtoEntityService::mapToDtoTetrazolio)
                .toList();
        ResponseListadoTetrazolio responseListadoTetrazolio = new ResponseListadoTetrazolio(dtos);
        return ResponseEntity.ok(responseListadoTetrazolio);
    }

    // Métodos para manejar repeticiones de Tetrazolio
    public List<RepeticionTetrazolioDto> listarRepeticionesPorTetrazolio(Long tetrazolioId) {
        List<ViabilidadRepsTetrazolio> repeticiones = repeticionRepository.findByActivoTrueAndTetrazolioId(tetrazolioId);
        return repeticiones.stream()
                .map(mapsDtoEntityService::mapToDtoRepeticionTetrazolio)
                .toList();
    }

    public void actualizarRepeticionesCompleto(Long tetrazolioId, List<RepeticionTetrazolioDto> repeticionesActuales) {
        Tetrazolio tetrazolio = tetrazolioRepository.findById(tetrazolioId).orElse(null);
        if (tetrazolio == null) throw new RuntimeException("Tetrazolio no encontrado");
        
        List<ViabilidadRepsTetrazolio> actuales = repeticionRepository.findByActivoTrueAndTetrazolioId(tetrazolioId);
        
        // Usar la lista entrante para calcular los ids que deben permanecer
        Set<Long> nuevosIds = repeticionesActuales.stream()
                .map(h -> h.getId() != null ? h.getId() : -1L)
                .collect(Collectors.toSet());

        // Eliminar los que no están en la nueva lista
        for (ViabilidadRepsTetrazolio actual : actuales) {
            if (!nuevosIds.contains(actual.getId())) {
                repeticionRepository.delete(actual);
            }
        }
        
        // Crear o actualizar los recibidos
        for (RepeticionTetrazolioDto dto : repeticionesActuales) {
            ViabilidadRepsTetrazolio repeticion;
            if (dto.getId() != null) {
                repeticion = repeticionRepository.findById(dto.getId()).orElse(new ViabilidadRepsTetrazolio());
            } else {
                repeticion = new ViabilidadRepsTetrazolio();
            }

            repeticion.setViables(dto.getViables() != null ? dto.getViables() : 0);
            repeticion.setNoViables(dto.getNoViables() != null ? dto.getNoViables() : 0);
            repeticion.setDuras(dto.getDuras() != null ? dto.getDuras() : 0);
            repeticion.setNumeroRepeticion(dto.getNumero() != null ? dto.getNumero() : 1);
            repeticion.setActivo(true);
            repeticion.setTetrazolio(tetrazolio);

            repeticionRepository.save(repeticion);
        }
    }
}

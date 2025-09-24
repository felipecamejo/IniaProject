package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadoSanitario;
import ti.proyectoinia.api.responses.ResponseListadoTetrazolio;
import ti.proyectoinia.business.entities.Tetrazolio;
import ti.proyectoinia.business.repositories.TetrazolioRepository;
import ti.proyectoinia.dtos.TetrazolioDto;


@Service
public class TetrazolioService {

    private final TetrazolioRepository tetrazolioRepository;
    private final MapsDtoEntityService mapsDtoEntityService;

    public TetrazolioService(TetrazolioRepository tetrazolioRepository, MapsDtoEntityService mapsDtoEntityService) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.tetrazolioRepository = tetrazolioRepository;
    }

    public String crearTetrazolio(TetrazolioDto tetrazolioDto) {
        this.tetrazolioRepository.save(mapsDtoEntityService.mapToEntityTetrazolio(tetrazolioDto));
        return "Tetrazolio creada correctamente ID:" + tetrazolioDto.getId();
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
}

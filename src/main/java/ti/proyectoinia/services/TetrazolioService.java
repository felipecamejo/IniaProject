package ti.proyectoinia.services;

import org.springframework.stereotype.Service;
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
        return "Tetrazolio creada correctamente";
    }

    public TetrazolioDto obtenerTetrazolioPorId(Long id) {
        Tetrazolio tetrazolio = this.tetrazolioRepository.findById(id).orElse(null);
        if (tetrazolio == null || !tetrazolio.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoTetrazolio(tetrazolio);
    }

    public String eliminarTetrazolio(Long id) {
        this.tetrazolioRepository.deleteById(id);
        return "Tetrazolio eliminada correctamente";
    }

    public String editarTetrazolio(TetrazolioDto tetrazolioDto) {
        this.tetrazolioRepository.save(mapsDtoEntityService.mapToEntityTetrazolio(tetrazolioDto));
        return "Tetrazolio actualizada correctamente";
    }

}

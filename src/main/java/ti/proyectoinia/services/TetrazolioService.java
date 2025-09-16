package ti.proyectoinia.services;

import org.springframework.stereotype.Service;
import ti.proyectoinia.business.entities.Tetrazolio;
import ti.proyectoinia.business.repositories.TetrazolioRepository;
import ti.proyectoinia.dtos.TetrazolioDto;


@Service
public class TetrazolioService {

    private final TetrazolioRepository TetrazolioRepository;
    private final MapsDtoEntityService mapsDtoEntityService;

    public TetrazolioService(TetrazolioRepository TetrazolioRepository, MapsDtoEntityService mapsDtoEntityService) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.TetrazolioRepository = TetrazolioRepository;
    }

    public String crearTetrazolio(TetrazolioDto TetrazolioDto) {
        this.TetrazolioRepository.save(mapsDtoEntityService.mapToEntityTetrazolio(TetrazolioDto));
        return "Tetrazolio creada correctamente";
    }

    public TetrazolioDto obtenerTetrazolioPorId(Long id) {
        Tetrazolio Tetrazolio = this.TetrazolioRepository.findById(id).orElse(null);
        if (Tetrazolio == null || !Tetrazolio.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoTetrazolio(Tetrazolio);
    }

    public String eliminarTetrazolio(Long id) {
        this.TetrazolioRepository.deleteById(id);
        return "Tetrazolio eliminada correctamente";
    }

    public String editarTetrazolio(TetrazolioDto TetrazolioDto) {
        this.TetrazolioRepository.save(mapsDtoEntityService.mapToEntityTetrazolio(TetrazolioDto));
        return "Tetrazolio actualizada correctamente";
    }

}

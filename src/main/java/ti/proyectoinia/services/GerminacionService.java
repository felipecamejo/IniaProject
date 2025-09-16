package ti.proyectoinia.services;

import org.springframework.stereotype.Service;
import ti.proyectoinia.business.entities.Germinacion;
import ti.proyectoinia.business.repositories.GerminacionRepository;
import ti.proyectoinia.dtos.GerminacionDto;


@Service
public class GerminacionService {

    private final GerminacionRepository germinacionRepository;
    private final MapsDtoEntityService mapsDtoEntityService;

    public GerminacionService(GerminacionRepository germinacionRepository, MapsDtoEntityService mapsDtoEntityService) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.germinacionRepository = germinacionRepository;
    }

    public String crearGerminacion(GerminacionDto germinacionDto) {
        this.germinacionRepository.save(mapsDtoEntityService.mapToEntityGerminacion(germinacionDto));
        return "Germinacion creada correctamente";
    }

    public GerminacionDto obtenerGerminacionPorId(Long id) {
        Germinacion germinacion = this.germinacionRepository.findById(id).orElse(null);
        if (germinacion == null || !germinacion.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoGerminacion(germinacion);
    }

    public String eliminarGerminacion(Long id) {
        this.germinacionRepository.deleteById(id);
        return "Germinacion eliminada correctamente";
    }

    public String editarGerminacion(GerminacionDto germinacionDto) {
        this.germinacionRepository.save(mapsDtoEntityService.mapToEntityGerminacion(germinacionDto));
        return "Germinacion actualizada correctamente";
    }

}

package ti.proyectoinia.services;

import org.springframework.stereotype.Service;
import ti.proyectoinia.business.entities.PurezaPNotatum;
import ti.proyectoinia.business.repositories.PurezaPNotatumRepository;
import ti.proyectoinia.dtos.PurezaPNotatumDto;


@Service
public class PurezaPNotatumService {

    private final PurezaPNotatumRepository PurezaPNotatumRepository;
    private final MapsDtoEntityService mapsDtoEntityService;

    public PurezaPNotatumService(PurezaPNotatumRepository PurezaPNotatumRepository, MapsDtoEntityService mapsDtoEntityService) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.PurezaPNotatumRepository = PurezaPNotatumRepository;
    }

    public String crearPurezaPNotatum(PurezaPNotatumDto PurezaPNotatumDto) {
        this.PurezaPNotatumRepository.save(mapsDtoEntityService.mapToEntityPurezaPNotatum(PurezaPNotatumDto));
        return "PurezaPNotatum creada correctamente";
    }

    public PurezaPNotatumDto obtenerPurezaPNotatumPorId(Long id) {
        PurezaPNotatum PurezaPNotatum = this.PurezaPNotatumRepository.findById(id).orElse(null);
        if (PurezaPNotatum == null || !PurezaPNotatum.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoPurezaPNotatum(PurezaPNotatum);
    }

    public String eliminarPurezaPNotatum(Long id) {
        this.PurezaPNotatumRepository.deleteById(id);
        return "PurezaPNotatum eliminada correctamente";
    }

    public String editarPurezaPNotatum(PurezaPNotatumDto PurezaPNotatumDto) {
        this.PurezaPNotatumRepository.save(mapsDtoEntityService.mapToEntityPurezaPNotatum(PurezaPNotatumDto));
        return "PurezaPNotatum actualizada correctamente";
    }

}

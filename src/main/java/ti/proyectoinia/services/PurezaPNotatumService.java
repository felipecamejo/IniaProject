package ti.proyectoinia.services;

import org.springframework.stereotype.Service;
import ti.proyectoinia.business.entities.PurezaPNotatum;
import ti.proyectoinia.business.repositories.PurezaPNotatumRepository;
import ti.proyectoinia.dtos.PurezaPNotatumDto;


@Service
public class PurezaPNotatumService {

    private final PurezaPNotatumRepository purezaPNotatumRepository;
    private final MapsDtoEntityService mapsDtoEntityService;

    public PurezaPNotatumService(PurezaPNotatumRepository purezaPNotatumRepository, MapsDtoEntityService mapsDtoEntityService) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.purezaPNotatumRepository = purezaPNotatumRepository;
    }

    public String crearPurezaPNotatum(PurezaPNotatumDto purezaPNotatumDto) {
        this.purezaPNotatumRepository.save(mapsDtoEntityService.mapToEntityPurezaPNotatum(purezaPNotatumDto));
        return "PurezaPNotatum creada correctamente";
    }

    public PurezaPNotatumDto obtenerPurezaPNotatumPorId(Long id) {
        PurezaPNotatum PurezaPNotatum = this.purezaPNotatumRepository.findById(id).orElse(null);
        if (PurezaPNotatum == null || !PurezaPNotatum.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoPurezaPNotatum(PurezaPNotatum);
    }

    public String eliminarPurezaPNotatum(Long id) {
        this.purezaPNotatumRepository.deleteById(id);
        return "PurezaPNotatum eliminada correctamente";
    }

    public String editarPurezaPNotatum(PurezaPNotatumDto purezaPNotatumDto) {
        this.purezaPNotatumRepository.save(mapsDtoEntityService.mapToEntityPurezaPNotatum(purezaPNotatumDto));
        return "PurezaPNotatum actualizada correctamente";
    }

}

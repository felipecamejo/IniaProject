package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.ErrorResponse;
import ti.proyectoinia.api.responses.ResponseListadoGerminacion;
import ti.proyectoinia.api.responses.ResponseListadoPMS;
import ti.proyectoinia.api.responses.ResponseListadoPurezaPNotatum;
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
        return "PurezaPNotatum creada correctamente ID:" + purezaPNotatumDto.getId();
    }

    public PurezaPNotatumDto obtenerPurezaPNotatumPorId(Long id) {
        PurezaPNotatum PurezaPNotatum = this.purezaPNotatumRepository.findById(id).orElse(null);
        if (PurezaPNotatum == null || !PurezaPNotatum.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoPurezaPNotatum(PurezaPNotatum);
    }

    public String eliminarPurezaPNotatum(Long id) {
        if (id != null) {
            this.purezaPNotatumRepository.findById(id).ifPresent(purezaPNotatum -> {
                purezaPNotatum.setActivo(false);
                this.purezaPNotatumRepository.save(purezaPNotatum);
            });
        }
        return "PurezaPNotatum eliminada correctamente ID:" + id;
    }

    public String editarPurezaPNotatum(PurezaPNotatumDto purezaPNotatumDto) {
        this.purezaPNotatumRepository.save(mapsDtoEntityService.mapToEntityPurezaPNotatum(purezaPNotatumDto));
        return "PurezaPNotatum actualizada correctamente ID:" + purezaPNotatumDto.getId();
    }

    public ResponseEntity<ResponseListadoPurezaPNotatum> listadoPurezaPNotatumporRecibo(Long id) {
        var activos = this.purezaPNotatumRepository.findByActivoTrueAndReciboIdAndReciboActivoTrue(id);
        var dto = activos.stream()
                .map(mapsDtoEntityService::mapToDtoPurezaPNotatum)
                .toList();
        ResponseListadoPurezaPNotatum responseListadoPurezaPNotatum= new ResponseListadoPurezaPNotatum(dto);
        return ResponseEntity.ok(responseListadoPurezaPNotatum);
    }
}

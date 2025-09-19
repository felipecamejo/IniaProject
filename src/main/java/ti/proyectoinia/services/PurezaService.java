package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadoMalezas;
import ti.proyectoinia.api.responses.ResponseListadoPurezas;
import ti.proyectoinia.business.entities.Pureza;
import ti.proyectoinia.business.repositories.PurezaRepository;
import ti.proyectoinia.dtos.PurezaDto;

@Service
public class PurezaService {

    private final PurezaRepository purezaRepository;
    private final MapsDtoEntityService mapsDtoEntityService;

    public PurezaService(PurezaRepository purezaRepository, MapsDtoEntityService mapsDtoEntityService) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.purezaRepository = purezaRepository;
    }

    public String crearPureza(PurezaDto dto) {
        this.purezaRepository.save(mapsDtoEntityService.mapToEntityPureza(dto));
        return "Pureza creada correctamente";
    }

    public PurezaDto obtenerPurezaPorId(Long id) {
        Pureza pureza = this.purezaRepository.findById(id).orElse(null);
        if (pureza == null || !pureza.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoPureza(pureza);
    }

    public String eliminarPureza(Long id) {
        if (id != null) {
            this.purezaRepository.findById(id).ifPresent(pureza -> {
                pureza.setActivo(false);
                this.purezaRepository.save(pureza);
            });
        }
        return "Pureza eliminada correctamente";
    }

    public String editarPureza(PurezaDto dto) {
        this.purezaRepository.save(mapsDtoEntityService.mapToEntityPureza(dto));
        return "Pureza actualizada correctamente";
    }

    public ResponseEntity<ResponseListadoPurezas> listadoPurezas() {
        var purezasActivas = this.purezaRepository.findByActivoTrue();
        var purezasDto = purezasActivas.stream()
                .map(mapsDtoEntityService::mapToDtoPureza)
                .toList();
        ResponseListadoPurezas responseListadoPurezas = new ResponseListadoPurezas(purezasDto);
        return ResponseEntity.ok(responseListadoPurezas);
    }
}



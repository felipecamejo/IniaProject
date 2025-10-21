package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadoLotes;
import ti.proyectoinia.business.entities.Lote;
import ti.proyectoinia.business.repositories.LoteRepository;
import ti.proyectoinia.business.repositories.ReciboRepository;
import ti.proyectoinia.dtos.LoteDto;

import java.util.Optional;

@Service
public class LoteService {

    private final LoteRepository loteRepository;
    private final MapsDtoEntityService mapsDtoEntityService;
    private final ReciboRepository reciboRepository;

    public LoteService(LoteRepository loteRepository, MapsDtoEntityService mapsDtoEntityService, ReciboRepository reciboRepository) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.loteRepository = loteRepository;
        this.reciboRepository = reciboRepository;
    }

    public String crearLote(LoteDto loteDto) {
        return "Lote creado correctamente ID:" + this.loteRepository.save(mapsDtoEntityService.mapToEntityLote(loteDto)).getId();
    }

    public LoteDto obtenerLotePorId(Long id) {
        Lote lote = this.loteRepository.findById(id).orElse(null);
        if (lote == null || !lote.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoLote(lote);
    }

    public String eliminarLote(Long id) {
        if (id != null) {
            this.loteRepository.findById(id).ifPresent(lote -> {
                lote.setActivo(false);
                this.loteRepository.save(lote);
            });
        }
        return "Lote eliminado correctamente ID:" + id;
    }

    public String editarLote(LoteDto loteDto) {
        this.loteRepository.save(mapsDtoEntityService.mapToEntityLote(loteDto));
        return "Lote actualizado correctamente ID:" + loteDto.getId();
    }

    public ResponseEntity<ResponseListadoLotes> listadoLotes() {
        var lotesActivos = this.loteRepository.findByActivoTrue();
        var lotesDto = lotesActivos.stream()
                .map(mapsDtoEntityService::mapToDtoLote)
                .toList();
        ResponseListadoLotes responseListadoLotes = new ResponseListadoLotes(lotesDto);
        return ResponseEntity.ok(responseListadoLotes);
    }

    public Optional<Long> obtenerReciboIdPorLoteId(Long loteId) {
        Lote lote = this.loteRepository.findById(loteId).orElse(null);
        if (lote == null || !lote.isActivo()) {
            return Optional.empty();
        }
        var recibo = this.reciboRepository.findByActivoTrueAndLoteId(loteId);
        if (recibo == null) {
            return Optional.empty();
        }
        return Optional.ofNullable(recibo.getId());
    }
}

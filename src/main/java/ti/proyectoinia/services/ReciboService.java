package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadoRecibos;
import ti.proyectoinia.business.entities.Recibo;
import ti.proyectoinia.business.entities.Lote;
import ti.proyectoinia.business.repositories.ReciboRepository;
import ti.proyectoinia.business.repositories.LoteRepository;
import ti.proyectoinia.dtos.ReciboDto;

@Service
public class ReciboService {

    private final ReciboRepository reciboRepository;
    private final MapsDtoEntityService mapsDtoEntityService;
    private final LoteRepository loteRepository;

    public ReciboService(ReciboRepository reciboRepository, MapsDtoEntityService mapsDtoEntityService, LoteRepository loteRepository) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.reciboRepository = reciboRepository;
        this.loteRepository = loteRepository;
    }

    public String crearRecibo(ReciboDto reciboDto) {
        // Validar que el lote existe y está activo
        if (reciboDto.getLoteId() != null) {
            Lote lote = loteRepository.findById(Long.valueOf(reciboDto.getLoteId())).orElse(null);
            if (lote == null || !lote.isActivo()) {
                throw new IllegalArgumentException("El lote con ID " + reciboDto.getLoteId() + " no existe o no está activo");
            }
        }

        return "Recibo creado correctamente ID:" + this.reciboRepository.save(mapsDtoEntityService.mapToEntityRecibo(reciboDto)).getId();
    }

    public ReciboDto obtenerReciboPorId(Long id) {
        Recibo recibo = this.reciboRepository.findById(id).orElse(null);
        if (recibo == null || !recibo.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoRecibo(recibo);
    }

    public String eliminarRecibo(Long id) {
        if (id != null) {
            this.reciboRepository.findById(id).ifPresent(recibo -> {
                recibo.setActivo(false);
                this.reciboRepository.save(recibo);
            });
        }
        return "Recibo eliminado correctamente ID:" + id;
    }

    public String editarRecibo(ReciboDto reciboDto) {
        // Validar que el lote existe y está activo
        if (reciboDto.getLoteId() != null) {
            Lote lote = loteRepository.findById(Long.valueOf(reciboDto.getLoteId())).orElse(null);
            if (lote == null || !lote.isActivo()) {
                throw new IllegalArgumentException("El lote con ID " + reciboDto.getLoteId() + " no existe o no está activo");
            }
        }
        
        this.reciboRepository.save(mapsDtoEntityService.mapToEntityRecibo(reciboDto));
        return "Recibo actualizado correctamente ID:" + reciboDto.getId();
    }

    public ResponseEntity<ResponseListadoRecibos> listadoRecibos() {
        var recibosActivos = this.reciboRepository.findByActivoTrue();
        var recibosDto = recibosActivos.stream()
                .map(mapsDtoEntityService::mapToDtoRecibo)
                .toList();
        ResponseListadoRecibos responseListadoRecibos = new ResponseListadoRecibos(recibosDto);
        return ResponseEntity.ok(responseListadoRecibos);
    }

}

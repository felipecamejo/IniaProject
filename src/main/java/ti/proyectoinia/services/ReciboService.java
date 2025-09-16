package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadoRecibos;
import ti.proyectoinia.business.entities.Recibo;
import ti.proyectoinia.business.repositories.ReciboRepository;
import ti.proyectoinia.dtos.ReciboDto;

@Service
public class ReciboService {

    private final ReciboRepository reciboRepository;
    private final MapsDtoEntityService mapsDtoEntityService;

    public ReciboService(ReciboRepository reciboRepository, MapsDtoEntityService mapsDtoEntityService) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.reciboRepository = reciboRepository;
    }

    public String crearRecibo(ReciboDto reciboDto) {
        this.reciboRepository.save(mapsDtoEntityService.mapToEntityRecibo(reciboDto));
        return "Recibo creado correctamente";
    }

    public ReciboDto obtenerReciboPorId(Long id) {
        Recibo recibo = this.reciboRepository.findById(id == null ? null : id.intValue()).orElse(null);
        if (recibo == null || !recibo.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoRecibo(recibo);
    }

    public String eliminarRecibo(Long id) {
        if (id != null) {
            this.reciboRepository.deleteById(id.intValue());
        }
        return "Recibo eliminado correctamente";
    }

    public String editarRecibo(ReciboDto reciboDto) {
        this.reciboRepository.save(mapsDtoEntityService.mapToEntityRecibo(reciboDto));
        return "Recibo actualizado correctamente";
    }

    public ResponseEntity<ResponseListadoRecibos> listadoRecibos() {
        ResponseListadoRecibos responseListadoRecibos = (ResponseListadoRecibos) this.reciboRepository.findByActivoTrue();
        return ResponseEntity.ok(responseListadoRecibos);
    }
}



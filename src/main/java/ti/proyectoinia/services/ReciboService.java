package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadoPurezas;
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
        Recibo recibo = this.reciboRepository.findById(id).orElse(null);
        if (recibo == null || !recibo.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoRecibo(recibo);
    }

    public String eliminarRecibo(Long id) {
        if (id != null) {
            this.reciboRepository.deleteById(id);
        }
        return "Recibo eliminado correctamente";
    }

    public String editarRecibo(ReciboDto reciboDto) {
        this.reciboRepository.save(mapsDtoEntityService.mapToEntityRecibo(reciboDto));
        return "Recibo actualizado correctamente";
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



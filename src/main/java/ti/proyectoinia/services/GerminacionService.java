package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.ErrorResponse;
import ti.proyectoinia.api.responses.ResponseListadoDOSN;
import ti.proyectoinia.api.responses.ResponseListadoGerminacion;
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
        return "Germinacion creada correctamente ID:" + germinacionDto.getId();
    }

    public GerminacionDto obtenerGerminacionPorId(Long id) {
        Germinacion germinacion = this.germinacionRepository.findById(id).orElse(null);
        if (germinacion == null || !germinacion.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoGerminacion(germinacion);
    }

    public String eliminarGerminacion(Long id) {
        if (id != null) {
            this.germinacionRepository.findById(id).ifPresent(germinacion -> {
                germinacion.setActivo(false);
                this.germinacionRepository.save(germinacion);
            });
        }
        return "Germinacion eliminada correctamente ID:" + id;
    }

    public String editarGerminacion(GerminacionDto germinacionDto) {
        this.germinacionRepository.save(mapsDtoEntityService.mapToEntityGerminacion(germinacionDto));
        return "Germinacion actualizada correctamente ID:" + germinacionDto.getId();
    }

    public ResponseEntity<ResponseListadoGerminacion> listadoGerminacion() {
        var activos = this.germinacionRepository.findByActivoTrue();
        var dtos = activos.stream()
                .map(mapsDtoEntityService::mapToDtoGerminacion)
                .toList();
        ResponseListadoGerminacion responseListadoGerminacion = new ResponseListadoGerminacion(dtos);
        return ResponseEntity.ok(responseListadoGerminacion);
    }
}

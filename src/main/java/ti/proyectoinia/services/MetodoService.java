package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadoMetodos;
import ti.proyectoinia.business.entities.Metodo;
import ti.proyectoinia.business.repositories.MetodoRepository;
import ti.proyectoinia.dtos.MetodoDto;

@Service
public class MetodoService {

    private final MetodoRepository metodoRepository;
    private final MapsDtoEntityService mapsDtoEntityService;

    public MetodoService(MetodoRepository metodoRepository, MapsDtoEntityService mapsDtoEntityService) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.metodoRepository = metodoRepository;
    }

    public String crearMetodo(MetodoDto metodoDto) {
        Metodo metodo = mapsDtoEntityService.mapToEntityMetodo(metodoDto);
        metodo.setActivo(true);
        Metodo metodoGuardado = metodoRepository.save(metodo);
        return "Método creado correctamente ID:" + metodoGuardado.getId();
    }

    public MetodoDto obtenerMetodoPorId(Long id) {
        Metodo metodo = this.metodoRepository.findById(id).orElse(null);
        if (metodo == null || !metodo.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoMetodo(metodo);
    }

    public String eliminarMetodo(Long id) {
        if (id != null) {
            this.metodoRepository.findById(id).ifPresent(metodo -> {
                metodo.setActivo(false);
                this.metodoRepository.save(metodo);
            });
        }
        return "Método eliminado correctamente ID:" + id;
    }

    public String editarMetodo(MetodoDto metodoDto) {
        this.metodoRepository.save(mapsDtoEntityService.mapToEntityMetodo(metodoDto));
        return "Método actualizado correctamente ID:" + metodoDto.getId();
    }

    public ResponseEntity<ResponseListadoMetodos> listadoMetodos() {
        var metodosActivos = this.metodoRepository.findByActivoTrue();
        var metodosDto = metodosActivos.stream()
                .map(mapsDtoEntityService::mapToDtoMetodo)
                .toList();
        ResponseListadoMetodos responseListadoMetodos = new ResponseListadoMetodos(metodosDto);
        return ResponseEntity.ok(responseListadoMetodos);
    }
}

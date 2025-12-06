package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadoAutocompletados;
import ti.proyectoinia.business.entities.Autocompletado;
import ti.proyectoinia.business.repositories.AutocompletadoRepository;
import ti.proyectoinia.dtos.AutocompletadoDto;


@Service
public class AutocompletadoService {
    
    private final AutocompletadoRepository autocompletadoRepository;
    private final MapsDtoEntityService mapsDtoEntityService;

    public AutocompletadoService(AutocompletadoRepository autocompletadoRepository, MapsDtoEntityService mapsDtoEntityService) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.autocompletadoRepository = autocompletadoRepository;
    }

    public String crearAutocompletado(AutocompletadoDto autocompletadoDto) {
        return "Autocompletado creado correctamente ID:" + this.autocompletadoRepository.save(mapsDtoEntityService.mapToEntityAutocompletado(autocompletadoDto)).getId();
    }

    public ResponseEntity<ResponseListadoAutocompletados> listadoAutocompletados() {
        var autocompletadosActivos = this.autocompletadoRepository.findByActivoTrue();
        var autocompletadosDto = autocompletadosActivos.stream()
                .map(mapsDtoEntityService::mapToDtoAutocompletado)
                .toList();
        ResponseListadoAutocompletados responseListadoAutocompletados = new ResponseListadoAutocompletados(autocompletadosDto);
        return ResponseEntity.ok(responseListadoAutocompletados);
    }

    public AutocompletadoDto obtenerAutocompletadoPorId(Long id) {
        Autocompletado autocompletado = this.autocompletadoRepository.findById(id).orElse(null);
        if (autocompletado == null || !autocompletado.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoAutocompletado(autocompletado);
    }

    public String editarAutocompletado(AutocompletadoDto autocompletadoDto) {
        this.autocompletadoRepository.save(mapsDtoEntityService.mapToEntityAutocompletado(autocompletadoDto));
        return "Autocompletado actualizado correctamente ID:" + autocompletadoDto.getId();
    }

    public String eliminarAutocompletado(Long id) {
        if (id != null) {
            this.autocompletadoRepository.findById(id).ifPresent(autocompletado -> {
                autocompletado.setActivo(false);
                this.autocompletadoRepository.save(autocompletado);
            });
        }
        return "Autocompletado eliminado correctamente ID:" + id;
    }

    public ResponseListadoAutocompletados obtenerPorParametro(String parametro) {
        var autocompletados = this.autocompletadoRepository.findByParametroAndActivoTrue(parametro);
        var autocompletadosDto = autocompletados.stream()
                .map(mapsDtoEntityService::mapToDtoAutocompletado)
                .toList();
        return new ResponseListadoAutocompletados(autocompletadosDto);
    }
}


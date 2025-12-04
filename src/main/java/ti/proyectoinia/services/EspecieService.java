package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadosEspecies;
import ti.proyectoinia.business.entities.Especie;
import ti.proyectoinia.business.repositories.EspecieRepository;
import ti.proyectoinia.dtos.EspecieDto;

@Service
public class EspecieService {

    private final EspecieRepository repository;
    private final MapsDtoEntityService mapsDtoEntityService;

    public EspecieService(EspecieRepository repository, MapsDtoEntityService mapsDtoEntityService) {
        this.repository = repository;
        this.mapsDtoEntityService = mapsDtoEntityService;
    }

    public ResponseEntity<ResponseListadosEspecies> listado() {
        var activos = repository.findByActivoTrue();
        var dtos = activos.stream()
                .map(mapsDtoEntityService::maptoDtoEspecie)
                .toList();
        return ResponseEntity.ok(new ResponseListadosEspecies(dtos));
    }

    public String crear(EspecieDto dto) {
        dto.setId(null);
        this.repository.save(mapsDtoEntityService.maptoEntityEspecie(dto));
        return "Especie creado correctamente ID:" + dto.getId();
    }

    public EspecieDto obtenerPorId(Long id) {
        Especie Especie = this.repository.findById(id).orElse(null);
        if (Especie == null || !Especie.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.maptoDtoEspecie(Especie);
    }

    public String editar(EspecieDto EspecieDto) {
        this.repository.save(mapsDtoEntityService.maptoEntityEspecie(EspecieDto));
        return "Especie actualizado correctamente ID:" + EspecieDto.getId();
    }

    public String eliminar(Long id) {
        if (id != null) {
            this.repository.findById(id).ifPresent(Especie -> {
                Especie.setActivo(false);
                this.repository.save(Especie);
            });
        }
        return "Especie eliminado correctamente ID:" + id;
    }
}



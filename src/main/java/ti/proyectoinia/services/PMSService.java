package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadoHongos;
import ti.proyectoinia.api.responses.ResponseListadoPMS;
import ti.proyectoinia.business.entities.PMS;
import ti.proyectoinia.business.repositories.PMSRepository;
import ti.proyectoinia.dtos.PMSDto;

@Service
public class PMSService {

    private final PMSRepository pmsRepository;
    private final MapsDtoEntityService mapsDtoEntityService;

    public PMSService(PMSRepository pmsRepository, MapsDtoEntityService mapsDtoEntityService) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.pmsRepository = pmsRepository;
    }

    public String crearPMS(PMSDto pmsDto) {
        return "PMS creado correctamente ID:" + this.pmsRepository.save(mapsDtoEntityService.mapToEntityPMS(pmsDto)).getId();
    }

    public PMSDto obtenerPMSPorId(Long id) {
        PMS pms = this.pmsRepository.findById(id).orElse(null);
        if (pms == null || !pms.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoPMS(pms);
    }

    public String eliminarPMS(Long id) {
        if (id != null) {
            this.pmsRepository.findById(id).ifPresent(pms -> {
                pms.setActivo(false);
                this.pmsRepository.save(pms);
            });
        }
        return "PMS eliminado correctamente ID:" + id;
    }

    public String editarPMS(PMSDto pmsDto) {
        if (pmsDto.getId() == null) {
            throw new IllegalArgumentException("ID de PMS requerido para editar");
        }
        PMS existente = this.pmsRepository.findById(pmsDto.getId()).orElse(null);
        if (existente == null) {
            throw new IllegalArgumentException("PMS no encontrado");
        }
        if (!existente.isActivo()) {
            throw new IllegalStateException("No se puede editar un PMS inactivo");
        }
        if (existente.isRepetido() || existente.isEstandar()) {
            throw new IllegalStateException("No se puede editar un PMS marcado como repetido o estándar");
        }
        this.pmsRepository.save(mapsDtoEntityService.mapToEntityPMS(pmsDto));
        return "PMS actualizado correctamente ID:" + pmsDto.getId();
    }

    public ResponseEntity<ResponseListadoPMS> listadoPMSporRecibo(Long id) {
        var pmsActivos = this.pmsRepository.findByActivoTrueAndReciboIdAndReciboActivoTrue(id);
        var pmsDto = pmsActivos.stream()
                .map(mapsDtoEntityService::mapToDtoPMS)
                .toList();
        ResponseListadoPMS responseListadoPMS= new ResponseListadoPMS(pmsDto);
        return ResponseEntity.ok(responseListadoPMS);
    }
}



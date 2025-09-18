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
        this.pmsRepository.save(mapsDtoEntityService.mapToEntityPMS(pmsDto));
        return "PMS creado correctamente";
    }

    public PMSDto obtenerPMSPorId(Long id) {
        PMS pms = this.pmsRepository.findById(id).orElse(null);
        if (pms == null || !pms.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoPMS(pms);
    }

    public String eliminarPMS(Long id) {
        this.pmsRepository.deleteById(id);
        return "PMS eliminado correctamente";
    }

    public String editarPMS(PMSDto pmsDto) {
        this.pmsRepository.save(mapsDtoEntityService.mapToEntityPMS(pmsDto));
        return "PMS actualizado correctamente";
    }

    public ResponseEntity<ResponseListadoPMS> listadoPMS() {
        var pmsActivos = this.pmsRepository.findByActivoTrue();
        var pmsDto = pmsActivos.stream()
                .map(mapsDtoEntityService::mapToDtoPMS)
                .toList();
        ResponseListadoPMS responseListadoPMS= new ResponseListadoPMS(pmsDto);
        return ResponseEntity.ok(responseListadoPMS);
    }
}



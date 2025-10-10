package ti.proyectoinia.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.ErrorResponse;
import org.springframework.web.server.ResponseStatusException;
import ti.proyectoinia.api.responses.ResponseListadoDOSN;
import ti.proyectoinia.api.responses.ResponseListadoPurezas;
import ti.proyectoinia.business.entities.Cultivo;
import ti.proyectoinia.business.entities.DOSN;
import ti.proyectoinia.business.repositories.CultivoRepository;
import ti.proyectoinia.business.repositories.DOSNRepository;
import ti.proyectoinia.dtos.DOSNDto;


@Service
public class DOSNService {

    private final DOSNRepository dosnRepository;
    private final MapsDtoEntityService mapsDtoEntityService;

    @Autowired
    private CultivoRepository cultivoRepository;

    public DOSNService(DOSNRepository dosnRepository, MapsDtoEntityService mapsDtoEntityService) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.dosnRepository = dosnRepository;
    }

    public String crearDOSN(DOSNDto dosnDto) {
        if (dosnDto.getCultivos() != null) {
            for (var cultivoDto : dosnDto.getCultivos()) {
                if (cultivoDto.getId() == null || !cultivoRepository.existsById(cultivoDto.getId())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El cultivo con id " + cultivoDto.getId() + " no existe");
                }
            }
        }
        return "DOSN creada correctamente ID:" + this.dosnRepository.save(mapsDtoEntityService.mapToEntityDOSN(dosnDto)).getId();
    }

    public DOSNDto obtenerDOSNPorId(Long id) {
        DOSN DOSN = this.dosnRepository.findById(id).orElse(null);
        if (DOSN == null || !DOSN.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoDOSN(DOSN);
    }

    public String eliminarDOSN(Long id) {
        if (id != null) {
            this.dosnRepository.findById(id).ifPresent(dosn -> {
                dosn.setActivo(false);
                this.dosnRepository.save(dosn);
            });
        }
        return "DOSN eliminada correctamente ID:" + id;
    }

    public String editarDOSN(DOSNDto dosnDto) {
        DOSN dosn = mapsDtoEntityService.mapToEntityDOSN(dosnDto);
        if (dosn.getCultivos() != null) {
            for (Cultivo cultivo : dosn.getCultivos()) {
                if (cultivo.getId() == null || cultivo.getId() == 0 || !cultivoRepository.existsById(cultivo.getId())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El cultivo con id " + cultivo.getId() + " no existe.");
                }
            }
        }
        this.dosnRepository.save(dosn);
        return "DOSN actualizada correctamente ID:" + dosn.getId();
    }

    public ResponseEntity<ResponseListadoDOSN> listadoDOSNporRecibo(Long id) {
        var activos = this.dosnRepository.findByActivoTrueAndReciboIdAndReciboActivoTrue(id);
        var dtos = activos.stream()
                .map(mapsDtoEntityService::mapToDtoDOSN)
                .toList();
        ResponseListadoDOSN responseListadoDOSN = new ResponseListadoDOSN(dtos);
        return ResponseEntity.ok(responseListadoDOSN);
    }
}

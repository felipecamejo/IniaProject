package ti.proyectoinia.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ti.proyectoinia.dtos.HumedadReciboDto;
import ti.proyectoinia.business.entities.HumedadRecibo;
import ti.proyectoinia.business.repositories.HumedadReciboRepository;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HumedadReciboService {

    @Autowired
    private HumedadReciboRepository humedadReciboRepository;
    @Autowired
    private MapsDtoEntityService mapsDtoEntityService;

    public String crearHumedadRecibo(HumedadReciboDto dto) {
        HumedadRecibo entity = mapsDtoEntityService.mapToEntityHumedadRecibo(dto);
        humedadReciboRepository.save(entity);
        return "HumedadRecibo creada correctamente";
    }

    public List<HumedadReciboDto> listarHumedades() {
        List<HumedadRecibo> lista = humedadReciboRepository.findAll();
        return lista.stream()
                .map(mapsDtoEntityService::mapToDtoHumedadRecibo)
                .collect(Collectors.toList());
    }

    public String editarHumedadRecibo(HumedadReciboDto dto) {
        if (dto.getId() == null) {
            return "El id de la HumedadRecibo es obligatorio para editar";
        }
        HumedadRecibo entity = mapsDtoEntityService.mapToEntityHumedadRecibo(dto);
        if (!humedadReciboRepository.existsById(dto.getId())) {
            return "No existe una HumedadRecibo con ese id";
        }
        humedadReciboRepository.save(entity);
        return "HumedadRecibo editada correctamente";
    }

    public List<HumedadReciboDto> obtenerHumedadesPorRecibo(Long reciboId) {
        List<HumedadRecibo> lista = humedadReciboRepository.findByActivoTrueAndReciboId(reciboId);
        return lista.stream()
                .map(mapsDtoEntityService::mapToDtoHumedadRecibo)
                .collect(Collectors.toList());
    }

    public List<HumedadReciboDto> crearMultiplesHumedades(List<HumedadReciboDto> dtos) {
        List<HumedadRecibo> entities = dtos.stream()
                .map(mapsDtoEntityService::mapToEntityHumedadRecibo)
                .collect(Collectors.toList());
        List<HumedadRecibo> guardadas = humedadReciboRepository.saveAll(entities);
        return guardadas.stream()
                .map(mapsDtoEntityService::mapToDtoHumedadRecibo)
                .collect(Collectors.toList());
    }
}

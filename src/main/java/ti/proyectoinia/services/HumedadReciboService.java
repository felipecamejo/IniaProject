package ti.proyectoinia.services;

import jakarta.transaction.Transactional;
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

    public List<HumedadReciboDto> obtenerHumedadesPorRecibo(Long reciboId) {
        // Usar el repositorio que filtra por activo = true y que además verifica que el recibo esté activo
        List<HumedadRecibo> lista = humedadReciboRepository.findByReciboIdAndReciboActivoTrue(reciboId);
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

    @Transactional
    // Nuevo método: borra físicamente todas las humedades asociadas a un recibo y crea las nuevas
    public void actualizarHumedadesCompleto(Long reciboId, List<HumedadReciboDto> dtos) {
        // Borrar físicamente todas las humedades relacionadas al recibo
        humedadReciboRepository.deleteAllByReciboId(reciboId);

        if (dtos == null || dtos.isEmpty()) {
            return; // nothing to create
        }

        // Preparar dtos para creación: asegurar id nulo y asignar reciboId
        List<HumedadReciboDto> toCreate = dtos.stream().map(dto -> {
            dto.setId(null);
            dto.setReciboId(reciboId);
            return dto;
        }).collect(Collectors.toList());

        // Crear todos los registros nuevos
        crearMultiplesHumedades(toCreate);
    }
}

package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadoPurezaPNotatum;
import ti.proyectoinia.business.entities.*;
import ti.proyectoinia.business.repositories.PurezaPNotatumRepository;
import ti.proyectoinia.business.repositories.RepeticionPPNRepository;
import ti.proyectoinia.dtos.PurezaPNotatumDto;
import ti.proyectoinia.dtos.RepeticionesPPNDTO;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;


@Service
public class PurezaPNotatumService {

    private final PurezaPNotatumRepository purezaPNotatumRepository;
    private final MapsDtoEntityService mapsDtoEntityService;
    private final RepeticionPPNRepository repeticionPPNRepository;

    public PurezaPNotatumService(PurezaPNotatumRepository purezaPNotatumRepository, MapsDtoEntityService mapsDtoEntityService, RepeticionPPNRepository repeticionPPNRepository) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.purezaPNotatumRepository = purezaPNotatumRepository;
        this.repeticionPPNRepository = repeticionPPNRepository;
    }

    public String crearPurezaPNotatum(PurezaPNotatumDto purezaPNotatumDto) {
        return "PurezaPNotatum creada correctamente ID:" + this.purezaPNotatumRepository.save(mapsDtoEntityService.mapToEntityPurezaPNotatum(purezaPNotatumDto)).getId();
    }

    public PurezaPNotatumDto obtenerPurezaPNotatumPorId(Long id) {
        PurezaPNotatum PurezaPNotatum = this.purezaPNotatumRepository.findById(id).orElse(null);
        if (PurezaPNotatum == null || !PurezaPNotatum.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoPurezaPNotatum(PurezaPNotatum);
    }

    public String eliminarPurezaPNotatum(Long id) {
        if (id != null) {
            this.purezaPNotatumRepository.findById(id).ifPresent(purezaPNotatum -> {
                purezaPNotatum.setActivo(false);
                this.purezaPNotatumRepository.save(purezaPNotatum);
            });
        }
        return "PurezaPNotatum eliminada correctamente ID:" + id;
    }

    public String editarPurezaPNotatum(PurezaPNotatumDto purezaPNotatumDto) {
        this.purezaPNotatumRepository.save(mapsDtoEntityService.mapToEntityPurezaPNotatum(purezaPNotatumDto));
        return "PurezaPNotatum actualizada correctamente ID:" + purezaPNotatumDto.getId();
    }

    public ResponseEntity<ResponseListadoPurezaPNotatum> listadoPurezaPNotatumporRecibo(Long id) {
        var activos = this.purezaPNotatumRepository.findByActivoTrueAndReciboIdAndReciboActivoTrue(id);
        var dto = activos.stream()
                .map(mapsDtoEntityService::mapToDtoPurezaPNotatum)
                .toList();
        ResponseListadoPurezaPNotatum responseListadoPurezaPNotatum= new ResponseListadoPurezaPNotatum(dto);
        return ResponseEntity.ok(responseListadoPurezaPNotatum);
    }

    public List<RepeticionesPPNDTO> listarRepeticionesPorPPN(Long ppnId) {
        List<RepeticionesPPN> repeticionesPPNS = repeticionPPNRepository.findByPurezaPPNId(ppnId);
        return repeticionesPPNS.stream()
                .map(mapsDtoEntityService::maptoDtoRepeticionPPN)
                .toList();
    }

    public void actualizarRepeticionesCompleto(Long ppnId, List<RepeticionesPPNDTO> repeticionesActuales) {
        PurezaPNotatum purezaPNotatum = purezaPNotatumRepository.findById(ppnId).orElse(null);
        if (purezaPNotatum == null) throw new RuntimeException("PurezaPNotatum no encontrado");
        List<RepeticionesPPN> actuales = repeticionPPNRepository.findByPurezaPPNId(ppnId);
        // Usar la lista entrante para calcular los ids que deben permanecer
        Set<Long> nuevosIds = repeticionesActuales.stream()
                .map(h -> h.getId() != null ? h.getId() : -1L)
                .collect(Collectors.toSet());

        // Eliminar los que no están en la nueva lista
        for (RepeticionesPPN actual : actuales) {
            if (!nuevosIds.contains(actual.getId())) {
                repeticionPPNRepository.delete(actual);
            }
        }
        // Crear o actualizar los recibidos
        for (RepeticionesPPNDTO dto : repeticionesActuales) {
            RepeticionesPPN repeticionesPPN;
            if (dto.getId() != null) {
                repeticionesPPN = repeticionPPNRepository.findById(dto.getId()).orElse(new RepeticionesPPN());
            } else {
                repeticionesPPN = new RepeticionesPPN();
            }

            repeticionesPPN.setPeso(dto.getPeso());
            repeticionesPPN.setNroSemillasPuras(dto.getNroSemillasPuras());
            repeticionesPPN.setContaminadasYVanas(dto.getContaminadasYVanas());
            repeticionesPPN.setGramosContaminadasYVanas(dto.getGramosContaminadasYVanas());
            repeticionesPPN.setGramosControlDePesos(dto.getGramosControlDePesos());
            repeticionesPPN.setGramosSemillasSanas(dto.getGramosSemillasSanas());
            repeticionesPPN.setCantidadSemillasSanas(dto.getCantidadSemillasSanas());
            // Asegurar la relación con la PurezaPNotatum guardando el id de la pureza
            repeticionesPPN.setPurezaPPNId(ppnId);

            repeticionPPNRepository.save(repeticionesPPN);
        }
    }
}

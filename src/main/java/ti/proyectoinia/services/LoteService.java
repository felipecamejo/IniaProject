package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadoLotes;
import ti.proyectoinia.business.entities.Lote;
import ti.proyectoinia.business.repositories.LoteRepository;
import ti.proyectoinia.business.repositories.ReciboRepository;
import ti.proyectoinia.dtos.LoteDto;

import java.util.Optional;

@Service
public class LoteService {

    private final LoteRepository loteRepository;
    private final MapsDtoEntityService mapsDtoEntityService;
    private final ReciboRepository reciboRepository;

    public LoteService(LoteRepository loteRepository, MapsDtoEntityService mapsDtoEntityService, ReciboRepository reciboRepository) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.loteRepository = loteRepository;
        this.reciboRepository = reciboRepository;
    }

    public Long crearLote(LoteDto loteDto) {
        return this.loteRepository.save(mapsDtoEntityService.mapToEntityLote(loteDto)).getId();
    }

    public LoteDto obtenerLotePorId(Long id) {
        Lote lote = this.loteRepository.findById(id).orElse(null);
        if (lote == null || !lote.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoLote(lote);
    }

    public String eliminarLote(Long id) {
        if (id != null) {
            this.loteRepository.findById(id).ifPresent(lote -> {
                lote.setActivo(false);
                this.loteRepository.save(lote);
            });
        }
        return "Lote eliminado correctamente ID:" + id;
    }

    public Long editarLote(LoteDto loteDto) {
        return this.loteRepository.save(mapsDtoEntityService.mapToEntityLote(loteDto)).getId();
    }

    public ResponseEntity<ResponseListadoLotes> listadoLotes() {
        var lotesActivos = this.loteRepository.findByActivoTrue();
        var lotesDto = lotesActivos.stream()
                .map(mapsDtoEntityService::mapToDtoLote)
                .toList();
        ResponseListadoLotes responseListadoLotes = new ResponseListadoLotes(lotesDto);
        return ResponseEntity.ok(responseListadoLotes);
    }

    public Optional<Long> obtenerReciboIdPorLoteId(Long loteId) {
        System.out.println("=== VALIDACIÓN RECIBO-LOTE ===");
        System.out.println("Buscando recibo para loteId: " + loteId);
        
        // Validar que el lote existe y está activo
        Lote lote = this.loteRepository.findById(loteId).orElse(null);
        if (lote == null) {
            System.out.println("ERROR: Lote con ID " + loteId + " no existe");
            return Optional.empty();
        }
        
        if (!lote.isActivo()) {
            System.out.println("ERROR: Lote con ID " + loteId + " no está activo");
            return Optional.empty();
        }
        
        System.out.println("Lote encontrado: " + lote.getNombre() + " (Activo: " + lote.isActivo() + ")");
        
        // Buscar recibo activo asociado al lote
        var recibo = this.reciboRepository.findByActivoTrueAndLoteId(loteId);
        if (recibo == null) {
            System.out.println("INFO: No se encontró recibo activo para loteId: " + loteId);
            
            // Verificar si existen recibos inactivos para este lote
            var recibosInactivos = this.reciboRepository.findAll().stream()
                .filter(r -> r.getLoteId() != null && r.getLoteId().equals(loteId))
                .filter(r -> !r.isActivo())
                .toList();
            
            if (!recibosInactivos.isEmpty()) {
                System.out.println("INFO: Se encontraron " + recibosInactivos.size() + " recibos inactivos para este lote");
                recibosInactivos.forEach(r -> 
                    System.out.println("  - Recibo ID: " + r.getId() + " (Activo: " + r.isActivo() + ")")
                );
            }
            
            return Optional.empty();
        }
        
        System.out.println("Recibo encontrado: ID=" + recibo.getId() + " (Activo: " + recibo.isActivo() + ")");
        System.out.println("=== FIN VALIDACIÓN ===");
        
        return Optional.ofNullable(recibo.getId());
    }

    /**
     * Verifica que un recibo se haya asociado correctamente a un lote
     * @param loteId ID del lote
     * @param reciboId ID del recibo a verificar
     * @return true si la asociación es correcta, false en caso contrario
     */
    public boolean verificarAsociacionReciboLote(Long loteId, Long reciboId) {
        System.out.println("=== VERIFICACIÓN ASOCIACIÓN RECIBO-LOTE ===");
        System.out.println("Verificando asociación: LoteId=" + loteId + ", ReciboId=" + reciboId);
        
        try {
            // Verificar que el lote existe y está activo
            Lote lote = this.loteRepository.findById(loteId).orElse(null);
            if (lote == null) {
                System.out.println("ERROR: Lote con ID " + loteId + " no existe");
                return false;
            }
            
            if (!lote.isActivo()) {
                System.out.println("ERROR: Lote con ID " + loteId + " no está activo");
                return false;
            }
            
            // Verificar que el recibo existe y está activo
            var recibo = this.reciboRepository.findById(reciboId).orElse(null);
            if (recibo == null) {
                System.out.println("ERROR: Recibo con ID " + reciboId + " no existe");
                return false;
            }
            
            if (!recibo.isActivo()) {
                System.out.println("ERROR: Recibo con ID " + reciboId + " no está activo");
                return false;
            }
            
            // Verificar la asociación
            boolean asociacionCorrecta = recibo.getLoteId() != null && recibo.getLoteId().equals(loteId);
            
            if (asociacionCorrecta) {
                System.out.println("SUCCESS: Asociación correcta - Recibo " + reciboId + " está asociado al Lote " + loteId);
            } else {
                System.out.println("ERROR: Asociación incorrecta - Recibo " + reciboId + " no está asociado al Lote " + loteId);
                System.out.println("  Recibo.loteId actual: " + recibo.getLoteId());
                System.out.println("  LoteId esperado: " + loteId);
            }
            
            System.out.println("=== FIN VERIFICACIÓN ===");
            return asociacionCorrecta;
            
        } catch (Exception e) {
            System.out.println("ERROR: Excepción durante la verificación: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}

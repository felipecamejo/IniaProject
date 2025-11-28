package ti.proyectoinia.services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadoLotes;
import ti.proyectoinia.api.responses.ResponseListadoLotesPage;
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

    public String crearLote(LoteDto loteDto) {
        return "Lote creado correctamente ID:" + this.loteRepository.save(mapsDtoEntityService.mapToEntityLote(loteDto)).getId();
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

    public String editarLote(LoteDto loteDto) {
        this.loteRepository.save(mapsDtoEntityService.mapToEntityLote(loteDto));
        return "Lote actualizado correctamente ID:" + loteDto.getId();
    }

    public ResponseEntity<ResponseListadoLotes> listadoLotes() {
        var lotesActivos = this.loteRepository.findByActivoTrue();
        var lotesDto = lotesActivos.stream()
                .map(mapsDtoEntityService::mapToDtoLote)
                .toList();
        ResponseListadoLotes responseListadoLotes = new ResponseListadoLotes(lotesDto);
        return ResponseEntity.ok(responseListadoLotes);
    }

    /**
     * Paginated listing of active lotes with filters.
     * @param page page number (0-based)
     * @param size page size
     * @param sortField field to sort by
     * @param direction ASC or DESC
     * @param searchText texto a buscar en nombre o descripcion
     * @param estado estado del lote (puede ser null)
     * @param mes mes de la fecha de creación (1-12, puede ser null)
     * @param anio año de la fecha de creación (puede ser null)
     * @return paginated response
     */
        public ResponseEntity<ResponseListadoLotesPage> listadoLotesPage(
            int page, int size, String sortField, String direction,
            String searchText, String estado, Integer mes, Integer anio, String categoria) {
        if (size <= 0) size = 20;
        if (page < 0) page = 0;
        if (sortField == null || sortField.isBlank()) sortField = "fechaCreacion";
        Sort sort = direction != null && direction.equalsIgnoreCase("ASC") ? Sort.by(sortField).ascending() : Sort.by(sortField).descending();
        Pageable pageable = PageRequest.of(page, size, sort);


        // Normalizar searchText, estado y categoria
        String nombreFiltro = (searchText == null || searchText.isBlank() || "null".equalsIgnoreCase(searchText.trim())) ? null : searchText.trim();
        String estadoNorm = (estado == null || estado.isBlank() || "null".equalsIgnoreCase(estado.trim())) ? null : estado.trim();
        String categoriaNorm = (categoria == null || categoria.isBlank() || "null".equalsIgnoreCase(categoria.trim())) ? null : categoria.trim();

        ti.proyectoinia.business.entities.Estado estadoEnum = null;
        if (estadoNorm != null) {
            try {
                estadoEnum = ti.proyectoinia.business.entities.Estado.valueOf(estadoNorm.toUpperCase());
            } catch (Exception e) {
                System.out.println("[LoteService] Estado inválido recibido: '" + estadoNorm + "'");
            }
        }

        ti.proyectoinia.business.entities.loteCategoria categoriaEnum = null;
        if (categoriaNorm != null) {
            try {
                categoriaEnum = ti.proyectoinia.business.entities.loteCategoria.valueOf(categoriaNorm.toUpperCase());
            } catch (Exception e) {
                System.out.println("[LoteService] Categoria inválida recibida: '" + categoriaNorm + "'");
            }
        }

        java.util.Date fechaInicio = null;
        java.util.Date fechaFin = null;
        try {
            if (mes != null && anio != null) {
                java.util.Calendar cal = java.util.Calendar.getInstance();
                cal.set(anio, mes - 1, 1, 0, 0, 0);
                cal.set(java.util.Calendar.MILLISECOND, 0);
                fechaInicio = cal.getTime();
                cal.set(java.util.Calendar.DAY_OF_MONTH, cal.getActualMaximum(java.util.Calendar.DAY_OF_MONTH));
                cal.set(java.util.Calendar.HOUR_OF_DAY, 23);
                cal.set(java.util.Calendar.MINUTE, 59);
                cal.set(java.util.Calendar.SECOND, 59);
                cal.set(java.util.Calendar.MILLISECOND, 999);
                fechaFin = cal.getTime();
            } else if (anio != null) {
                java.util.Calendar cal = java.util.Calendar.getInstance();
                cal.set(anio, 0, 1, 0, 0, 0);
                cal.set(java.util.Calendar.MILLISECOND, 0);
                fechaInicio = cal.getTime();
                cal.set(anio, 11, 31, 23, 59, 59);
                cal.set(java.util.Calendar.MILLISECOND, 999);
                fechaFin = cal.getTime();
            }
        } catch (Exception e) {
            System.out.println("[LoteService] Error construyendo fechas: " + e.getMessage());
        }

        Page<Lote> pageResult;
        System.out.println("[LoteService] listadoLotesPage - Parámetros recibidos:");
        System.out.println("  page=" + page + ", size=" + size + ", sortField=" + sortField + ", direction=" + direction);
        System.out.println("  nombre='" + nombreFiltro + "', estado='" + estadoEnum + "', categoria='" + categoriaEnum + "', fechaInicio=" + fechaInicio + ", fechaFin=" + fechaFin);

        // Lógica de selección de método derivado (con categoria)
        if (nombreFiltro != null && estadoEnum != null && categoriaEnum != null && fechaInicio != null && fechaFin != null) {
            System.out.println("[LoteService] findByActivoTrueAndNombreIgnoreCaseContainingAndEstadoAndCategoriaAndFechaCreacionBetween");
            pageResult = loteRepository.findByActivoTrueAndNombreIgnoreCaseContainingAndEstadoAndCategoriaAndFechaCreacionBetween(
                nombreFiltro, estadoEnum, categoriaEnum, fechaInicio, fechaFin, pageable);
        } else if (nombreFiltro != null && estadoEnum != null && categoriaEnum != null) {
            System.out.println("[LoteService] findByActivoTrueAndNombreIgnoreCaseContainingAndEstadoAndCategoria");
            pageResult = loteRepository.findByActivoTrueAndNombreIgnoreCaseContainingAndEstadoAndCategoria(
                nombreFiltro, estadoEnum, categoriaEnum, pageable);
        } else if (nombreFiltro != null && categoriaEnum != null && fechaInicio != null && fechaFin != null) {
            System.out.println("[LoteService] findByActivoTrueAndNombreIgnoreCaseContainingAndCategoriaAndFechaCreacionBetween");
            pageResult = loteRepository.findByActivoTrueAndNombreIgnoreCaseContainingAndCategoriaAndFechaCreacionBetween(
                nombreFiltro, categoriaEnum, fechaInicio, fechaFin, pageable);
        } else if (estadoEnum != null && categoriaEnum != null && fechaInicio != null && fechaFin != null) {
            System.out.println("[LoteService] findByActivoTrueAndEstadoAndCategoriaAndFechaCreacionBetween");
            pageResult = loteRepository.findByActivoTrueAndEstadoAndCategoriaAndFechaCreacionBetween(
                estadoEnum, categoriaEnum, fechaInicio, fechaFin, pageable);
        } else if (nombreFiltro != null && estadoEnum != null && categoriaEnum != null) {
            System.out.println("[LoteService] findByActivoTrueAndNombreIgnoreCaseContainingAndEstadoAndCategoria");
            pageResult = loteRepository.findByActivoTrueAndNombreIgnoreCaseContainingAndEstadoAndCategoria(
                nombreFiltro, estadoEnum, categoriaEnum, pageable);
        } else if (nombreFiltro != null && categoriaEnum != null) {
            System.out.println("[LoteService] findByActivoTrueAndNombreIgnoreCaseContainingAndCategoria");
            pageResult = loteRepository.findByActivoTrueAndNombreIgnoreCaseContainingAndCategoria(
                nombreFiltro, categoriaEnum, pageable);
        } else if (estadoEnum != null && categoriaEnum != null) {
            System.out.println("[LoteService] findByActivoTrueAndEstadoAndCategoria");
            pageResult = loteRepository.findByActivoTrueAndEstadoAndCategoria(
                estadoEnum, categoriaEnum, pageable);
        } else if (categoriaEnum != null && fechaInicio != null && fechaFin != null) {
            System.out.println("[LoteService] findByActivoTrueAndCategoriaAndFechaCreacionBetween");
            pageResult = loteRepository.findByActivoTrueAndCategoriaAndFechaCreacionBetween(
                categoriaEnum, fechaInicio, fechaFin, pageable);
        } else if (categoriaEnum != null) {
            System.out.println("[LoteService] findByActivoTrueAndCategoria");
            pageResult = loteRepository.findByActivoTrueAndCategoria(
                categoriaEnum, pageable);
        } else if (nombreFiltro != null && estadoEnum != null && fechaInicio != null && fechaFin != null) {
            System.out.println("[LoteService] findByActivoTrueAndNombreIgnoreCaseContainingAndEstadoAndFechaCreacionBetween");
            pageResult = loteRepository.findByActivoTrueAndNombreIgnoreCaseContainingAndEstadoAndFechaCreacionBetween(
                nombreFiltro, estadoEnum, fechaInicio, fechaFin, pageable);
        } else if (nombreFiltro != null && estadoEnum != null) {
            System.out.println("[LoteService] findByActivoTrueAndNombreIgnoreCaseContainingAndEstado");
            pageResult = loteRepository.findByActivoTrueAndNombreIgnoreCaseContainingAndEstado(
                nombreFiltro, estadoEnum, pageable);
        } else if (nombreFiltro != null && fechaInicio != null && fechaFin != null) {
            System.out.println("[LoteService] findByActivoTrueAndNombreIgnoreCaseContainingAndFechaCreacionBetween");
            pageResult = loteRepository.findByActivoTrueAndNombreIgnoreCaseContainingAndFechaCreacionBetween(
                nombreFiltro, fechaInicio, fechaFin, pageable);
        } else if (estadoEnum != null && fechaInicio != null && fechaFin != null) {
            System.out.println("[LoteService] findByActivoTrueAndEstadoAndFechaCreacionBetween");
            pageResult = loteRepository.findByActivoTrueAndEstadoAndFechaCreacionBetween(
                estadoEnum, fechaInicio, fechaFin, pageable);
        } else if (nombreFiltro != null) {
            System.out.println("[LoteService] findByActivoTrueAndNombreIgnoreCaseContaining");
            pageResult = loteRepository.findByActivoTrueAndNombreIgnoreCaseContaining(
                nombreFiltro, pageable);
        } else if (estadoEnum != null) {
            System.out.println("[LoteService] findByActivoTrueAndEstado");
            pageResult = loteRepository.findByActivoTrueAndEstado(
                estadoEnum, pageable);
        } else if (fechaInicio != null && fechaFin != null) {
            System.out.println("[LoteService] findByActivoTrueAndFechaCreacionBetween");
            pageResult = loteRepository.findByActivoTrueAndFechaCreacionBetween(
                fechaInicio, fechaFin, pageable);
        } else {
            System.out.println("[LoteService] findByActivoTrue");
            pageResult = loteRepository.findByActivoTrue(pageable);
        }
        var contentDto = pageResult.getContent().stream()
            .map(mapsDtoEntityService::mapToDtoLote)
            .toList();
        ResponseListadoLotesPage response = new ResponseListadoLotesPage(
            contentDto,
            pageResult.getNumber(),
            pageResult.getSize(),
            pageResult.getTotalElements(),
            pageResult.getTotalPages(),
            pageResult.isFirst(),
            pageResult.isLast()
        );
        return ResponseEntity.ok(response);
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

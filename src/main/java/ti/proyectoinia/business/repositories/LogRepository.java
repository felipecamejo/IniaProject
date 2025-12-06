    
package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.Log;
import org.springframework.data.domain.Page;

import java.util.List;

@Repository
public interface LogRepository  extends JpaRepository<Log, Long> {
    List<Log> findByLoteId(Long loteId);

    Page<Log> findByLoteIdAndId(Long loteId, Long id, org.springframework.data.domain.Pageable pageable);

    // Paginado por loteId
    Page<Log> findByLoteId(Long loteId, org.springframework.data.domain.Pageable pageable);

    // Buscar por loteId y texto (containing, case-insensitive)
    Page<Log> findByLoteIdAndTextoIgnoreCaseContaining(Long loteId, String texto, org.springframework.data.domain.Pageable pageable);

    // Buscar por loteId y rango de fechas
    Page<Log> findByLoteIdAndFechaCreacionBetween(Long loteId, java.util.Date fechaInicio, java.util.Date fechaFin, org.springframework.data.domain.Pageable pageable);

    // Buscar por loteId, texto y rango de fechas
    Page<Log> findByLoteIdAndTextoIgnoreCaseContainingAndFechaCreacionBetween(Long loteId, String texto, java.util.Date fechaInicio, java.util.Date fechaFin, org.springframework.data.domain.Pageable pageable);
}

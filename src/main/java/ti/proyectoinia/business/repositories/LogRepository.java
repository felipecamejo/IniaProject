package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.Cultivo;
import ti.proyectoinia.business.entities.Log;

import java.util.List;

@Repository
public interface LogRepository  extends JpaRepository<Log, Long> {
    List<Log> findByLoteId(Long loteId);

    // Paginado por loteId
    org.springframework.data.domain.Page<Log> findByLoteId(Long loteId, org.springframework.data.domain.Pageable pageable);

    // Buscar por loteId y texto (containing, case-insensitive)
    org.springframework.data.domain.Page<Log> findByLoteIdAndTextoIgnoreCaseContaining(Long loteId, String texto, org.springframework.data.domain.Pageable pageable);

    // Buscar por loteId y rango de fechas
    org.springframework.data.domain.Page<Log> findByLoteIdAndFechaCreacionBetween(Long loteId, java.util.Date fechaInicio, java.util.Date fechaFin, org.springframework.data.domain.Pageable pageable);

    // Buscar por loteId, texto y rango de fechas
    org.springframework.data.domain.Page<Log> findByLoteIdAndTextoIgnoreCaseContainingAndFechaCreacionBetween(Long loteId, String texto, java.util.Date fechaInicio, java.util.Date fechaFin, org.springframework.data.domain.Pageable pageable);
}

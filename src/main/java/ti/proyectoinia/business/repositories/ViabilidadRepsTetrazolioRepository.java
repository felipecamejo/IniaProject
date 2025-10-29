package ti.proyectoinia.business.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.Tetrazolio;
import ti.proyectoinia.business.entities.ViabilidadRepsTetrazolio;

@Repository
public interface ViabilidadRepsTetrazolioRepository extends JpaRepository<ViabilidadRepsTetrazolio, Long>{
    
    // Método existente (mantener para compatibilidad)
    List<ViabilidadRepsTetrazolio> findByActivoTrueAndTetrazolioId(Long tetrazolioId);
    
    // Nuevos métodos para consulta por relación JPA
    List<ViabilidadRepsTetrazolio> findByTetrazolioId(Long tetrazolioId);
    List<ViabilidadRepsTetrazolio> findByTetrazolio(Tetrazolio tetrazolio);
    List<ViabilidadRepsTetrazolio> findByActivoTrueAndTetrazolio(Tetrazolio tetrazolio);
    void deleteByTetrazolioId(Long tetrazolioId);
}
package ti.proyectoinia.business.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.ViabilidadRepsTetrazolio;

@Repository
public interface ViabilidadRepsTetrazolioRepository extends JpaRepository<ViabilidadRepsTetrazolio, Long>{
    List<ViabilidadRepsTetrazolio> findByActivoTrueAndTetrazolioId(Long tetrazolioId);
}
package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import ti.proyectoinia.business.entities.DetalleSemillasTetrazolio;

import java.util.List;

public interface DetalleSemillasTetrazolioRepository extends JpaRepository<DetalleSemillasTetrazolio, Long> {
    List<DetalleSemillasTetrazolio> findByActivoTrueAndTetrazolioId(Long tetrazolioId);
}



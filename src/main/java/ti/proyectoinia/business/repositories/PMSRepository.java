package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.PMS;
import java.util.List;

@Repository
public interface PMSRepository extends JpaRepository<PMS, Long> {
    List<PMS> findByActivoTrue();
}

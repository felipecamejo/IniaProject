package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.Maleza;
import java.util.List;

@Repository
public interface MalezaRepository extends JpaRepository<Maleza, Long> {
    List<Maleza> findByActivoTrue();
}

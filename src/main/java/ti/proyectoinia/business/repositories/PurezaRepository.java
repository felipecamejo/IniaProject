package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.Pureza;
import java.util.List;

@Repository
public interface PurezaRepository extends JpaRepository<Pureza, Integer> {
    List<Pureza> findByActivoTrue();
}

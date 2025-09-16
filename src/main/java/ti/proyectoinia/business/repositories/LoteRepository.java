package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.Lote;
import java.util.List;

@Repository
public interface LoteRepository extends JpaRepository<Lote, Integer> {
    List<Lote> findByActivoTrue();
}

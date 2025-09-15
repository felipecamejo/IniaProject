package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.Maleza;

@Repository
public interface MalezaRerpository extends JpaRepository<Long, Maleza> {
}

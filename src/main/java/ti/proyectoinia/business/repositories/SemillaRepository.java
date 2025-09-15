package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.Semilla;

@Repository
public interface SemillaRepository extends JpaRepository<Long, Semilla>{
}
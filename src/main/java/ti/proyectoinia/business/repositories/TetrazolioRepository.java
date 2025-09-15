package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.Tetrazolio;

@Repository
public interface TetrazolioRepository extends JpaRepository<Tetrazolio, Long>{
}

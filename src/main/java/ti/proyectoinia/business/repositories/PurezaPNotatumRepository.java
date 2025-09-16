package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.PurezaPNotatum;

@Repository
public interface PurezaPNotatumRepository extends JpaRepository<PurezaPNotatum, Long>{
}
package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.PurezaPnotatum;

@Repository
public interface PurezaPnotatumRepository extends JpaRepository<Long, PurezaPnotatum>{
}
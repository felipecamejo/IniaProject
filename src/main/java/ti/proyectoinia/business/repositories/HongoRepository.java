package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.Hongo;

@Repository
public interface HongoRepository  extends JpaRepository<Long, Hongo> {

}

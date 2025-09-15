package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.DOSN;

@Repository
public interface DOSNRepository extends JpaRepository<DOSN, Long>{
}
package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.PurezaPNotatum;

import java.util.List;

@Repository
public interface PurezaPNotatumRepository extends JpaRepository<PurezaPNotatum, Long>{

    List<PurezaPNotatum> findByActivoTrueAndReciboIdAndReciboActivoTrue(Long reciboId);
}
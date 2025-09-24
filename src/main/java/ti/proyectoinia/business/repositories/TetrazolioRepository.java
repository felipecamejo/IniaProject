package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.Pureza;
import ti.proyectoinia.business.entities.PurezaPNotatum;
import ti.proyectoinia.business.entities.Tetrazolio;

import java.util.List;

@Repository
public interface TetrazolioRepository extends JpaRepository<Tetrazolio, Long>{
    List<Tetrazolio> findByActivoTrueAndReciboIdAndReciboActivoTrue(Long reciboId);

}

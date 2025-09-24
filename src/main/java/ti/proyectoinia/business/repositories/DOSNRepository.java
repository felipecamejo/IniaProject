package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.DOSN;
import ti.proyectoinia.business.entities.Germinacion;
import ti.proyectoinia.business.entities.Pureza;

import java.util.List;

@Repository
public interface DOSNRepository extends JpaRepository<DOSN, Long>{

    List<DOSN> findByActivoTrueAndReciboIdAndReciboActivoTrue(Long reciboId);
}
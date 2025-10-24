package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.Germinacion;

import java.util.List;
import java.util.Optional;

@Repository
public interface GerminacionRepository extends JpaRepository<Germinacion, Long> {

    List<Germinacion> findByActivoTrueAndReciboIdAndReciboActivoTrue(Long reciboId);

    Optional<Germinacion> findByIdAndActivoTrue(Long id);
}

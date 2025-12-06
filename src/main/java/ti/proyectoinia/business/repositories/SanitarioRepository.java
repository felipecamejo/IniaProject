package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.Sanitario;

import java.util.List;

@Repository
public interface SanitarioRepository extends JpaRepository<Sanitario, Long> {
    List<Sanitario> findByActivoTrueAndReciboIdAndReciboActivoTrue(Long reciboId);
}

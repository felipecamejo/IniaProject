package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.RepeticionesPPN;

import java.util.List;

@Repository
public interface RepeticionPPNRepository extends JpaRepository<RepeticionesPPN, Long> {

    // Buscar repeticiones por el id de la entidad PurezaPNotatum
    List<RepeticionesPPN> findByPurezaPNotatumId(Long ppnId);

}

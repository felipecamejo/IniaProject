package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.Autocompletado;
import java.util.List;

@Repository
public interface AutocompletadoRepository extends JpaRepository<Autocompletado, Long> {
    List<Autocompletado> findByActivoTrue();
    
    List<Autocompletado> findByParametroAndActivoTrue(String parametro);
}


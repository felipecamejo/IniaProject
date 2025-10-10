package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.Cultivo;
import java.util.List;

@Repository
public interface CultivoRepository extends JpaRepository<Cultivo, Long>{
    List<Cultivo> findByActivoTrue();
}
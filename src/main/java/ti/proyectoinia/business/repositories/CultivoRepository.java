package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.Cultivo;

@Repository
public interface CultivoRepository extends JpaRepository<Cultivo, Long>{
}
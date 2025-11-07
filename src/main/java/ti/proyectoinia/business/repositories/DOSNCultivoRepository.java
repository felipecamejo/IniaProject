package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.DOSNCultivo;

@Repository
public interface DOSNCultivoRepository extends JpaRepository<DOSNCultivo, Long> {
}

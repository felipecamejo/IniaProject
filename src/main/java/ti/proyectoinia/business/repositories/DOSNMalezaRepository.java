package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.DOSNMaleza;

@Repository
public interface DOSNMalezaRepository extends JpaRepository<DOSNMaleza, Long> {
}

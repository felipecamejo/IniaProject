package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.Recibo;

@Repository
public interface ReciboRepository extends JpaRepository<Recibo, Long> {
}

package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.Recibo;
import java.util.List;

@Repository
public interface ReciboRepository extends JpaRepository<Recibo, Long> {
    List<Recibo> findByActivoTrue();

    Recibo findByActivoTrueAndLoteId(Long loteId);
}

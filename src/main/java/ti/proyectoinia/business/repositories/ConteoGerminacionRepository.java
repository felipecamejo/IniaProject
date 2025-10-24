package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.ConteoGerminacion;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConteoGerminacionRepository extends JpaRepository<ConteoGerminacion, Long> {

    List<ConteoGerminacion> findByGerminacionIdOrderByNumeroConteoAsc(Long germinacionId);

    boolean existsByGerminacionIdAndNumeroConteo(Long germinacionId, Integer numeroConteo);

    Optional<ConteoGerminacion> findByGerminacionIdAndNumeroConteo(Long germinacionId, Integer numeroConteo);

    void deleteByGerminacionIdAndNumeroConteo(Long germinacionId, Integer numeroConteo);

    void deleteByGerminacionId(Long germinacionId);
}

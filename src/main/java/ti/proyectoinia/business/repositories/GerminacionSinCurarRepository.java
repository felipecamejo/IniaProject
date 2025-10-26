package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.GerminacionSinCurar;

import java.util.List;
import java.util.Optional;

@Repository
public interface GerminacionSinCurarRepository extends JpaRepository<GerminacionSinCurar, Long> {

    List<GerminacionSinCurar> findByGerminacionIdOrderByNumeroRepeticionAsc(Long germinacionId);

    Optional<GerminacionSinCurar> findByGerminacionIdAndNumeroRepeticion(Long germinacionId, Integer numeroRepeticion);

    void deleteByGerminacionId(Long germinacionId);

    void deleteByGerminacionIdAndNumeroRepeticion(Long germinacionId, Integer numeroRepeticion);
}

package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.NormalPorConteo;

import java.util.List;
import java.util.Optional;

@Repository
public interface NormalPorConteoRepository extends JpaRepository<NormalPorConteo, Long> {

    Optional<NormalPorConteo> findByGerminacionIdAndTablaAndNumeroRepeticionAndConteoId(Long germinacionId, String tabla, Integer numeroRepeticion, Long conteoId);

    List<NormalPorConteo> findByGerminacionIdAndTablaOrderByConteoIdAsc(Long germinacionId, String tabla);

    List<NormalPorConteo> findByGerminacionIdAndTablaAndConteoIdOrderByNumeroRepeticionAsc(Long germinacionId, String tabla, Long conteoId);

    List<NormalPorConteo> findByGerminacionIdAndTablaAndNumeroRepeticionOrderByConteoIdAsc(Long germinacionId, String tabla, Integer numeroRepeticion);

    void deleteByConteoId(Long conteoId);

    void deleteByGerminacionId(Long germinacionId);
}

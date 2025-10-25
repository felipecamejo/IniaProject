package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.GerminacionCuradaLaboratorio;

import java.util.List;
import java.util.Optional;

@Repository
public interface GerminacionCuradaLaboratorioRepository extends JpaRepository<GerminacionCuradaLaboratorio, Long> {

    List<GerminacionCuradaLaboratorio> findByGerminacionIdOrderByNumeroRepeticionAsc(Long germinacionId);

    Optional<GerminacionCuradaLaboratorio> findByGerminacionIdAndNumeroRepeticion(Long germinacionId, Integer numeroRepeticion);

    void deleteByGerminacionId(Long germinacionId);

    void deleteByGerminacionIdAndNumeroRepeticion(Long germinacionId, Integer numeroRepeticion);
}

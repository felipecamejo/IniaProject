package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.GerminacionCuradaPlanta;

import java.util.List;
import java.util.Optional;

@Repository
public interface GerminacionCuradaPlantaRepository extends JpaRepository<GerminacionCuradaPlanta, Long> {

    List<GerminacionCuradaPlanta> findByGerminacionIdOrderByNumeroRepeticionAsc(Long germinacionId);

    Optional<GerminacionCuradaPlanta> findByGerminacionIdAndNumeroRepeticion(Long germinacionId, Integer numeroRepeticion);

    void deleteByGerminacionId(Long germinacionId);

    void deleteByGerminacionIdAndNumeroRepeticion(Long germinacionId, Integer numeroRepeticion);
}

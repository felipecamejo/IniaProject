package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.Especie;

import java.util.List;

@Repository
public interface EspecieRepository extends JpaRepository<Especie, Long> {
    List<Especie> findByActivoTrue();
}

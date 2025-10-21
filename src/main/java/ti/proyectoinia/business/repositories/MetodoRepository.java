package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.Metodo;

import java.util.List;

@Repository
public interface MetodoRepository extends JpaRepository<Metodo, Long> {

    List<Metodo> findByActivoTrue();
}

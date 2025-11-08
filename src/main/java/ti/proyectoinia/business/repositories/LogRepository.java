package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.Cultivo;
import ti.proyectoinia.business.entities.Log;

import java.util.List;

@Repository
public interface LogRepository  extends JpaRepository<Log, Long> {
    List<Log> findAll();
}

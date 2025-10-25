
package ti.proyectoinia.business.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import ti.proyectoinia.business.entities.GramosPms;

@Repository
public interface GramosPmsRepository extends JpaRepository<GramosPms, Long> {
    List<GramosPms> findByPmsId(Long pmsId);

    // Nuevo: borrar físicamente todos los registros asociados a un pmsId
    void deleteByPmsId(Long pmsId);
}

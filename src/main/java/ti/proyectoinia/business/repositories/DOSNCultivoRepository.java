package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import ti.proyectoinia.business.entities.DOSNCultivo;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DOSNCultivoRepository extends JpaRepository<DOSNCultivo, Long> {
	@Modifying
	@Query("DELETE FROM DOSNCultivo dc WHERE dc.dosn.id = :dosnId")
	void deleteByDosnId(@Param("dosnId") Long dosnId);
}

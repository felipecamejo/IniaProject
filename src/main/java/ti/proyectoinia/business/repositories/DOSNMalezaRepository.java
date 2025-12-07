package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.DOSNMaleza;


import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface DOSNMalezaRepository extends JpaRepository<DOSNMaleza, Long> {
	@Modifying
	@Query("DELETE FROM DOSNMaleza dm WHERE dm.dosn.id = :dosnId")
	void deleteByDosnId(@Param("dosnId") Long dosnId);
}

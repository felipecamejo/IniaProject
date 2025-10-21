package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.HumedadRecibo;

import java.util.List;

@Repository
public interface HumedadReciboRepository  extends JpaRepository<HumedadRecibo, Long> {
    // Permite obtener todas las humedades (independientemente de activo) por recibo
    List<HumedadRecibo> findByReciboId(Long reciboId);

    // Borra físicamente todas las filas de HUMEDAD_RECIBO asociadas a un recibo
    void deleteAllByReciboId(Long reciboId);

    // Devuelve sólo humedades activas asociadas a un recibo cuyo recibo también esté activo
    List<HumedadRecibo> findByReciboIdAndReciboActivoTrue(Long reciboId);
}

package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.Certificado;
import java.util.List;

@Repository
public interface CertificadoRepository extends JpaRepository<Certificado, Long> {
    List<Certificado> findByActivoTrue();
    
    Certificado findByActivoTrueAndNumeroCertificado(String numeroCertificado);
    
    Certificado findByActivoTrueAndNumeroMuestra(String numeroMuestra);
    
    List<Certificado> findByActivoTrueAndReciboIdAndReciboActivoTrue(Long reciboId);
}


package ti.proyectoinia.business.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ti.proyectoinia.business.entities.Usuario;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    List<Usuario> findByActivoTrue();
    Usuario findByEmailAndActivoTrue(String email);
    Optional<Usuario> findByEmail(String email);
    List<Usuario> findByRolAndActivoTrue(ti.proyectoinia.business.entities.RolUsuario rol);
}

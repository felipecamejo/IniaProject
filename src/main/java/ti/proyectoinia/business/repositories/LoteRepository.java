            package ti.proyectoinia.business.repositories;

            import org.springframework.data.domain.Page;
            import org.springframework.data.domain.Pageable;
            import org.springframework.data.jpa.repository.JpaRepository;
            import org.springframework.stereotype.Repository;
            import ti.proyectoinia.business.entities.Lote;
            import ti.proyectoinia.business.entities.loteCategoria;
            import java.util.List;

            @Repository
            public interface LoteRepository extends JpaRepository<Lote, Long> {
                // Obtener todos los años únicos de los lotes activos
                @org.springframework.data.jpa.repository.Query("SELECT DISTINCT EXTRACT(YEAR FROM l.fechaCreacion) FROM Lote l WHERE l.activo = true ORDER BY EXTRACT(YEAR FROM l.fechaCreacion) ASC")
                List<Integer> findDistinctAniosByActivoTrue();

                List<Lote> findByActivoTrue();
                Page<Lote> findByActivoTrue(Pageable pageable);

            // Buscar solo por nombre (containing, case-insensitive)
            Page<Lote> findByActivoTrueAndNombreIgnoreCaseContaining(String nombre, Pageable pageable);

            // Buscar por nombre y estado
            Page<Lote> findByActivoTrueAndNombreIgnoreCaseContainingAndEstado(String nombre, ti.proyectoinia.business.entities.Estado estado, Pageable pageable);

            // Buscar por estado
            Page<Lote> findByActivoTrueAndEstado(ti.proyectoinia.business.entities.Estado estado, Pageable pageable);

            // Buscar por nombre, estado, mes y año
            Page<Lote> findByActivoTrueAndNombreIgnoreCaseContainingAndEstadoAndFechaCreacionBetween(
                String nombre,
                ti.proyectoinia.business.entities.Estado estado,
                java.util.Date fechaInicio,
                java.util.Date fechaFin,
                Pageable pageable
            );

            // Buscar por nombre y fechas
            Page<Lote> findByActivoTrueAndNombreIgnoreCaseContainingAndFechaCreacionBetween(
                String nombre,
                java.util.Date fechaInicio,
                java.util.Date fechaFin,
                Pageable pageable
            );

            // Buscar por estado y fechas
            Page<Lote> findByActivoTrueAndEstadoAndFechaCreacionBetween(
                ti.proyectoinia.business.entities.Estado estado,
                java.util.Date fechaInicio,
                java.util.Date fechaFin,
                Pageable pageable
            );

            // Buscar solo por fechas
            Page<Lote> findByActivoTrueAndFechaCreacionBetween(
                java.util.Date fechaInicio,
                java.util.Date fechaFin,
                Pageable pageable
            );

            // Buscar por categoria
            Page<Lote> findByActivoTrueAndCategoria(loteCategoria categoria, Pageable pageable);

            // Buscar por nombre y categoria
            Page<Lote> findByActivoTrueAndNombreIgnoreCaseContainingAndCategoria(String nombre, loteCategoria categoria, Pageable pageable);

            // Buscar por estado y categoria
            Page<Lote> findByActivoTrueAndEstadoAndCategoria(ti.proyectoinia.business.entities.Estado estado, loteCategoria categoria, Pageable pageable);

            // Buscar por nombre, estado y categoria
            Page<Lote> findByActivoTrueAndNombreIgnoreCaseContainingAndEstadoAndCategoria(String nombre, ti.proyectoinia.business.entities.Estado estado, loteCategoria categoria, Pageable pageable);

            // Buscar por fechas y categoria
            Page<Lote> findByActivoTrueAndCategoriaAndFechaCreacionBetween(loteCategoria categoria, java.util.Date fechaInicio, java.util.Date fechaFin, Pageable pageable);

            // Buscar por nombre, categoria y fechas
            Page<Lote> findByActivoTrueAndNombreIgnoreCaseContainingAndCategoriaAndFechaCreacionBetween(String nombre, loteCategoria categoria, java.util.Date fechaInicio, java.util.Date fechaFin, Pageable pageable);

            // Buscar por estado, categoria y fechas
            Page<Lote> findByActivoTrueAndEstadoAndCategoriaAndFechaCreacionBetween(ti.proyectoinia.business.entities.Estado estado, loteCategoria categoria, java.util.Date fechaInicio, java.util.Date fechaFin, Pageable pageable);

            // Buscar por nombre, estado, categoria y fechas
            Page<Lote> findByActivoTrueAndNombreIgnoreCaseContainingAndEstadoAndCategoriaAndFechaCreacionBetween(String nombre, ti.proyectoinia.business.entities.Estado estado, loteCategoria categoria, java.util.Date fechaInicio, java.util.Date fechaFin, Pageable pageable);
        }

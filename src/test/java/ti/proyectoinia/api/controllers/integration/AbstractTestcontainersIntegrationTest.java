package ti.proyectoinia.api.controllers.integration;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import ti.proyectoinia.ProjectoIniaApplication;
import ti.proyectoinia.api.controllers.security.TestSecurityConfig;
import ti.proyectoinia.config.TestcontainersConfig;

/**
 * Clase base abstracta para tests de integración con Testcontainers.
 * 
 * Esta clase proporciona la configuración base para tests de integración
 * que requieren una base de datos PostgreSQL real usando Testcontainers.
 * 
 * Características:
 * - Inicia automáticamente un contenedor PostgreSQL
 * - Configura Spring Boot con las propiedades del contenedor
 * - Limpia la base de datos entre tests
 * - Reutiliza el contenedor para mejorar el rendimiento
 * 
 * Uso:
 * ```java
 * @SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
 * class MiTestDeIntegracion extends AbstractTestcontainersIntegrationTest {
 *     // Tus tests aquí
 * }
 * ```
 */
@SpringBootTest(
        classes = ProjectoIniaApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@Import({TestcontainersConfig.class, TestSecurityConfig.class})
@ActiveProfiles("test")
public abstract class AbstractTestcontainersIntegrationTest {

    /**
     * Obtiene la URL JDBC del contenedor PostgreSQL.
     * 
     * @return URL JDBC
     */
    protected String getJdbcUrl() {
        return TestcontainersConfig.getJdbcUrl();
    }

    /**
     * Obtiene el nombre de usuario de la base de datos.
     * 
     * @return Nombre de usuario
     */
    protected String getUsername() {
        return TestcontainersConfig.getUsername();
    }

    /**
     * Obtiene la contraseña de la base de datos.
     * 
     * @return Contraseña
     */
    protected String getPassword() {
        return TestcontainersConfig.getPassword();
    }
}




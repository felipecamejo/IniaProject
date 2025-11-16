package ti.proyectoinia.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * Configuración de Testcontainers para tests de integración con base de datos real.
 * 
 * Esta clase proporciona un contenedor PostgreSQL que se inicia automáticamente
 * para los tests de integración que requieren una base de datos real.
 * 
 * Uso:
 * - Extender AbstractTestcontainersIntegrationTest en tus tests de integración
 * - O usar @Import(TestcontainersConfig.class) en tus tests
 */
@TestConfiguration
public class TestcontainersConfig {

    /**
     * Contenedor PostgreSQL compartido para todos los tests.
     * Se reutiliza entre tests para mejorar el rendimiento.
     */
    private static final PostgreSQLContainer<?> postgresContainer;

    static {
        postgresContainer = new PostgreSQLContainer<>(
                DockerImageName.parse("postgres:16-alpine")
                        .asCompatibleSubstituteFor("postgres"))
                .withDatabaseName("inia_test")
                .withUsername("inia_user")
                .withPassword("inia_password")
                .withReuse(true); // Reutilizar contenedor entre ejecuciones

        postgresContainer.start();
    }

    /**
     * Configura las propiedades dinámicas de Spring para usar el contenedor PostgreSQL.
     * 
     * @param registry Registro de propiedades dinámicas de Spring
     */
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgresContainer::getJdbcUrl);
        registry.add("spring.datasource.username", postgresContainer::getUsername);
        registry.add("spring.datasource.password", postgresContainer::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        
        // Configuración JPA para tests
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
        registry.add("spring.jpa.show-sql", () -> "true");
        registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.PostgreSQLDialect");
    }

    /**
     * Bean para acceder al contenedor desde los tests si es necesario.
     * 
     * @return Instancia del contenedor PostgreSQL
     */
    @Bean
    public static PostgreSQLContainer<?> getPostgresContainer() {
        return postgresContainer;
    }

    /**
     * Obtiene la URL JDBC del contenedor.
     * 
     * @return URL JDBC
     */
    public static String getJdbcUrl() {
        return postgresContainer.getJdbcUrl();
    }

    /**
     * Obtiene el nombre de usuario de la base de datos.
     * 
     * @return Nombre de usuario
     */
    public static String getUsername() {
        return postgresContainer.getUsername();
    }

    /**
     * Obtiene la contraseña de la base de datos.
     * 
     * @return Contraseña
     */
    public static String getPassword() {
        return postgresContainer.getPassword();
    }

    /**
     * Detiene el contenedor (se llama automáticamente al finalizar los tests).
     */
    public static void stopContainer() {
        if (postgresContainer != null && postgresContainer.isRunning()) {
            postgresContainer.stop();
        }
    }
}


package ti.proyectoinia.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.core.annotation.Order;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.utility.DockerImageName;

import java.time.Duration;

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
@Order(Integer.MIN_VALUE)
public class TestcontainersConfig {

    /**
     * Contenedor PostgreSQL compartido para todos los tests.
     * Se reutiliza entre tests para mejorar el rendimiento.
     */
    private static final PostgreSQLContainer<?> postgresContainer = createAndStartContainer();

    @SuppressWarnings("resource")
    private static PostgreSQLContainer<?> createAndStartContainer() {
        // Verificar que JWT_SECRET esté disponible (debe estar configurado en pom.xml)
        String jwtSecret = System.getenv("JWT_SECRET");
        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            System.err.println("ADVERTENCIA: JWT_SECRET no está configurado como variable de entorno. " +
                    "Asegúrate de que esté configurado en pom.xml en maven-surefire-plugin.");
        }

        PostgreSQLContainer<?> container = new PostgreSQLContainer<>(
                DockerImageName.parse("postgres:16-alpine")
                        .asCompatibleSubstituteFor("postgres"))
                .withDatabaseName("Inia")
                .withUsername("postgres")
                .withPassword("897888fg2")
                .withStartupTimeout(Duration.ofMinutes(2)) // Timeout de inicio
                .waitingFor(Wait.forLogMessage(".*database system is ready to accept connections.*", 2)) // Esperar a que PostgreSQL esté listo
                .withConnectTimeoutSeconds(30); // Timeout de conexión

        try {
            container.start();
            Runtime.getRuntime().addShutdownHook(new Thread(TestcontainersConfig::stopContainer));
            return container;
        } catch (Exception e) {
            throw new RuntimeException(
                    "Error al iniciar contenedor Testcontainers. " +
                    "Verifica que Docker esté corriendo y que tengas permisos suficientes. " +
                    "Error: " + e.getMessage(), e);
        }
    }

    /**
     * Configura las propiedades dinámicas de Spring para usar el contenedor PostgreSQL.
     * Este método se ejecuta ANTES de que Spring intente crear el DataSource.
     * 
     * @param registry Registro de propiedades dinámicas de Spring
     */
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgresContainer::getJdbcUrl);
        registry.add("spring.datasource.username", postgresContainer::getUsername);
        registry.add("spring.datasource.password", postgresContainer::getPassword);
        // Registrar ambas formas de especificar el driver para compatibilidad con Spring Boot 3.x
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        registry.add("spring.datasource.driverClassName", () -> "org.postgresql.Driver");
        
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


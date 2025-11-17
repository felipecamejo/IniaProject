package ti.proyectoinia.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import ti.proyectoinia.ProjectoIniaApplication;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test de verificación de conexión a Testcontainers.
 * 
 * Este test verifica que:
 * - Testcontainers puede iniciar un contenedor PostgreSQL
 * - La conexión a la base de datos funciona correctamente
 * - Se pueden ejecutar consultas SQL básicas
 * 
 * Este test es útil para verificar que la configuración de Testcontainers
 * está correcta antes de ejecutar otros tests de integración.
 */
@SpringBootTest(classes = ProjectoIniaApplication.class)
@Import({TestcontainersConfig.class, ti.proyectoinia.api.controllers.security.TestSecurityConfig.class})
@ActiveProfiles("test")
@DisplayName("Verificación de Conexión Testcontainers")
class TestcontainersConnectionTest {

    @Autowired
    private DataSource dataSource;

    /**
     * Configura las propiedades dinámicas de Spring para usar el contenedor PostgreSQL.
     * Este método se ejecuta ANTES de que Spring intente crear el DataSource.
     * Nota: TestcontainersConfig también tiene un @DynamicPropertySource, pero este método
     * asegura que las propiedades se registren incluso si hay problemas de carga de clases.
     */
    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        PostgreSQLContainer<?> container = TestcontainersConfig.getPostgresContainer();
        registry.add("spring.datasource.url", container::getJdbcUrl);
        registry.add("spring.datasource.username", container::getUsername);
        registry.add("spring.datasource.password", container::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        registry.add("spring.datasource.driverClassName", () -> "org.postgresql.Driver");
    }

    @Test
    @DisplayName("Debería poder obtener el contenedor PostgreSQL")
    void obtenerContenedor_DeberiaRetornarContenedorActivo() {
        // Arrange & Act
        PostgreSQLContainer<?> container = TestcontainersConfig.getPostgresContainer();

        // Assert
        assertNotNull(container, "El contenedor no debería ser null");
        assertTrue(container.isRunning(), "El contenedor debería estar corriendo");
        assertNotNull(container.getJdbcUrl(), "La URL JDBC no debería ser null");
        assertNotNull(container.getUsername(), "El usuario no debería ser null");
        assertNotNull(container.getPassword(), "La contraseña no debería ser null");
    }

    @Test
    @DisplayName("Debería poder obtener la URL JDBC del contenedor")
    void obtenerJdbcUrl_DeberiaRetornarUrlValida() {
        // Arrange & Act
        String jdbcUrl = TestcontainersConfig.getJdbcUrl();
        String databaseName = TestcontainersConfig.getPostgresContainer().getDatabaseName();

        // Assert
        assertNotNull(jdbcUrl, "La URL JDBC no debería ser null");
        assertTrue(jdbcUrl.startsWith("jdbc:postgresql://"), 
                   "La URL debería comenzar con jdbc:postgresql://");
        assertTrue(jdbcUrl.contains(databaseName), 
                   "La URL debería contener el nombre de la base de datos configurada (" + databaseName + ")");
    }

    @Test
    @DisplayName("Debería poder obtener las credenciales del contenedor")
    void obtenerCredenciales_DeberiaRetornarCredencialesValidas() {
        // Arrange & Act
        String username = TestcontainersConfig.getUsername();
        String password = TestcontainersConfig.getPassword();

        // Assert
        assertEquals("postgres", username, "El usuario debería ser postgres");
        assertEquals("897888fg2", password, "La contraseña debería ser 897888fg2");
    }

    @Test
    @DisplayName("Debería poder conectarse a la base de datos usando DataSource")
    void conectarBaseDeDatos_ConDataSource_DeberiaConectarCorrectamente() throws Exception {
        // Arrange & Act
        try (Connection connection = dataSource.getConnection()) {
            // Assert
            assertNotNull(connection, "La conexión no debería ser null");
            assertFalse(connection.isClosed(), "La conexión no debería estar cerrada");
            
            // Verificar que podemos ejecutar una consulta
            try (Statement statement = connection.createStatement();
                 ResultSet resultSet = statement.executeQuery("SELECT 1")) {
                assertTrue(resultSet.next(), "Debería poder ejecutar una consulta");
                assertEquals(1, resultSet.getInt(1), "El resultado de la consulta debería ser 1");
            }
        }
    }

    @Test
    @DisplayName("Debería poder ejecutar consultas SQL básicas")
    void ejecutarConsultaSQL_DeberiaFuncionarCorrectamente() throws Exception {
        // Arrange
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {
            
            // Act - Crear una tabla temporal
            statement.execute("CREATE TEMP TABLE test_table (id INT, name VARCHAR(50))");
            
            // Insertar datos
            statement.execute("INSERT INTO test_table (id, name) VALUES (1, 'Test')");
            
            // Consultar datos
            try (ResultSet resultSet = statement.executeQuery("SELECT * FROM test_table WHERE id = 1")) {
                // Assert
                assertTrue(resultSet.next(), "Debería haber un resultado");
                assertEquals(1, resultSet.getInt("id"), "El ID debería ser 1");
                assertEquals("Test", resultSet.getString("name"), "El nombre debería ser 'Test'");
            }
        }
    }

    @Test
    @DisplayName("Debería poder obtener información de la versión de PostgreSQL")
    void obtenerVersionPostgreSQL_DeberiaRetornarVersion() throws Exception {
        // Arrange
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery("SELECT version()")) {
            
            // Act & Assert
            assertTrue(resultSet.next(), "Debería haber un resultado");
            String version = resultSet.getString(1);
            assertNotNull(version, "La versión no debería ser null");
            assertTrue(version.contains("PostgreSQL"), 
                      "La versión debería contener 'PostgreSQL'");
            
            System.out.println("Versión de PostgreSQL: " + version);
        }
    }
}


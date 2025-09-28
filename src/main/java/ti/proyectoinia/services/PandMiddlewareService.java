package ti.proyectoinia.services;

import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Service
public class PandMiddlewareService {

    /**
     * Ejecuta el script Python `Middleware/pandaAlchemy.py` para crear la tabla.
     * Retorna la salida combinada (stdout y stderr) del proceso.
     */
    public String ejecutarCrearTabla() {
        List<String> command = buildPythonCommand();

        // Ruta del script: <projectRoot>/Middleware/pandaAlchemy.py
        Path scriptPath = Paths.get(System.getProperty("user.dir"), "Middleware", "pandaAlchemy.py");
        if (!scriptPath.toFile().exists()) {
            return "No se encontró el script: " + scriptPath;
        }
        command.add(scriptPath.toString());

        return runProcess(command, scriptPath.getParent().toFile());
    }

    /**
     * Ejecuta el script para insertar datos desde un archivo Excel en la tabla mi_talbla.
     */
    public String ejecutarInsertarDesdeExcel(String rutaExcel) {
        List<String> command = buildPythonCommand();

        Path scriptPath = Paths.get(System.getProperty("user.dir"), "Middleware", "pandaAlchemy.py");
        if (!scriptPath.toFile().exists()) {
            return "No se encontró el script: " + scriptPath;
        }

        command.add(scriptPath.toString());
        command.add("--insert");
        command.add(rutaExcel);

        return runProcess(command, scriptPath.getParent().toFile());
    }

    /**
     * Ejecuta el script InsertTablesHere.py para insertar datos masivos.
     * Inserta 5000 registros en todas las tablas excepto usuarios (20 registros).
     */
    public String ejecutarInsertarDatosMasivos() {
        return ejecutarInsertarDatosMasivos(5000);
    }

    /**
     * Ejecuta el script InsertTablesHere.py para insertar datos masivos con cantidad personalizada.
     * @param numRows Número de registros a insertar por tabla
     */
    public String ejecutarInsertarDatosMasivos(int numRows) {
        List<String> command = buildPythonCommandWithVenv();

        Path scriptPath = Paths.get(System.getProperty("user.dir"), "middleware", "InsertTablesHere.py");
        if (!scriptPath.toFile().exists()) {
            return "No se encontró el script: " + scriptPath;
        }

        command.add(scriptPath.toString());
        command.add("--rows");
        command.add(String.valueOf(numRows));

        return runProcess(command, scriptPath.getParent().toFile());
    }

    /**
     * Ejecuta el script InsertTablesHere.py con parámetros personalizados.
     * @param numRows Número de registros a insertar por tabla
     * @param onlyTables Lista de tablas específicas (separadas por comas)
     * @param skipTables Lista de tablas a excluir (separadas por comas)
     */
    public String ejecutarInsertScriptConParametros(int numRows, String onlyTables, String skipTables) {
        List<String> command = buildPythonCommandWithVenv();

        Path scriptPath = Paths.get(System.getProperty("user.dir"), "middleware", "InsertTablesHere.py");
        if (!scriptPath.toFile().exists()) {
            return "No se encontró el script: " + scriptPath;
        }

        command.add(scriptPath.toString());
        command.add("--rows");
        command.add(String.valueOf(numRows));

        // Agregar parámetros opcionales
        if (onlyTables != null && !onlyTables.trim().isEmpty()) {
            command.add("--only");
            command.add(onlyTables.trim());
        }

        if (skipTables != null && !skipTables.trim().isEmpty()) {
            command.add("--skip");
            command.add(skipTables.trim());
        }

        return runProcess(command, scriptPath.getParent().toFile());
    }

    private List<String> buildPythonCommand() {
        List<String> command = new ArrayList<>();
        String pythonExecutable = System.getenv("PYTHON_EXECUTABLE");
        if (pythonExecutable == null || pythonExecutable.isBlank()) {
            // Preferir 'py' en Windows; 'python' en otros entornos
            String osName = System.getProperty("os.name", "").toLowerCase();
            pythonExecutable = osName.contains("win") ? "py" : "python";
        }
        command.add(pythonExecutable);
        return command;
    }

    /**
     * Construye el comando Python usando el entorno virtual del middleware.
     * Esto asegura que se usen las dependencias correctas instaladas por SetupMiddleware.ps1
     */
    private List<String> buildPythonCommandWithVenv() {
        List<String> command = new ArrayList<>();
        String osName = System.getProperty("os.name", "").toLowerCase();
        
        if (osName.contains("win")) {
            // En Windows, usar el Python del entorno virtual
            Path venvPython = Paths.get(System.getProperty("user.dir"), "middleware", ".venv", "Scripts", "python.exe");
            if (venvPython.toFile().exists()) {
                command.add(venvPython.toString());
            } else {
                // Fallback a py si no existe el venv
                command.add("py");
            }
        } else {
            // En Linux/Mac, usar el Python del entorno virtual
            Path venvPython = Paths.get(System.getProperty("user.dir"), "middleware", ".venv", "bin", "python");
            if (venvPython.toFile().exists()) {
                command.add(venvPython.toString());
            } else {
                // Fallback a python si no existe el venv
                command.add("python");
            }
        }
        
        return command;
    }

    private String runProcess(List<String> command, File workingDirectory) {
        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.directory(workingDirectory);
        processBuilder.redirectErrorStream(true);
        // Forzar UTF-8 en salida de Python para evitar problemas de consola en Windows
        processBuilder.environment().put("PYTHONIOENCODING", "utf-8");
        processBuilder.environment().put("PYTHONUTF8", "1");

        StringBuilder outputBuilder = new StringBuilder();
        try {
            Process process = processBuilder.start();

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    outputBuilder.append(line).append(System.lineSeparator());
                }
            }

            int exitCode = process.waitFor();
            outputBuilder.append("ExitCode: ").append(exitCode);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            outputBuilder.append("Ejecución interrumpida: ").append(e.getMessage());
        } catch (IOException e) {
            outputBuilder.append("Error ejecutando pandaAlchemy.py: ").append(e.getMessage());
        }

        return outputBuilder.toString();
    }
}



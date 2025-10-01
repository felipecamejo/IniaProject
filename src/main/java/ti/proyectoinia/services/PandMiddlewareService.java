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

    // Eliminados métodos de pandaAlchemy (crear tabla y cargar Excel a mi_tabla)

    /**
     * Ejecuta el script MassiveInsertFiles.py para insertar datos masivos.
     * Inserta datos en todas las tablas del sistema.
     */
    public String ejecutarInsertarDatosMasivos() {
        return ejecutarInsertarDatosMasivos(5000);
    }

    /**
     * Ejecuta el script MassiveInsertFiles.py para insertar datos masivos.
     * @param numRows Número de registros a insertar por tabla (ignorado, usa valores por defecto)
     */
    public String ejecutarInsertarDatosMasivos(int numRows) {
        List<String> command = buildPythonCommandWithVenv();

        Path scriptPath = Paths.get(System.getProperty("user.dir"), "middleware", "MassiveInsertFiles.py");
        if (!scriptPath.toFile().exists()) {
            return "No se encontró el script: " + scriptPath;
        }

        command.add(scriptPath.toString());

        return runProcess(command, scriptPath.getParent().toFile());
    }

    /**
     * Ejecuta el script MassiveInsertFiles.py (sin parámetros personalizados).
     * @param numRows Número de registros a insertar por tabla (ignorado)
     * @param onlyTables Lista de tablas específicas (ignorado)
     * @param skipTables Lista de tablas a excluir (ignorado)
     */
    public String ejecutarInsertScriptConParametros(int numRows, String onlyTables, String skipTables) {
        // MassiveInsertFiles.py no acepta parámetros personalizados, usa configuración interna
        return ejecutarInsertarDatosMasivos();
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
            outputBuilder.append("Error ejecutando MassiveInsertFiles.py: ").append(e.getMessage());
        }

        return outputBuilder.toString();
    }
}



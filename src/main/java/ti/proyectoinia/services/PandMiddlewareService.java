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



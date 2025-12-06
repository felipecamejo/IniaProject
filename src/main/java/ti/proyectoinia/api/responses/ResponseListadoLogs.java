package ti.proyectoinia.api.responses;

import ti.proyectoinia.dtos.LogDto;

import java.util.List;

public class ResponseListadoLogs {
    private List<LogDto> logs;

    public ResponseListadoLogs() {}

    public ResponseListadoLogs(List<LogDto> logs) {
        this.logs = logs;
    }

    public List<LogDto> getLogs() {
        return logs;
    }

    public void setLogs(List<LogDto> logs) {
        this.logs = logs;
    }
}

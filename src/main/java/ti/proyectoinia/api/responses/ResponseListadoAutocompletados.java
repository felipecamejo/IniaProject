package ti.proyectoinia.api.responses;

import ti.proyectoinia.dtos.AutocompletadoDto;

import java.util.List;

public class ResponseListadoAutocompletados {
    private List<AutocompletadoDto> autocompletados;

    public ResponseListadoAutocompletados() {}

    public ResponseListadoAutocompletados(List<AutocompletadoDto> autocompletados) {
        this.autocompletados = autocompletados;
    }

    public List<AutocompletadoDto> getAutocompletados() {
        return autocompletados;
    }

    public void setAutocompletados(List<AutocompletadoDto> autocompletados) {
        this.autocompletados = autocompletados;
    }
}


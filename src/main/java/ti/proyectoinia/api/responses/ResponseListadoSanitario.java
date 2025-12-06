package ti.proyectoinia.api.responses;

import ti.proyectoinia.dtos.SanitarioDto;

import java.util.List;

public class ResponseListadoSanitario {

    private List<SanitarioDto> dtos;

    public ResponseListadoSanitario() {}

    public ResponseListadoSanitario(List<SanitarioDto> dtos) {
        this.dtos = dtos;
    }

    public List<SanitarioDto> getSanitario() {
        return dtos;
    }

    public void setSanitario(List<SanitarioDto> dtos) {
        this.dtos = dtos;
    }

}

package ti.proyectoinia.api.responses;

import ti.proyectoinia.dtos.DOSNDto;

import java.util.List;

public class ResponseListadoDOSN {

    private List<DOSNDto> dtos;

    public ResponseListadoDOSN() {}

    public ResponseListadoDOSN(List<DOSNDto> dtos) {
        this.dtos = dtos;
    }

    public List<DOSNDto> getDOSN() {
        return dtos;
    }

    public void setDOSN(List<DOSNDto> dtos) {
        this.dtos = dtos;
    }
}

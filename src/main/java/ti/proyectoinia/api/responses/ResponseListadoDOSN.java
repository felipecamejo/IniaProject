package ti.proyectoinia.api.responses;

import ti.proyectoinia.business.entities.DOSN;
import ti.proyectoinia.dtos.DOSNDto;
import ti.proyectoinia.dtos.PMSDto;

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

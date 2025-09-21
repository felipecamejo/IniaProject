package ti.proyectoinia.api.responses;

import ti.proyectoinia.dtos.DOSNDto;
import ti.proyectoinia.dtos.PurezaPNotatumDto;

import java.util.List;

public class ResponseListadoPurezaPNotatum {

    private List<PurezaPNotatumDto> dtos;

    public ResponseListadoPurezaPNotatum() {}

    public ResponseListadoPurezaPNotatum(List<PurezaPNotatumDto> dtos) {
        this.dtos = dtos;
    }

    public List<PurezaPNotatumDto> getPurezaPNotatun() {
        return dtos;
    }

    public void setPurezaPNotatum(List<PurezaPNotatumDto> dtos) {
        this.dtos = dtos;
    }
}

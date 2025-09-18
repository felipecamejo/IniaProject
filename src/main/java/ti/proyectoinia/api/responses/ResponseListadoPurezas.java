package ti.proyectoinia.api.responses;

import ti.proyectoinia.dtos.PurezaDto;

import java.util.List;

public class ResponseListadoPurezas {
    private List<PurezaDto> purezas;

    public ResponseListadoPurezas() {}

    public ResponseListadoPurezas(List<PurezaDto> purezas) {
        this.purezas = purezas;
    }

    public List<PurezaDto> getPurezas() {
        return purezas;
    }

    public void setPurezas(List<PurezaDto> purezas) {
        this.purezas = purezas;
    }
}

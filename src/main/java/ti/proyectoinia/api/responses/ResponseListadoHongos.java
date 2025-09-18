package ti.proyectoinia.api.responses;

import ti.proyectoinia.dtos.HongoDto;

import java.util.List;

public class ResponseListadoHongos {
    private List<HongoDto> hongos;

    public ResponseListadoHongos() {}

    public ResponseListadoHongos(List<HongoDto> hongos) {
        this.hongos = hongos;
    }

    public List<HongoDto> getHongos() {
        return hongos;
    }

    public void setHongos(List<HongoDto> hongos) {
        this.hongos = hongos;
    }
}

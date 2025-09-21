package ti.proyectoinia.api.responses;

import ti.proyectoinia.dtos.DOSNDto;
import ti.proyectoinia.dtos.GerminacionDto;

import java.util.List;

public class ResponseListadoGerminacion {

    private List<GerminacionDto> dtos;

    public ResponseListadoGerminacion() {}

    public ResponseListadoGerminacion(List<GerminacionDto> dtos) {
        this.dtos = dtos;
    }

    public List<GerminacionDto> getGerminacion() {
        return dtos;
    }

    public void setGerminacion(List<GerminacionDto> dtos) {
        this.dtos = dtos;
    }

}

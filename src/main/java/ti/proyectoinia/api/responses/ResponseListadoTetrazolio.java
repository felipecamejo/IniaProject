package ti.proyectoinia.api.responses;

import ti.proyectoinia.dtos.TetrazolioDto;

import java.util.List;

public class ResponseListadoTetrazolio {

    private List<TetrazolioDto> dtos;

    public ResponseListadoTetrazolio() {}

    public ResponseListadoTetrazolio(List<TetrazolioDto> dtos) {
        this.dtos = dtos;
    }

    public List<TetrazolioDto> getTetrazolio() {
        return dtos;
    }

    public void setTetrazolio(List<TetrazolioDto> dtos) {
        this.dtos = dtos;
    }

}

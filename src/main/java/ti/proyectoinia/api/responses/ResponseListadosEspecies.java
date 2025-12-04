package ti.proyectoinia.api.responses;


import ti.proyectoinia.dtos.EspecieDto;

import java.util.List;

public class ResponseListadosEspecies {
    private List<EspecieDto> listados;

    public ResponseListadosEspecies() {}

    public ResponseListadosEspecies(List<EspecieDto> listados) {
        this.listados = listados;
    }

    public List<EspecieDto> getListado() {
        return listados;
    }

    public void setListado(List<EspecieDto> listados) {
        this.listados = listados;
    }
}

package ti.proyectoinia.api.responses;

import ti.proyectoinia.dtos.MetodoDto;

import java.util.List;

public class ResponseListadoMetodos {
    private List<MetodoDto> metodos;

    public ResponseListadoMetodos() {}

    public ResponseListadoMetodos(List<MetodoDto> metodos) {
        this.metodos = metodos;
    }

    public List<MetodoDto> getMetodos() {
        return metodos;
    }

    public void setMetodos(List<MetodoDto> metodos) {
        this.metodos = metodos;
    }
}

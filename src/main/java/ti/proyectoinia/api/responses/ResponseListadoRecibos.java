package ti.proyectoinia.api.responses;

import ti.proyectoinia.dtos.ReciboDto;

import java.util.List;

public class ResponseListadoRecibos {
    private List<ReciboDto> recibos;

    public ResponseListadoRecibos() {}

    public ResponseListadoRecibos(List<ReciboDto> recibos) {
        this.recibos = recibos;
    }

    public List<ReciboDto> getRecibos() {
        return recibos;
    }

    public void setRecibos(List<ReciboDto> recibos) {
        this.recibos = recibos;
    }
}

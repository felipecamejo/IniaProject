package ti.proyectoinia.api.responses;

import ti.proyectoinia.dtos.LoteDto;

import java.util.List;

public class ResponseListadoLotes {
    private List<LoteDto> lotes;

    public ResponseListadoLotes() {}

    public ResponseListadoLotes(List<LoteDto> lotes) {
        this.lotes = lotes;
    }

    public List<LoteDto> getLotes() {
        return lotes;
    }

    public void setLotes(List<LoteDto> lotes) {
        this.lotes = lotes;
    }
}

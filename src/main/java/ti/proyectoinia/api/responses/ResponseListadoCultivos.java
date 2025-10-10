package ti.proyectoinia.api.responses;

import ti.proyectoinia.dtos.CultivoDto;
import java.util.List;

public class ResponseListadoCultivos {
    private List<CultivoDto> cultivos;

    public ResponseListadoCultivos() {}

    public ResponseListadoCultivos(List<CultivoDto> cultivos) {
        this.cultivos = cultivos;
    }

    public List<CultivoDto> getCultivos() {
        return cultivos;
    }

    public void setCultivos(List<CultivoDto> cultivos) {
        this.cultivos = cultivos;
    }
}



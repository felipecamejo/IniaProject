package ti.proyectoinia.api.responses;

import ti.proyectoinia.dtos.SanitarioHongoDto;

import java.util.List;

public class ResponseListadoSanitarioHongo {
    private List<SanitarioHongoDto> sanitarioHongos;

    public ResponseListadoSanitarioHongo() {}

    public ResponseListadoSanitarioHongo(List<SanitarioHongoDto> sanitarioHongos) {
        this.sanitarioHongos = sanitarioHongos;
    }

    public List<SanitarioHongoDto> getSanitarioHongos() {
        return sanitarioHongos;
    }

    public void setSanitarioHongos(List<SanitarioHongoDto> sanitarioHongos) {
        this.sanitarioHongos = sanitarioHongos;
    }

}

package ti.proyectoinia.api.responses;

import ti.proyectoinia.dtos.MalezaDto;

import java.util.List;

public class ResponseListadoMalezas {
    private List<MalezaDto> malezas;

    public ResponseListadoMalezas() {}

    public ResponseListadoMalezas(List<MalezaDto> malezas) {
        this.malezas = malezas;
    }

    public List<MalezaDto> getMalezas() {
        return malezas;
    }

    public void setMalezas(List<MalezaDto> malezas) {
        this.malezas = malezas;
    }
}

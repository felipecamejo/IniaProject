package ti.proyectoinia.api.responses;

import ti.proyectoinia.dtos.RepeticionesPPNDTO;

import java.util.List;

public class ResponseListadoRepeticionPPN {

    private List<RepeticionesPPNDTO> repeticiones;

    public ResponseListadoRepeticionPPN() {}

    public ResponseListadoRepeticionPPN(List<RepeticionesPPNDTO> repeticiones) {
        this.repeticiones = repeticiones;
    }

    public List<RepeticionesPPNDTO> getRepeticiones() {
        return repeticiones;
    }

    public void setHumedades(List<RepeticionesPPNDTO> repeticiones) {
        this.repeticiones = repeticiones;
    }



}

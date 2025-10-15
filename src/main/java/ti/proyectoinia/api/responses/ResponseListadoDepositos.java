package ti.proyectoinia.api.responses;

import ti.proyectoinia.dtos.DepositoDto;
import ti.proyectoinia.dtos.HongoDto;

import java.util.List;

public class ResponseListadoDepositos {
    private List<DepositoDto> depositos;

    public ResponseListadoDepositos() {}

    public ResponseListadoDepositos(List<DepositoDto> depositos) {
        this.depositos = depositos;
    }

    public List<DepositoDto> getDepositos() {
        return depositos;
    }

    public void setDepositos(List<DepositoDto> depositos) {
        this.depositos = depositos;
    }

}

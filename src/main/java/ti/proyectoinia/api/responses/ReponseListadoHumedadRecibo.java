package ti.proyectoinia.api.responses;

import ti.proyectoinia.business.entities.HumedadRecibo;
import ti.proyectoinia.dtos.DepositoDto;
import ti.proyectoinia.dtos.HumedadReciboDto;

import java.util.List;

public class ReponseListadoHumedadRecibo {

        private List<HumedadReciboDto> humedades;

        public ReponseListadoHumedadRecibo() {}

        public ReponseListadoHumedadRecibo(List<HumedadReciboDto> humedades) {
            this.humedades = humedades;
        }

        public List<HumedadReciboDto> getHumedades() {
            return humedades;
        }

        public void setHumedades(List<HumedadReciboDto> humedades) {
            this.humedades = humedades;
        }



}

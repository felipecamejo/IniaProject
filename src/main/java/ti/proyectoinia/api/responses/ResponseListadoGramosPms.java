package ti.proyectoinia.api.responses;

import ti.proyectoinia.dtos.GramosPmsDto;
import java.util.List;

public class ResponseListadoGramosPms {

        private List<GramosPmsDto> gramosPms;

        public ResponseListadoGramosPms() {}

        public ResponseListadoGramosPms(List<GramosPmsDto> gramosPms) {
            this.gramosPms = gramosPms;
        }

        public List<GramosPmsDto> getGramosPms() {
            return gramosPms;
        }

        public void setGramosPms(List<GramosPmsDto> gramosPms) {
            this.gramosPms = gramosPms;
        }



}

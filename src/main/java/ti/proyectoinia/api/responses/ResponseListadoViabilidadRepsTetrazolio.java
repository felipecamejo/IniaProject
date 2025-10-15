package ti.proyectoinia.api.responses;

import ti.proyectoinia.dtos.ViabilidadRepsTetrazolioDto;
import java.util.List;

public class ResponseListadoViabilidadRepsTetrazolio {

        private List<ViabilidadRepsTetrazolioDto> viabilidadRepsTetrazolio;

        public ResponseListadoViabilidadRepsTetrazolio() {}

        public ResponseListadoViabilidadRepsTetrazolio(List<ViabilidadRepsTetrazolioDto> viabilidadRepsTetrazolio) {
            this.viabilidadRepsTetrazolio = viabilidadRepsTetrazolio;
        }

        public List<ViabilidadRepsTetrazolioDto> getViabilidadRepsTetrazolio() {
            return viabilidadRepsTetrazolio;
        }

        public void setViabilidadRepsTetrazolio(List<ViabilidadRepsTetrazolioDto> viabilidadRepsTetrazolio) {
            this.viabilidadRepsTetrazolio = viabilidadRepsTetrazolio;
        }



}

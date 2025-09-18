package ti.proyectoinia.api.responses;

import ti.proyectoinia.dtos.PMSDto;

import java.util.List;

public class ResponseListadoPMS {
    private List<PMSDto> pms;

    public ResponseListadoPMS() {}

    public ResponseListadoPMS(List<PMSDto> pms) {
        this.pms = pms;
    }

    public List<PMSDto> getPms() {
        return pms;
    }

    public void setPms(List<PMSDto> pms) {
        this.pms = pms;
    }
}

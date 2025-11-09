package ti.proyectoinia.api.responses;

import ti.proyectoinia.dtos.CertificadoDto;

import java.util.List;

public class ResponseListadoCertificados {
    private List<CertificadoDto> certificados;

    public ResponseListadoCertificados() {}

    public ResponseListadoCertificados(List<CertificadoDto> certificados) {
        this.certificados = certificados;
    }

    public List<CertificadoDto> getCertificados() {
        return certificados;
    }

    public void setCertificados(List<CertificadoDto> certificados) {
        this.certificados = certificados;
    }
}


package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadoCertificados;
import ti.proyectoinia.business.entities.Certificado;
import ti.proyectoinia.business.repositories.CertificadoRepository;
import ti.proyectoinia.dtos.CertificadoDto;

@Service
public class CertificadoService {

    private final CertificadoRepository certificadoRepository;
    private final MapsDtoEntityService mapsDtoEntityService;

    public CertificadoService(CertificadoRepository certificadoRepository, MapsDtoEntityService mapsDtoEntityService) {
        this.certificadoRepository = certificadoRepository;
        this.mapsDtoEntityService = mapsDtoEntityService;
    }

    public CertificadoDto crearCertificado(CertificadoDto certificadoDto) {
        certificadoDto.setId(null);
        Certificado certificadoGuardado = this.certificadoRepository.save(
            mapsDtoEntityService.mapToEntityCertificado(certificadoDto)
        );
        return mapsDtoEntityService.mapToDtoCertificado(certificadoGuardado);
    }

    public CertificadoDto obtenerCertificadoPorId(Long id) {
        Certificado certificado = this.certificadoRepository.findById(id).orElse(null);
        if (certificado == null || !certificado.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoCertificado(certificado);
    }

    public String editarCertificado(CertificadoDto certificadoDto) {
        this.certificadoRepository.save(mapsDtoEntityService.mapToEntityCertificado(certificadoDto));
        return "Certificado actualizado correctamente ID:" + certificadoDto.getId();
    }

    public String eliminarCertificado(Long id) {
        if (id != null) {
            this.certificadoRepository.findById(id).ifPresent(certificado -> {
                certificado.setActivo(false);
                this.certificadoRepository.save(certificado);
            });
        }
        return "Certificado eliminado correctamente ID:" + id;
    }

    public ResponseEntity<ResponseListadoCertificados> listadoCertificados() {
        var certificadosActivos = this.certificadoRepository.findByActivoTrue();
        var certificadosDto = certificadosActivos.stream()
                .map(mapsDtoEntityService::mapToDtoCertificado)
                .toList();
        ResponseListadoCertificados responseListadoCertificados = new ResponseListadoCertificados(certificadosDto);
        return ResponseEntity.ok(responseListadoCertificados);
    }

    public ResponseEntity<ResponseListadoCertificados> listadoCertificadosPorRecibo(Long reciboId) {
        var certificadosActivos = this.certificadoRepository.findByActivoTrueAndReciboIdAndReciboActivoTrue(reciboId);
        var certificadosDto = certificadosActivos.stream()
                .map(mapsDtoEntityService::mapToDtoCertificado)
                .toList();
        ResponseListadoCertificados responseListadoCertificados = new ResponseListadoCertificados(certificadosDto);
        return ResponseEntity.ok(responseListadoCertificados);
    }
}


package ti.proyectoinia.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadoGerminacion;
import ti.proyectoinia.business.entities.Germinacion;
import ti.proyectoinia.business.repositories.GerminacionRepository;
import ti.proyectoinia.dtos.GerminacionDto;
import ti.proyectoinia.dtos.ConteoGerminacionDto;


@Service
public class GerminacionService {

    private final GerminacionRepository germinacionRepository;
    private final MapsDtoEntityService mapsDtoEntityService;
    private final GerminacionMatrizService germinacionMatrizService;
    private static final Logger log = LoggerFactory.getLogger(GerminacionService.class);

    public GerminacionService(GerminacionRepository germinacionRepository, MapsDtoEntityService mapsDtoEntityService, GerminacionMatrizService germinacionMatrizService) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.germinacionRepository = germinacionRepository;
        this.germinacionMatrizService = germinacionMatrizService;
    }

    public String crearGerminacion(GerminacionDto germinacionDto) {
        // 1) Persistir germinación
        Germinacion saved = this.germinacionRepository.save(mapsDtoEntityService.mapToEntityGerminacion(germinacionDto));
        Long germinacionId = saved.getId();

        // Log de confirmación de campos persistidos
        try {
            log.info("Germinacion guardada ID {} - pNormal(INIA/INASE): {}/{}; pAnormal: {}/{}; pMuertas: {}/{}; pFrescas: {}/{}; semillasDuras: {}/{}; germinacion: {}/{}",
                    germinacionId,
                    saved.getPNormalINIA(), saved.getPNormalINASE(),
                    saved.getPAnormalINIA(), saved.getPAnormalINASE(),
                    saved.getPMuertasINIA(), saved.getPMuertasINASE(),
                    saved.getPFrescasINIA(), saved.getPFrescasINASE(),
                    saved.getSemillasDurasINIA(), saved.getSemillasDurasINASE(),
                    saved.getGerminacionINIA(), saved.getGerminacionINASE());
        } catch (Exception e) {
            log.warn("No se pudo registrar el log de la germinacion guardada: {}", e.getMessage());
        }
        // Fallback a System.out.println si los logs no se ven
        try {
            System.out.println("[GerminacionService] Guardada ID=" + germinacionId + " -> " +
                    "pNormalINIA=" + saved.getPNormalINIA() + ", " +
                    "pNormalINASE=" + saved.getPNormalINASE() + ", " +
                    "pAnormalINIA=" + saved.getPAnormalINIA() + ", " +
                    "pAnormalINASE=" + saved.getPAnormalINASE() + ", " +
                    "pMuertasINIA=" + saved.getPMuertasINIA() + ", " +
                    "pMuertasINASE=" + saved.getPMuertasINASE() + ", " +
                    "pFrescasINIA=" + saved.getPFrescasINIA() + ", " +
                    "pFrescasINASE=" + saved.getPFrescasINASE() + ", " +
                    "semillasDurasINIA=" + saved.getSemillasDurasINIA() + ", " +
                    "semillasDurasINASE=" + saved.getSemillasDurasINASE() + ", " +
                    "germinacionINIA=" + saved.getGerminacionINIA() + ", " +
                    "germinacionINASE=" + saved.getGerminacionINASE());
        } catch (Exception ignored) {}

        // 2) Crear automáticamente el Conteo 1 usando la fechaInicio como fechaConteo (si está presente)
        ConteoGerminacionDto conteoInicial = new ConteoGerminacionDto();
        conteoInicial.setNumeroConteo(1);
        conteoInicial.setFechaConteo(saved.getFechaInicio());
        germinacionMatrizService.addConteo(germinacionId, conteoInicial);

        // 3) Inicializar las 3 tablas de tratamientos (crear repetición 1 vacía para cada una)
        germinacionMatrizService.initializeTablasForGerminacion(germinacionId);

        return "Germinacion creada correctamente ID:" + germinacionId;
    }

    public GerminacionDto obtenerGerminacionPorId(Long id) {
        Germinacion germinacion = this.germinacionRepository.findById(id).orElse(null);
        if (germinacion == null || !germinacion.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoGerminacion(germinacion);
    }

    public String eliminarGerminacion(Long id) {
        if (id != null) {
            this.germinacionRepository.findById(id).ifPresent(germinacion -> {
                germinacion.setActivo(false);
                this.germinacionRepository.save(germinacion);
            });
        }
        return "Germinacion eliminada correctamente ID:" + id;
    }

    public String editarGerminacion(GerminacionDto germinacionDto) {
        this.germinacionRepository.save(mapsDtoEntityService.mapToEntityGerminacion(germinacionDto));
        return "Germinacion actualizada correctamente ID:" + germinacionDto.getId();
    }

    public ResponseEntity<ResponseListadoGerminacion> listarGerminacionesPorRecibo(Long reciboId) {
        var germinaciones = this.germinacionRepository.findByActivoTrueAndReciboIdAndReciboActivoTrue(reciboId);
        var dtos = germinaciones.stream()
                .map(mapsDtoEntityService::mapToDtoGerminacion)
                .toList();
        ResponseListadoGerminacion response = new ResponseListadoGerminacion(dtos);
        return ResponseEntity.ok(response);
    }
}

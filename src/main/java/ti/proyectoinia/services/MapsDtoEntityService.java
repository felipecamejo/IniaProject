package ti.proyectoinia.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ti.proyectoinia.business.entities.*;
import ti.proyectoinia.dtos.*;
import ti.proyectoinia.business.repositories.ReciboRepository;
import ti.proyectoinia.business.repositories.CultivoRepository;
import ti.proyectoinia.business.repositories.MalezaRepository;
import ti.proyectoinia.business.repositories.PurezaPNotatumRepository;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Date;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
public class MapsDtoEntityService {
    @Autowired
    private ReciboRepository reciboRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private CultivoRepository cultivoRepository;
    @Autowired
    private MalezaRepository malezaRepository;
    @Autowired
    private PurezaPNotatumRepository purezaPNotatumRepository;

    // Formato ISO simple para fechas tipo "2024-01-15T10:30:00"
    private static final DateTimeFormatter ISO_LOCAL_DATE_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    private String formatDate(Date date) {
        if (date == null) {
            return null;
        }
        LocalDateTime localDateTime = LocalDateTime.ofInstant(date.toInstant(), ZoneId.systemDefault());
        return ISO_LOCAL_DATE_TIME.format(localDateTime);
    }

    private Date parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        
        // Remover milisegundos y zona horaria para evitar problemas de parsing
        String cleanValue = value;
        if (cleanValue.contains(".")) {
            // Remover milisegundos (ej: .917)
            cleanValue = cleanValue.substring(0, cleanValue.indexOf("."));
        }
        if (cleanValue.endsWith("Z")) {
            // Remover Z de zona horaria UTC
            cleanValue = cleanValue.substring(0, cleanValue.length() - 1);
        }
        
        LocalDateTime localDateTime = LocalDateTime.parse(cleanValue, ISO_LOCAL_DATE_TIME);
        return Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
    }

    public Recibo getValidRecibo(Long reciboId) {
        if (reciboId == null) {
            return null;
        }
        
        return reciboRepository.findById(reciboId)
            .filter(Recibo::isActivo)
            .orElse(null);
    }

    public Cultivo getValidCultivo(Long cultivoId) {
        if (cultivoId == null) {
            return null;
        }
        return cultivoRepository.findById(cultivoId)
            .filter(Cultivo::isActivo)
            .orElse(null);
    }

    public Maleza getValidMaleza(Long malezaId) {
        if (malezaId == null) {
            return null;
        }
        return malezaRepository.findById(malezaId)
            .filter(Maleza::isActivo)
            .orElse(null);
    }

    public PurezaPNotatum getValidPurezaPNotatum(Long id) {
        if (id == null) return null;
        return purezaPNotatumRepository.findById(id).filter(PurezaPNotatum::isActivo).orElse(null);
    }

    public HongoDto mapToDtoHongo(Hongo hongo) {
        if (hongo == null) {
            return null;
        }

        HongoDto hongoDto = new HongoDto();
        hongoDto.setId(hongo.getId());
        hongoDto.setNombre(hongo.getNombre());
        hongoDto.setDescripcion(hongo.getDescripcion());
        hongoDto.setActivo(hongo.isActivo());

        return hongoDto;
    }

    public Hongo mapToEntityHongo(HongoDto hongoDto) {
        if (hongoDto == null) {
            return null;
        }

        Hongo hongo = new Hongo();
        hongo.setId(hongoDto.getId());
        hongo.setNombre(hongoDto.getNombre());
        hongo.setDescripcion(hongoDto.getDescripcion());
        hongo.setActivo(hongoDto.isActivo());

        return hongo;
    }

    public MetodoDto mapToDtoMetodo(Metodo metodo) {
        if (metodo == null) {
            return null;
        }

        MetodoDto metodoDto = new MetodoDto();
        metodoDto.setId(metodo.getId());
        metodoDto.setNombre(metodo.getNombre());
        metodoDto.setAutor(metodo.getAutor());
        metodoDto.setDescripcion(metodo.getDescripcion());
        metodoDto.setActivo(metodo.isActivo());

        return metodoDto;
    }

    public Metodo mapToEntityMetodo(MetodoDto metodoDto) {
        if (metodoDto == null) {
            return null;
        }

        Metodo metodo = new Metodo();
        metodo.setId(metodoDto.getId());
        metodo.setNombre(metodoDto.getNombre());
        metodo.setAutor(metodoDto.getAutor());
        metodo.setDescripcion(metodoDto.getDescripcion());
        metodo.setActivo(metodoDto.isActivo());

        return metodo;
    }

    public RepeticionesPPN maptoEntityRepeticionPPN(RepeticionesPPNDTO dto){
        if (dto == null){
            return null;
        }

        RepeticionesPPN entity = new RepeticionesPPN();

        entity.setId(dto.getId());
        entity.setPeso(dto.getPeso());
        entity.setNroSemillasPuras(dto.getNroSemillasPuras());
        entity.setContaminadasYVanas(dto.getContaminadasYVanas());
        entity.setGramosContaminadasYVanas(dto.getGramosContaminadasYVanas());
        entity.setGramosSemillasSanas(dto.getGramosSemillasSanas());
        entity.setCantidadSemillasSanas(dto.getCantidadSemillasSanas());
        entity.setPurezaPNotatum(getValidPurezaPNotatum(dto.getPurezaPNotatum()));

        return entity;
    }

    public RepeticionesPPNDTO maptoDtoRepeticionPPN(RepeticionesPPN entity){
        if (entity == null){
            return null;
        }

        RepeticionesPPNDTO dto = new RepeticionesPPNDTO();

        dto.setId(entity.getId());
        dto.setPeso(entity.getPeso());
        dto.setNroSemillasPuras(entity.getNroSemillasPuras());
        dto.setContaminadasYVanas(entity.getContaminadasYVanas());
        dto.setGramosContaminadasYVanas(entity.getGramosContaminadasYVanas());
        dto.setGramosSemillasSanas(entity.getGramosSemillasSanas());
        dto.setCantidadSemillasSanas(entity.getCantidadSemillasSanas());
        dto.setPurezaPNotatum(entity.getPurezaPNotatum() != null ? entity.getPurezaPNotatum().getId() : null);

        return dto;
    }

    public GerminacionDto mapToDtoGerminacion(Germinacion germinacion) {
        if (germinacion == null) {
            return null;
        }

        GerminacionDto dto = new GerminacionDto();
        dto.setId(germinacion.getId());
        dto.setFechaInicio(germinacion.getFechaInicio());
        dto.setTotalDias(germinacion.getTotalDias());
        dto.setTratamiento(germinacion.getTratamiento());
        dto.setNroSemillaPorRepeticion(germinacion.getNroSemillaPorRepeticion());
        dto.setMetodo(germinacion.getMetodo());
        dto.setTemperatura(germinacion.getTemperatura());
        dto.setPreFrio(germinacion.getPreFrio());
        dto.setPreTratamiento(germinacion.getPreTratamiento());
        dto.setNroDias(germinacion.getNroDias());
        dto.setFechaFinal(germinacion.getFechaFinal());
        dto.setPRedondeo(germinacion.getPRedondeo());
        dto.setPNormalINIA(germinacion.getPNormalINIA());
        dto.setPNormalINASE(germinacion.getPNormalINASE());
        dto.setPAnormalINIA(germinacion.getPAnormalINIA());
        dto.setPAnormalINASE(germinacion.getPAnormalINASE());
        dto.setPMuertasINIA(germinacion.getPMuertasINIA());
        dto.setPMuertasINASE(germinacion.getPMuertasINASE());
        dto.setPFrescasINIA(germinacion.getPFrescasINIA());
        dto.setPFrescasINASE(germinacion.getPFrescasINASE());
        dto.setSemillasDurasINIA(germinacion.getSemillasDurasINIA());
        dto.setSemillasDurasINASE(germinacion.getSemillasDurasINASE());
        dto.setGerminacionINIA(germinacion.getGerminacionINIA());
        dto.setGerminacionINASE(germinacion.getGerminacionINASE());
        dto.setComentarios(germinacion.getComentarios());
        dto.setRepetido(germinacion.isRepetido());
        dto.setFechaCreacion(germinacion.getFechaCreacion());
        dto.setFechaRepeticion(germinacion.getFechaRepeticion());


        if (germinacion.getRecibo() != null) {
            dto.setReciboId(germinacion.getRecibo().getId());
        } else {
            dto.setReciboId(null);
        }
        dto.setActivo(germinacion.isActivo());

        return dto;
    }

    public Germinacion mapToEntityGerminacion(GerminacionDto dto) {
        if (dto == null) {
            return null;
        }

        Germinacion germinacion = new Germinacion();
        // Fallback de depuración: imprimir lo que llega antes de mapear
        try {
            System.out.println("[mapToEntityGerminacion] DTO -> " +
                    "pNormalINIA=" + dto.getPNormalINIA() + ", " +
                    "pNormalINASE=" + dto.getPNormalINASE() + ", " +
                    "pAnormalINIA=" + dto.getPAnormalINIA() + ", " +
                    "pAnormalINASE=" + dto.getPAnormalINASE() + ", " +
                    "pMuertasINIA=" + dto.getPMuertasINIA() + ", " +
                    "pMuertasINASE=" + dto.getPMuertasINASE() + ", " +
                    "pFrescasINIA=" + dto.getPFrescasINIA() + ", " +
                    "pFrescasINASE=" + dto.getPFrescasINASE() + ", " +
                    "semillasDurasINIA=" + dto.getSemillasDurasINIA() + ", " +
                    "semillasDurasINASE=" + dto.getSemillasDurasINASE() + ", " +
                    "germinacionINIA=" + dto.getGerminacionINIA() + ", " +
                    "germinacionINASE=" + dto.getGerminacionINASE());
        } catch (Exception ignored) {}
        germinacion.setId(dto.getId());
        germinacion.setFechaInicio(dto.getFechaInicio());
        germinacion.setTotalDias(dto.getTotalDias());
        germinacion.setTratamiento(dto.getTratamiento());
        germinacion.setNroSemillaPorRepeticion(dto.getNroSemillaPorRepeticion());
        germinacion.setMetodo(dto.getMetodo());
        germinacion.setTemperatura(dto.getTemperatura());
        germinacion.setPreFrio(dto.getPreFrio());
        germinacion.setPreTratamiento(dto.getPreTratamiento());
        germinacion.setNroDias(dto.getNroDias());
        germinacion.setFechaFinal(dto.getFechaFinal());
        germinacion.setPRedondeo(dto.getPRedondeo());
        germinacion.setPNormalINIA(dto.getPNormalINIA());
        germinacion.setPNormalINASE(dto.getPNormalINASE());
        germinacion.setPAnormalINIA(dto.getPAnormalINIA());
        germinacion.setPAnormalINASE(dto.getPAnormalINASE());
        germinacion.setPMuertasINIA(dto.getPMuertasINIA());
        germinacion.setPMuertasINASE(dto.getPMuertasINASE());
        germinacion.setPFrescasINIA(dto.getPFrescasINIA());
        germinacion.setPFrescasINASE(dto.getPFrescasINASE());
        germinacion.setSemillasDurasINIA(dto.getSemillasDurasINIA());
        germinacion.setSemillasDurasINASE(dto.getSemillasDurasINASE());
        germinacion.setGerminacionINIA(dto.getGerminacionINIA());
        germinacion.setGerminacionINASE(dto.getGerminacionINASE());
        germinacion.setComentarios(dto.getComentarios());
        germinacion.setRepetido(dto.isRepetido());
        germinacion.setActivo(dto.isActivo());
        germinacion.setFechaCreacion(dto.getFechaCreacion());
        germinacion.setFechaRepeticion(dto.getFechaRepeticion());

    // Validar y obtener el recibo si existe
    Recibo recibo = getValidRecibo(dto.getReciboId());
    germinacion.setRecibo(recibo);


        return germinacion;
    }

    public ti.proyectoinia.dtos.ReciboDto mapToDtoRecibo(ti.proyectoinia.business.entities.Recibo recibo) {
        if (recibo == null) {
            return null;
        }
        ReciboDto dto = new ReciboDto();
        dto.setId(recibo.getId());
        dto.setNroAnalisis(recibo.getNroAnalisis());
        dto.setDepositoId(recibo.getDepositoId());
        dto.setEstado(recibo.getEstado());
        dto.setEspecie(recibo.getEspecie());
        dto.setFicha(recibo.getFicha());
        dto.setFechaRecibo(recibo.getFechaRecibo());
        dto.setRemitente(recibo.getRemitente());
        dto.setOrigen(recibo.getOrigen());
        dto.setCultivar(recibo.getCultivar());
        dto.setLoteId(recibo.getLoteId());
        dto.setKgLimpios(recibo.getKgLimpios());
        dto.setAnalisisSolicitados(recibo.getAnalisisSolicitados());
        dto.setArticulo(recibo.getArticulo());
        dto.setActivo(recibo.isActivo());
        // Mapear listas de entidades a listas de IDs
        dto.setDosnAnalisisId(recibo.getDosnAnalisis() != null ? recibo.getDosnAnalisis().stream().map(DOSN::getId).collect(Collectors.toList()) : null);
        dto.setPmsAnalisisId(recibo.getPmsAnalisis() != null ? recibo.getPmsAnalisis().stream().map(PMS::getId).collect(Collectors.toList()) : null);
        dto.setPurezaAnalisisId(recibo.getPurezaAnalisis() != null ? recibo.getPurezaAnalisis().stream().map(Pureza::getId).collect(Collectors.toList()) : null);
        dto.setGerminacionAnalisisId(recibo.getGerminacionAnalisis() != null ? recibo.getGerminacionAnalisis().stream().map(Germinacion::getId).collect(Collectors.toList()) : null);
        dto.setPurezaPNotatumAnalisisId(recibo.getPurezaPNotatumAnalisis() != null ? recibo.getPurezaPNotatumAnalisis().stream().map(PurezaPNotatum::getId).collect(Collectors.toList()) : null);
        dto.setSanitarioAnalisisId(recibo.getSanitarioAnalisis() != null ? recibo.getSanitarioAnalisis().stream().map(Sanitario::getId).collect(Collectors.toList()) : null);
        dto.setTetrazolioAnalisisId(recibo.getTetrazolioAnalisis() != null ? recibo.getTetrazolioAnalisis().stream().map(Tetrazolio::getId).collect(Collectors.toList()) : null);
        return dto;
    }

    public ti.proyectoinia.business.entities.Recibo mapToEntityRecibo(ti.proyectoinia.dtos.ReciboDto dto) {
        if (dto == null) {
            return null;
        }
        Recibo recibo = new Recibo();
        recibo.setId(dto.getId());
        recibo.setNroAnalisis(dto.getNroAnalisis());
        recibo.setDepositoId(dto.getDepositoId());
        recibo.setEstado(dto.getEstado());
        recibo.setEspecie(dto.getEspecie());
        recibo.setFicha(dto.getFicha());
        recibo.setFechaRecibo(dto.getFechaRecibo());
        recibo.setRemitente(dto.getRemitente());
        recibo.setOrigen(dto.getOrigen());
        recibo.setCultivar(dto.getCultivar());
        recibo.setLoteId(dto.getLoteId());
        recibo.setKgLimpios(dto.getKgLimpios());
        recibo.setAnalisisSolicitados(dto.getAnalisisSolicitados());
        recibo.setArticulo(dto.getArticulo());
        recibo.setActivo(dto.isActivo());
        // Mapear listas de IDs a listas de entidades (requiere repositorios para cada entidad)
        // Ejemplo: recibo.setDosnAnalisis(dto.getDosnAnalisisId() != null ? dto.getDosnAnalisisId().stream().map(id -> dosnRepository.findById(id).orElse(null)).filter(Objects::nonNull).collect(Collectors.toList()) : null);
        // Repetir para cada lista de análisis y humedades
        // ...
        return recibo;
    }

    public MalezaDto mapToDtoMaleza(Maleza maleza) {
        if (maleza == null) {
            return null;
        }

        MalezaDto malezaDto = new MalezaDto();
        malezaDto.setId(maleza.getId());
        malezaDto.setNombre(maleza.getNombre());
        malezaDto.setDescripcion(maleza.getDescripcion());
        malezaDto.setActivo(maleza.isActivo());
        return malezaDto;

    }

    public Maleza mapToEntityMaleza(MalezaDto malezaDto) {
        if (malezaDto == null) {
            return null;
        }

        Maleza maleza = new Maleza();
        maleza.setId(malezaDto.getId());
        maleza.setNombre(malezaDto.getNombre());
        maleza.setDescripcion(malezaDto.getDescripcion());
        maleza.setActivo(malezaDto.isActivo());

        return maleza;
    }

    public SanitarioDto mapToDtoSanitario(Sanitario sanitario) {
        if (sanitario == null) {
            return null;
        }
        SanitarioDto sanitarioDto = new SanitarioDto();
        sanitarioDto.setId(sanitario.getId());
        sanitarioDto.setFechaSiembra(sanitario.getFechaSiembra());
        sanitarioDto.setFecha(sanitario.getFecha());
        sanitarioDto.setMetodo(sanitario.getMetodo());
        sanitarioDto.setTemperatura(sanitario.getTemperatura());
        sanitarioDto.setHorasLuz(sanitario.getHorasLuz());
        sanitarioDto.setHorasOscuridad(sanitario.getHorasOscuridad());
        sanitarioDto.setNroDias(sanitario.getNroDias());
        sanitarioDto.setEstado(sanitario.getEstado());
        sanitarioDto.setObservaciones(sanitario.getObservaciones());
        sanitarioDto.setNroSemillasRepeticion(sanitario.getNroSemillasRepeticion());
        sanitarioDto.setActivo(sanitario.isActivo());
        sanitarioDto.setEstandar(sanitario.isEstandar());
        sanitarioDto.setRepetido(sanitario.isRepetido());
        sanitarioDto.setFechaCreacion(sanitario.getFechaCreacion());
        sanitarioDto.setFechaRepeticion(sanitario.getFechaRepeticion());

        if (sanitario.getRecibo() != null) {
            sanitarioDto.setReciboId(sanitario.getRecibo().getId());
        } else {
            sanitarioDto.setReciboId(null);
        }
        // Mapeo de la lista sanitarioHongos a IDs
        if (sanitario.getSanitarioHongos() != null) {
            sanitarioDto.setSanitarioHongosId(sanitario.getSanitarioHongos().stream()
                .map(SanitarioHongo::getId)
                .collect(Collectors.toList()));
        }
        return sanitarioDto;
    }

    public Sanitario mapToEntitySanitario(SanitarioDto sanitarioDto) {
        if (sanitarioDto == null) {
            return null;
        }
        Sanitario sanitario = new Sanitario();
        sanitario.setId(sanitarioDto.getId());
        sanitario.setFechaSiembra(sanitarioDto.getFechaSiembra());
        sanitario.setFecha(sanitarioDto.getFecha());
        sanitario.setMetodo(sanitarioDto.getMetodo());
        sanitario.setTemperatura(sanitarioDto.getTemperatura());
        sanitario.setHorasLuz(sanitarioDto.getHorasLuz());
        sanitario.setHorasOscuridad(sanitarioDto.getHorasOscuridad());
        sanitario.setNroDias(sanitarioDto.getNroDias());
        sanitario.setEstado(sanitarioDto.getEstado());
        sanitario.setObservaciones(sanitarioDto.getObservaciones());
        sanitario.setNroSemillasRepeticion(sanitarioDto.getNroSemillasRepeticion());
        sanitario.setActivo(sanitarioDto.isActivo());
        sanitario.setEstandar(sanitarioDto.isEstandar());
        sanitario.setRepetido(sanitarioDto.isRepetido());
        sanitario.setFechaCreacion(sanitarioDto.getFechaCreacion());
        sanitario.setFechaRepeticion(sanitarioDto.getFechaRepeticion());

        if (sanitarioDto.getReciboId() != null) {
            Recibo recibo = getValidRecibo(sanitarioDto.getReciboId());
            sanitario.setRecibo(recibo);
        } else {
            sanitario.setRecibo(null);
        }

        // Mapeo de la lista de IDs a entidades SanitarioHongo
        if (sanitarioDto.getSanitarioHongosId() != null) {
            List<SanitarioHongo> sanitarioHongos = sanitarioDto.getSanitarioHongosId().stream()
                .map(id -> {
                    SanitarioHongo sh = new SanitarioHongo();
                    sh.setId(id);
                    return sh;
                })
                .collect(Collectors.toList());
            sanitario.setSanitarioHongos(sanitarioHongos);
        }


        return sanitario;
    }
    public PMSDto mapToDtoPMS(PMS pms) {
        if (pms == null) {
            return null;
        }
        PMSDto pmsDto = new PMSDto();

        pmsDto.setId(pms.getId());
        pmsDto.setPesoPromedioCienSemillas(pms.getPesoPromedioCienSemillas());
        pmsDto.setPesoMilSemillas(pms.getPesoMilSemillas());
        pmsDto.setPesoPromedioMilSemillas(pms.getPesoPromedioMilSemillas());
        pmsDto.setDesvioEstandar(pms.getDesvioEstandar());
        pmsDto.setCoeficienteVariacion(pms.getCoeficienteVariacion());
        pmsDto.setComentarios(pms.getComentarios());
        pmsDto.setActivo(pms.isActivo());
        pmsDto.setRepetido(pms.isRepetido());
        pmsDto.setFechaCreacion(pms.getFechaCreacion());
        pmsDto.setFechaRepeticion(pms.getFechaRepeticion());
        pmsDto.setFechaMedicion(pms.getFechaMedicion());
        pmsDto.setHumedadPorcentual(pms.getHumedadPorcentual());
        pmsDto.setEstandar(pms.isEstandar());

        if (pms.getRecibo() != null) {
            pmsDto.setReciboId(pms.getRecibo().getId());
        } else {
            pmsDto.setReciboId(null);
        }
        return pmsDto;
    }

    public PMS mapToEntityPMS(PMSDto pmsDto) {
        if (pmsDto == null) {
            return null;
        }

        PMS pms = new PMS();

        pms.setId(pmsDto.getId());
        pms.setPesoPromedioCienSemillas(pmsDto.getPesoPromedioCienSemillas());
        pms.setPesoMilSemillas(pmsDto.getPesoMilSemillas());
        pms.setPesoPromedioMilSemillas(pmsDto.getPesoPromedioMilSemillas());
        pms.setDesvioEstandar(pmsDto.getDesvioEstandar());
        pms.setCoeficienteVariacion(pmsDto.getCoeficienteVariacion());
        pms.setComentarios(pmsDto.getComentarios());
        pms.setActivo(pmsDto.isActivo());
        pms.setRepetido(pmsDto.isRepetido());
        pms.setFechaCreacion(pmsDto.getFechaCreacion());
        pms.setFechaRepeticion(pmsDto.getFechaRepeticion());
        pms.setFechaMedicion(pmsDto.getFechaMedicion());
        pms.setHumedadPorcentual(pmsDto.getHumedadPorcentual());
        pms.setEstandar(pmsDto.isEstandar());

        // Validar y obtener el recibo si existe
        Recibo recibo = getValidRecibo(pmsDto.getReciboId());
        pms.setRecibo(recibo);
        return pms;
    }

    public PurezaDto mapToDtoPureza(Pureza pureza) {
        if (pureza == null) {
            return null;
        }

        PurezaDto dto = new PurezaDto();
        dto.setId(pureza.getId());
        dto.setFechaInase(pureza.getFechaInase());
        dto.setFechaInia(pureza.getFechaInia());
        dto.setPesoInicial(pureza.getPesoInicial());
        dto.setPesoInicialInase(pureza.getPesoInicialInase());
        dto.setSemillaPura(pureza.getSemillaPura());
        dto.setSemillaPuraInase(pureza.getSemillaPuraInase());
        dto.setSemillaPuraPorcentajeRedondeo(pureza.getSemillaPuraPorcentajeRedondeo());
        dto.setSemillaPuraPorcentajeRedondeoInase(pureza.getSemillaPuraPorcentajeRedondeoInase());
        dto.setMaterialInerte(pureza.getMaterialInerte());
        dto.setMaterialInerteInase(pureza.getMaterialInerteInase());
        dto.setMaterialInertePorcentajeRedondeo(pureza.getMaterialInertePorcentajeRedondeo());
        dto.setMaterialInertePorcentajeRedondeoInase(pureza.getMaterialInertePorcentajeRedondeoInase());
        dto.setOtrosCultivos(pureza.getOtrosCultivos());
        dto.setOtrosCultivosInase(pureza.getOtrosCultivosInase());
        dto.setOtrosCultivosPorcentajeRedondeo(pureza.getOtrosCultivosPorcentajeRedondeo());
        dto.setOtrosCultivosPorcentajeRedondeoInase(pureza.getOtrosCultivosPorcentajeRedondeoInase());
        dto.setMalezas(pureza.getMalezas());
        dto.setMalezasInase(pureza.getMalezasInase());
        dto.setMalezasPorcentajeRedondeo(pureza.getMalezasPorcentajeRedondeo());
        dto.setMalezasPorcentajeRedondeoInase(pureza.getMalezasPorcentajeRedondeoInase());
        dto.setMalezasToleradas(pureza.getMalezasToleradas());
        dto.setMalezasToleradasInase(pureza.getMalezasToleradasInase());
        dto.setMalezasToleradasPorcentajeRedondeo(pureza.getMalezasToleradasPorcentajeRedondeo());
        dto.setMalezasToleradasPorcentajeRedondeoInase(pureza.getMalezasToleradasPorcentajeRedondeoInase());
        dto.setMalezasToleranciaCero(pureza.getMalezasToleranciaCero());
        dto.setMalezasToleranciaCeroInase(pureza.getMalezasToleranciaCeroInase());
        dto.setMalezasToleranciaCeroPorcentajeRedondeo(pureza.getMalezasToleranciaCeroPorcentajeRedondeo());
        dto.setMalezasToleranciaCeroPorcentajeRedondeoInase(pureza.getMalezasToleranciaCeroPorcentajeRedondeoInase());
        dto.setPesoTotal(pureza.getPesoTotal());
        dto.setPesoTotalInase(pureza.getPesoTotalInase());
        dto.setOtrosCultivo(pureza.getOtrosCultivo());
        dto.setFechaEstandar(pureza.getFechaEstandar());
        dto.setEstandar(pureza.getEstandar());
        dto.setActivo(pureza.isActivo());
        dto.setRepetido(pureza.isRepetido());
        dto.setFechaCreacion(pureza.getFechaCreacion());
        dto.setFechaRepeticion(pureza.getFechaRepeticion());

        // Mapeo de cultivos
        if (pureza.getCultivos() != null) {
            dto.setCultivosId(pureza.getCultivos().stream().map(Cultivo::getId).collect(Collectors.toList()));
        } else {
            dto.setCultivosId(null);
        }
        // Mapeo de malezas normales
        if (pureza.getMalezasNormales() != null) {
            dto.setMalezasNormalesId(pureza.getMalezasNormales().stream().map(Maleza::getId).collect(Collectors.toList()));
        } else {
            dto.setMalezasNormalesId(null);
        }
        // Mapeo de malezas toleradas
        if (pureza.getListamalezasToleradas() != null) {
            dto.setMalezasToleradasId(pureza.getListamalezasToleradas().stream().map(Maleza::getId).collect(Collectors.toList()));
        } else {
            dto.setMalezasToleradasId(null);
        }
        // Mapeo de malezas tolerancia cero
        if (pureza.getListamalezasToleranciaCero() != null) {
            dto.setMalezasToleranciaCeroId(pureza.getListamalezasToleranciaCero().stream().map(Maleza::getId).collect(Collectors.toList()));
        } else {
            dto.setMalezasToleranciaCeroId(null);
        }

        if (pureza.getRecibo() != null) {
            dto.setReciboId(pureza.getRecibo().getId());
        } else {
            dto.setReciboId(null);
        }

        return dto;
    }

    public Pureza mapToEntityPureza(PurezaDto dto) {
        if (dto == null) {
            return null;
        }
        Pureza pureza = new Pureza();
        if (dto.getId() != null) {
            pureza.setId(dto.getId());
        }

        pureza.setFechaInase(dto.getFechaInase());
        pureza.setFechaInia(dto.getFechaInia());
        pureza.setPesoInicial(dto.getPesoInicial());
        pureza.setPesoInicialInase(dto.getPesoInicialInase());
        pureza.setSemillaPura(dto.getSemillaPura());
        pureza.setSemillaPuraInase(dto.getSemillaPuraInase());
        pureza.setSemillaPuraPorcentajeRedondeo(dto.getSemillaPuraPorcentajeRedondeo());
        pureza.setSemillaPuraPorcentajeRedondeoInase(dto.getSemillaPuraPorcentajeRedondeoInase());
        pureza.setMaterialInerte(dto.getMaterialInerte());
        pureza.setMaterialInerteInase(dto.getMaterialInerteInase());
        pureza.setMaterialInertePorcentajeRedondeo(dto.getMaterialInertePorcentajeRedondeo());
        pureza.setMaterialInertePorcentajeRedondeoInase(dto.getMaterialInertePorcentajeRedondeoInase());
        pureza.setOtrosCultivos(dto.getOtrosCultivos());
        pureza.setOtrosCultivosInase(dto.getOtrosCultivosInase());
        pureza.setOtrosCultivosPorcentajeRedondeo(dto.getOtrosCultivosPorcentajeRedondeo());
        pureza.setOtrosCultivosPorcentajeRedondeoInase(dto.getOtrosCultivosPorcentajeRedondeoInase());
        pureza.setMalezas(dto.getMalezas());
        pureza.setMalezasInase(dto.getMalezasInase());
        pureza.setMalezasPorcentajeRedondeo(dto.getMalezasPorcentajeRedondeo());
        pureza.setMalezasPorcentajeRedondeoInase(dto.getMalezasPorcentajeRedondeoInase());
        pureza.setMalezasToleradas(dto.getMalezasToleradas());
        pureza.setMalezasToleradasInase(dto.getMalezasToleradasInase());
        pureza.setMalezasToleradasPorcentajeRedondeo(dto.getMalezasToleradasPorcentajeRedondeo());
        pureza.setMalezasToleradasPorcentajeRedondeoInase(dto.getMalezasToleradasPorcentajeRedondeoInase());
        pureza.setMalezasToleranciaCero(dto.getMalezasToleranciaCero());
        pureza.setMalezasToleranciaCeroInase(dto.getMalezasToleranciaCeroInase());
        pureza.setMalezasToleranciaCeroPorcentajeRedondeo(dto.getMalezasToleranciaCeroPorcentajeRedondeo());
        pureza.setMalezasToleranciaCeroPorcentajeRedondeoInase(dto.getMalezasToleranciaCeroPorcentajeRedondeoInase());
        pureza.setPesoTotal(dto.getPesoTotal());
        pureza.setPesoTotalInase(dto.getPesoTotalInase());
        pureza.setOtrosCultivo(dto.getOtrosCultivo());
        pureza.setFechaEstandar(dto.getFechaEstandar());
        pureza.setEstandar(dto.isEstandar());
        pureza.setActivo(dto.isActivo());
        pureza.setRepetido(dto.isRepetido());
        pureza.setFechaCreacion(dto.getFechaCreacion());
        pureza.setFechaRepeticion(dto.getFechaRepeticion());

        // Mapeo de cultivos
        if (dto.getCultivosId() != null) {
            List<Cultivo> cultivos = dto.getCultivosId().stream()
                .map(this::getValidCultivo)
                .collect(Collectors.toList());
            pureza.setCultivos(cultivos);
        } else {
            pureza.setCultivos(null);
        }
        // Mapeo de malezas normales
        if (dto.getMalezasNormalesId() != null) {
            List<Maleza> malezasNormales = dto.getMalezasNormalesId().stream()
                .map(this::getValidMaleza)
                .collect(Collectors.toList());
            pureza.setMalezasNormales(malezasNormales);
        } else {
            pureza.setMalezasNormales(null);
        }
        // Mapeo de malezas toleradas
        if (dto.getMalezasToleradasId() != null) {
            List<Maleza> malezasToleradas = dto.getMalezasToleradasId().stream()
                .map(this::getValidMaleza)
                .collect(Collectors.toList());
            pureza.setListamalezasToleradas(malezasToleradas);
        } else {
            pureza.setListamalezasToleradas(null);
        }
        // Mapeo de malezas tolerancia cero
        if (dto.getMalezasToleranciaCeroId() != null) {
            List<Maleza> malezasToleranciaCero = dto.getMalezasToleranciaCeroId().stream()
                .map(this::getValidMaleza)
                .collect(Collectors.toList());
            pureza.setListamalezasToleranciaCero(malezasToleranciaCero);
        } else {
            pureza.setListamalezasToleranciaCero(null);
        }

        Recibo recibo = getValidRecibo(dto.getReciboId());
        pureza.setRecibo(recibo);

        return pureza;
    }

    public LoteDto mapToDtoLote(Lote lote) {
        if (lote == null) {
            return null;
        }

        LoteDto loteDto = new LoteDto();
        loteDto.setId(lote.getId());
        loteDto.setNombre(lote.getNombre());
        loteDto.setActivo(lote.isActivo());
        loteDto.setDescripcion(lote.getDescripcion());
        loteDto.setFechaCreacion(formatDate(lote.getFechaCreacion()));
        loteDto.setFechaFinalizacion(formatDate(lote.getFechaFinalizacion()));
        loteDto.setEstado(lote.getEstado());

        if (lote.getUsuarios() != null) {
            loteDto.setUsuariosId(lote.getUsuarios().stream().map(Usuario::getId).collect(Collectors.toList()));
        } else {
            loteDto.setUsuariosId(null);
        }

        return loteDto;
    }

    public Lote mapToEntityLote(LoteDto loteDto) {
        if (loteDto == null) {
            return null;
        }

        Lote lote = new Lote();
        lote.setId(loteDto.getId());
        lote.setNombre(loteDto.getNombre());
        lote.setActivo(loteDto.isActivo());
        lote.setDescripcion(loteDto.getDescripcion());
        lote.setFechaCreacion(parseDate(loteDto.getFechaCreacion()));
        lote.setFechaFinalizacion(parseDate(loteDto.getFechaFinalizacion()));
        lote.setEstado(loteDto.getEstado());

        if (loteDto.getUsuariosId() != null) {
            lote.setUsuarios(loteDto.getUsuariosId().stream().map(id -> {
                Usuario usuario = new Usuario();
                usuario.setId(id);
                return usuario;
            }).collect(Collectors.toList()));
        } else {
            lote.setUsuarios(null);
        }

        return lote;
    }

    public UsuarioDto mapToDtoUsuario(Usuario usuario) {
        if (usuario == null) {
            return null;
        }

        UsuarioDto usuarioDto = new UsuarioDto();
        usuarioDto.setId(usuario.getId());
        usuarioDto.setEmail(usuario.getEmail());
        usuarioDto.setNombre(usuario.getNombre());
        usuarioDto.setPassword(usuario.getPassword());
        usuarioDto.setTelefono(usuario.getTelefono());
        usuarioDto.setRol(usuario.getRol());
        usuarioDto.setActivo(usuario.isActivo());

        if (usuario.getLotes() != null) {
            usuarioDto.setLotesId(usuario.getLotes().stream().map(Lote::getId).collect(Collectors.toList()));
        } else {
            usuarioDto.setLotesId(null);
        }

        return usuarioDto;
    }

    public UsuarioDto mapToDtoUsuarioSinPassword(Usuario usuario) {
        if (usuario == null) {
            return null;
        }

        UsuarioDto usuarioDto = new UsuarioDto();
        usuarioDto.setId(usuario.getId());
        usuarioDto.setEmail(usuario.getEmail());
        usuarioDto.setNombre(usuario.getNombre());
        // NO incluir password por seguridad
        usuarioDto.setPassword(null);
        usuarioDto.setTelefono(usuario.getTelefono());
        usuarioDto.setRol(usuario.getRol());
        usuarioDto.setActivo(usuario.isActivo());

        if (usuario.getLotes() != null) {
            usuarioDto.setLotesId(usuario.getLotes().stream().map(Lote::getId).collect(Collectors.toList()));
        } else {
            usuarioDto.setLotesId(null);
        }

        return usuarioDto;
    }

    public Usuario mapToEntityUsuario(UsuarioDto usuarioDto) {
        if (usuarioDto == null) {
            return null;
        }

        Usuario usuario = new Usuario();
        usuario.setId(usuarioDto.getId());
        usuario.setEmail(usuarioDto.getEmail());
        usuario.setNombre(usuarioDto.getNombre());
        usuario.setTelefono(usuarioDto.getTelefono());

        // Encriptar la contraseña si no está vacía
        if (usuarioDto.getPassword() != null && !usuarioDto.getPassword().trim().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(usuarioDto.getPassword()));
        } else {
            // Si la contraseña es null o vacía, se mantiene null para ser manejada en el servicio
            usuario.setPassword(null);
        }

        usuario.setRol(usuarioDto.getRol());
        usuario.setActivo(usuarioDto.isActivo());

        if (usuarioDto.getLotesId() != null) {
            usuario.setLotes(usuarioDto.getLotesId().stream().map(id -> {
                Lote lote = new Lote();
                lote.setId(id);
                return lote;
            }).collect(Collectors.toList()));
        } else {
            usuario.setLotes(null);
        }

        return usuario;
    }


    private UsuarioDto mapToDtoUsuarioBasic(Usuario usuario) {
        if (usuario == null) return null;

        UsuarioDto dto = new UsuarioDto();
        dto.setId(usuario.getId());
        dto.setNombre(usuario.getNombre());
        dto.setEmail(usuario.getEmail());

        return dto;
    }

    private Usuario mapToEntityUsuarioBasic(UsuarioDto usuarioDto) {
        if (usuarioDto == null) return null;

        Usuario usuario = new Usuario();
        usuario.setId(usuarioDto.getId());
        usuario.setNombre(usuarioDto.getNombre());
        usuario.setEmail(usuarioDto.getEmail());

        return usuario;
    }

    private LoteDto mapToDtoLoteBasic(Lote lote) {
        if (lote == null) return null;

        LoteDto dto = new LoteDto();
        dto.setId(lote.getId());
        dto.setNombre(lote.getNombre());

        return dto;
    }
    private Lote mapToEntityLoteBasic(LoteDto loteDto) {
        if (loteDto == null) return null;

        Lote lote = new Lote();
        lote.setId(loteDto.getId());
        lote.setNombre(loteDto.getNombre());

        return lote;
    }

    public DOSNDto mapToDtoDOSN(DOSN dosn) {
        if (dosn == null) {
            return null;
        }

        DOSNDto dto = new DOSNDto();
        dto.setId(dosn.getId());
        if (dosn.getRecibo() != null) {
            dto.setReciboId(dosn.getRecibo().getId());
        }
        // Fechas
        dto.setFechaINIA(dosn.getFechaINIA());
        dto.setFechaINASE(dosn.getFechaINASE());
        // Gramos analizados
        dto.setGramosAnalizadosINIA(dosn.getGramosAnalizadosINIA());
        dto.setGramosAnalizadosINASE(dosn.getGramosAnalizadosINASE());
        // Tipos de análisis (enum a String)
        dto.setTiposDeanalisisINIA(dosn.getTiposDeanalisisINIA() != null ? dosn.getTiposDeanalisisINIA().name() : null);
        dto.setTiposDeanalisisINASE(dosn.getTiposDeanalisisINASE() != null ? dosn.getTiposDeanalisisINASE().name() : null);
    // Completo/Reducido removido; usar tiposDeanalisis*
        // Determinaciones
        dto.setDeterminacionBrassica(dosn.getDeterminacionBrassica());
        dto.setDeterminacionBrassicaGramos(dosn.getDeterminacionBrassicaGramos());
        dto.setDeterminacionCuscuta(dosn.getDeterminacionCuscuta());
        dto.setDeterminacionCuscutaGramos(dosn.getDeterminacionCuscutaGramos());
        // Otros
        dto.setEstandar(dosn.getEstandar());
        dto.setFechaAnalisis(dosn.getFechaAnalisis());
        dto.setActivo(dosn.isActivo());
        dto.setRepetido(dosn.isRepetido());
        dto.setFechaCreacion(dosn.getFechaCreacion());
        dto.setFechaRepeticion(dosn.getFechaRepeticion());

        // Colecciones -> listas de IDs
        dto.setMalezasNormalesINIAId(dosn.getMalezasNormalesINIA() != null ?
                dosn.getMalezasNormalesINIA().stream().map(Maleza::getId).collect(Collectors.toList()) : null);
        dto.setMalezasNormalesINASEId(dosn.getMalezasNormalesINASE() != null ?
                dosn.getMalezasNormalesINASE().stream().map(Maleza::getId).collect(Collectors.toList()) : null);

        dto.setMalezasToleradasINIAId(dosn.getMalezasToleradasINIA() != null ?
                dosn.getMalezasToleradasINIA().stream().map(Maleza::getId).collect(Collectors.toList()) : null);
        dto.setMalezasToleradasINASEId(dosn.getMalezasToleradasINASE() != null ?
                dosn.getMalezasToleradasINASE().stream().map(Maleza::getId).collect(Collectors.toList()) : null);

        dto.setMalezasToleranciaCeroINIAId(dosn.getMalezasToleranciaCeroListaINIA() != null ?
                dosn.getMalezasToleranciaCeroListaINIA().stream().map(Maleza::getId).collect(Collectors.toList()) : null);
        dto.setMalezasToleranciaCeroINASEId(dosn.getMalezasToleranciaCeroListaINASE() != null ?
                dosn.getMalezasToleranciaCeroListaINASE().stream().map(Maleza::getId).collect(Collectors.toList()) : null);

        dto.setCultivosINIAId(dosn.getCultivosINIA() != null ?
                dosn.getCultivosINIA().stream().map(Cultivo::getId).collect(Collectors.toList()) : null);
        dto.setCultivosINASEId(dosn.getCultivosINASE() != null ?
                dosn.getCultivosINASE().stream().map(Cultivo::getId).collect(Collectors.toList()) : null);
        return dto;
    }

    public DOSN mapToEntityDOSN(DOSNDto dto) {
        if (dto == null) {
            return null;
        }
        DOSN dosn = new DOSN();
        dosn.setId(dto.getId());
        // Fechas
        dosn.setFechaINIA(dto.getFechaINIA());
        dosn.setFechaINASE(dto.getFechaINASE());
        // Gramos analizados
        dosn.setGramosAnalizadosINIA(dto.getGramosAnalizadosINIA());
        dosn.setGramosAnalizadosINASE(dto.getGramosAnalizadosINASE());
        // Tipos de análisis (String a enum)
        if (dto.getTiposDeanalisisINIA() != null) {
            dosn.setTiposDeanalisisINIA(tipoAnalisisDOSN.valueOf(dto.getTiposDeanalisisINIA()));
        }
        if (dto.getTiposDeanalisisINASE() != null) {
            dosn.setTiposDeanalisisINASE(tipoAnalisisDOSN.valueOf(dto.getTiposDeanalisisINASE()));
        }
    // Completo/Reducido removido; usar tiposDeanalisis*
        // Determinaciones
        dosn.setDeterminacionBrassica(dto.getDeterminacionBrassica());
        dosn.setDeterminacionBrassicaGramos(dto.getDeterminacionBrassicaGramos());
        dosn.setDeterminacionCuscuta(dto.getDeterminacionCuscuta());
        dosn.setDeterminacionCuscutaGramos(dto.getDeterminacionCuscutaGramos());
        // Otros
        dosn.setEstandar(dto.getEstandar());
        dosn.setActivo(dto.isActivo());
        dosn.setFechaAnalisis(dto.getFechaAnalisis());
        dosn.setRepetido(dto.isRepetido());
        dosn.setFechaCreacion(dto.getFechaCreacion());
        dosn.setFechaRepeticion(dto.getFechaRepeticion());

        // Vincular recibo si viene en el DTO
        Recibo recibo = getValidRecibo(dto.getReciboId());
        dosn.setRecibo(recibo);

        // Listas de IDs -> colecciones de entidades
        if (dto.getMalezasNormalesINIAId() != null) {
            dosn.setMalezasNormalesINIA(dto.getMalezasNormalesINIAId().stream()
                    .map(this::getValidMaleza)
                    .collect(Collectors.toList()));
        } else {
            dosn.setMalezasNormalesINIA(null);
        }

        if (dto.getMalezasNormalesINASEId() != null) {
            dosn.setMalezasNormalesINASE(dto.getMalezasNormalesINASEId().stream()
                    .map(this::getValidMaleza)
                    .collect(Collectors.toList()));
        } else {
            dosn.setMalezasNormalesINASE(null);
        }

        if (dto.getMalezasToleradasINIAId() != null) {
            dosn.setMalezasToleradasINIA(dto.getMalezasToleradasINIAId().stream()
                    .map(this::getValidMaleza)
                    .collect(Collectors.toList()));
        } else {
            dosn.setMalezasToleradasINIA(null);
        }

        if (dto.getMalezasToleradasINASEId() != null) {
            dosn.setMalezasToleradasINASE(dto.getMalezasToleradasINASEId().stream()
                    .map(this::getValidMaleza)
                    .collect(Collectors.toList()));
        } else {
            dosn.setMalezasToleradasINASE(null);
        }

        if (dto.getMalezasToleranciaCeroINIAId() != null) {
            dosn.setMalezasToleranciaCeroListaINIA(dto.getMalezasToleranciaCeroINIAId().stream()
                    .map(this::getValidMaleza)
                    .collect(Collectors.toList()));
        } else {
            dosn.setMalezasToleranciaCeroListaINIA(null);
        }

        if (dto.getMalezasToleranciaCeroINASEId() != null) {
            dosn.setMalezasToleranciaCeroListaINASE(dto.getMalezasToleranciaCeroINASEId().stream()
                    .map(this::getValidMaleza)
                    .collect(Collectors.toList()));
        } else {
            dosn.setMalezasToleranciaCeroListaINASE(null);
        }

        if (dto.getCultivosINIAId() != null) {
            dosn.setCultivosINIA(dto.getCultivosINIAId().stream()
                    .map(this::getValidCultivo)
                    .collect(Collectors.toList()));
        } else {
            dosn.setCultivosINIA(null);
        }

        if (dto.getCultivosINASEId() != null) {
            dosn.setCultivosINASE(dto.getCultivosINASEId().stream()
                    .map(this::getValidCultivo)
                    .collect(Collectors.toList()));
        } else {
            dosn.setCultivosINASE(null);
        }
        return dosn;
    }

    public CultivoDto mapToDtoCultivo(Cultivo cultivo) {
        if (cultivo == null) return null;

        CultivoDto dto = new CultivoDto();
        dto.setId(cultivo.getId());
        dto.setNombre(cultivo.getNombre());
        dto.setDescripcion(cultivo.getDescripcion());
        dto.setActivo(cultivo.isActivo());

        return dto;
    }
    public Cultivo mapToEntityCultivo(CultivoDto dto) {
        if (dto == null) return null;

        Cultivo cultivo = new Cultivo();
        cultivo.setId(dto.getId());
        cultivo.setNombre(dto.getNombre());
        cultivo.setDescripcion(dto.getDescripcion());
        cultivo.setActivo(dto.isActivo());

        return cultivo;
    }

    public PurezaPNotatumDto mapToDtoPurezaPNotatum(PurezaPNotatum pureza) {
        if (pureza == null) {
            return null;
        }
        PurezaPNotatumDto dto = new PurezaPNotatumDto();
        dto.setId(pureza.getId());

        dto.setGramosSemillaPura(pureza.getGramosSemillaPura());
        dto.setGramosSemillasMalezas(pureza.getGramosSemillasMalezas());
        dto.setGramosMateriaInerte(pureza.getGramosMateriaInerte());
        dto.setGramosSemillasCultivos(pureza.getGramosSemillasCultivos());
        dto.setActivo(pureza.isActivo());
        dto.setRepetido(pureza.isRepetido());
        dto.setFechaCreacion(pureza.getFechaCreacion());
        dto.setFechaRepeticion(pureza.getFechaRepeticion());
        dto.setObservaciones(pureza.getObservaciones());

        if (pureza.getRecibo() != null) {
            dto.setReciboId(pureza.getRecibo().getId());
        } else {
            dto.setReciboId(null);
        }

        return dto;
    }

    public PurezaPNotatum mapToEntityPurezaPNotatum(PurezaPNotatumDto dto) {
        if (dto == null) {
            return null;
        }
        PurezaPNotatum pureza = new PurezaPNotatum();
        pureza.setId(dto.getId());
        pureza.setGramosSemillaPura(dto.getGramosSemillaPura());
        pureza.setGramosSemillasMalezas(dto.getGramosSemillasMalezas());
        pureza.setGramosMateriaInerte(dto.getGramosMateriaInerte());
        pureza.setGramosSemillasCultivos(dto.getGramosSemillasCultivos());
        pureza.setActivo(dto.isActivo());
        pureza.setRepetido(dto.isRepetido());
        pureza.setFechaCreacion(dto.getFechaCreacion());
        pureza.setFechaRepeticion(dto.getFechaRepeticion());
        pureza.setObservaciones(dto.getObservaciones());

        // Validar y obtener el recibo si existe
        Recibo recibo = getValidRecibo(dto.getReciboId());
        pureza.setRecibo(recibo);

        return pureza;
    }

    public TetrazolioDto mapToDtoTetrazolio(Tetrazolio tetrazolio) {
        if (tetrazolio == null) {
            return null;
        }
        TetrazolioDto dto = new TetrazolioDto();
        dto.setId(tetrazolio.getId());
        dto.setRepeticion(tetrazolio.getRepeticion());
        dto.setNroSemillasPorRepeticion(tetrazolio.getNroSemillasPorRepeticion());
        if (tetrazolio.getPretratamiento() != null) {
            dto.setPretratamiento(tetrazolio.getPretratamiento());
        }
        dto.setConcentracion(tetrazolio.getConcentracion() != null ? tetrazolio.getConcentracion().toString() : null);
        dto.setTincionHoras(tetrazolio.getTincionHoras() != null ? tetrazolio.getTincionHoras().toString() : null);
        dto.setTincionGrados(tetrazolio.getTincionGrados() != null ? tetrazolio.getTincionGrados().toString() : null);
        dto.setFecha(tetrazolio.getFecha());
        dto.setViables(tetrazolio.getViables() != null ? tetrazolio.getViables().toString() : null);
        dto.setNoViables(tetrazolio.getNoViables() != null ? tetrazolio.getNoViables().toString() : null);
        dto.setDuras(tetrazolio.getDuras() != null ? tetrazolio.getDuras().toString() : null);
        dto.setTotal(tetrazolio.getTotal() != null ? tetrazolio.getTotal().toString() : null);
        dto.setPromedio(tetrazolio.getPromedio() != null ? tetrazolio.getPromedio().toString() : null);
        dto.setPorcentaje(tetrazolio.getPorcentaje());
        dto.setFechaCreacion(tetrazolio.getFechaCreacion());
        dto.setFechaRepeticion(tetrazolio.getFechaRepeticion());

        if (tetrazolio.getViabilidadPorTetrazolio() != null) {
            dto.setViabilidadPorTetrazolio(tetrazolio.getViabilidadPorTetrazolio());
        }

        dto.setNroSemillas(tetrazolio.getNroSemillas());
        dto.setDaniosNroSemillas(tetrazolio.getDaniosNroSemillas());
        dto.setDaniosMecanicos(tetrazolio.getDaniosMecanicos());
        dto.setDanioAmbiente(tetrazolio.getDanioAmbiente());
        dto.setDaniosChinches(tetrazolio.getDaniosChinches());
        dto.setDaniosFracturas(tetrazolio.getDaniosFracturas());
        dto.setDaniosOtros(tetrazolio.getDaniosOtros());
        dto.setDaniosDuras(tetrazolio.getDaniosDuras());

        if (tetrazolio.getViabilidadVigorTz() != null) {
            dto.setViabilidadVigorTz(tetrazolio.getViabilidadVigorTz());
        }

        dto.setPorcentajeFinal(tetrazolio.getPorcentajeFinal());
        dto.setDaniosPorPorcentajes(tetrazolio.getDaniosPorPorcentajes());
        dto.setActivo(tetrazolio.isActivo());
        dto.setRepetido(tetrazolio.isRepetido());
        dto.setReciboId(tetrazolio.getRecibo() != null ? tetrazolio.getRecibo().getId() : null);

        return dto;
    }

    public Tetrazolio mapToEntityTetrazolio(TetrazolioDto dto) {
        if (dto == null) {
            return null;
        }
        Tetrazolio tetrazolio = new Tetrazolio();
        tetrazolio.setId(dto.getId());
        tetrazolio.setRepeticion(dto.getRepeticion());
        tetrazolio.setNroSemillasPorRepeticion(dto.getNroSemillasPorRepeticion());

        if (dto.getPretratamiento() != null) {
            tetrazolio.setPretratamiento(dto.getPretratamiento());
        }

        tetrazolio.setConcentracion(dto.getConcentracion() != null ? Float.parseFloat(dto.getConcentracion()) : null);
        tetrazolio.setTincionHoras(dto.getTincionHoras() != null ? Float.parseFloat(dto.getTincionHoras()) : null);
        tetrazolio.setTincionGrados(dto.getTincionGrados() != null ? Float.parseFloat(dto.getTincionGrados()) : null);
        tetrazolio.setFecha(dto.getFecha());
        tetrazolio.setViables(dto.getViables() != null ? Float.parseFloat(dto.getViables()) : null);
        tetrazolio.setNoViables(dto.getNoViables() != null ? Float.parseFloat(dto.getNoViables()) : null);
        tetrazolio.setDuras(dto.getDuras() != null ? Float.parseFloat(dto.getDuras()) : null);
        tetrazolio.setTotal(dto.getTotal() != null ? Float.parseFloat(dto.getTotal()) : null);
        tetrazolio.setPromedio(dto.getPromedio() != null ? Float.parseFloat(dto.getPromedio()) : null);
        tetrazolio.setPorcentaje(dto.getPorcentaje());
        tetrazolio.setViabilidadPorTetrazolio(dto.getViabilidadPorTetrazolio());
        tetrazolio.setViabilidadVigorTz(dto.getViabilidadVigorTz());
        tetrazolio.setNroSemillas(dto.getNroSemillas());
        tetrazolio.setDaniosNroSemillas(dto.getDaniosNroSemillas());
        tetrazolio.setDaniosMecanicos(dto.getDaniosMecanicos());
        tetrazolio.setDanioAmbiente(dto.getDanioAmbiente());
        tetrazolio.setDaniosChinches(dto.getDaniosChinches());
        tetrazolio.setDaniosFracturas(dto.getDaniosFracturas());
        tetrazolio.setDaniosOtros(dto.getDaniosOtros());
        tetrazolio.setDaniosDuras(dto.getDaniosDuras());
        tetrazolio.setPorcentajeFinal(dto.getPorcentajeFinal());
        tetrazolio.setDaniosPorPorcentajes(dto.getDaniosPorPorcentajes());
        tetrazolio.setActivo(dto.isActivo());
        tetrazolio.setRepetido(dto.isRepetido());
        tetrazolio.setFechaCreacion(dto.getFechaCreacion());
        tetrazolio.setFechaRepeticion(dto.getFechaRepeticion());

        // Validar y obtener el recibo si existe
        Recibo recibo = getValidRecibo(dto.getReciboId());
        tetrazolio.setRecibo(recibo);

        return tetrazolio;
    }


    public SanitarioHongoDto mapToDtoSanitarioHongo(SanitarioHongo entity) {

        if (entity == null) return null;
        SanitarioHongoDto dto = new SanitarioHongoDto();
        dto.setId(entity.getId());
        dto.setSanitarioId(entity.getSanitario() != null ? entity.getSanitario().getId() : null);
        dto.setHongoId(entity.getHongo() != null ? entity.getHongo().getId() : null);
        dto.setRepeticion(entity.getRepeticion());
        dto.setValor(entity.getValor());
        dto.setIncidencia(entity.getIncidencia());
        // Mapeo del tipo
        dto.setTipo(entity.getTipo());
        return dto;
    }

    public SanitarioHongo mapToEntitySanitarioHongo(SanitarioHongoDto dto) {

        if (dto == null) return null;
        SanitarioHongo entity = new SanitarioHongo();

        entity.setId(dto.getId());
        if (dto.getSanitarioId() != null) {
            Sanitario sanitario = new Sanitario();
            sanitario.setId(dto.getSanitarioId());
            entity.setSanitario(sanitario);
        } else {
            entity.setSanitario(null);

        }
        if (dto.getHongoId() != null) {
            Hongo hongo = new Hongo();
            hongo.setId(dto.getHongoId());
            entity.setHongo(hongo);
        } else {
            entity.setHongo(null);

        }
        entity.setRepeticion(dto.getRepeticion());
        entity.setValor(dto.getValor());
        entity.setIncidencia(dto.getIncidencia());

        entity.setTipo(dto.getTipo());
        return entity;
    }

    public SemillaDto mapToDtoSemilla(Semilla entity) {
        if (entity == null) return null;

        SemillaDto dto = new SemillaDto();
        dto.setId(entity.getId());
        dto.setNroSemillasPura(entity.getNroSemillasPura());
        dto.setActivo(entity.isActivo());
        dto.setDescripcion(entity.getDescripcion());

        return dto;
    }

    public Semilla mapToEntitySemilla(SemillaDto dto) {
        if (dto == null) return null;

        Semilla entity = new Semilla();
        entity.setId(dto.getId());
        entity.setNroSemillasPura(dto.getNroSemillasPura());
        entity.setActivo(dto.isActivo());
        entity.setDescripcion(dto.getDescripcion());

        return entity;
    }

    public HumedadReciboDto mapToDtoHumedadRecibo(HumedadRecibo humedadRecibo) {
        if (humedadRecibo == null) {
            return null;
        }
        HumedadReciboDto dto = new HumedadReciboDto();
        dto.setId(humedadRecibo.getId());
        dto.setLugar(humedadRecibo.getLugar());
        dto.setNumero(humedadRecibo.getNumero());
        dto.setReciboId(humedadRecibo.getRecibo() != null ? humedadRecibo.getRecibo().getId() : null);
        return dto;
    }

    public HumedadRecibo mapToEntityHumedadRecibo(HumedadReciboDto dto) {
        if (dto == null) return null;
        HumedadRecibo entity = new HumedadRecibo();
        entity.setId(dto.getId());
        entity.setLugar(dto.getLugar());
        entity.setNumero(dto.getNumero());
        // Asignar la relación Recibo si reciboId está presente
        if (dto.getReciboId() != null) {
            Recibo recibo = getValidRecibo(dto.getReciboId());
            entity.setRecibo(recibo);
        } else {
            entity.setRecibo(null);
        }
        return entity;
    }

    // Mappers for GramosPms
    public GramosPmsDto mapToDtoGramosPms(ti.proyectoinia.business.entities.GramosPms entity) {
        if (entity == null) return null;
        GramosPmsDto dto = new GramosPmsDto();

        dto.setId(entity.getId());
        dto.setPmsId(entity.getPmsId());
        dto.setGramos(entity.getGramos());
        dto.setNumeroRepeticion(entity.getNumeroRepeticion());

        return dto;
    }

    public ti.proyectoinia.business.entities.GramosPms mapToEntityGramosPms(GramosPmsDto dto) {
        if (dto == null) return null;
        GramosPms entity = new ti.proyectoinia.business.entities.GramosPms();

        entity.setId(dto.getId());
        entity.setPmsId(dto.getPmsId());
        entity.setGramos(dto.getGramos());
        entity.setNumeroRepeticion(dto.getNumeroRepeticion());

        return entity;
    }

    public Deposito mapToEntityDeposito(DepositoDto dto) {
        if (dto == null) return null;

        Deposito entity = new Deposito();
        entity.setId(dto.getId());
        entity.setNombre(dto.getNombre());
        entity.setActivo(dto.isActivo());

        return entity;
    }

    public DepositoDto mapToDtoDeposito(Deposito entity) {
        if (entity == null) return null;

        DepositoDto dto = new DepositoDto();
        dto.setId(entity.getId());
        dto.setNombre(entity.getNombre());
        dto.setActivo(entity.isActivo());

        return dto;
    }

    // =============================
    // Germinación: Conteos y Celdas
    // =============================

    public ConteoGerminacionDto mapToDtoConteoGerminacion(ConteoGerminacion entity) {
        if (entity == null) return null;
        ConteoGerminacionDto dto = new ConteoGerminacionDto();
        dto.setId(entity.getId());
        dto.setGerminacionId(entity.getGerminacionId());
        dto.setNumeroConteo(entity.getNumeroConteo());
        dto.setFechaConteo(entity.getFechaConteo());
        dto.setActivo(entity.isActivo());
        return dto;
    }

    public ConteoGerminacion mapToEntityConteoGerminacion(ConteoGerminacionDto dto) {
        if (dto == null) return null;
        ConteoGerminacion entity = new ConteoGerminacion();
        // Tratar id=0 como null para forzar INSERT
        entity.setId(dto.getId() != null && dto.getId() == 0 ? null : dto.getId());
        entity.setGerminacionId(dto.getGerminacionId());
        entity.setNumeroConteo(dto.getNumeroConteo());
        entity.setFechaConteo(dto.getFechaConteo());
        entity.setActivo(dto.isActivo());
        return entity;
    }

    // Nuevos mapeos: Repetición (finales) y NormalPorConteo

    public RepeticionFinalDto mapToDtoRepeticionSinCurar(GerminacionSinCurar e) {
        if (e == null) return null;
        RepeticionFinalDto dto = new RepeticionFinalDto();
        dto.setId(e.getId());
        dto.setActivo(e.isActivo());
        dto.setGerminacionId(e.getGerminacionId());
        dto.setNumeroRepeticion(e.getNumeroRepeticion());
        dto.setAnormal(e.getAnormal());
        dto.setDuras(e.getDuras());
        dto.setFrescas(e.getFrescas());
        dto.setMuertas(e.getMuertas());
        dto.setTotales(e.getTotales());
        dto.setPromedioRedondeado(e.getPromedioRedondeado());
        return dto;
    }

    public RepeticionFinalDto mapToDtoRepeticionCuradaPlanta(GerminacionCuradaPlanta e) {
        if (e == null) return null;
        RepeticionFinalDto dto = new RepeticionFinalDto();
        dto.setId(e.getId());
        dto.setActivo(e.isActivo());
        dto.setGerminacionId(e.getGerminacionId());
        dto.setNumeroRepeticion(e.getNumeroRepeticion());
        dto.setAnormal(e.getAnormal());
        dto.setDuras(e.getDuras());
        dto.setFrescas(e.getFrescas());
        dto.setMuertas(e.getMuertas());
        dto.setTotales(e.getTotales());
        dto.setPromedioRedondeado(e.getPromedioRedondeado());
        return dto;
    }

    public RepeticionFinalDto mapToDtoRepeticionCuradaLaboratorio(GerminacionCuradaLaboratorio e) {
        if (e == null) return null;
        RepeticionFinalDto dto = new RepeticionFinalDto();
        dto.setId(e.getId());
        dto.setActivo(e.isActivo());
        dto.setGerminacionId(e.getGerminacionId());
        dto.setNumeroRepeticion(e.getNumeroRepeticion());
        dto.setAnormal(e.getAnormal());
        dto.setDuras(e.getDuras());
        dto.setFrescas(e.getFrescas());
        dto.setMuertas(e.getMuertas());
        dto.setTotales(e.getTotales());
        dto.setPromedioRedondeado(e.getPromedioRedondeado());
        return dto;
    }

    public GerminacionSinCurar mapToEntityRepeticionSinCurar(RepeticionFinalDto dto) {
        if (dto == null) return null;
        GerminacionSinCurar e = new GerminacionSinCurar();
        e.setId(dto.getId() != null && dto.getId() == 0 ? null : dto.getId());
        e.setActivo(dto.isActivo());
        e.setGerminacionId(dto.getGerminacionId());
        e.setNumeroRepeticion(dto.getNumeroRepeticion());
        e.setAnormal(dto.getAnormal());
        e.setDuras(dto.getDuras());
        e.setFrescas(dto.getFrescas());
        e.setMuertas(dto.getMuertas());
        e.setTotales(dto.getTotales());
        e.setPromedioRedondeado(dto.getPromedioRedondeado());
        return e;
    }

    public GerminacionCuradaPlanta mapToEntityRepeticionCuradaPlanta(RepeticionFinalDto dto) {
        if (dto == null) return null;
        GerminacionCuradaPlanta e = new GerminacionCuradaPlanta();
        e.setId(dto.getId() != null && dto.getId() == 0 ? null : dto.getId());
        e.setActivo(dto.isActivo());
        e.setGerminacionId(dto.getGerminacionId());
        e.setNumeroRepeticion(dto.getNumeroRepeticion());
        e.setAnormal(dto.getAnormal());
        e.setDuras(dto.getDuras());
        e.setFrescas(dto.getFrescas());
        e.setMuertas(dto.getMuertas());
        e.setTotales(dto.getTotales());
        e.setPromedioRedondeado(dto.getPromedioRedondeado());
        return e;
    }

    public GerminacionCuradaLaboratorio mapToEntityRepeticionCuradaLaboratorio(RepeticionFinalDto dto) {
        if (dto == null) return null;
        GerminacionCuradaLaboratorio e = new GerminacionCuradaLaboratorio();
        e.setId(dto.getId() != null && dto.getId() == 0 ? null : dto.getId());
        e.setActivo(dto.isActivo());
        e.setGerminacionId(dto.getGerminacionId());
        e.setNumeroRepeticion(dto.getNumeroRepeticion());
        e.setAnormal(dto.getAnormal());
        e.setDuras(dto.getDuras());
        e.setFrescas(dto.getFrescas());
        e.setMuertas(dto.getMuertas());
        e.setTotales(dto.getTotales());
        e.setPromedioRedondeado(dto.getPromedioRedondeado());
        return e;
    }

    public NormalPorConteoDto mapToDtoNormalPorConteo(NormalPorConteo e) {
        if (e == null) return null;
        NormalPorConteoDto dto = new NormalPorConteoDto();
        dto.setId(e.getId());
        dto.setActivo(e.isActivo());
        dto.setGerminacionId(e.getGerminacionId());
        dto.setTabla(e.getTabla());
        dto.setNumeroRepeticion(e.getNumeroRepeticion());
        dto.setConteoId(e.getConteoId());
        dto.setNormal(e.getNormal());
        return dto;
    }

    public NormalPorConteo mapToEntityNormalPorConteo(NormalPorConteoDto dto) {
        if (dto == null) return null;
        NormalPorConteo e = new NormalPorConteo();
        e.setId(dto.getId() != null && dto.getId() == 0 ? null : dto.getId());
        e.setActivo(dto.isActivo());
        e.setGerminacionId(dto.getGerminacionId());
        e.setTabla(dto.getTabla());
        e.setNumeroRepeticion(dto.getNumeroRepeticion());
        e.setConteoId(dto.getConteoId());
        e.setNormal(dto.getNormal());
        return e;
    }


    // Métodos de mapeo para RepeticionTetrazolio
    public ti.proyectoinia.business.entities.ViabilidadRepsTetrazolio mapToEntityRepeticionTetrazolio(RepeticionTetrazolioDto dto) {
        if (dto == null) return null;
        
        ti.proyectoinia.business.entities.ViabilidadRepsTetrazolio entity = new ti.proyectoinia.business.entities.ViabilidadRepsTetrazolio();
        entity.setId(dto.getId());
        entity.setViables(dto.getViables() != null ? dto.getViables() : 0);
        entity.setNoViables(dto.getNoViables() != null ? dto.getNoViables() : 0);
        entity.setDuras(dto.getDuras() != null ? dto.getDuras() : 0);
        entity.setNumeroRepeticion(dto.getNumero() != null ? dto.getNumero() : 1);
        entity.setActivo(true);
        
        // Manejar la relación con Tetrazolio
        if (dto.getTetrazolioId() != null) {
            ti.proyectoinia.business.entities.Tetrazolio tetrazolio = new ti.proyectoinia.business.entities.Tetrazolio();
            tetrazolio.setId(dto.getTetrazolioId());
            entity.setTetrazolio(tetrazolio);
        }
        
        return entity;
    }

    public RepeticionTetrazolioDto mapToDtoRepeticionTetrazolio(ti.proyectoinia.business.entities.ViabilidadRepsTetrazolio entity) {
        if (entity == null) return null;
        
        RepeticionTetrazolioDto dto = new RepeticionTetrazolioDto();
        dto.setId(entity.getId());
        dto.setViables(entity.getViables());
        dto.setNoViables(entity.getNoViables());
        dto.setDuras(entity.getDuras());
        dto.setNumero(entity.getNumeroRepeticion());
        
        // Mapear el ID de la relación
        dto.setTetrazolioId(entity.getTetrazolio() != null ? entity.getTetrazolio().getId() : null);
        
        return dto;
    }
}

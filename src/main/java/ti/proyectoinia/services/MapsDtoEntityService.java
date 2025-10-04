package ti.proyectoinia.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ti.proyectoinia.business.entities.*;
import ti.proyectoinia.dtos.*;
import ti.proyectoinia.business.repositories.ReciboRepository;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MapsDtoEntityService {
    @Autowired
    private ReciboRepository reciboRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public Recibo getValidRecibo(Long reciboId) {
        if (reciboId == null) {
            return null;
        }
        
        return reciboRepository.findById(reciboId)
            .filter(Recibo::isActivo)
            .orElse(null);
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

    public GerminacionDto mapToDtoGerminacion(Germinacion germinacion) {
        if (germinacion == null) {
            return null;
        }

        GerminacionDto dto = new GerminacionDto();
        dto.setId(germinacion.getId());
        dto.setFechaInicio(germinacion.getFechaInicio());
        dto.setFechaConteo1(germinacion.getFechaConteo1());
        dto.setFechaConteo2(germinacion.getFechaConteo2());
        dto.setFechaConteo3(germinacion.getFechaConteo3());
        dto.setFechaConteo4(germinacion.getFechaConteo4());
        dto.setFechaConteo5(germinacion.getFechaConteo5());
        dto.setTotalDias(germinacion.getTotalDias());
        dto.setRepeticionNormal1(germinacion.getRepeticionNormal1());
        dto.setRepeticionNormal2(germinacion.getRepeticionNormal2());
        dto.setRepeticionNormal3(germinacion.getRepeticionNormal3());
        dto.setRepeticionNormal4(germinacion.getRepeticionNormal4());
        dto.setRepeticionNormal5(germinacion.getRepeticionNormal5());
        dto.setRepeticionDura(germinacion.getRepeticionDura());
        dto.setRepeticionFresca(germinacion.getRepeticionFresca());
        dto.setRepeticionAnormal(germinacion.getRepeticionAnormal());
        dto.setRepeticionMuerta(germinacion.getRepeticionMuerta());
        dto.setTotalRepeticion(germinacion.getTotalRepeticion());
        dto.setPromedioRepeticiones(germinacion.getPromedioRepeticiones());
        dto.setTratamiento(germinacion.getTratamiento());
        dto.setNroSemillaPorRepeticion(germinacion.getNroSemillaPorRepeticion());
        dto.setMetodo(germinacion.getMetodo());
        dto.setTemperatura(germinacion.getTemperatura());
        dto.setPreFrio(germinacion.getPreFrio());
        dto.setPreTratamiento(germinacion.getPreTratamiento());
        dto.setNroDias(germinacion.getNroDias());
        dto.setFechaFinal(germinacion.getFechaFinal());
        dto.setPRedondeo(germinacion.getPRedondeo());
        dto.setPNormal(germinacion.getPNormal());
        dto.setPAnormal(germinacion.getPAnormal());
        dto.setPMuertas(germinacion.getPMuertas());
        dto.setSemillasDuras(germinacion.getSemillasDuras());
        dto.setGerminacion(germinacion.getGerminacion());
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
        germinacion.setId(dto.getId());
        germinacion.setFechaInicio(dto.getFechaInicio());
        germinacion.setFechaConteo1(dto.getFechaConteo1());
        germinacion.setFechaConteo2(dto.getFechaConteo2());
        germinacion.setFechaConteo3(dto.getFechaConteo3());
        germinacion.setFechaConteo4(dto.getFechaConteo4());
        germinacion.setFechaConteo5(dto.getFechaConteo5());
        germinacion.setTotalDias(dto.getTotalDias());
        germinacion.setRepeticionNormal1(dto.getRepeticionNormal1());
        germinacion.setRepeticionNormal2(dto.getRepeticionNormal2());
        germinacion.setRepeticionNormal3(dto.getRepeticionNormal3());
        germinacion.setRepeticionNormal4(dto.getRepeticionNormal4());
        germinacion.setRepeticionNormal5(dto.getRepeticionNormal5());
        germinacion.setRepeticionDura(dto.getRepeticionDura());
        germinacion.setRepeticionFresca(dto.getRepeticionFresca());
        germinacion.setRepeticionAnormal(dto.getRepeticionAnormal());
        germinacion.setRepeticionMuerta(dto.getRepeticionMuerta());
        germinacion.setTotalRepeticion(dto.getTotalRepeticion());
        germinacion.setPromedioRepeticiones(dto.getPromedioRepeticiones());
        germinacion.setTratamiento(dto.getTratamiento());
        germinacion.setNroSemillaPorRepeticion(dto.getNroSemillaPorRepeticion());
        germinacion.setMetodo(dto.getMetodo());
        germinacion.setTemperatura(dto.getTemperatura());
        germinacion.setPreFrio(dto.getPreFrio());
        germinacion.setPreTratamiento(dto.getPreTratamiento());
        germinacion.setNroDias(dto.getNroDias());
        germinacion.setFechaFinal(dto.getFechaFinal());
        germinacion.setPRedondeo(dto.getPRedondeo());
        germinacion.setPNormal(dto.getPNormal());
        germinacion.setPAnormal(dto.getPAnormal());
        germinacion.setPMuertas(dto.getPMuertas());
        germinacion.setSemillasDuras(dto.getSemillasDuras());
        germinacion.setGerminacion(dto.getGerminacion());
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

        ti.proyectoinia.dtos.ReciboDto reciboDto = new ti.proyectoinia.dtos.ReciboDto();
        reciboDto.setId(recibo.getId());
        reciboDto.setNroAnalisis(recibo.getNroAnalisis());
        reciboDto.setEspecie(recibo.getEspecie());
        reciboDto.setFicha(recibo.getFicha());
        reciboDto.setFechaRecibo(recibo.getFechaRecibo());
        reciboDto.setRemitente(recibo.getRemitente());
        reciboDto.setOrigen(recibo.getOrigen());
        reciboDto.setCultivar(recibo.getCultivar());
        reciboDto.setDeposito(recibo.getDeposito());
        reciboDto.setDepositoId(recibo.getDepositoId());
        reciboDto.setEstado(recibo.getEstado());
        reciboDto.setLote(recibo.getLote());
        reciboDto.setKgLimpios(recibo.getKgLimpios());
        reciboDto.setAnalisisSolicitados(recibo.getAnalisisSolicitados());
        reciboDto.setArticulo(recibo.getArticulo());
        reciboDto.setActivo(recibo.isActivo());

        // Mapear humedades a lista de IDs
        if (recibo.getHumedades() != null) {
            reciboDto.setHumedadesId(recibo.getHumedades().stream().map(h -> h.getId().intValue()).collect(Collectors.toList()));
        } else {
            reciboDto.setHumedadesId(null);
        }
        return reciboDto;
    }

    public ti.proyectoinia.business.entities.Recibo mapToEntityRecibo(ti.proyectoinia.dtos.ReciboDto reciboDto) {
        if (reciboDto == null) {
            return null;
        }

        ti.proyectoinia.business.entities.Recibo recibo = new ti.proyectoinia.business.entities.Recibo();
        if (reciboDto.getId() != null) {
            recibo.setId(reciboDto.getId());
        }

        recibo.setNroAnalisis(reciboDto.getNroAnalisis());
        recibo.setEspecie(reciboDto.getEspecie());
        recibo.setFicha(reciboDto.getFicha());
        recibo.setFechaRecibo(reciboDto.getFechaRecibo());
        recibo.setRemitente(reciboDto.getRemitente());
        recibo.setOrigen(reciboDto.getOrigen());
        recibo.setCultivar(reciboDto.getCultivar());
        recibo.setDeposito(reciboDto.getDeposito());
        recibo.setDepositoId(reciboDto.getDepositoId());
        recibo.setEstado(reciboDto.getEstado());
        recibo.setLote(reciboDto.getLote());
        recibo.setKgLimpios(reciboDto.getKgLimpios());
        recibo.setAnalisisSolicitados(reciboDto.getAnalisisSolicitados());
        recibo.setArticulo(reciboDto.getArticulo());
        recibo.setActivo(reciboDto.isActivo());

        // Mapear lista de IDs a entidades HumedadRecibo (solo con id)
        if (reciboDto.getHumedadesId() != null && !reciboDto.getHumedadesId().isEmpty()) {
            List<HumedadRecibo> humedadesValidas = reciboDto.getHumedadesId().stream()
                .filter(id -> id != null && id > 0) // Filtrar IDs nulos o cero
                .map(id -> {
                    HumedadRecibo h = new HumedadRecibo();
                    h.setId(Long.valueOf(id));
                    return h;
                }).collect(Collectors.toList());
            
            // Solo establecer humedades si hay IDs válidos
            recibo.setHumedades(humedadesValidas.isEmpty() ? null : humedadesValidas);
        } else {
            recibo.setHumedades(null);
        }
        return recibo;
    }

    public MalezaDto mapToDtoMaleza(Maleza maleza) {
        if (maleza == null) {
            return null;
        }

        MalezaDto malezaDto = new MalezaDto();
        malezaDto.setId(maleza.getId());
        malezaDto.setNombre(maleza.getNombre());
        malezaDto.setDescripcion(malezaDto.getDescripcion());
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
        sanitarioDto.setEstadoProductoDosis(sanitario.getEstadoProductoDosis());
        sanitarioDto.setObservaciones(sanitario.getObservaciones());
        sanitarioDto.setNroSemillasRepeticion(sanitario.getNroSemillasRepeticion());
        sanitarioDto.setActivo(sanitario.isActivo());
        sanitarioDto.setEstandar(sanitario.isEstandar());
        sanitarioDto.setRepetido(sanitario.isRepetido());
        sanitarioDto.setFechaCreacion(sanitario.getFechaCreacion());
        sanitarioDto.setFechaRepeticion(sanitario.getFechaRepeticion());
        // Manejar la relación con Recibo
        if (sanitario.getRecibo() != null) {
            sanitarioDto.setReciboId(sanitario.getRecibo().getId());
        } else {
            sanitarioDto.setReciboId(null);
        }
        sanitarioDto.setSanitarioHongoids(sanitario.getSanitarioHongoids());
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
        sanitario.setEstadoProductoDosis(sanitarioDto.getEstadoProductoDosis());
        sanitario.setObservaciones(sanitarioDto.getObservaciones());
        sanitario.setNroSemillasRepeticion(sanitarioDto.getNroSemillasRepeticion());
        sanitario.setActivo(sanitarioDto.isActivo());
        sanitario.setEstandar(sanitarioDto.isEstandar());
        sanitario.setRepetido(sanitarioDto.isRepetido());
        sanitario.setFechaCreacion(sanitarioDto.getFechaCreacion());
        sanitario.setFechaRepeticion(sanitarioDto.getFechaRepeticion());
        // Manejar la relación con Recibo
        if (sanitarioDto.getReciboId() != null) {
            Recibo recibo = getValidRecibo(sanitarioDto.getReciboId());
            sanitario.setRecibo(recibo);
        } else {
            sanitario.setRecibo(null);
        }
        sanitario.setSanitarioHongoids(sanitarioDto.getSanitarioHongoids());
        return sanitario;
    }

    public PMSDto mapToDtoPMS(PMS pms) {
        if (pms == null) {
            return null;
        }
        PMSDto pmsDto = new PMSDto();
        pmsDto.setId(pms.getId());
        pmsDto.setGramosPorRepeticiones(pms.getGramosPorRepeticiones());
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
        pms.setGramosPorRepeticiones(pmsDto.getGramosPorRepeticiones());
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
        dto.setPesoInicialPorcentajeRedondeo(pureza.getPesoInicialPorcentajeRedondeo());
        dto.setPesoInicialPorcentajeRedondeoInase(pureza.getPesoInicialPorcentajeRedondeoInase());
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
        dto.setFechaEstandar(pureza.getFechaEstandar());
        dto.setEstandar(pureza.getEstandar());
        dto.setActivo(pureza.isActivo());
        dto.setRepetido(pureza.isRepetido());
        dto.setFechaCreacion(pureza.getFechaCreacion());
        dto.setFechaRepeticion(pureza.getFechaRepeticion());

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
        pureza.setPesoInicialPorcentajeRedondeo(dto.getPesoInicialPorcentajeRedondeo());
        pureza.setPesoInicialPorcentajeRedondeoInase(dto.getPesoInicialPorcentajeRedondeoInase());
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
        pureza.setFechaEstandar(dto.getFechaEstandar());
        pureza.setEstandar(dto.isEstandar());
        pureza.setActivo(dto.isActivo());
        pureza.setRepetido(dto.isRepetido());
        pureza.setFechaCreacion(dto.getFechaCreacion());
        pureza.setFechaRepeticion(dto.getFechaRepeticion());

        // Validar y obtener el recibo si existe
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
        loteDto.setFechaCreacion(lote.getFechaCreacion());
        loteDto.setFechaFinalizacion(lote.getFechaFinalizacion());

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
        lote.setFechaCreacion(loteDto.getFechaCreacion());
        lote.setFechaFinalizacion(loteDto.getFechaFinalizacion());

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
        dto.setFecha(dosn.getFecha());
        dto.setGramosAnalizados(dosn.getGramosAnalizados());
        dto.setTiposDeanalisis(dosn.getTiposDeanalisis());
        dto.setCompletoReducido(dosn.getCompletoReducido());
        dto.setMalezasToleranciaCero(dosn.getMalezasToleranciaCero());
        dto.setOtrosCultivos(dosn.getOtrosCultivos());
        dto.setDeterminacionBrassica(dosn.getDeterminacionBrassica());
        dto.setDeterminacionCuscuta(dosn.getDeterminacionCuscuta());
        dto.setEstandar(dosn.getEstandar());
        dto.setFechaAnalisis(dosn.getFechaAnalisis());
        dto.setActivo(dosn.isActivo());
        dto.setRepetido(dosn.isRepetido());
        dto.setFechaCreacion(dosn.getFechaCreacion());
        dto.setFechaRepeticion(dosn.getFechaRepeticion());

        if (dosn.getCultivos() != null) {
            dto.setCultivos(dosn.getCultivos().stream().map(this::mapToDtoCultivo).collect(Collectors.toList()));
        } else {
            dto.setCultivos(null);
        }
        return dto;
    }

    public DOSN mapToEntityDOSN(DOSNDto dto) {
        if (dto == null) {
            return null;
        }
        DOSN dosn = new DOSN();
        dosn.setId(dto.getId());
        dosn.setFecha(dto.getFecha());
        dosn.setGramosAnalizados(dto.getGramosAnalizados());
        dosn.setTiposDeanalisis(dto.getTiposDeanalisis());
        dosn.setCompletoReducido(dto.isCompletoReducido());
        dosn.setMalezasToleranciaCero(dto.getMalezasToleranciaCero());
        dosn.setOtrosCultivos(dto.getOtrosCultivos());
        dosn.setDeterminacionBrassica(dto.getDeterminacionBrassica());
        dosn.setDeterminacionCuscuta(dto.getDeterminacionCuscuta());
        dosn.setEstandar(dto.isEstandar());
        dosn.setActivo(dto.isActivo());
        dosn.setFechaAnalisis(dto.getFechaAnalisis());
        dosn.setRepetido(dto.isRepetido());
        dosn.setFechaCreacion(dto.getFechaCreacion());
        dosn.setFechaRepeticion(dto.getFechaRepeticion());

        if (dto.getCultivos() != null) {
            dosn.setCultivos(dto.getCultivos().stream().map(this::mapToEntityCultivo).collect(Collectors.toList()));
        } else {
            dosn.setCultivos(null);
        }
        return dosn;
    }

    private CultivoDto mapToDtoCultivo(Cultivo cultivo) {
        if (cultivo == null) return null;

        CultivoDto dto = new CultivoDto();
        dto.setId(cultivo.getId());
        dto.setNombre(cultivo.getNombre());
        dto.setDescripcion(cultivo.getDescripcion());
        dto.setActivo(cultivo.isActivo());

        return dto;
    }
    private Cultivo mapToEntityCultivo(CultivoDto dto) {
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
        dto.setPorcentaje(pureza.getPorcentaje());
        dto.setPesoInicial(pureza.getPesoInicial());
        dto.setRepeticiones(pureza.getRepeticiones());
        dto.setPi(pureza.getPi());
        dto.setAt(pureza.getAt());
        dto.setPorcentajeA(pureza.getPorcentajeA());
        dto.setTotalA(pureza.getTotalA());
        dto.setSemillasLS(pureza.getSemillasLS());
        dto.setActivo(pureza.isActivo());
        dto.setRepetido(pureza.isRepetido());
        dto.setFechaCreacion(pureza.getFechaCreacion());
        dto.setFechaRepeticion(pureza.getFechaRepeticion());

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
        pureza.setPorcentaje(dto.getPorcentaje());
        pureza.setPesoInicial(dto.getPesoInicial());
        pureza.setRepeticiones(dto.getRepeticiones());
        pureza.setPi(dto.getPi());
        pureza.setAt(dto.getAt());
        pureza.setPorcentajeA(dto.getPorcentajeA());
        pureza.setTotalA(dto.getTotalA());
        pureza.setSemillasLS(dto.getSemillasLS());
        pureza.setActivo(dto.isActivo());
        pureza.setRepetido(dto.isRepetido());
        pureza.setFechaCreacion(dto.getFechaCreacion());
        pureza.setFechaRepeticion(dto.getFechaRepeticion());

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
        dto.setConcentracion(tetrazolio.getConcentracion());
        dto.setTincionHoras(tetrazolio.getTincionHoras());
        dto.setTincionGrados(tetrazolio.getTincionGrados());
        dto.setFecha(tetrazolio.getFecha());
        dto.setViables(tetrazolio.getViables());
        dto.setNoViables(tetrazolio.getNoViables());
        dto.setDuras(tetrazolio.getDuras());
        dto.setTotal(tetrazolio.getTotal());
        dto.setPromedio(tetrazolio.getPromedio());
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
        dto.setFechaCreacion(tetrazolio.getFechaCreacion());
        dto.setFechaRepeticion(tetrazolio.getFechaRepeticion());

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

        tetrazolio.setConcentracion(dto.getConcentracion());
        tetrazolio.setTincionHoras(dto.getTincionHoras());
        tetrazolio.setTincionGrados(dto.getTincionGrados());
        tetrazolio.setFecha(dto.getFecha());
        tetrazolio.setViables(dto.getViables());
        tetrazolio.setNoViables(dto.getNoViables());
        tetrazolio.setDuras(dto.getDuras());
        tetrazolio.setTotal(dto.getTotal());
        tetrazolio.setPromedio(dto.getPromedio());
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

    public HumedadReciboDto mapToDtoHumedadRecibo(HumedadRecibo entity) {
        if (entity == null) return null;
        HumedadReciboDto dto = new HumedadReciboDto();
        dto.setId(entity.getId());
        dto.setLugar(entity.getLugar());
        dto.setNumero(entity.getNumero());
        return dto;
    }

    public HumedadRecibo mapToEntityHumedadRecibo(HumedadReciboDto dto) {
        if (dto == null) return null;
        HumedadRecibo entity = new HumedadRecibo();
        entity.setId(dto.getId());
        entity.setLugar(dto.getLugar());
        entity.setNumero(dto.getNumero());
        return entity;
    }
}

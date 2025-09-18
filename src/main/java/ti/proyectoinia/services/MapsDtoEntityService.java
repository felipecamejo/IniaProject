package ti.proyectoinia.services;

import org.springframework.stereotype.Service;
import ti.proyectoinia.business.entities.*;
import ti.proyectoinia.dtos.*;

import java.util.stream.Collectors;

@Service
public class MapsDtoEntityService {

    public HongoDto mapToDtoHongo(Hongo hongo) {
        if (hongo == null) {
            return null;
        }
        HongoDto hongoDto = new HongoDto();
        hongoDto.setId(hongo.getId());
        hongoDto.setNombre(hongo.getNombre());

        return hongoDto;
    }

    public Hongo mapToEntityHongo(HongoDto hongoDto) {
        if (hongoDto == null) {
            return null;
        }
        Hongo hongo = new Hongo();
        hongo.setId(hongoDto.getId());
        hongo.setNombre(hongoDto.getNombre());

        return hongo;
    }

    public GerminacionDto mapToDtoGerminacion(Germinacion germinacion) {
        if (germinacion == null) {
            return null;
        }
        GerminacionDto germinacionDto = new GerminacionDto();
        germinacionDto.setId(germinacion.getId());
        germinacionDto.setFechaInicio(germinacion.getFechaInicio());
        germinacionDto.setFechaConteo1(germinacion.getFechaConteo1());
        germinacionDto.setFechaConteo2(germinacion.getFechaConteo2());
        germinacionDto.setFechaConteo3(germinacion.getFechaConteo3());
        germinacionDto.setFechaConteo4(germinacion.getFechaConteo4());
        germinacionDto.setFechaConteo5(germinacion.getFechaConteo5());
        germinacionDto.setTotalDias(germinacion.getTotalDias());
        germinacionDto.setRepeticionNormal1(germinacion.getRepeticionNormal1());
        germinacionDto.setRepeticionNormal2(germinacion.getRepeticionNormal2());
        germinacionDto.setRepeticionNormal3(germinacion.getRepeticionNormal3());
        germinacionDto.setRepeticionNormal4(germinacion.getRepeticionNormal4());
        germinacionDto.setRepeticionNormal5(germinacion.getRepeticionNormal5());
        germinacionDto.setRepeticionDura(germinacion.getRepeticionDura());
        germinacionDto.setRepeticionFresca(germinacion.getRepeticionFresca());
        germinacionDto.setRepeticionAnormal(germinacion.getRepeticionAnormal());
        germinacionDto.setRepeticionMuerta(germinacion.getRepeticionMuerta());
        germinacionDto.setTotalRepeticion(germinacion.getTotalRepeticion());
        germinacionDto.setPromedioRepeticiones(germinacion.getPromedioRepeticiones());
        germinacionDto.setTratamiento(germinacion.getTratamiento());
        germinacionDto.setNroSemillaPorRepeticion(germinacion.getNroSemillaPorRepeticion());
        germinacionDto.setMetodo(germinacion.getMetodo());
        germinacionDto.setTempertatura(germinacion.getTempertatura());
        germinacionDto.setPreFrio(germinacion.getPreFrio());
        germinacionDto.setPreTratamiento(germinacion.getPreTratamiento());
        germinacionDto.setNroDias(germinacion.getNroDias());
        germinacionDto.setFechaFinal(germinacion.getFechaFinal());
        germinacionDto.setPRedondeo(germinacion.getPRedondeo());
        germinacionDto.setPNormal(germinacion.getPNormal());
        germinacionDto.setPAnormal(germinacion.getPAnormal());
        germinacionDto.setPMuertas(germinacion.getPMuertas());
        germinacionDto.setSemillasDuras(germinacion.getSemillasDuras());
        germinacionDto.setGerminacion(germinacion.getGerminacion());
        germinacionDto.setComentarios(germinacion.getComentarios());


        if (germinacion.getRecibo() != null) {
            germinacionDto.setRecibo(mapToDtoRecibo(germinacion.getRecibo()));
        } else {
            germinacionDto.setRecibo(null);
        }
        germinacionDto.setActivo(germinacion.isActivo());

        return germinacionDto;
    }

    public Germinacion mapToEntityGerminacion(GerminacionDto germinacionDto) {
        if (germinacionDto == null) {
            return null;
        }
        Germinacion germinacion = new Germinacion();
        germinacion.setId(germinacionDto.getId());
        germinacion.setFechaInicio(germinacionDto.getFechaInicio());
        germinacion.setFechaConteo1(germinacionDto.getFechaConteo1());
        germinacion.setFechaConteo2(germinacionDto.getFechaConteo2());
        germinacion.setFechaConteo3(germinacionDto.getFechaConteo3());
        germinacion.setFechaConteo4(germinacionDto.getFechaConteo4());
        germinacion.setFechaConteo5(germinacionDto.getFechaConteo5());
        germinacion.setTotalDias(germinacionDto.getTotalDias());
        germinacion.setRepeticionNormal1(germinacionDto.getRepeticionNormal1());
        germinacion.setRepeticionNormal2(germinacionDto.getRepeticionNormal2());
        germinacion.setRepeticionNormal3(germinacionDto.getRepeticionNormal3());
        germinacion.setRepeticionNormal4(germinacionDto.getRepeticionNormal4());
        germinacion.setRepeticionNormal5(germinacionDto.getRepeticionNormal5());
        germinacion.setRepeticionDura(germinacionDto.getRepeticionDura());
        germinacion.setRepeticionFresca(germinacionDto.getRepeticionFresca());
        germinacion.setRepeticionAnormal(germinacionDto.getRepeticionAnormal());
        germinacion.setRepeticionMuerta(germinacionDto.getRepeticionMuerta());
        germinacion.setTotalRepeticion(germinacionDto.getTotalRepeticion());
        germinacion.setPromedioRepeticiones(germinacionDto.getPromedioRepeticiones());
        germinacion.setTratamiento(germinacionDto.getTratamiento());
        germinacion.setNroSemillaPorRepeticion(germinacionDto.getNroSemillaPorRepeticion());
        germinacion.setMetodo(germinacionDto.getMetodo());
        germinacion.setTempertatura(germinacionDto.getTempertatura());
        germinacion.setPreFrio(germinacionDto.getPreFrio());
        germinacion.setPreTratamiento(germinacionDto.getPreTratamiento());
        germinacion.setNroDias(germinacionDto.getNroDias());
        germinacion.setFechaFinal(germinacionDto.getFechaFinal());
        germinacion.setPRedondeo(germinacionDto.getPRedondeo());
        germinacion.setPNormal(germinacionDto.getPNormal());
        germinacion.setPAnormal(germinacionDto.getPAnormal());
        germinacion.setPMuertas(germinacionDto.getPMuertas());
        germinacion.setSemillasDuras(germinacionDto.getSemillasDuras());
        germinacion.setGerminacion(germinacionDto.getGerminacion());
        germinacion.setComentarios(germinacionDto.getComentarios());


        if (germinacionDto.getRecibo() != null) {
            germinacion.setRecibo(mapToEntityRecibo(germinacionDto.getRecibo()));
        } else {
            germinacion.setRecibo(null);
        }
        germinacion.setActivo(germinacionDto.isActivo());
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
        reciboDto.setEstado(recibo.getEstado());
        reciboDto.setLote(recibo.getLote());
        reciboDto.setKgLimpios(recibo.getKgLimpios());
        reciboDto.setAnalisisSolicitados(recibo.getAnalisisSolicitados());
        reciboDto.setArticulo(recibo.getArticulo());
        reciboDto.setActivo(recibo.isActivo());
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
        recibo.setEstado(reciboDto.getEstado());
        recibo.setLote(reciboDto.getLote());
        recibo.setKgLimpios(reciboDto.getKgLimpios());
        recibo.setAnalisisSolicitados(reciboDto.getAnalisisSolicitados());
        recibo.setArticulo(reciboDto.getArticulo());
        recibo.setActivo(reciboDto.isActivo());
        return recibo;
    }

    public MalezaDto mapToDtoMaleza(Maleza maleza) {
        if (maleza == null) {
            return null;
        }
        MalezaDto malezaDto = new MalezaDto();
        malezaDto.setId(maleza.getId());
        malezaDto.setNombre(maleza.getNombre());
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
        sanitarioDto.setHorasLuzOscuridad(sanitario.getHorasLuzOscuridad());
        sanitarioDto.setNroDias(sanitario.getNroDias());
        sanitarioDto.setEstadoProductoDosis(sanitario.getEstadoProductoDosis());
        sanitarioDto.setObservaciones(sanitario.getObservaciones());
        sanitarioDto.setNroSemillasRepeticion(sanitario.getNroSemillasRepeticion());
        sanitarioDto.setActivo(sanitario.isActivo());

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
        sanitario.setHorasLuzOscuridad(sanitarioDto.getHorasLuzOscuridad());
        sanitario.setNroDias(sanitarioDto.getNroDias());
        sanitario.setEstadoProductoDosis(sanitarioDto.getEstadoProductoDosis());
        sanitario.setObservaciones(sanitarioDto.getObservaciones());
        sanitario.setNroSemillasRepeticion(sanitarioDto.getNroSemillasRepeticion());
        sanitario.setActivo(sanitarioDto.isActivo());

        return sanitario;
    }

    public PMSDto mapToDtoPMS(PMS pms) {
        if (pms == null) {
            return null;
        }
        PMSDto pmsDto = new PMSDto();
        pmsDto.setId(pms.getId());
        pmsDto.setPesoMilSemillas(pms.getPesoMilSemillas());
        pmsDto.setHumedadPorcentual(pms.getHumedadPorcentual());
        pmsDto.setFechaMedicion(pms.getFechaMedicion());
        pmsDto.setMetodo(pms.getMetodo());
        pmsDto.setObservaciones(pms.getObservaciones());
        pmsDto.setActivo(pms.isActivo());
        
        return pmsDto;
    }

    public PMS mapToEntityPMS(PMSDto pmsDto) {
        if (pmsDto == null) {
            return null;
        }
        PMS pms = new PMS();
        pms.setId(pmsDto.getId());
        pms.setPesoMilSemillas(pmsDto.getPesoMilSemillas());
        pms.setHumedadPorcentual(pmsDto.getHumedadPorcentual());
        pms.setFechaMedicion(pmsDto.getFechaMedicion());
        pms.setMetodo(pmsDto.getMetodo());
        pms.setObservaciones(pmsDto.getObservaciones());
        pms.setActivo(pmsDto.isActivo());
       
        return pms;
    }

    public PurezaDto mapToDtoPureza(Pureza pureza) {
        if (pureza == null) {
            return null;
        }
        PurezaDto dto = new PurezaDto();
        dto.setId(pureza.getId());
        dto.setFecha(pureza.getFecha());
        dto.setPesoInicial(pureza.getPesoInicial());
        dto.setSemillaPura(pureza.getSemillaPura());
        dto.setMaterialInerte(pureza.getMaterialInerte());
        dto.setOtrosCultivos(pureza.getOtrosCultivos());
        dto.setMalezas(pureza.getMalezas());
        dto.setMalezasToleradas(pureza.getMalezasToleradas());
        dto.setPesoTotal(pureza.getPesoTotal());
        dto.setOtrosCultivo(pureza.getOtrosCultivo());
        dto.setFechaEstandar(pureza.getFechaEstandar());
        dto.setEstandar(pureza.isEstandar());
        dto.setActivo(pureza.isActivo());
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
        pureza.setFecha(dto.getFecha());
        pureza.setPesoInicial(dto.getPesoInicial());
        pureza.setSemillaPura(dto.getSemillaPura());
        pureza.setMaterialInerte(dto.getMaterialInerte());
        pureza.setOtrosCultivos(dto.getOtrosCultivos());
        pureza.setMalezas(dto.getMalezas());
        pureza.setMalezasToleradas(dto.getMalezasToleradas());
        pureza.setPesoTotal(dto.getPesoTotal());
        pureza.setOtrosCultivo(dto.getOtrosCultivo());
        pureza.setFechaEstandar(dto.getFechaEstandar());
        pureza.setEstandar(dto.isEstandar());
        pureza.setActivo(dto.isActivo());
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

        

        if (lote.getUsuarios() != null) {
            loteDto.setUsuarios(lote.getUsuarios().stream().map(this::mapToDtoUsuarioBasic).collect(Collectors.toList()));
        } else {
            loteDto.setUsuarios(null);
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

    

        if (loteDto.getUsuarios() != null) {
            lote.setUsuarios(loteDto.getUsuarios().stream().map(this::mapToEntityUsuarioBasic).collect(Collectors.toList()));
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
            usuarioDto.setLotes(usuario.getLotes().stream().map(this::mapToDtoLoteBasic).collect(Collectors.toList()));
        } else {
            usuarioDto.setLotes(null);
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
        usuario.setPassword(usuarioDto.getPassword());
        usuario.setRol(usuarioDto.getRol());
        usuario.setActivo(usuarioDto.isActivo());
        if (usuarioDto.getLotes() != null) {
            usuario.setLotes(usuarioDto.getLotes().stream().map(this::mapToEntityLoteBasic).collect(Collectors.toList()));
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
        dto.setCompletoReducido(dosn.isCompletoReducido());
        dto.setMalezasToleranciaCero(dosn.getMalezasToleranciaCero());
        dto.setOtrosCultivos(dosn.getOtrosCultivos());
        dto.setDeterminacionBrassica(dosn.getDeterminacionBrassica());
        dto.setDeterminacionCuscuta(dosn.getDeterminacionCuscuta());
        dto.setEstandar(dosn.isEstandar());
        dto.setFechaAnalisis(dosn.getFechaAnalisis());

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
        dosn.setFechaAnalisis(dto.getFechaAnalisis());

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
        return dto;
    }
    private Cultivo mapToEntityCultivo(CultivoDto dto) {
        if (dto == null) return null;
        Cultivo cultivo = new Cultivo();
        cultivo.setId(dto.getId());
        cultivo.setNombre(dto.getNombre());
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
            dto.setPretratamientoId(tetrazolio.getPretratamiento().ordinal());
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
        if (dto.getPretratamientoId() != null) {
            tetrazolio.setPretratamiento(PreTratamiento.values()[dto.getPretratamientoId()]);
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
        return tetrazolio;
    }
}

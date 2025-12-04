package ti.proyectoinia.dtos;

import lombok.Data;
import ti.proyectoinia.business.entities.Certificado.TipoCertificado;

import java.util.Date;

@Data
public class CertificadoDto {
    private Long id;

    // Datos del solicitante
    private String nombreSolicitante;
    private String especie;
    private String cultivar;
    private String categoria;

    // Datos del muestreo
    private String responsableMuestreo;
    private Date fechaMuestreo;
    private String numeroLote;
    private Float pesoKg;
    private Integer numeroEnvases;

    // Datos del laboratorio
    private Date fechaIngresoLaboratorio;
    private Date fechaFinalizacionAnalisis;
    private String numeroMuestra;

    // Datos del certificado
    private String numeroCertificado;
    private TipoCertificado tipoCertificado;
    private Date fechaEmision;
    private byte[] firmante;
    private Date fechaFirma;

    private boolean brassicaContiene;

    private Long reciboId;

    private boolean activo;

    // Resultados de análisis - Pureza
    private Float purezaSemillaPura;
    private Float purezaMateriaInerte;
    private Float purezaOtrasSemillas;
    private Float purezaOtrosCultivos;
    private Float purezaMalezas;
    private String purezaMalezasToleradas;
    private String purezaPeso1000Semillas;
    private String purezaHumedad;
    private String purezaClaseMateriaInerte;
    private String purezaOtrasSemillasDescripcion;

    // Resultados de análisis - DOSN
    private Float dosnGramosAnalizados;
    private Integer dosnMalezasToleranciaCero;
    private Integer dosnMalezasTolerancia;
    private Integer dosnOtrosCultivos;
    private String dosnBrassicaSpp;

    // Resultados de análisis - Germinación
    private Integer germinacionNumeroDias;
    private Float germinacionPlantulasNormales;
    private Float germinacionPlantulasAnormales;
    private Integer germinacionSemillasDuras;
    private Integer germinacionSemillasFrescas;
    private Float germinacionSemillasMuertas;
    private String germinacionSustrato;
    private Integer germinacionTemperatura;
    private String germinacionPreTratamiento;

    private String otrasDeterminaciones;
    private String nombreFirmante;
    private String funcionFirmante;

}


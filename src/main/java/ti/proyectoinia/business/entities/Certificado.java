package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Entity
@Data
@Table(name = "CERTIFICADO")
public class Certificado {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "CERTIFICADO_ID")
    private Long id;

    // Datos del solicitante
    @Column(name = "NOMBRE_SOLICITANTE")
    private String nombreSolicitante;

    @Column(name = "ESPECIE")
    private String especie;

    @Column(name = "CULTIVAR")
    private String cultivar;

    @Column(name = "CATEGORIA")
    private String categoria;

    // Datos del muestreo
    @Column(name = "RESPONSABLE_MUESTREO")
    private String responsableMuestreo;

    @Column(name = "FECHA_MUESTREO")
    private Date fechaMuestreo;

    @Column(name = "NUMERO_LOTE")
    private String numeroLote;

    @Column(name = "PESO_KG")
    private Float pesoKg;

    @Column(name = "NUMERO_ENVASES")
    private Integer numeroEnvases;

    // Datos del laboratorio
    @Column(name = "FECHA_INGRESO_LABORATORIO")
    private Date fechaIngresoLaboratorio;

    @Column(name = "FECHA_FINALIZACION_ANALISIS")
    private Date fechaFinalizacionAnalisis;

    @Column(name = "NUMERO_MUESTRA")
    private String numeroMuestra;

    // Datos del certificado
    @Column(name = "NUMERO_CERTIFICADO")
    private String numeroCertificado;

    @Column(name = "TIPO_CERTIFICADO")
    @Enumerated(EnumType.STRING)
    private TipoCertificado tipoCertificado;

    @Column(name = "FECHA_EMISION")
    private Date fechaEmision;

    @Column(name = "FIRMANTE")
    private String firmante;

    @Column(name = "FECHA_FIRMA")
    private Date fechaFirma;

    @Column(name = "CERTIFICADO_ACTIVO")
    private boolean activo;

    // Relación con Recibo
    @ManyToOne
    @JoinColumn(name = "RECIBO_ID")
    private Recibo recibo;

    // Resultados de análisis - Pureza
    @Column(name = "PUREZA_SEMILLA_PURA")
    private Float purezaSemillaPura;

    @Column(name = "PUREZA_MATERIA_INERTE")
    private Float purezaMateriaInerte;

    @Column(name = "PUREZA_OTRAS_SEMILLAS")
    private Float purezaOtrasSemillas;

    @Column(name = "PUREZA_OTROS_CULTIVOS")
    private Float purezaOtrosCultivos;

    @Column(name = "PUREZA_MALEZAS")
    private Float purezaMalezas;

    @Column(name = "PUREZA_MALEZAS_TOLERADAS")
    private String purezaMalezasToleradas;

    @Column(name = "PUREZA_PESO_1000_SEMILLAS")
    private String purezaPeso1000Semillas;

    @Column(name = "PUREZA_HUMEDAD")
    private String purezaHumedad;

    @Column(name = "PUREZA_CLASE_MATERIA_INERTE")
    private String purezaClaseMateriaInerte;

    @Column(name = "PUREZA_OTRAS_SEMILLAS_DESC")
    private String purezaOtrasSemillasDescripcion;

    // Resultados de análisis - DOSN
    @Column(name = "DOSN_GRAMOS_ANALIZADOS")
    private Float dosnGramosAnalizados;

    @Column(name = "DOSN_MALEZAS_TOLERANCIA_CERO")
    private Integer dosnMalezasToleranciaCero;

    @Column(name = "DOSN_MALEZAS_TOLERANCIA")
    private Integer dosnMalezasTolerancia;

    @Column(name = "DOSN_OTROS_CULTIVOS")
    private Integer dosnOtrosCultivos;

    @Column(name = "DOSN_BRASSICA_SPP")
    private String dosnBrassicaSpp;

    // Resultados de análisis - Germinación
    @Column(name = "GERMINACION_NUMERO_DIAS")
    private Integer germinacionNumeroDias;

    @Column(name = "GERMINACION_PLANTULAS_NORMALES")
    private Float germinacionPlantulasNormales;

    @Column(name = "GERMINACION_PLANTULAS_ANORMALES")
    private Float germinacionPlantulasAnormales;

    @Column(name = "GERMINACION_SEMILLAS_DURAS")
    private Integer germinacionSemillasDuras;

    @Column(name = "GERMINACION_SEMILLAS_FRESCAS")
    private Integer germinacionSemillasFrescas;

    @Column(name = "GERMINACION_SEMILLAS_MUERTAS")
    private Float germinacionSemillasMuertas;

    @Column(name = "GERMINACION_SUSTRATO")
    private String germinacionSustrato;

    @Column(name = "GERMINACION_TEMPERATURA")
    private Integer germinacionTemperatura;

    @Column(name = "GERMINACION_PRE_TRATAMIENTO")
    private String germinacionPreTratamiento;

    public enum TipoCertificado {
        DEFINITIVO,
        PROVISORIO
    }

    @Column(name = "OTRAS_DETERMINACIONES")
    private String otrasDeterminaciones;

    @Column(name = "NOMBRE_FIRMANTE")
    private String nombreFirmante;

    @Column(name = "FUNCION_FIRMANTE")
    private String funcionFirmante;
}


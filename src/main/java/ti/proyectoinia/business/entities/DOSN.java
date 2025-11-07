package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Entity
@Data
@Table(name = "DOSN")
public class DOSN {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "DOSN_ID")
    private Long id;

    @Column(name = "DOSN_FECHA_INIA")
    private Date fechaINIA;

    @Column(name = "DOSN_FECHA_INASE")
    private Date fechaINASE;

    @Column(name = "DOSN_GRAMOS_ANALIZADOS_INIA")
    private Float gramosAnalizadosINIA;

    @Column(name = "DOSN_GRAMOS_ANALIZADOS_INASE")
    private Float gramosAnalizadosINASE;

    @Enumerated(EnumType.STRING)
    @Column(name = "DOSN_TIPOS_DE_ANALISIS_INIA")
    private tipoAnalisisDOSN tiposDeanalisisINIA;

    @Enumerated(EnumType.STRING)
    @Column(name = "DOSN_TIPOS_DE_ANALISIS_INASE")
    private tipoAnalisisDOSN tiposDeanalisisINASE;

    @Column(name = "DOSN_DETERMINACION_BRASSICA")
    private Boolean determinacionBrassica;

    @Column(name = "DOSN_DETERMINACION_CUSCUTA")
    private Boolean determinacionCuscuta;

    @Column(name = "DOSN_DETERMINACION_CUSCUTA_GRAMOS")
    private Float determinacionCuscutaGramos;

    @Column(name = "DOSN_DETERMINACION_BRASSICA_GRAMOS")
    private Float determinacionBrassicaGramos;

    @Column(name = "DOSN_ESTANDAR")
    private Boolean estandar;

    @Column(name = "DOSN_FECHA_ANALISIS")
    private Date fechaAnalisis;

    

    @ManyToOne
    @JoinColumn(name = "RECIBO_ID")
    private Recibo recibo;

    @Column(name = "DOSN_ACTIVO")
    private boolean activo;

    @Column(name = "DOSN_REPETIDO")
    private boolean repetido;

    @Column(name = "DOSN_FECHA_CREACION")
    private Date fechaCreacion;

    @Column(name = "DOSN_FECHA_REPETICION")
    private Date fechaRepeticion;

    // Colecciones de malezas (INIA / INASE), siguiendo el modelo de Pureza

    @ManyToMany
    @JoinTable(
        name = "DOSN_MALEZA_NORMAL_INIA",
        joinColumns = @JoinColumn(name = "DOSN_ID"),
        inverseJoinColumns = @JoinColumn(name = "MALEZA_ID")
    )
    private List<Maleza> malezasNormalesINIA;

    @ManyToMany
    @JoinTable(
        name = "DOSN_MALEZA_NORMAL_INASE",
        joinColumns = @JoinColumn(name = "DOSN_ID"),
        inverseJoinColumns = @JoinColumn(name = "MALEZA_ID")
    )
    private List<Maleza> malezasNormalesINASE;

    @ManyToMany
    @JoinTable(
        name = "DOSN_MALEZA_TOLERADA_INIA",
        joinColumns = @JoinColumn(name = "DOSN_ID"),
        inverseJoinColumns = @JoinColumn(name = "MALEZA_ID")
    )
    private List<Maleza> malezasToleradasINIA;

    @ManyToMany
    @JoinTable(
        name = "DOSN_MALEZA_TOLERADA_INASE",
        joinColumns = @JoinColumn(name = "DOSN_ID"),
        inverseJoinColumns = @JoinColumn(name = "MALEZA_ID")
    )
    private List<Maleza> malezasToleradasINASE;

    @ManyToMany
    @JoinTable(
        name = "DOSN_MALEZA_TOLERANCIA_CERO_INIA",
        joinColumns = @JoinColumn(name = "DOSN_ID"),
        inverseJoinColumns = @JoinColumn(name = "MALEZA_ID")
    )
    private List<Maleza> malezasToleranciaCeroListaINIA;

    @ManyToMany
    @JoinTable(
        name = "DOSN_MALEZA_TOLERANCIA_CERO_INASE",
        joinColumns = @JoinColumn(name = "DOSN_ID"),
        inverseJoinColumns = @JoinColumn(name = "MALEZA_ID")
    )
    private List<Maleza> malezasToleranciaCeroListaINASE;

    @ManyToMany
    @JoinTable(
        name = "DOSN_CULTIVO_INIA",
        joinColumns = @JoinColumn(name = "DOSN_ID"),
        inverseJoinColumns = @JoinColumn(name = "CULTIVO_ID")
    )
    private List<Cultivo> cultivosINIA;

    @ManyToMany
    @JoinTable(
        name = "DOSN_CULTIVO_INASE",
        joinColumns = @JoinColumn(name = "DOSN_ID"),
        inverseJoinColumns = @JoinColumn(name = "CULTIVO_ID")
    )
    private List<Cultivo> cultivosINASE;

    // Nuevas relaciones con detalle (organismo, categoría y cantidad)
    // Mantienen compatibilidad con las listas ManyToMany anteriores.

    @OneToMany(mappedBy = "dosn", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DOSNMaleza> malezasDetalle;

    @OneToMany(mappedBy = "dosn", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DOSNCultivo> cultivosDetalle;
}

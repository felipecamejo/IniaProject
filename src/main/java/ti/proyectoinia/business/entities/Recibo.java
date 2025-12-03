package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

import java.util.Date;

@Entity
@Data
@Table(name = "RECIBO")
public class Recibo {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "RECIBO_ID")
    private Long id;

    @Column(name = "NRO_ANALISIS")
    private Integer nroAnalisis;

    @ManyToOne
    @JoinColumn(name = "ESPECIE_ID")
    private Especie especie;

    @ManyToOne
    @JoinColumn(name = "CULTIVAR_ID")
    private Cultivo cultivar;

    @Column(name = "FICHA")
    private String ficha;

    @Column(name = "FECHA_RECIBO")
    private Date fechaRecibo;

    @Column(name = "REMITENTE")
    private String remitente;

    @Column(name = "ORIGEN")
    private String origen;

    @Column(name = "DEPOSITO_ID")
    private Long depositoId;

    @Column(name = "ESTADO_ENUM")
    @Enumerated(EnumType.STRING)
    private ReciboEstado estado;

    @Column(name = "LOTE_ID")
    private Long loteId;

    @Column(name = "KG_LIMPIOS")
    private Float kgLimpios;

    @Column(name = "ANALISIS_SOLICITADOS")
    private String analisisSolicitados;

    @Column(name = "ARTICULO")
    private Integer articulo;

    @Column(name = "RECIBO_ACTIVO")
    private boolean activo;

    // Relaciones con los diferentes tipos de análisis
    @OneToMany(mappedBy = "recibo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DOSN> dosnAnalisis;

    @OneToMany(mappedBy = "recibo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PMS> pmsAnalisis;

    @OneToMany(mappedBy = "recibo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Pureza> purezaAnalisis;

    @OneToMany(mappedBy = "recibo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Germinacion> germinacionAnalisis;

    @OneToMany(mappedBy = "recibo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PurezaPNotatum> purezaPNotatumAnalisis;

    @OneToMany(mappedBy = "recibo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Sanitario> sanitarioAnalisis;

    @OneToMany(mappedBy = "recibo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Tetrazolio> tetrazolioAnalisis;

    @OneToMany(mappedBy = "recibo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Certificado> certificados;
}

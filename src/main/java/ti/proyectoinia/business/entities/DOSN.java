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

    @Column(name = "DOSN_FECHA")
    private Date fecha;

    @Column(name = "DOSN_GRAMOS_ANALIZADOS")
    private Float gramosAnalizados;

    @Column(name = "DOSN_TIPOS_DE_ANALISIS")
    private String tiposDeanalisis;

    @Column(name = "DOSN_COMPLETO_REDUCIDO")
    private Boolean completoReducido;

    @Column(name = "DOSN_MALEZAS_TOLERANCIA_CERO")
    private Float malezasToleranciaCero;

    @Column(name = "DOSN_OTROS_CULTIVOS")
    private Float otrosCultivos;

    @Column(name = "DOSN_DETERMINACION_BRASSICA")
    private Float determinacionBrassica;

    @Column(name = "DOSN_DETERMINACION_CUSCUTA")
    private Float determinacionCuscuta;

    @Column(name = "DOSN_ESTANDAR")
    private Boolean estandar;

    @Column(name = "DOSN_FECHA_ANALISIS")
    private Date fechaAnalisis;

    @OneToMany
    @JoinColumn(name = "DOSN_ID")
    private List<Cultivo> cultivos;

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
}

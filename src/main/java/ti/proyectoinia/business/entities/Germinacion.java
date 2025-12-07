package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Data
@Table(name = "GERMINACION")
public class Germinacion {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "GERMINACION_ID")
    private Long id;

    @Column(name = "GERMINACION_FECHAINICIO")
    private Date fechaInicio;

    @Column(name = "GERMINACION_TOTALDIAS")
    private Integer totalDias;

    @Enumerated(EnumType.STRING)
    @Column(name = "GERMINACION_TRATAMIENTO")
    private Tratamiento tratamiento;

    @Column(name = "GERMINACION_NROSEMILLAPORREPETICION")
    private Integer nroSemillaPorRepeticion;

    @ManyToOne
    @JoinColumn(name = "METODO_ID")
    private Metodo metodo;

    @Column(name = "GERMINACION_TEMPERATURA")
    private Float temperatura;

    @Enumerated(EnumType.STRING)
    @Column(name = "GERMINACION_PREFRIO")
    private PreFrio preFrio;

    @Enumerated(EnumType.STRING)
    @Column(name = "GERMINACION_PRETRATAMIENTO")
    private PreTratamiento preTratamiento;

    @Column(name = "GERMINACION_NRODIAS")
    private Integer nroDias;

    @Column(name = "GERMINACION_PRODUCTODOSIS")
    private String productoDosis;

    @Column(name = "GERMINACION_PREDONDEO")
    private Integer pRedondeo;

    @Column(name = "INIA_GERMINACION_PNORMAL")
    private Integer pNormalINIA;

    @Column(name = "INASE_GERMINACION_PNORMAL")
    private Integer pNormalINASE;

    @Column(name = "INIA_GERMINACION_PANORMAL")
    private Integer pAnormalINIA;

    @Column(name = "INASE_GERMINACION_PANORMAL")
    private Integer pAnormalINASE;

    @Column(name = "INIA_GERMINACION_PMUERTAS")
    private Integer pMuertasINIA;

    @Column(name = "INASE_GERMINACION_PMUERTAS")
    private Integer pMuertasINASE;

    @Column(name = "INIA_GERMINACION_FRESCAS")
    private Integer pFrescasINIA;

    @Column(name = "INASE_GERMINACION_FRESCAS")
    private Integer pFrescasINASE;

    @Column(name = "INIA_GERMINACION_SEMILLASDURAS")
    private Integer semillasDurasINIA;

    @Column(name = "INASE_GERMINACION_SEMILLASDURAS")
    private Integer semillasDurasINASE;

    @Column(name = "INIA_GERMINACION_GERMINACION")
    private Integer germinacionINIA;

    @Column(name = "INASE_GERMINACION_GERMINACION")
    private Integer germinacionINASE;

    @Column(name = "GERMINACION_COMENTARIOS")
    private String comentarios;

    @ManyToOne
    @JoinColumn(name = "RECIBO_ID")
    private Recibo recibo;

    @Column(name = "GERMINACION_ACTIVO")
    private boolean activo;

    @Column(name = "GERMINACION_REPETIDO")
    private boolean repetido;

    @Column(name = "GERMINACION_ESTANDAR")
    private boolean estandar;

    @Column(name = "GERMINACION_FECHA_CREACION")
    private Date fechaCreacion;

    @Column(name = "GERMINACION_FECHA_REPETICION")
    private Date fechaRepeticion;

    @Column(name = "GERMINACION_FECHA_INASE")
    private Date fechaINASE;
}

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

    @Column(name = "GERMINACION_FECHACONTEO_1")
    private Date fechaConteo1;

    @Column(name = "GERMINACION_FECHACONTEO_2")
    private Date fechaConteo2;

    @Column(name = "GERMINACION_FECHACONTEO_3")
    private Date fechaConteo3;

    @Column(name = "GERMINACION_FECHACONTEO_4")
    private Date fechaConteo4;

    @Column(name = "GERMINACION_FECHACONTEO_5")
    private Date fechaConteo5;

    @Column(name = "GERMINACION_TOTALDIAS")
    private Integer totalDias;

    @Column(name = "GERMINACION_REPETICIONNORMAL_1")
    private Integer repeticionNormal1;

    @Column(name = "GERMINACION_REPETICIONNORMAL_2")
    private Integer repeticionNormal2;

    @Column(name = "GERMINACION_REPETICIONNORMAL_3")
    private Integer repeticionNormal3;

    @Column(name = "GERMINACION_REPETICIONNORMAL_4")
    private Integer repeticionNormal4;

    @Column(name = "GERMINACION_REPETICIONNORMAL_5")
    private Integer repeticionNormal5;

    @Column(name = "GERMINACION_REPETICIONDURA")
    private Integer repeticionDura;

    @Column(name = "GERMINACION_REPETICIONFRESCA")
    private Integer repeticionFresca;

    @Column(name = "GERMINACION_REPETICIONANORMAL")
    private Integer repeticionAnormal;

    @Column(name = "GERMINACION_REPETICIONMUERTA")
    private Integer repeticionMuerta;

    @Column(name = "GERMINACION_TOTALREPETICION")
    private Integer totalRepeticion;

    @Column(name = "GERMINACION_PROMEDIOREPETICIONES")
    private Float promedioRepeticiones;

    @Enumerated(EnumType.STRING)
    @Column(name = "GERMINACION_TRATAMIENTO")
    private Tratamiento tratamiento;

    @Column(name = "GERMINACION_NROSEMILLAPORREPETICION")
    private Integer nroSemillaPorRepeticion;

    @Enumerated(EnumType.STRING)
    @Column(name = "GERMINACION_METODO")
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

    @Column(name = "GERMINACION_FECHAFINAL")
    private Date fechaFinal;

    @Column(name = "GERMINACION_PREDONDEO")
    private Integer pRedondeo;

    @Column(name = "GERMINACION_PNORMAL")
    private Integer pNormal;

    @Column(name = "GERMINACION_PANORMAL")
    private Integer pAnormal;

    @Column(name = "GERMINACION_PMUERTAS")
    private Integer pMuertas;

    @Column(name = "GERMINACION_SEMILLASDURAS")
    private Integer semillasDuras;

    @Column(name = "GERMINACION_GERMINACION")
    private Integer germinacion;

    @Column(name = "GERMINACION_COMENTARIOS")
    private String comentarios;

    @ManyToOne
    @JoinColumn(name = "RECIBO_ID")
    private Recibo recibo;

    @Column(name = "GERMINACION_ACTIVO")
    private boolean activo;

    @Column(name = "GERMINACION_REPETIDO")
    private boolean repetido;

    @Column(name = "GERMINACION_FECHA_CREACION")
    private Date fechaCreacion;

    @Column(name = "GERMINACION_FECHA_REPETICION")
    private Date fechaRepeticion;
}

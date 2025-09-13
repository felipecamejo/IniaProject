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
    private int totalDias;

    @Column(name = "GERMINACION_REPETICIONNORMAL_1")
    private int repeticionNormal1;

    @Column(name = "GERMINACION_REPETICIONNORMAL_2")
    private int repeticionNormal2;

    @Column(name = "GERMINACION_REPETICIONNORMAL_3")
    private int repeticionNormal3;

    @Column(name = "GERMINACION_REPETICIONNORMAL_4")
    private int repeticionNormal4;

    @Column(name = "GERMINACION_REPETICIONNORMAL_5")
    private int repeticionNormal5;

    @Column(name = "GERMINACION_REPETICIONDURA")
    private int repeticionDura;

    @Column(name = "GERMINACION_REPETICIONFRESCA")
    private int repeticionFresca;

    @Column(name = "GERMINACION_REPETICIONANORMAL")
    private int repeticionAnormal;

    @Column(name = "GERMINACION_REPETICIONMUERTA")
    private int repeticionMuerta;

    @Column(name = "GERMINACION_TOTALREPETICION")
    private int totalRepeticion;

    @Column(name = "GERMINACION_PROMEDIOREPETICIONES")
    private float promedioRepeticiones;

    @Column(name = "GERMINACION_TRATAMIENTO")
    private Tratamiento tratamiento;

    @Column(name = "GERMINACION_NROSEMILLAPORREPETICION")
    private int nroSemillaPorRepeticion;

    @Column(name = "GERMINACION_METODO")
    private Metodo metodo;

    @Column(name = "GERMINACION_TEMPERATURA")
    private float tempertatura;

    @Column(name = "GERMINACION_PREFRIO")
    private PreFrio preFrio;

    @Column(name = "GERMINACION_PRETRATAMIENTO")
    private PreTratamiento preTratamiento;

    @Column(name = "GERMINACION_NRODIAS")
    private int nroDias;

    @Column(name = "GERMINACION_FECHAFINAL")
    private Date fechaFinal;

    @Column(name = "GERMINACION_PREDONDEO")
    private int pRedondeo;

    @Column(name = "GERMINACION_PNORMAL")
    private int pNormal;

    @Column(name = "GERMINACION_PANORMAL")
    private int pAnormal;

    @Column(name = "GERMINACION_PMUERTAS")
    private int pMuertas;

    @Column(name = "GERMINACION_SEMILLASDURAS")
    private int semillasDuras;

    @Column(name = "GERMINACION_GERMINACION")
    private int germinacion;

    @Column(name = "GERMINACION_COMENTARIOS")
    private String comentarios;

    @Column(name = "GERMINACION_ACTIVO")
    private boolean activo;

}

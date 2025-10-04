package ti.proyectoinia.business.entities;


import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Entity
@Data
@Table(name = "SANITARIO")
public class Sanitario {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "SANITARIO_ID")
    private Long id;

    @Column(name = "SANITARIO_FECHASIEMBRA")
    private Date fechaSiembra;

    @Column(name = "SANITARIO_FECHA")
    private Date fecha;

    @Column(name = "SANITARIO_METODO")
    private String metodo;

    @Column(name = "SANITARIO_TEMPERATURA")
    private Integer temperatura;

    @Column(name = "SANITARIO_HORASLUZ")
    private Integer horasLuz;

    @Column(name = "SANITARIO_HORASOSCURIDAD")
    private Integer horasOscuridad;

    @Column(name = "SANITARIO_NRODIAS")
    private Integer nroDias;

    @Column(name = "SANITARIO_ESTADOPRODUCTODOSIS")
    private String estadoProductoDosis;

    @Column(name = "SANITARIO_OBSERVACIONES")
    private String observaciones;

    @Column(name = "SANITARIO_NROSEMILLASREPETICION")
    private Integer nroSemillasRepeticion;

    @Column(name = "SANITARIO_RECIBOID")
    private Long reciboId;

    @Column(name = "SANITARIO_ACTIVO")
    private boolean activo;

    @Column(name = "SANITARIO_ESTANDAR")
    private boolean estandar;

    @Column(name = "SANITARIO_REPETIDO")
    private boolean repetido;

    @ElementCollection
    @CollectionTable(name = "SANITARIO_HONGO_IDS", joinColumns = @JoinColumn(name = "SANITARIO_ID"))
    @Column(name = "HONGO_ID")
    private List<Long> SanitarioHongoids;

    @Column(name = "SANITARIO_FECHACREACION")
    private Date fechaCreacion;

    @Column(name = "SANITARIO_FECHAREPETICION")
    private Date fechaRepeticion;

}

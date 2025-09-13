package ti.proyectoinia.business.entities;


import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "SANITARIO_METODO")
    private Metodo metodo;

    @Column(name = "SANITARIO_TEMPERATURA")
    private int temperatura;

    @Column(name = "SANITARIO_HORASLUZOSCURIDAD")
    private int horasLuzOscuridad;

    @Column(name = "SANITARIO_NRODIAS")
    private int nroDias;

    @Enumerated(EnumType.STRING)
    @Column(name = "SANITARIO_ESTADOPRODUCTODOSIS")
    private Estado estadoProductoDosis;

    @Column(name = "SANITARIO_OBSERVACIONES")
    private int observaciones;

    @Column(name = "SANITARIO_NROSEMILLASREPETICION")
    private int nroSemillasRepeticion;

    @Column(name = "SANITARIO_ACTIVO")
    private boolean activo;

}

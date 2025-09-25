package ti.proyectoinia.business.entities;


import jakarta.persistence.*;
import lombok.Data;
import ti.proyectoinia.dtos.HongoDto;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "SANITARIO_METODO")
    private Metodo metodo;

    @Column(name = "SANITARIO_TEMPERATURA")
    private Integer temperatura;

    @Column(name = "SANITARIO_HORASLUZOSCURIDAD")
    private Integer horasLuzOscuridad;

    @Column(name = "SANITARIO_NRODIAS")
    private Integer nroDias;

    @Enumerated(EnumType.STRING)
    @Column(name = "SANITARIO_ESTADOPRODUCTODOSIS")
    private Estado estadoProductoDosis;

    @Column(name = "SANITARIO_OBSERVACIONES")
    private String observaciones;

    @Column(name = "SANITARIO_NROSEMILLASREPETICION")
    private Integer nroSemillasRepeticion;

    @ManyToOne
    @JoinColumn(name = "RECIBO_ID")
    private Recibo recibo;

    @Column(name = "SANITARIO_ACTIVO")
    private boolean activo;

    @Column(name = "SANITARIO_REPETIDO")
    private boolean repetido;

    @OneToMany(mappedBy = "sanitario", cascade = CascadeType.ALL)
    private List<SanitarioHongo> sanitarioHongos;

    @Column(name = "SANITARIO_FECHA_CREACION")
    private Date fechaCreacion;

    @Column(name = "SANITARIO_FECHA_REPETICION")
    private Date fechaRepeticion;

}

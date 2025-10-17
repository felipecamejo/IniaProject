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

    @ManyToOne
    @JoinColumn(name = "METODO_ID")
    private Metodo metodo;

    @Column(name = "SANITARIO_TEMPERATURA")
    private Integer temperatura;

    @Column(name = "SANITARIO_HORASLUZ")
    private Integer horasLuz;

    @Column(name = "SANITARIO_HORASOSCURIDAD")
    private Integer horasOscuridad;

    @Column(name = "SANITARIO_NRODIAS")
    private Integer nroDias;
    
    @Column(name = "SANITARIO_ESTADO")
    private String estado;

    @Column(name = "SANITARIO_OBSERVACIONES")
    private String observaciones;

    @Column(name = "SANITARIO_NROSEMILLASREPETICION")
    private Integer nroSemillasRepeticion;

    @ManyToOne
    @JoinColumn(name = "SANITARIO_RECIBOID")
    private Recibo recibo;

    @Column(name = "SANITARIO_ACTIVO")
    private boolean activo;

    @Column(name = "SANITARIO_ESTANDAR")
    private boolean estandar;

    @Column(name = "SANITARIO_REPETIDO")
    private boolean repetido;


    @Column(name = "SANITARIO_FECHACREACION")
    private Date fechaCreacion;

    @Column(name = "SANITARIO_FECHAREPETICION")
    private Date fechaRepeticion;

    @OneToMany(mappedBy = "sanitario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SanitarioHongo> sanitarioHongos;

}
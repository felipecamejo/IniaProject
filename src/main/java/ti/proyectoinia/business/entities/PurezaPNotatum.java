package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Data
@Table(name = "PUREZA_PNOTATUM")
public class PurezaPNotatum {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "PUREZA_PNOTATUM_ID")
    private Long Id;

    @Column(name = "GRAMOS_SEMILLA_PURA" )
    private Float gramosSemillaPura;

    @Column(name = "GRAMOS_SEMILLA_CULTIVOS" )
    private Float gramosSemillasCultivos;

    @Column(name = "GRAMOS_SEMILLA_MALEZAS" )
    private Float gramosSemillasMalezas;

    @Column(name = "GRAMOS_MATERIOA_INERTE" )
    private Float gramosMateriaInerte;

    @ManyToOne
    @JoinColumn(name = "RECIBO_ID")
    private Recibo recibo;

    @Column(name = "PUREZA_ACTIVO")
    private boolean activo;

    @Column(name = "PUREZA_REPETIDO")
    private boolean repetido;

    @Column(name = "PUREZA_PNOTATUM_FECHA_CREACION")
    private Date fechaCreacion;

    @Column(name = "PUREZA_PNOTATUM_FECHA_REPETICION")
    private Date fechaRepeticion;

    @Column(name = "PUREZA_PNOTATUM_OBSERVACIONES")
    private String observaciones;
}

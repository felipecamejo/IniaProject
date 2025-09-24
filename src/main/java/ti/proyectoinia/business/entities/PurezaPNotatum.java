package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "PUREZA_PNOTATUM")
public class PurezaPNotatum {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "PUREZA_PNOTATUM_ID")
    private Long Id;

    @Column(name = "PUREZA_PORCENTAJE")
    private Float porcentaje;

    @Column(name = "PUREZA_PESO_INICIAL")
    private Float pesoInicial;

    @Column(name = "PUREZA_REPETICIONES")
    private Integer repeticiones;

    @Column(name = "PUREZA_PI")
    private Float Pi;

    @Column(name = "PUREZA_AT")
    private Float At;

    @Column(name = "PUREZA_PORCENTAJE_A")
    private Float porcentajeA;

    @Column(name = "PUREZA_TOTAL_A")
    private Integer totalA;

    @Column(name = "PUREZA_SEMILLAS_LS")
    private Float semillasLS;

    @ManyToOne
    @JoinColumn(name = "RECIBO_ID")
    private Recibo recibo;

    @Column(name = "PUREZA_ACTIVO")
    private boolean activo;

    @Column(name = "PUREZA_REPETIDO")
    private boolean repetido;
}

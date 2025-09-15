package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "PUREZA_PNOTATUM")
public class PurezaPnotatum {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "PUREZA_PNOTATUM_ID")
    private Integer purezaPnotatumId;

    @Column(name = "PUREZA_PORCENTAJE")
    private float porcentaje;

    @Column(name = "PUREZA_PESO_INICIAL")
    private float pesoInicial;

    @Column(name = "PUREZA_REPETICIONES")
    private int repeticiones;

    @Column(name = "PUREZA_PI")
    private float Pi;

    @Column(name = "PUREZA_AT")
    private float At;

    @Column(name = "PUREZA_PORCENTAJE_A")
    private float porcentajeA;

    @Column(name = "PUREZA_TOTAL_A")
    private int totalA;

    @Column(name = "PUREZA_SEMILLAS_LS")
    private float semillasLS;
}

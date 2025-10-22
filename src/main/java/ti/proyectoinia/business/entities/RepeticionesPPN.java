package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "REPETICIONES_PUREZA_PNOTATUM")
public class RepeticionesPPN {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "REPETICIONES_PUREZA_PNOTATUM_ID")
    private Long id;

    @Column(name = "NRO_SEMILLAS_PURAS")
    private Integer nroSemillasPuras;

    @Column(name = "PESO")
    private Float peso;

    @Column(name = "CANTIDAD_SEMILLAS_SANAS")
    private Integer cantidadSemillasSanas;

    @Column(name = "GRAMOS_SEMILLAS_SANAS")
    private Float gramosSemillasSanas;

    @Column(name = "CONTAMINADAS_Y_VANAS")
    private Integer contaminadasYVanas;

    @Column(name = "GRAMOS_CONTAMINADAS_Y_VANAS")
    private Float gramosContaminadasYVanas;

    @Column(name = "CONTROL_DE_PESOS")
    private Float gramosControlDePesos;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PUREZA_PNOTATUM_ID")
    private PurezaPNotatum purezaPNotatum;


}

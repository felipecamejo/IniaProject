package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "SEMILLA")
public class Semilla {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "SEMILLA_ID")
    private Integer semillaId;

    @Column(name = "SEMILLA_NRO_SEMILLAS_PURA")
    private int nroSemillasPura;
}

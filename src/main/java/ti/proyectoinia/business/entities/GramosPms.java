package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "GRAMOS_PMS")
public class GramosPms {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "GRAMOS_PMS_ID")
    private Long id;

    @Column(name = "GRAMOS_PMS_ACTIVO")
    private boolean activo;

    @Column(name = "PMS_ID")
    private Long pmsId;

    @Column(name = "GRAMOS")
    private int gramos;

    @Column(name = "NUMERO_REPETICION")
    private int numeroRepeticion;
}

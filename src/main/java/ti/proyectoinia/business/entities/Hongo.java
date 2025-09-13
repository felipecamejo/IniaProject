package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table (name = "HONGO")
public class Hongo {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "HONGO_ID")
    private Long id;

    @Column(name = "HONGO_NOMBRE")
    private String nombre;

    @Column(name = "HONGO_TIPO")
    @Enumerated(EnumType.STRING)
    private tipoHongo tipo;
}

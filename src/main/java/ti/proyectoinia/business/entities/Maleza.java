package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "MALEZA")
public class Maleza {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "MALEZA_ID")
    private Long id;

    @Column(name = "MALEZA_NOMBRE")
    private String nombre;

    @Column(name = "MALEZA_DESCRIPCION")
    private String descripcion;

    @Column(name = "MALEZA_ACTIVO")
    private boolean activo;
}

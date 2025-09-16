package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "CULTIVO")
public class Cultivo {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "CULTIVO_ID")
    private Long id;

    @Column(name = "CULTIVO_NOMBRE")
    private String nombre;

    @Column(name = "CULTIVO_ACTIVO")
    private boolean activo;
}
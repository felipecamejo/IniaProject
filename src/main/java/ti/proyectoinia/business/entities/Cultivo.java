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
    private Integer cultivoId;

    @Column(name = "CULTIVO_NOMBRE")
    private String nombre;
}
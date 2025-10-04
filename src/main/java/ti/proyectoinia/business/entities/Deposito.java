package ti.proyectoinia.business.entities;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "DEPOSITO")
public class Deposito {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "DEPOSITO_ID")
    private Long id;

    @Column(name = "DEPOSITO_NOMBRE")
    private String nombre;
}

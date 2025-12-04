package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "ESPECIE")
public class Especie {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ESPECIE_ID")
    private Long id;

    @Column(name = "ESPECIE_NOMBRE")
    private String nombre;

    @Column(name = "ESPECIAL_DESCRIPCION")
    private String descripcion;

    @Column(name = "ESPECIE_ACTIVO")
    private boolean activo;

}
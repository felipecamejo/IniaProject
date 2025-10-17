package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "METODO")
public class Metodo {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "METODO_ID")
    private Long id;

    @Column(name = "METODO_NOMBRE")
    private String nombre;

    @Column(name = "METODO_AUTOR")
    private String autor;

    @Column(name = "METODO_DESCRIPCION")
    private String descripcion;

    @Column(name = "METODO_ACTIVO")
    private boolean activo;
}
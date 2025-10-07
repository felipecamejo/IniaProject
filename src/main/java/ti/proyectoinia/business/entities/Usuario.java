package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
@Table(name = "USUARIO")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "USUARIO_ID")
    private Long id;

    @Column(name = "EMAIL")
    private String email;

    @Column(name = "NOMBRE")
    private String nombre;

    @Column(name = "PASSWORD")
    private String password;

    @Column(name = "TELEFONO")
    private String telefono;

    @Enumerated(EnumType.STRING)
    @Column(name = "ROL")
    private RolUsuario rol;

    @Column(name = "USUARIO_ACTIVO")
    private boolean activo;


    @ManyToMany
    @JoinTable(
        name = "USUARIO_LOTE",
        joinColumns = @JoinColumn(name = "USUARIO_ID"),
        inverseJoinColumns = @JoinColumn(name = "LOTE_ID")
    )
    private List<Lote> lotes;

}

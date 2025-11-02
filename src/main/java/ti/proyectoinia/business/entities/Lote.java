package ti.proyectoinia.business.entities;


import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Entity
@Data
@Table(name = "LOTE")
public class Lote {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "LOTE_ID")
    private Long Id;

    @Column(name = "LOTE_NOMBRE")
    private String nombre;

    @Column(name = "LOTE_DESCRIPCION")
    private String descripcion;

    @Column(name = "LOTE_FECHA_CREACION")
    private Date fechaCreacion;

    @Column(name = "LOTE_FECHA_FINALIZACION")
    private Date fechaFinalizacion;

    @Column(name = "LOTE_ACTIVO")
    private boolean activo;

    @Enumerated(EnumType.STRING)
    @Column(name = "LOTE_ESTADO")
    private Estado estado;

    @OneToMany
    @JoinColumn(name = "LOTE_ID")
    private List<Recibo> recibos;

    @ManyToMany(mappedBy = "lotes")
    private List<Usuario> usuarios;

    @Enumerated(EnumType.STRING)
    @Column(name = "LOTE_CATEGORIA")
    private loteCategoria categoria;
}

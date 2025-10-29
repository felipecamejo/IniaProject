package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "TETRAZOLIO_DETALLE_SEMILLAS")
public class DetalleSemillasTetrazolio {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "DETALLE_ID")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "TETRAZOLIO_ID")
    private Tetrazolio tetrazolio;

    @Column(name = "NUMERO_TABLA")
    private Integer numeroTabla;

    // Viables sin defectos
    private Integer vsd_total;
    private Integer vsd_mecanico;
    private Integer vsd_ambiente;
    private Integer vsd_chinches;
    private Integer vsd_fracturas;
    private Integer vsd_otros;
    private Integer vsd_duras;

    // Viables defectos leves
    private Integer vl_total;
    private Integer vl_mecanico;
    private Integer vl_ambiente;
    private Integer vl_chinches;
    private Integer vl_fracturas;
    private Integer vl_otros;
    private Integer vl_duras;

    // Viables defectos moderados
    private Integer vm_total;
    private Integer vm_mecanico;
    private Integer vm_ambiente;
    private Integer vm_chinches;
    private Integer vm_fracturas;
    private Integer vm_otros;
    private Integer vm_duras;

    // Viables defectos severos
    private Integer vs_total;
    private Integer vs_mecanico;
    private Integer vs_ambiente;
    private Integer vs_chinches;
    private Integer vs_fracturas;
    private Integer vs_otros;
    private Integer vs_duras;

    // No viables
    private Integer nv_total;
    private Integer nv_mecanico;
    private Integer nv_ambiente;
    private Integer nv_chinches;
    private Integer nv_fracturas;
    private Integer nv_otros;
    private Integer nv_duras;

    @Column(name = "ACTIVO")
    private boolean activo = true;
}



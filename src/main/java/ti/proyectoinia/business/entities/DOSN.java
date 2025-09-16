package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Table(name = "DOSN")
public class DOSN {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "DOSN_ID")
    private Long id;

    @Column(name = "DOSN_FECHA")
    private LocalDateTime fecha;

    @Column(name = "DOSN_GRAMOS_ANALIZADOS")
    private float gramosAnalizados;

    @Column(name = "DOSN_TIPOS_DE_ANALISIS")
    private String tiposDeanalisis;

    @Column(name = "DOSN_COMPLETO_REDUCIDO")
    private boolean completoReducido;

    @Column(name = "DOSN_MALEZAS_TOLERANCIA_CERO")
    private float malezasToleranciaCero;

    @Column(name = "DOSN_OTROS_CULTIVOS")
    private float otrosCultivos;

    @Column(name = "DOSN_DETERMINACION_BRASSICA")
    private float determinacionBrassica;

    @Column(name = "DOSN_DETERMINACION_CUSCUTA")
    private float determinacionCuscuta;

    @Column(name = "DOSN_ESTANDAR")
    private boolean estandar;

    @Column(name = "DOSN_FECHA_ANALISIS")
    private LocalDateTime fechaAnalisis;

    @OneToMany
    @JoinColumn(name = "DOSN_ID")
    private List<Cultivo> cultivos;

    @ManyToOne
    @JoinColumn(name = "RECIBO_ID")
    private Recibo recibo;

    @Column(name = "DOSN_ACTIVO")
    private boolean activo;
}

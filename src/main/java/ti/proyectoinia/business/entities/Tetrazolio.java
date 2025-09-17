package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Data
@Table(name = "TETRAZOLIO")
public class Tetrazolio {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "TETRAZOLIO_ID")
    private Long id;

    @Column(name = "TETRAZOLIO_REPETICION")
    private Integer repeticion;

    @Column(name = "TETRAZOLIO_NRO_SEMILLAS_POR_REPETICION")
    private Integer nroSemillasPorRepeticion;

    @ManyToOne
    @JoinColumn(name = "PRETRATAMIENTO_ID")
    private PreTratamiento pretratamiento;

    @ManyToOne
    @JoinColumn(name = "CONCENTRACION_ID")
    private float concentracion;

    @ManyToOne
    @JoinColumn(name = "TINCION_HS_ID")
    private float tincionHoras;

    @ManyToOne
    @JoinColumn(name = "TINCION_GRADOS_ID")
    private float tincionGrados;

    @Column(name = "TETRAZOLIO_FECHA")
    private Date fecha;

    @Column(name = "TETRAZOLIO_VIABLES")
    private float viables;

    @Column(name = "TETRAZOLIO_NO_VIABLES")
    private float noViables;

    @Column(name = "TETRAZOLIO_DURAS")
    private float duras;

    @Column(name = "TETRAZOLIO_TOTAL")
    private float total;

    @Column(name = "TETRAZOLIO_PROMEDIO")
    private float promedio;

    @Column(name = "TETRAZOLIO_PORCENTAJE")
    private Integer porcentaje;

    @ManyToOne
    @JoinColumn(name = "VIABILIDAD_TZ_ID")
    private ViabilidadPorTz viabilidadPorTetrazolio;

    @Column(name = "TETRAZOLIO_NRO_SEMILLAS")
    private Integer nroSemillas;

    @Column(name = "TETRAZOLIO_DANIOS_NRO_SEMILLAS")
    private Integer daniosNroSemillas;

    @Column(name = "TETRAZOLIO_DANIOS_MECANICOS")
    private Integer daniosMecanicos;

    @Column(name = "TETRAZOLIO_DANIO_AMBIENTE")
    private Integer danioAmbiente;

    @Column(name = "TETRAZOLIO_DANIOS_CHINCHES")
    private Integer daniosChinches;

    @Column(name = "TETRAZOLIO_DANIOS_FRACTURAS")
    private Integer daniosFracturas;

    @Column(name = "TETRAZOLIO_DANIOS_OTROS")
    private Integer daniosOtros;

    @Column(name = "TETRAZOLIO_DANIOS_DURAS")
    private Integer daniosDuras;

    @ManyToOne
    @JoinColumn(name = "VIABILIDAD_VIGOR_TZ_ID")
    private ViabilidadVigorTZ viabilidadVigorTz;

    @Column(name = "TETRAZOLIO_PORCENTAJE_FINAL")
    private Integer porcentajeFinal;

    @Column(name = "TETRAZOLIO_DANIOS_POR_PORCENTAJES")
    private Integer daniosPorPorcentajes;

    @ManyToOne
    @JoinColumn(name = "RECIBO_ID")
    private Recibo recibo;

    @Column(name = "TETRAZOLIO_ACTIVO")
    private boolean activo;
}
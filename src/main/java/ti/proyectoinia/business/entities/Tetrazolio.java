package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "TETRAZOLIO")
public class Tetrazolio {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "TETRAZOLIO_ID")
    private Integer tetrazolioId;

    @Column(name = "TETRAZOLIO_REPETICION")
    private int repeticion;

    @Column(name = "TETRAZOLIO_NRO_SEMILLAS_POR_REPETICION")
    private int nroSemillasPorRepeticion;

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
    private LocalDateTime fecha;

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
    private int porcentaje;

    @ManyToOne
    @JoinColumn(name = "VIABILIDAD_TZ_ID")
    private ViabilidadPorTz viabilidadPorTetrazolio;

    @Column(name = "TETRAZOLIO_NRO_SEMILLAS")
    private int nroSemillas;

    @Column(name = "TETRAZOLIO_DANIOS_NRO_SEMILLAS")
    private int daniosNroSemillas;

    @Column(name = "TETRAZOLIO_DANIOS_MECANICOS")
    private int daniosMecanicos;

    @Column(name = "TETRAZOLIO_DANIO_AMBIENTE")
    private int danioAmbiente;

    @Column(name = "TETRAZOLIO_DANIOS_CHINCHES")
    private int daniosChinches;

    @Column(name = "TETRAZOLIO_DANIOS_FRACTURAS")
    private int daniosFracturas;

    @Column(name = "TETRAZOLIO_DANIOS_OTROS")
    private int daniosOtros;

    @Column(name = "TETRAZOLIO_DANIOS_DURAS")
    private int daniosDuras;

    @ManyToOne
    @JoinColumn(name = "VIABILIDAD_VIGOR_TZ_ID")
    private ViabilidadVigorTZ viabilidadVigorTz;

    @Column(name = "TETRAZOLIO_PORCENTAJE_FINAL")
    private int porcentajeFinal;

    @Column(name = "TETRAZOLIO_DANIOS_POR_PORCENTAJES")
    private int daniosPorPorcentajes;
}
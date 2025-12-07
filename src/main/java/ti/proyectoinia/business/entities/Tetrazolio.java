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

    @Column(name = "OBSERVACIONES")
    private String observaciones;

    @Column(name = "TETRAZOLIO_NRO_SEMILLAS_POR_REPETICION")
    private Integer nroSemillasPorRepeticion;

    @Enumerated(EnumType.STRING)
    @Column(name = "PRETRATAMIENTO")
    private PreTratamiento pretratamiento;

    @Column(name = "CONCENTRACION")
    private Float concentracion;

    @Column(name = "TINCION_HS")
    private Float tincionHoras;

    @Column(name = "TINCION_GRADOS")
    private Float tincionGrados;

    @Column(name = "TETRAZOLIO_FECHA")
    private Date fecha;

    // Segundo conjunto de datos (para tabla de detalles)
    @Column(name = "TETRAZOLIO_NRO_SEMILLAS_POR_REPETICION_2")
    private Integer nroSemillasPorRepeticion2;

    @Enumerated(EnumType.STRING)
    @Column(name = "PRETRATAMIENTO_2")
    private PreTratamiento pretratamiento2;

    @Column(name = "CONCENTRACION_2")
    private Float concentracion2;

    @Column(name = "TINCION_HS_2")
    private Float tincionHoras2;

    @Column(name = "TINCION_GRADOS_2")
    private Float tincionGrados2;

    @Column(name = "TETRAZOLIO_FECHA_2")
    private Date fecha2;

    @Column(name = "TETRAZOLIO_VIABLES")
    private Float viables;

    @Column(name = "TETRAZOLIO_NO_VIABLES")
    private Float noViables;

    @Column(name = "TETRAZOLIO_DURAS")
    private Float duras;

    @Column(name = "TETRAZOLIO_TOTAL")
    private Float total;

    @Column(name = "TETRAZOLIO_PROMEDIO")
    private Float promedio;

    @Column(name = "TETRAZOLIO_PROMEDIO_NO_VIABLES")
    private Float promedioNoViables;

    @Column(name = "TETRAZOLIO_PROMEDIO_DURAS")
    private Float promedioDuras;

    @Column(name = "TETRAZOLIO_PORCENTAJE")
    private Integer porcentaje;

    @Enumerated(EnumType.STRING)
    @Column(name = "VIABILIDAD_TZ")
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

    @Enumerated(EnumType.STRING)
    @Column(name = "VIABILIDAD_VIGOR_TZ")
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

    @Column(name = "TETRAZOLIO_REPETIDO")
    private boolean repetido;

    @Column(name = "TETRAZOLIO_ESTANDAR")
    private boolean estandar;

    @Column(name = "TETRAZOLIO_FECHA_CREACION")
    private Date fechaCreacion;

    @Column(name = "TETRAZOLIO_FECHA_REPETICION")
    private Date fechaRepeticion;
}
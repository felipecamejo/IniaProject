package ti.proyectoinia.dtos;

import lombok.Data;
import lombok.Generated;

import java.util.Date;
import java.util.List;

@Data
public class DOSNDto {
    private Long id;

    // Relación principal
    private Long reciboId;

    // Fechas INIA / INASE
    private Date fechaINIA;
    private Date fechaINASE;

    // Gramos analizados INIA / INASE
    private Float gramosAnalizadosINIA;
    private Float gramosAnalizadosINASE;

    // Tipos de análisis (usar String para el nombre del enum)
    private String tiposDeanalisisINIA;
    private String tiposDeanalisisINASE;

    // Campo completo/reducido removido; reemplazado por tiposDeanalisisINIA/INASE

    // Determinaciones (flags + gramos)
    private Boolean determinacionBrassica;
    private Float determinacionBrassicaGramos;
    private Boolean determinacionCuscuta;
    private Float determinacionCuscutaGramos;

    private Boolean estandar;
    private Date fechaAnalisis;

    // Colecciones (IDs) para malezas y cultivos por organismo
    private List<Long> malezasNormalesINIAId;
    private List<Long> malezasNormalesINASEId;
    private List<Long> malezasToleradasINIAId;
    private List<Long> malezasToleradasINASEId;
    private List<Long> malezasToleranciaCeroINIAId;
    private List<Long> malezasToleranciaCeroINASEId;
    private List<Long> cultivosINIAId;
    private List<Long> cultivosINASEId;

    // Nuevas colecciones opcionales con cantidades por item (compatibles con front nuevo)
    private List<CantidadItemDto> malezasNormalesINIA;
    private List<CantidadItemDto> malezasNormalesINASE;
    private List<CantidadItemDto> malezasToleradasINIA;
    private List<CantidadItemDto> malezasToleradasINASE;
    private List<CantidadItemDto> malezasToleranciaCeroINIA;
    private List<CantidadItemDto> malezasToleranciaCeroINASE;
    private List<CantidadItemDto> cultivosINIA;
    private List<CantidadItemDto> cultivosINASE;

    private boolean activo;
    private boolean repetido;
    private Date fechaCreacion;
    private Date fechaRepeticion;

    @Generated
    public boolean equals(final Object o) {
        if (o == this) return true;
        if (!(o instanceof DOSNDto)) return false;
        DOSNDto other = (DOSNDto) o;
        return id != null && id.equals(other.id);
    }

    @Generated
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Generated
    public String toString() {
        return "DOSNDto(id=" + id + ", fechaINIA=" + fechaINIA + ", fechaINASE=" + fechaINASE + ")";
    }
}
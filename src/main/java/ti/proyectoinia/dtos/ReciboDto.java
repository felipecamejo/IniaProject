package ti.proyectoinia.dtos;

import lombok.Data;
import lombok.Generated;
import ti.proyectoinia.business.entities.ReciboEstado;

import java.util.Date;
import java.util.List;

@Data
public class ReciboDto {
    private Long id;

    private Integer nroAnalisis;

    private Long depositoId;

    private ReciboEstado estado;

    private List<Long> dosnAnalisisId;
    private List<Long> pmsAnalisisId;
    private List<Long> purezaAnalisisId;
    private List<Long> germinacionAnalisisId;
    private List<Long> purezaPNotatumAnalisisId;
    private List<Long> sanitarioAnalisisId;
    private List<Long> tetrazolioAnalisisId;

    private Long especieId;

    private String ficha;

    private Date fechaRecibo;

    private String remitente;

    private String origen;

    private Long cultivarId;

    private Long loteId;

    private Float kgLimpios;

    private Integer articulo;

    private boolean activo;

    @Generated
    public boolean equals(final Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ReciboDto that = (ReciboDto) o;
        return java.util.Objects.equals(id, that.id) &&
                nroAnalisis == that.nroAnalisis &&
                java.util.Objects.equals(especieId, that.especieId) &&
                java.util.Objects.equals(ficha, that.ficha) &&
                java.util.Objects.equals(fechaRecibo, that.fechaRecibo) &&
                java.util.Objects.equals(remitente, that.remitente) &&
                java.util.Objects.equals(origen, that.origen) &&
                java.util.Objects.equals(cultivarId, that.cultivarId) &&
                java.util.Objects.equals(estado, that.estado) &&
                loteId == that.loteId &&
                Float.compare(kgLimpios, that.kgLimpios) == 0 &&
                articulo == that.articulo &&
                activo == that.activo;
    }

    @Generated
    protected boolean canEqual(final Object other) {
        return other instanceof ReciboDto;
    }

    @Generated
    public int hashCode() {
        int result = 1;
        Object $id = this.getId();
        result = result * 59 + ($id == null ? 43 : $id.hashCode());
        result = result * 59 + this.getNroAnalisis();
        Object $especie = this.getEspecieId();
        result = result * 59 + ($especie == null ? 43 : $especie.hashCode());
        Object $ficha = this.getFicha();
        result = result * 59 + ($ficha == null ? 43 : $ficha.hashCode());
        Object $fechaRecibo = this.getFechaRecibo();
        result = result * 59 + ($fechaRecibo == null ? 43 : $fechaRecibo.hashCode());
        Object $remitente = this.getRemitente();
        result = result * 59 + ($remitente == null ? 43 : $remitente.hashCode());
        Object $origen = this.getOrigen();
        result = result * 59 + ($origen == null ? 43 : $origen.hashCode());
        Object $cultivar = this.getCultivarId();
        result = result * 59 + ($cultivar == null ? 43 : $cultivar.hashCode());
        Object $estado = this.getEstado();
        result = result * 59 + ($estado == null ? 43 : $estado.hashCode());
        result = Math.toIntExact(result * 59 + this.getLoteId());
        result = result * 59 + Float.floatToIntBits(this.getKgLimpios());
        result = result * 59 + this.getArticulo();
        result = result * 59 + (this.isActivo() ? 79 : 97);
        return result;
    }

    @Generated
    public String toString() {
        return "ReciboDto(id=" + this.getId() + ", nroAnalisis=" + this.getNroAnalisis() + ")";
    }
}

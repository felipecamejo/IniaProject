package ti.proyectoinia.dtos;

import lombok.Data;

@Data
public class DetalleSemillasTetrazolioDto {
    private Long id;
    private Long tetrazolioId;
    private Integer numeroTabla;

    public Integer vsd_total, vsd_mecanico, vsd_ambiente, vsd_chinches, vsd_fracturas, vsd_otros, vsd_duras;
    public Integer vl_total,  vl_mecanico,  vl_ambiente,  vl_chinches,  vl_fracturas,  vl_otros,  vl_duras;
    public Integer vm_total,  vm_mecanico,  vm_ambiente,  vm_chinches,  vm_fracturas,  vm_otros,  vm_duras;
    public Integer vs_total,  vs_mecanico,  vs_ambiente,  vs_chinches,  vs_fracturas,  vs_otros,  vs_duras;
    public Integer nv_total,  nv_mecanico,  nv_ambiente,  nv_chinches,  nv_fracturas,  nv_otros,  nv_duras;

    private boolean activo;
}



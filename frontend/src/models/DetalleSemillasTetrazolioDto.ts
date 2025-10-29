export interface DetalleSemillasTetrazolioDto {
  id: number | null;
  tetrazolioId: number | null;
  numeroTabla: number;

  vsd_total: number; vsd_mecanico: number; vsd_ambiente: number; vsd_chinches: number; vsd_fracturas: number; vsd_otros: number; vsd_duras: number;
  vl_total: number;  vl_mecanico: number;  vl_ambiente: number;  vl_chinches: number;  vl_fracturas: number;  vl_otros: number;  vl_duras: number;
  vm_total: number;  vm_mecanico: number;  vm_ambiente: number;  vm_chinches: number;  vm_fracturas: number;  vm_otros: number;  vm_duras: number;
  vs_total: number;  vs_mecanico: number;  vs_ambiente: number;  vs_chinches: number;  vs_fracturas: number;  vs_otros: number;  vs_duras: number;
  nv_total: number;  nv_mecanico: number;  nv_ambiente: number;  nv_chinches: number;  nv_fracturas: number;  nv_otros: number;  nv_duras: number;

  activo: boolean;
}



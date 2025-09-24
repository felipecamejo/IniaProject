

export interface ReciboDto {
  id: number | null;
  nroAnalisis: number;
  especie: string;
  ficha: string;
  fechaRecibo: string;
  remitente: string;
  origen: string;
  cultivar: string;
  deposito: string;
  estado: string;
  lote: number;
  kgLimpios: number;
  analisisSolicitados: string;
  articulo: number | null;
  activo: boolean;

  dosnAnalisis: import('./DOSN.dto').DOSNDto[] | null;
  pmsAnalisis: import('./PMS.dto').PMSDto[] | null;
  purezaAnalisis: import('./Pureza.dto').PurezaDto[] | null;
  germinacionAnalisis: import('./Germinacion.dto').GerminacionDto[] | null;
  purezaPNotatumAnalisis: import('./PurezaPNotatum.dto').PurezaPNotatumDto[] | null;
  sanitarioAnalisis: import('./Sanitario.dto').SanitarioDto[] | null;
  tetrazolioAnalisis: import('./Tetrazolio.dto').TetrazolioDto[] | null;
}

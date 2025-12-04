import { ReciboEstado } from './enums';

export interface ReciboDto {
  id: number | null;
  nroAnalisis: number | null;
  depositoId: number | null;
  estado: ReciboEstado | null;
  dosnAnalisisId?: number[] | null;
  pmsAnalisisId?: number[] | null;
  purezaAnalisisId?: number[] | null;
  germinacionAnalisisId?: number[] | null;
  purezaPNotatumAnalisisId?: number[] | null;
  sanitarioAnalisisId?: number[] | null;
  tetrazolioAnalisisId?: number[] | null;
  especieId: number | null;
  ficha: string | null;
  fechaRecibo: string; // ISO string para compatibilidad con backend
  remitente: string | null;
  origen: string | null;
  cultivarId: number | null;
  loteId: number | null;
  kgLimpios: number | null;
  analisisSolicitados: string | null;
  articulo: number | null;
  activo: boolean;
}

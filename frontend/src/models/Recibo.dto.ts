

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
  articulo: number;
  activo: boolean;

  dosnAnalisis: any[]; // Puedes definir un tipo específico si tienes el DTO
  pmsAnalisis: any[];
  purezaAnalisis: any[];
  germinacionAnalisis: any[];
  purezaPNotatumAnalisis: any[];
  sanitarioAnalisis: any[];
  tetrazolioAnalisis: any[];
}

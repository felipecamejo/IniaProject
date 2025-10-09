export interface ReciboDto {
  id: number | null;
  nroAnalisis: number;
  estado: string | null;
  HumedadesId: number[] | null;
  especie: string | null;
  ficha: string | null;
  fechaRecibo: string; // Si se maneja como Date en el frontend, cambiar a Date
  remitente: string | null;
  origen: string | null;
  cultivar: string | null;
  depositoId: number | null;
  lote: number | null;
  kgLimpios: number | null;
  analisisSolicitados: string | null;
  articulo: number | null;
  activo: boolean;
}

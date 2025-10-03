export interface ReciboDto {
  id: number | null;
  nroAnalisis: number;
  depositoId: number;
  estado: string; // Si existe un enum ReciboEstado en el frontend, reemplazar por ese tipo
  HumedadesId: number[];
  especie: string;
  ficha: string;
  fechaRecibo: string; // Si se maneja como Date en el frontend, cambiar a Date
  remitente: string;
  origen: string;
  cultivar: string;
  deposito: string;
  lote: number;
  kgLimpios: number;
  analisisSolicitados: string;
  articulo: number;
  activo: boolean;
}

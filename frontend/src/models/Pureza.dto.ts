export interface PurezaDto {
  id: number | null;
  fecha: string | null;
  pesoInicial: number;
  semillaPura: number;
  materialInerte: number;
  otrosCultivos: number;
  malezas: number;
  malezasToleradas: number;
  pesoTotal: number;
  otrosCultivo: number;
  fechaEstandar: string | null;
  estandar: boolean;
  activo: boolean;
  repetido: boolean;
  fechaCreacion: string | null;
  fechaRepeticion: string | null;
}

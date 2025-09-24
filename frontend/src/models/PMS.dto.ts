export interface PMSDto {
  id: number | null;
  pesoMilSemillas: number;
  humedadPorcentual: number;
  fechaMedicion: string | null;
  metodo: string;
  observaciones: string;
  activo: boolean;
  repetido: boolean;
}



export interface PMSDto {
  id: number | null;
  gramosPorRepeticiones: number[];
  pesoMilSemillas: number | null;
  pesoPromedioMilSemillas: number | null;
  comentarios: string;
  activo: boolean;
  repetido: boolean;
  reciboId: number | null;
  fechaMedicion: string | null;
  fechaCreacion: string | null;
  estandar: boolean
}

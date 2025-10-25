export interface PMSDto {
  id: number | null;
  gramosPorRepeticiones: number[];
  pesoPromedioCienSemillas: number | null;
  pesoMilSemillas: number | null;
  pesoPromedioMilSemillas: number | null;
  desvioEstandar: number | null;
  coeficienteVariacion: number | null;
  comentarios: string;
  activo: boolean;
  repetido: boolean;
  reciboId: number | null;
  fechaMedicion: string | null;
  fechaCreacion: string | null;
  fechaRepeticion: string | null;
  humedadPorcentual: number | null;
  estandar: boolean
}

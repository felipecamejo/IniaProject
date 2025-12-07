export interface RepeticionFinalDto {
  id?: number | null;
  activo?: boolean;
  germinacionId?: number | null;
  numeroRepeticion?: number | null;
  anormal?: number | null;
  duras?: number | null;
  frescas?: number | null;
  muertas?: number | null;
  totales?: number | null; // read-only in backend
  promedioAnormal?: number | null;
  promedioDuras?: number | null;
  promedioFrescas?: number | null;
  promedioMuertas?: number | null;
  promedioTotal?: number | null;
}

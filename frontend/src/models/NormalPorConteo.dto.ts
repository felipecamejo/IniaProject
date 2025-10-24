export interface NormalPorConteoDto {
  id?: number | null;
  activo?: boolean;
  germinacionId?: number | null;
  tabla?: 'SIN_CURAR' | 'CURADA_PLANTA' | 'CURADA_LABORATORIO' | string;
  numeroRepeticion?: number | null;
  conteoId?: number | null;
  normal?: number | null;
}

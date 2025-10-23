export interface PurezaPNotatumDto {
  id: number | null;
  gramosSemillaPura: number | null;
  gramosSemillasCultivos: number | null;
  gramosSemillasMalezas: number | null;
  gramosMateriaInerte: number | null;
  activo: boolean | null;
  repetido: boolean | null;
  reciboId: number | null;
  fechaCreacion: string | null;
  fechaRepeticion: string | null;
  observaciones: string | null;

}

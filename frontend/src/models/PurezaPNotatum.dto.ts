export interface PurezaPNotatumDto {
  id: number | null;
  gramosSemillaPura: number | null;
  gramosSemillasCultivos: number | null;
  gramosSemillasMalezas: number | null;
  gramosMateriaInerte: number | null;
  activo: boolean | null;
  estandar: boolean | null;
  repetido: boolean | null;
  reciboId: number | null;
  fechaCreacion: string | null;
  observaciones: string | null;

  semillaPuraPorcentaje?: number | null;
  semillacultivoPorcentaje?: number | null;
  semillaMalezaPorcentaje?: number | null;
  materiaInertePorcentaje?: number | null;
}

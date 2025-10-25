export interface DOSNDto {
  id: number | null;

  // Relación principal
  reciboId?: number | null;

  // Fechas INIA / INASE
  fechaINIA: string | null;
  fechaINASE: string | null;

  // Gramos analizados INIA / INASE
  gramosAnalizadosINIA: number | null;
  gramosAnalizadosINASE: number | null;

  // Tipos de análisis (valores esperados: COMPLETO, REDUCIDO, LIMITADO, REDUCIDO_LIMITADO)
  tiposDeanalisisINIA: string | null;
  tiposDeanalisisINASE: string | null;

  // Determinaciones y gramos
  determinacionBrassica: boolean | null;
  determinacionBrassicaGramos: number | null;
  determinacionCuscuta: boolean | null;
  determinacionCuscutaGramos: number | null;

  estandar: boolean | null;
  fechaAnalisis: string | null;

  // Colecciones (IDs)
  malezasNormalesINIAId: number[] | null;
  malezasNormalesINASEId: number[] | null;
  malezasToleradasINIAId: number[] | null;
  malezasToleradasINASEId: number[] | null;
  malezasToleranciaCeroINIAId: number[] | null;
  malezasToleranciaCeroINASEId: number[] | null;
  cultivosINIAId: number[] | null;
  cultivosINASEId: number[] | null;

  activo: boolean;
  repetido: boolean;
  fechaCreacion: string | null;
  fechaRepeticion: string | null;

  // Campo opcional usado en vistas de listado
  observaciones?: string | null;
}

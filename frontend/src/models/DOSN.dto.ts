export interface DOSNDto {
  id: number | null;

  // Relación principal
  reciboId?: number | null;

  // Fechas INIA / INASE
  fechaINIA: string | null;
  fechaINASE: string | null;
  fechaEstandar: string | null;

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

  // Colecciones (IDs)
  malezasNormalesINIAId: number[] | null;
  malezasNormalesINASEId: number[] | null;
  malezasToleradasINIAId: number[] | null;
  malezasToleradasINASEId: number[] | null;
  malezasToleranciaCeroINIAId: number[] | null;
  malezasToleranciaCeroINASEId: number[] | null;
  cultivosINIAId: number[] | null;
  cultivosINASEId: number[] | null;

  // Opcional: estructura con cantidades por item seleccionado (preparado para backend futuro)
  malezasNormalesINIA?: Array<{ id: number; cantidad: number }> | null;
  malezasNormalesINASE?: Array<{ id: number; cantidad: number }> | null;
  malezasToleradasINIA?: Array<{ id: number; cantidad: number }> | null;
  malezasToleradasINASE?: Array<{ id: number; cantidad: number }> | null;
  malezasToleranciaCeroINIA?: Array<{ id: number; cantidad: number }> | null;
  malezasToleranciaCeroINASE?: Array<{ id: number; cantidad: number }> | null;
  cultivosINIA?: Array<{ id: number; cantidad: number }> | null;
  cultivosINASE?: Array<{ id: number; cantidad: number }> | null;

  activo: boolean;
  repetido: boolean;
  fechaCreacion: string | null;

  // Campo opcional usado en vistas de listado
  observaciones: string | null;
}

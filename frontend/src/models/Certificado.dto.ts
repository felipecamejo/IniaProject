export enum TipoCertificado {
  DEFINITIVO = 'DEFINITIVO',
  PROVISORIO = 'PROVISORIO'
}

export interface CertificadoDto {
  id: number | null;
  nombreSolicitante: string | null;
  especie: string | null;
  cultivar: string | null;
  categoria: string | null;
  responsableMuestreo: string | null;
  fechaMuestreo: string | null; // ISO string
  numeroLote: string | null;
  numeroEnvases: number | null;
  fechaIngresoLaboratorio: string | null; // ISO string
  fechaFinalizacionAnalisis: string | null; // ISO string
  numeroMuestra: string | null;
  numeroCertificado: string | null;
  tipoCertificado: TipoCertificado | null;
  fechaEmision: string | null; // ISO string
  firmante: Uint8Array | number[];
  fechaFirma: string | null; // ISO string
  reciboId: number | null;
  activo: boolean;

  brassicaContiene: boolean;

  nombreFirmante: string | null;
  funcionFirmante: string | null;
  otrasDeterminaciones: string | null;

  // Resultados de análisis - Pureza
  purezaSemillaPura: number | null;
  purezaMateriaInerte: number | null;
  purezaOtrasSemillas: number | null;
  purezaOtrosCultivos: number | null;
  purezaMalezas: number | null;
  purezaMalezasToleradas: string | null;
  purezaPeso1000Semillas: string | null;
  purezaHumedad: string | null;
  purezaClaseMateriaInerte: string | null;
  purezaOtrasSemillasDescripcion: string | null;

  // Resultados de análisis - DOSN
  dosnGramosAnalizados: number | null;
  dosnMalezasToleranciaCero: number | null;
  dosnMalezasTolerancia: number | null;
  dosnOtrosCultivos: number | null;
  dosnBrassicaSpp: number;

  // Resultados de análisis - Germinación
  germinacionNumeroDias: number | null;
  germinacionPlantulasNormales: number | null;
  germinacionPlantulasAnormales: number | null;
  germinacionSemillasDuras: number | null;
  germinacionSemillasFrescas: number | null;
  germinacionSemillasMuertas: number | null;
  germinacionSustrato: string | null;
  germinacionTemperatura: number | null;
  germinacionPreTratamiento: string | null;
}


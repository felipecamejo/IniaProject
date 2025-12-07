// Estructura para la nueva tabla de detalle
interface DetalleCategoria {
  total: number;
  mecanico: number;
  ambiente: number;
  chinches: number;
  fracturas: number;
  otros: number;
  duras: number;
}

interface DetalleSemillas {
  viablesSinDefectos: DetalleCategoria;
  viablesLeves: DetalleCategoria;
  viablesModerados: DetalleCategoria;
  viablesSeveros: DetalleCategoria;
  noViables: DetalleCategoria;
}
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TetrazolioDto, ReporteTetrazolio } from '../../../models/Tetrazolio.dto';
import { RepeticionTetrazolioDto } from '../../../models/RepeticionTetrazolioDto';
import { TetrazolioService } from '../../../services/TetrazolioService';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { AuthService } from '../../../services/AuthService';
import { LogService } from '../../../services/LogService';

export interface RepeticionTetrazolio {
  numero: number;
  viables: number;
  noViables: number;
  duras: number;
}

@Component({
  selector: 'app-tetrazolio.component',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    MultiSelectModule
  ],
  templateUrl: './tetrazolio.component.html',
  styleUrl: './tetrazolio.component.scss'
})
export class TetrazolioComponent implements OnInit {
  // Campos nuevos del formulario
  cantidadSemillas: number | null = null;

  // Agregar propiedades para manejar errores
  errores: string[] = [];
  advertencias: string[] = [];

  comentarios: string = '';

  // Pretratamiento: seleccionar o especificar
  pretratamientoOptions: { label: string; value: any }[] = [
    { label: 'EP 16 horas', value: 'EP_16_HORAS' },
    { label: 'EP 18 horas', value: 'EP_18_HORAS' },
    { label: 'S/Pretratamiento', value: 'SIN_PRETRATAMIENTO' },
    { label: 'Agua 7 horas', value: 'AGUA_7_HORAS' },
    { label: 'Agua 18 horas', value: 'AGUA_18_HORAS' },
    { label: 'Otro (especificar)', value: 'custom' }
  ];
  selectedPretratamiento: string | 'custom' | null = null;
  pretratamientoCustom: string = '';

  // Concentración (%): seleccionar o especificar
  concentracionOptions: { label: string; value: any }[] = [
    { label: '0 %', value: 0 },
    { label: '1 %', value: 1 },
    { label: '5 %', value: 5 },
    { label: '0.75 %', value: 0.75 },
    { label: 'Otro (especificar)', value: 'custom' }
  ];
  selectedConcentracion: number | 'custom' | null = null;
  concentracionCustom: number | null = null;

  // Tinción (hs): seleccionar o especificar
  tincionHsOptions: { label: string; value: any }[] = [
    { label: '2 h', value: 2 },
    { label: '3 h', value: 3 },
    { label: '16 h', value: 16 },
    { label: '18 h', value: 18 },
    { label: 'Otro (especificar)', value: 'custom' }
  ];
  selectedTincionHs: number | 'custom' | null = null;
  tincionHsCustom: number | null = null;

  // Tinción (°C): ingreso manual
  tincionC: number | null = null;

  // Fecha (yyyy-MM-dd)
  fecha: string | null = null;

  // ===== SEGUNDO CONJUNTO DE DATOS (para tabla de detalles) =====
  cantidadSemillas2: number | null = null;
  selectedPretratamiento2: string | 'custom' | null = null;
  pretratamientoCustom2: string = '';
  selectedConcentracion2: number | 'custom' | null = null;
  concentracionCustom2: number | null = null;
  selectedTincionHs2: number | 'custom' | null = null;
  tincionHsCustom2: number | null = null;
  tincionC2: number | null = null;
  fecha2: string | null = null;

  // Variables para manejar navegación
  isEditing: boolean = false;
  isViewing: boolean = false;
  editingId: number | null = null;
  estandar: boolean = false;
  repetido: boolean = false;

  // Prevención de doble envío
  isSubmitting: boolean = false;

  // Variables para controlar si ya está marcado (no se puede cambiar)
  estandarOriginal: boolean = false;
  repetidoOriginal: boolean = false;

  // Promedios redondeados (ingresados manualmente por el usuario)
  promedioViablesRedondeado: number = 0;
  promedioNoViablesRedondeado: number = 0;
  promedioDurasRedondeado: number = 0;

  // Getters para deshabilitar checkboxes si ya están marcados
  get estandarDeshabilitado(): boolean {
    return this.estandarOriginal;
  }

  get repetidoDeshabilitado(): boolean {
    return this.repetidoOriginal;
  }

  // Getter para verificar si el usuario es admin
  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  // Métodos para hacer checkboxes mutuamente excluyentes con confirmación
  onEstandarChange() {
    // Si ya estaba marcado como estándar, no permitir cambiar
    if (this.estandarOriginal) {
      this.estandar = true; // Revertir
      return;
    }

    // Si está intentando marcar como estándar y ya está marcado como repetido
    if (this.estandar && this.repetido) {
      this.repetido = false;
      this.repetidoOriginal = false;
    }

    // Si está intentando marcar como estándar, mostrar confirmación with alert
    if (this.estandar) {
      const confirmar = confirm('¿Estás seguro de que deseas marcar este análisis como estándar? Una vez marcado, no podrás cambiarlo.');
      if (!confirmar) {
        // Revertir el cambio si no se confirma
        this.estandar = false;
        return;
      }
      // Confirmar el cambio
      this.repetido = false;
      this.estandarOriginal = true; // Marcar como original para que no se pueda cambiar
      this.repetidoOriginal = false;
    }
    // Actualizar validaciones dinámicamente
    this.manejarProblemas();
  }

  onRepetidoChange() {
    // Si ya estaba marcado como repetido, no permitir cambiar
    if (this.repetidoOriginal) {
      this.repetido = true; // Revertir
      return;
    }

    // Si está intentando marcar como repetido y ya está marcado como estándar
    if (this.repetido && this.estandar) {
      this.estandar = false;
      this.estandarOriginal = false;
    }

    // Si está intentando marcar como repetido, mostrar confirmación with alert
    if (this.repetido) {
      const confirmar = confirm('¿Estás seguro de que deseas marcar este análisis como repetido? Una vez marcado, no podrás cambiarlo.');
      if (!confirmar) {
        // Revertir el cambio si no se confirma
        this.repetido = false;
        return;
      }
      // Confirmar el cambio
      this.estandar = false;
      this.repetidoOriginal = true; // Marcar como original para que no se pueda cambiar
      this.estandarOriginal = false;
    }
    // Actualizar validaciones dinámicamente
    this.manejarProblemas();
  }

  // Getter para determinar si está en modo readonly
  get isReadonly(): boolean {
    return this.isViewing;
  }

  // IDs de contexto
  loteId: string | null = null;
  reciboId: string | null = null;

  // Fecha de repetición (para edición)
  fechaRepeticion: string | null = null;

  repeticiones: RepeticionTetrazolio[] = [
    { numero: 1, viables: 0, noViables: 0, duras: 0 }
  ];

  // Mantener las repeticiones del backend para edición
  repeticionesEntries: RepeticionTetrazolioDto[] = [];
  deletedRepeticionesIds: number[] = [];

  detalles: DetalleSemillas[] = [
    {
      viablesSinDefectos: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
      viablesLeves: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
      viablesModerados: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
      viablesSeveros: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
      noViables: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 }
    }
  ];

  // Estructura para la tabla de reporte
  reporte: ReporteTetrazolio = {
    vigorAlto: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
    vigorMedio: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
    vigorBajo: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
    limiteCritico: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
    noViables: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
    viabilidad: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
    vigorAcumulado: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } }
  };

  // --- Cálculos de Vigor (promedio de: sin defectos, defectos leves y defectos moderados) ---
  private getVigorTabla(det: DetalleSemillas): number {
    const favorables = (det.viablesSinDefectos.total || 0)
      + (det.viablesLeves.total || 0)
      + (det.viablesModerados.total || 0);
    const total = this.getSumaTotal(det);
    if (!total) return 0;
    return (favorables / total) * 100;
  }

  // --- Cálculos por repetición (por índice de tabla) ---
  getVigorPorTabla(index: number): number {
    const det = this.detalles[index];
    if (!det) return 0;
    return this.getVigorTabla(det);
  }

  getVigorPorTablaRed(index: number): number {
    return Math.round(this.getVigorPorTabla(index));
  }

  getClasificacionVigorPorTabla(index: number): string {
    const v = this.getVigorPorTabla(index);
    return this.getClasificacionVigor(v);
  }

  getNoViablesPorTabla(index: number): number {
    const det = this.detalles[index];
    if (!det) return 0;
    const total = this.getSumaTotal(det);
    const noV = det.noViables.total || 0;
    if (!total) return 0;
    return (noV / total) * 100;
  }

  getNoViablesClasificadoPorTabla(index: number): string {
    const pct = this.getNoViablesPorTabla(index);
    return this.getClasificacionNoViables(pct);
  }

  // NOTA: Se descontinúan los cálculos GLOBALes (ponderado/promedio) a pedido: solo por repetición

  // Clasificación por vigor
  getClasificacionVigor(vigorPct: number): string {
    if (vigorPct == null || isNaN(vigorPct)) return 'Sin clasificación';
    if (vigorPct >= 85) return 'Lote de muy alto vigor';
    if (vigorPct >= 75) return 'Lote de vigor alto';
    if (vigorPct >= 60) return 'Lote de vigor medio';
    if (vigorPct >= 50) return 'Lote de vigor bajo';
    return 'Lote de vigor muy bajo';
  }


  // --- Daños de semillas no viables (global, ponderado) ---
  getPorcentajeNoViablesPonderado(): number {
    if (!this.detalles || this.detalles.length === 0) return 0;
    let sumaNoViables = 0;
    let sumaTotal = 0;
    for (const det of this.detalles) {
      const total = this.getSumaTotal(det);
      const noV = det.noViables.total || 0;
      sumaNoViables += noV;
      sumaTotal += total;
    }
    if (!sumaTotal) return 0;
    return (sumaNoViables / sumaTotal) * 100;
  }

  getClasificacionNoViables(pctNoViables: number): string {
    if (pctNoViables == null || isNaN(pctNoViables)) return 'Sin clasificación';
    if (pctNoViables <= 6) return 'Sin problema';
    if (pctNoViables <= 10) return 'Problema serio';
    return 'Muy serio';
  }

  getNoViablesClasificado(): string {
    const pct = this.getPorcentajeNoViablesPonderado();
    return this.getClasificacionNoViables(pct);
  }

  // --- Cálculos automáticos del reporte (clasificación por vigor de cada tabla) ---
  
  // Clasificar el vigor de una tabla en categoría del reporte
  private clasificarVigorEnCategoria(vigorPct: number): 'vigorAlto' | 'vigorMedio' | 'vigorBajo' | 'vigorMuyBajo' {
    if (vigorPct >= 75) return 'vigorAlto';      // ≥75% (incluye ≥85%)
    if (vigorPct >= 60) return 'vigorMedio';    // 60-74%
    if (vigorPct >= 50) return 'vigorBajo';      // 50-59%
    return 'vigorMuyBajo';                      // <50%
  }

  // Calcular promedio de porcentaje de vigor por categoría (agrupando tablas por su clasificación de vigor)
  private getPromedioVigorPorCategoria(categoria: 'vigorAlto' | 'vigorMedio' | 'vigorBajo' | 'vigorMuyBajo'): number {
    if (!this.detalles || this.detalles.length === 0) return 0;
    
    let sumaVigor = 0;
    let tablasEnCategoria = 0;
    
    for (const det of this.detalles) {
      const vigorTabla = this.getVigorTabla(det);
      const categoriaTabla = this.clasificarVigorEnCategoria(vigorTabla);
      
      if (categoriaTabla === categoria) {
        sumaVigor += vigorTabla;
        tablasEnCategoria++;
      }
    }
    
    if (tablasEnCategoria === 0) return 0;
    return sumaVigor / tablasEnCategoria;
  }

  // Calcular promedio de porcentaje de daños para tablas que caen en una categoría de vigor específica
  private getPromedioDaniosPorCategoriaVigor(categoriaVigor: 'vigorAlto' | 'vigorMedio' | 'vigorBajo' | 'vigorMuyBajo', tipoDanio: 'mecanico' | 'ambiente' | 'chinches' | 'fracturas' | 'otros' | 'duras'): number {
    if (!this.detalles || this.detalles.length === 0) return 0;
    
    let sumaPorcentajes = 0;
    let tablasEnCategoria = 0;
    
    for (const det of this.detalles) {
      const vigorTabla = this.getVigorTabla(det);
      const categoriaTabla = this.clasificarVigorEnCategoria(vigorTabla);
      
      if (categoriaTabla === categoriaVigor) {
        const total = this.getSumaTotal(det);
        if (total > 0) {
          // Sumar daños de todas las categorías de semillas viables (sin defectos + leves + moderados)
          const danioTotal = (det.viablesSinDefectos[tipoDanio] || 0) +
                            (det.viablesLeves[tipoDanio] || 0) +
                            (det.viablesModerados[tipoDanio] || 0);
          const porcentaje = (danioTotal / total) * 100;
          sumaPorcentajes += porcentaje;
          tablasEnCategoria++;
        }
      }
    }
    
    if (tablasEnCategoria === 0) return 0;
    return sumaPorcentajes / tablasEnCategoria;
  }

  // Calcular porcentaje promedio de no viables (se mantiene igual)
  private getPorcentajePromedioNoViables(): number {
    if (!this.detalles || this.detalles.length === 0) return 0;
    
    let sumaPorcentajes = 0;
    let tablasValidas = 0;
    
    for (const det of this.detalles) {
      const total = this.getSumaTotal(det);
      if (total > 0) {
        const cantidad = det.noViables.total || 0;
        const porcentaje = (cantidad / total) * 100;
        sumaPorcentajes += porcentaje;
        tablasValidas++;
      }
    }
    
    if (tablasValidas === 0) return 0;
    return sumaPorcentajes / tablasValidas;
  }

  // Calcular promedio de daños de no viables
  private getPromedioDaniosNoViables(tipoDanio: 'mecanico' | 'ambiente' | 'chinches' | 'fracturas' | 'otros' | 'duras'): number {
    if (!this.detalles || this.detalles.length === 0) return 0;
    
    let sumaPorcentajes = 0;
    let tablasValidas = 0;
    
    for (const det of this.detalles) {
      const total = this.getSumaTotal(det);
      if (total > 0) {
        const cantidadDanio = det.noViables[tipoDanio] || 0;
        const porcentaje = (cantidadDanio / total) * 100;
        sumaPorcentajes += porcentaje;
        tablasValidas++;
      }
    }
    
    if (tablasValidas === 0) return 0;
    return sumaPorcentajes / tablasValidas;
  }

  // Funciones para obtener porcentajes promedio del reporte (basados en clasificación de vigor)
  getVigorAltoReportePct(): number {
    return this.getPromedioVigorPorCategoria('vigorAlto');
  }

  getVigorMedioReportePct(): number {
    return this.getPromedioVigorPorCategoria('vigorMedio');
  }

  getVigorBajoReportePct(): number {
    return this.getPromedioVigorPorCategoria('vigorBajo');
  }

  getLimiteCriticoReportePct(): number {
    return this.getPromedioVigorPorCategoria('vigorMuyBajo');
  }

  getNoViablesReportePct(): number {
    return this.getPorcentajePromedioNoViables();
  }

  // Calcular Viabilidad: promedio del vigor total de todas las tablas (sin defectos + leves + moderados)
  getViabilidadReportePct(): number {
    if (!this.detalles || this.detalles.length === 0) return 0;
    
    let sumaVigor = 0;
    let tablasValidas = 0;
    
    for (const det of this.detalles) {
      const vigorTabla = this.getVigorTabla(det);
      if (vigorTabla > 0 || this.getSumaTotal(det) > 0) {
        sumaVigor += vigorTabla;
        tablasValidas++;
      }
    }
    
    if (tablasValidas === 0) return 0;
    return sumaVigor / tablasValidas;
  }

  // Calcular Vigor Acumulado: suma de Vigor Alto + Medio + Bajo
  getVigorAcumuladoReportePct(): number {
    const alto = this.getVigorAltoReportePct();
    const medio = this.getVigorMedioReportePct();
    const bajo = this.getVigorBajoReportePct();
    return alto + medio + bajo;
  }

  // Calcular daños de Viabilidad (promedio de todas las tablas viables)
  private getDaniosViabilidad(tipoDanio: 'mecanico' | 'ambiente' | 'chinches' | 'fracturas' | 'otros' | 'duras'): number {
    if (!this.detalles || this.detalles.length === 0) return 0;
    
    let sumaPorcentajes = 0;
    let tablasValidas = 0;
    
    for (const det of this.detalles) {
      const total = this.getSumaTotal(det);
      if (total > 0) {
        // Sumar daños de todas las categorías de semillas viables
        const danioTotal = (det.viablesSinDefectos[tipoDanio] || 0) +
                          (det.viablesLeves[tipoDanio] || 0) +
                          (det.viablesModerados[tipoDanio] || 0) +
                          (det.viablesSeveros[tipoDanio] || 0);
        const porcentaje = (danioTotal / total) * 100;
        sumaPorcentajes += porcentaje;
        tablasValidas++;
      }
    }
    
    if (tablasValidas === 0) return 0;
    return sumaPorcentajes / tablasValidas;
  }

  // Calcular daños de Vigor Acumulado: suma de daños de Vigor Alto + Medio + Bajo
  private getDaniosVigorAcumulado(tipoDanio: 'mecanico' | 'ambiente' | 'chinches' | 'fracturas' | 'otros' | 'duras'): number {
    const alto = this.getPromedioDaniosPorCategoriaVigor('vigorAlto', tipoDanio);
    const medio = this.getPromedioDaniosPorCategoriaVigor('vigorMedio', tipoDanio);
    const bajo = this.getPromedioDaniosPorCategoriaVigor('vigorBajo', tipoDanio);
    return alto + medio + bajo;
  }

  // Método para actualizar cálculos automáticos cuando cambian los valores
  actualizarCalculosReporte() {
    // Actualizar todos los porcentajes del reporte automáticamente
    this.reporte.vigorAlto.porcentaje = this.getVigorAltoReportePct();
    this.reporte.vigorMedio.porcentaje = this.getVigorMedioReportePct();
    this.reporte.vigorBajo.porcentaje = this.getVigorBajoReportePct();
    this.reporte.limiteCritico.porcentaje = this.getLimiteCriticoReportePct();
    this.reporte.noViables.porcentaje = this.getNoViablesReportePct();
    // Actualizar Viabilidad y Vigor Acumulado
    this.reporte.viabilidad.porcentaje = this.getViabilidadReportePct();
    this.reporte.vigorAcumulado.porcentaje = this.getVigorAcumuladoReportePct();
    
    // Actualizar daños automáticamente (basados en clasificación de vigor)
    // Vigor Alto
    this.reporte.vigorAlto.danios.mecanicos = this.getPromedioDaniosPorCategoriaVigor('vigorAlto', 'mecanico');
    this.reporte.vigorAlto.danios.ambiente = this.getPromedioDaniosPorCategoriaVigor('vigorAlto', 'ambiente');
    this.reporte.vigorAlto.danios.chinches = this.getPromedioDaniosPorCategoriaVigor('vigorAlto', 'chinches');
    this.reporte.vigorAlto.danios.fracturas = this.getPromedioDaniosPorCategoriaVigor('vigorAlto', 'fracturas');
    this.reporte.vigorAlto.danios.otros = this.getPromedioDaniosPorCategoriaVigor('vigorAlto', 'otros');
    this.reporte.vigorAlto.danios.duras = this.getPromedioDaniosPorCategoriaVigor('vigorAlto', 'duras');
    
    // Vigor Medio
    this.reporte.vigorMedio.danios.mecanicos = this.getPromedioDaniosPorCategoriaVigor('vigorMedio', 'mecanico');
    this.reporte.vigorMedio.danios.ambiente = this.getPromedioDaniosPorCategoriaVigor('vigorMedio', 'ambiente');
    this.reporte.vigorMedio.danios.chinches = this.getPromedioDaniosPorCategoriaVigor('vigorMedio', 'chinches');
    this.reporte.vigorMedio.danios.fracturas = this.getPromedioDaniosPorCategoriaVigor('vigorMedio', 'fracturas');
    this.reporte.vigorMedio.danios.otros = this.getPromedioDaniosPorCategoriaVigor('vigorMedio', 'otros');
    this.reporte.vigorMedio.danios.duras = this.getPromedioDaniosPorCategoriaVigor('vigorMedio', 'duras');
    
    // Vigor Bajo
    this.reporte.vigorBajo.danios.mecanicos = this.getPromedioDaniosPorCategoriaVigor('vigorBajo', 'mecanico');
    this.reporte.vigorBajo.danios.ambiente = this.getPromedioDaniosPorCategoriaVigor('vigorBajo', 'ambiente');
    this.reporte.vigorBajo.danios.chinches = this.getPromedioDaniosPorCategoriaVigor('vigorBajo', 'chinches');
    this.reporte.vigorBajo.danios.fracturas = this.getPromedioDaniosPorCategoriaVigor('vigorBajo', 'fracturas');
    this.reporte.vigorBajo.danios.otros = this.getPromedioDaniosPorCategoriaVigor('vigorBajo', 'otros');
    this.reporte.vigorBajo.danios.duras = this.getPromedioDaniosPorCategoriaVigor('vigorBajo', 'duras');
    
    // Vigor Muy Bajo (antes Límite Crítico)
    this.reporte.limiteCritico.danios.mecanicos = this.getPromedioDaniosPorCategoriaVigor('vigorMuyBajo', 'mecanico');
    this.reporte.limiteCritico.danios.ambiente = this.getPromedioDaniosPorCategoriaVigor('vigorMuyBajo', 'ambiente');
    this.reporte.limiteCritico.danios.chinches = this.getPromedioDaniosPorCategoriaVigor('vigorMuyBajo', 'chinches');
    this.reporte.limiteCritico.danios.fracturas = this.getPromedioDaniosPorCategoriaVigor('vigorMuyBajo', 'fracturas');
    this.reporte.limiteCritico.danios.otros = this.getPromedioDaniosPorCategoriaVigor('vigorMuyBajo', 'otros');
    this.reporte.limiteCritico.danios.duras = this.getPromedioDaniosPorCategoriaVigor('vigorMuyBajo', 'duras');
    
    // No viables
    this.reporte.noViables.danios.mecanicos = this.getPromedioDaniosNoViables('mecanico');
    this.reporte.noViables.danios.ambiente = this.getPromedioDaniosNoViables('ambiente');
    this.reporte.noViables.danios.chinches = this.getPromedioDaniosNoViables('chinches');
    this.reporte.noViables.danios.fracturas = this.getPromedioDaniosNoViables('fracturas');
    this.reporte.noViables.danios.otros = this.getPromedioDaniosNoViables('otros');
    this.reporte.noViables.danios.duras = this.getPromedioDaniosNoViables('duras');
    
    // Viabilidad (suma de Vigor Alto + Medio + Bajo)
    this.reporte.viabilidad.danios.mecanicos = this.getDaniosViabilidad('mecanico');
    this.reporte.viabilidad.danios.ambiente = this.getDaniosViabilidad('ambiente');
    this.reporte.viabilidad.danios.chinches = this.getDaniosViabilidad('chinches');
    this.reporte.viabilidad.danios.fracturas = this.getDaniosViabilidad('fracturas');
    this.reporte.viabilidad.danios.otros = this.getDaniosViabilidad('otros');
    this.reporte.viabilidad.danios.duras = this.getDaniosViabilidad('duras');
    
    // Vigor Acumulado (suma de Vigor Alto + Medio)
    this.reporte.vigorAcumulado.danios.mecanicos = this.getDaniosVigorAcumulado('mecanico');
    this.reporte.vigorAcumulado.danios.ambiente = this.getDaniosVigorAcumulado('ambiente');
    this.reporte.vigorAcumulado.danios.chinches = this.getDaniosVigorAcumulado('chinches');
    this.reporte.vigorAcumulado.danios.fracturas = this.getDaniosVigorAcumulado('fracturas');
    this.reporte.vigorAcumulado.danios.otros = this.getDaniosVigorAcumulado('otros');
    this.reporte.vigorAcumulado.danios.duras = this.getDaniosVigorAcumulado('duras');
  }

  // Suma de N° de semillas (todas las filas)
  getSumaTotal(det: DetalleSemillas): number {
    return det.viablesSinDefectos.total + det.viablesLeves.total +
      det.viablesModerados.total + det.viablesSeveros.total +
      det.noViables.total;
  }

  // Verificar si una repetición excede la cantidad de semillas
  excedeSemillasRepeticion(rep: RepeticionTetrazolio): boolean {
    if (this.cantidadSemillas === null || this.cantidadSemillas === undefined) {
      return false;
    }
    const suma = (rep.viables || 0) + (rep.noViables || 0) + (rep.duras || 0);
    return suma > this.cantidadSemillas;
  }

  // Verificar si una tabla de detalles excede la cantidad de semillas 2
  excedeSemillasDetalle(det: DetalleSemillas): boolean {
    if (this.cantidadSemillas2 === null || this.cantidadSemillas2 === undefined) {
      return false;
    }
    return this.getSumaTotal(det) > this.cantidadSemillas2;
  }

  // Semillas viables: suma de todas las filas menos no viables
  getSemillasViablesTotal(det: DetalleSemillas): number {
    return det.viablesSinDefectos.total + det.viablesLeves.total +
      det.viablesModerados.total + det.viablesSeveros.total;
  }

  // Semillas viables por columna de daño
  getSemillasViables(det: DetalleSemillas, col: keyof DetalleCategoria): number {
    return (det.viablesSinDefectos[col] || 0) +
      (det.viablesLeves[col] || 0) +
      (det.viablesModerados[col] || 0) +
      (det.viablesSeveros[col] || 0);
  }

  private crearDetalleVacio(): DetalleSemillas {
    return {
      viablesSinDefectos: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
      viablesLeves: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
      viablesModerados: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
      viablesSeveros: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
      noViables: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 }
    };
  }

  private clonarDetalle(d: DetalleSemillas): DetalleSemillas {
    return JSON.parse(JSON.stringify(d));
  }

  agregarTablaDetalleClon() {
    if (this.detalles.length >= 8) return;
    const base = this.detalles[this.detalles.length - 1] || this.crearDetalleVacio();
    this.detalles.push(this.clonarDetalle(base));
    this.actualizarCalculosReporte();
  }

  eliminarTablaDetalle(index: number) {
    // Solo permitir eliminar tablas clonadas (no la primera R1)
    if (index <= 0) return;
    if (this.detalles.length <= 1) return;
    this.detalles.splice(index, 1);
    this.actualizarCalculosReporte();
  }

  agregarRepeticion() {
    const nuevaRepeticion: RepeticionTetrazolio = {
      numero: this.repeticiones.length + 1,
      viables: 0,
      noViables: 0,
      duras: 0
    };
    this.repeticiones.push(nuevaRepeticion);

    // Sincronizar con repeticionesEntries
    const nuevaRepeticionDto: RepeticionTetrazolioDto = {
      id: null, // null indica que es una nueva repetición que se creará en el backend
      numero: nuevaRepeticion.numero,
      viables: nuevaRepeticion.viables,
      noViables: nuevaRepeticion.noViables,
      duras: nuevaRepeticion.duras,
      tetrazolioId: this.editingId || null // Se asignará correctamente en onSubmit
    };
    this.repeticionesEntries.push(nuevaRepeticionDto);
  }

  eliminarRepeticion(index: number) {
    if (this.repeticiones.length > 1) {
      // Guardar ID de la repetición eliminada si existe
      if (this.repeticionesEntries[index] && this.repeticionesEntries[index].id) {
        this.deletedRepeticionesIds.push(this.repeticionesEntries[index].id!);
      }

      this.repeticiones.splice(index, 1);
      this.repeticionesEntries.splice(index, 1);

      // Re-enumerar
      this.repeticiones.forEach((r, i) => r.numero = i + 1);
      this.repeticionesEntries.forEach((r, i) => r.numero = i + 1);
    }
  }

  getTotalViables(): string {
    const total = this.repeticiones.reduce((acc, rep) => acc + (Number(rep.viables) || 0), 0);
    return total.toString();
  }
  getTotalNoViables(): string {
    const total = this.repeticiones.reduce((acc, rep) => acc + (Number(rep.noViables) || 0), 0);
    return total.toString();
  }
  getTotalDuras(): string {
    const total = this.repeticiones.reduce((acc, rep) => acc + (Number(rep.duras) || 0), 0);
    return total.toString();
  }

  // Promedios sin redondeo (calculados)
  getPromedioViables(): string {
    const prom = this.repeticiones.reduce((acc, rep) => acc + (Number(rep.viables) || 0), 0) / this.repeticiones.length;
    return prom.toFixed(2);
  }
  getPromedioNoViables(): string {
    const prom = this.repeticiones.reduce((acc, rep) => acc + (Number(rep.noViables) || 0), 0) / this.repeticiones.length;
    return prom.toFixed(2);
  }
  getPromedioDuras(): string {
    const prom = this.repeticiones.reduce((acc, rep) => acc + (Number(rep.duras) || 0), 0) / this.repeticiones.length;
    return prom.toFixed(2);
  }

  // Método para sincronizar cambios desde los inputs
  onRepeticionChange(index: number, field: keyof RepeticionTetrazolio, value: any) {
    const numericValue = parseFloat(value) || 0;

    // Actualizar tanto repeticiones como repeticionesEntries
    if (this.repeticiones[index]) {
      (this.repeticiones[index] as any)[field] = numericValue;
    }
    if (this.repeticionesEntries[index]) {
      (this.repeticionesEntries[index] as any)[field] = numericValue;
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tetrazolioService: TetrazolioService,
    private authService: AuthService,
    private logService: LogService,
  ) {}

  ngOnInit() {
    // Verificar si estamos en modo edición o solo lectura basado en la ruta y query params
    this.route.params.subscribe((params: any) => {
      this.loteId = params['loteId'] ?? null;
      this.reciboId = params['reciboId'] ?? null;

      // Revisar si hay query param view=true para modo solo lectura
      this.route.queryParams.subscribe((query) => {
        this.isViewing = query['view'] === 'true';
      });

      // Verificar si hay un ID en la ruta para determinar modo de edición o solo lectura
      const id = params['id'];
      if (id && !isNaN(parseInt(id))) {
        this.isEditing = !this.isViewing;
        this.editingId = parseInt(id);
        if (this.isViewing) {
          console.log('Modo solo lectura detectado, ID:', this.editingId);
        } else {
          console.log('Modo edición detectado, ID:', this.editingId);
        }
        this.cargarDatosParaEdicion(this.editingId);
      } else {
        this.isEditing = false;
        this.editingId = null;
        console.log('Modo creación detectado');
        this.cargarDatos();
      }
    });
  }

  // Datos de prueba (deberían venir de un servicio)
  private itemsData: TetrazolioDto[] = [
    {
      id: 1,
      repeticion: 1,
      nroSemillasPorRepeticion: 100,
      pretratamiento: { id: 1, nombre: 'EP 16 horas' },
      concentracion: '0.5',
      tincionHoras: '24',
      tincionGrados: '25',
      fecha: '2023-01-15',
      viables: '85',
      noViables: '10',
      duras: '5',
      total: '100',
      promedio: '85',
      promedioNoViables: '10',
      promedioDuras: '5',
      porcentaje: 85,
      viabilidadPorTetrazolio: 'ALTA',
      nroSemillas: 100,
      daniosNroSemillas: 15,
      daniosMecanicos: 5,
      danioAmbiente: 3,
      daniosChinches: 2,
      daniosFracturas: 3,
      daniosOtros: 2,
      daniosDuras: 5,
      viabilidadVigorTz: 'VIGOR_ALTO',
      porcentajeFinal: 85,
      daniosPorPorcentajes: 15,
      activo: true,
      estandar: false,
      repetido: false,
      fechaCreacion: '2023-01-15',
      fechaRepeticion: null,
      reciboId: null,
      reporte: null,
      observaciones: null
    }
  ];

  private cargarDatosParaEdicion(id: number) {
    console.log('=== INICIANDO CARGA DE DATOS PARA EDICIÓN ===');
    console.log('ID del tetrazolio a cargar:', id);

    // Cargar datos del Tetrazolio desde el backend
    this.tetrazolioService.obtener(id).subscribe({
      next: (item) => {
        console.log('Datos del tetrazolio cargados desde el backend:', item);
        console.log('Tipo de fecha recibida:', typeof item.fecha);
        console.log('Valor de fecha:', item.fecha);
        console.log('Fecha como string:', String(item.fecha));

        // Verificar que el tetrazolio existe y está activo
        if (!item) {
          console.error('No se encontró el tetrazolio con ID:', id);
          alert('No se encontró el tetrazolio seleccionado');
          this.safeNavigateToListado();
          return;
        }

        if (!item.activo) {
          console.error('El tetrazolio no está activo:', item);
          alert('El tetrazolio seleccionado no está disponible para edición');
          this.safeNavigateToListado();
          return;
        }

        // Cargar datos básicos
        this.cantidadSemillas = item.nroSemillasPorRepeticion ?? item.nroSemillas ?? null;

        // Pretratamiento
        if (item.pretratamiento) {
          const pretratamientoValue = String(item.pretratamiento);
          const ptOption = this.pretratamientoOptions.find(o => o.value === pretratamientoValue);
          if (ptOption) {
            this.selectedPretratamiento = pretratamientoValue;
          } else {
            this.selectedPretratamiento = null; // desconocido
          }
        } else {
          this.selectedPretratamiento = null;
        }

        // Concentración
        const concValue = item.concentracion ? parseFloat(item.concentracion) : null;
        const concOption = this.concentracionOptions.find(o => o.value === concValue);
        if (concOption) {
          this.selectedConcentracion = concValue as number;
        } else if (concValue !== null && concValue !== undefined) {
          this.selectedConcentracion = 'custom';
          this.concentracionCustom = concValue;
        }

        // Tinción horas
        const thValue = item.tincionHoras ? parseFloat(item.tincionHoras) : null;
        const thOption = this.tincionHsOptions.find(o => o.value === thValue);
        if (thOption) {
          this.selectedTincionHs = thValue as number;
        } else if (thValue !== null && thValue !== undefined) {
          this.selectedTincionHs = 'custom';
          this.tincionHsCustom = thValue;
        }

        // Tinción grados (ingreso manual)
        this.tincionC = item.tincionGrados ? parseFloat(item.tincionGrados) : null;

        // Fecha - convertir cualquier formato a yyyy-MM-dd para el input HTML
        if (item.fecha) {
          try {
            // Crear objeto Date desde cualquier formato
            const dateObj = new Date(item.fecha);

            // Verificar que la fecha es válida
            if (isNaN(dateObj.getTime())) {
              console.warn('Fecha inválida recibida:', item.fecha);
              this.fecha = null;
            } else {
              // Convertir a formato yyyy-MM-dd
              this.fecha = dateObj.toISOString().split('T')[0];
              console.log('Fecha convertida para input HTML:', this.fecha);
            }
          } catch (error) {
            console.warn('Error convirtiendo fecha:', error, 'Valor original:', item.fecha);
            this.fecha = null;
          }
        } else {
          this.fecha = null;
        }

        this.estandar = item.estandar || false;
        this.repetido = item.repetido || false;
        // Guardar valores originales para deshabilitar checkboxes si ya están marcados
        this.estandarOriginal = item.estandar || false;
        this.repetidoOriginal = item.repetido || false;

        this.comentarios = item.observaciones || '';

        // Cargar promedios redondeados si existen
        if (item.promedio) {
          this.promedioViablesRedondeado = parseFloat(item.promedio);
        }
        if ((item as any).promedioNoViables) {
          this.promedioNoViablesRedondeado = parseFloat((item as any).promedioNoViables);
        }
        if ((item as any).promedioDuras) {
          this.promedioDurasRedondeado = parseFloat((item as any).promedioDuras);
        }

        // ===== CARGAR SEGUNDO CONJUNTO DE DATOS =====
        this.cantidadSemillas2 = (item as any).nroSemillasPorRepeticion2 ?? null;

        if ((item as any).pretratamiento2) {
          const pretratamientoValue2 = String((item as any).pretratamiento2);
          const ptOption2 = this.pretratamientoOptions.find(o => o.value === pretratamientoValue2);
          if (ptOption2) {
            this.selectedPretratamiento2 = pretratamientoValue2;
          } else {
            this.selectedPretratamiento2 = null;
          }
        } else {
          this.selectedPretratamiento2 = null;
        }

        const concValue2 = (item as any).concentracion2 ? parseFloat((item as any).concentracion2) : null;
        const concOption2 = this.concentracionOptions.find(o => o.value === concValue2);
        if (concOption2) {
          this.selectedConcentracion2 = concValue2 as number;
        } else if (concValue2 !== null && concValue2 !== undefined) {
          this.selectedConcentracion2 = 'custom';
          this.concentracionCustom2 = concValue2;
        }

        const thValue2 = (item as any).tincionHoras2 ? parseFloat((item as any).tincionHoras2) : null;
        const thOption2 = this.tincionHsOptions.find(o => o.value === thValue2);
        if (thOption2) {
          this.selectedTincionHs2 = thValue2 as number;
        } else if (thValue2 !== null && thValue2 !== undefined) {
          this.selectedTincionHs2 = 'custom';
          this.tincionHsCustom2 = thValue2;
        }

        this.tincionC2 = (item as any).tincionGrados2 ? parseFloat((item as any).tincionGrados2) : null;

        if ((item as any).fecha2) {
          try {
            const dateObj2 = new Date((item as any).fecha2);
            if (isNaN(dateObj2.getTime())) {
              console.warn('Fecha2 inválida recibida:', (item as any).fecha2);
              this.fecha2 = null;
            } else {
              this.fecha2 = dateObj2.toISOString().split('T')[0];
              console.log('Fecha2 convertida para input HTML:', this.fecha2);
            }
          } catch (error) {
            console.warn('Error convirtiendo fecha2:', error, 'Valor original:', (item as any).fecha2);
            this.fecha2 = null;
          }
        } else {
          this.fecha2 = null;
        }

        // Si hay datos de daños en el DTO, los cargamos en la primera tabla R1
        const d = this.detalles[0];
        if (d) {
          d.viablesSinDefectos.total = item.viables ? parseFloat(item.viables) : 0; // mapeo aproximado si aplica
          d.noViables.total = item.noViables ? parseFloat(item.noViables) : 0;
          // Si existiera un mapeo más preciso de daños (mecánico, ambiente, etc.) en el DTO, se asignaría aquí.
          d.viablesSinDefectos.mecanico = item.daniosMecanicos ?? 0;
          d.viablesSinDefectos.ambiente = item.danioAmbiente ?? 0;
          d.viablesSinDefectos.chinches = item.daniosChinches ?? 0;
          d.viablesSinDefectos.fracturas = item.daniosFracturas ?? 0;
          d.viablesSinDefectos.otros = item.daniosOtros ?? 0;
          d.viablesSinDefectos.duras = item.daniosDuras ?? 0;
        }

        // Cargar reporte desde el backend si existe
        if (item.reporte) {
          this.reporte = item.reporte;
        } else {
          // Inicializar reporte con valores por defecto
          this.reporte = {
            vigorAlto: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
            vigorMedio: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
            vigorBajo: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
            limiteCritico: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
            noViables: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
            viabilidad: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
            vigorAcumulado: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } }
          };
        }
        // Inicializar cálculos automáticos del reporte
        this.actualizarCalculosReporte();

        // Cargar repeticiones y detalles desde el backend
        this.cargarRepeticiones(id);
        this.cargarDetalles(id);

        // Log de verificación de datos cargados
        console.log('=== DATOS CARGADOS PARA EDICIÓN ===');
        console.log('Cantidad de semillas:', this.cantidadSemillas);
        console.log('Pretratamiento seleccionado:', this.selectedPretratamiento);
        console.log('Concentración:', this.selectedConcentracion);
        console.log('Tinción horas:', this.selectedTincionHs);
        console.log('Tinción grados:', this.tincionC);
        console.log('Fecha:', this.fecha);
        console.log('Repetido:', this.repetido);
        console.log('Repeticiones:', this.repeticiones);
        console.log('Detalles:', this.detalles);
      },
      error: (err) => {
        console.error('Error obteniendo Tetrazolio:', err);
        this.cargarDatos();
      }
    });
  }

  private cargarRepeticiones(tetrazolioId: number) {
    this.tetrazolioService.listarRepeticiones(tetrazolioId).subscribe({
      next: (repeticiones) => {
        console.log('Repeticiones cargadas:', repeticiones);
        if (repeticiones && repeticiones.length > 0) {
          // Convertir DTOs a la interfaz local
          this.repeticiones = repeticiones.map(rep => ({
            numero: rep.numero,
            viables: rep.viables,
            noViables: rep.noViables,
            duras: rep.duras
          }));

          // Mantener las repeticiones del backend para edición
          this.repeticionesEntries = repeticiones.map(rep => ({...rep}));
        } else {
          // Si no hay repeticiones, mantener la estructura por defecto
          this.repeticiones = [{ numero: 1, viables: 0, noViables: 0, duras: 0 }];
          this.repeticionesEntries = [];
        }
      },
      error: (err) => {
        console.error('Error obteniendo repeticiones:', err);
        // Mantener estructura por defecto en caso de error
        this.repeticiones = [{ numero: 1, viables: 0, noViables: 0, duras: 0 }];
        this.repeticionesEntries = [];
      }
    });
  }

  private cargarDetalles(tetrazolioId: number) {
    this.tetrazolioService.listarDetalles(tetrazolioId).subscribe({
      next: (detDtos: any[]) => {
        console.log('Detalles cargados:', detDtos);
        if (detDtos && detDtos.length > 0) {
          this.detalles = detDtos
            .sort((a, b) => (a.numeroTabla || 0) - (b.numeroTabla || 0))
            .map(dto => ({
              viablesSinDefectos: { total: dto.vsd_total || 0, mecanico: dto.vsd_mecanico || 0, ambiente: dto.vsd_ambiente || 0, chinches: dto.vsd_chinches || 0, fracturas: dto.vsd_fracturas || 0, otros: dto.vsd_otros || 0, duras: dto.vsd_duras || 0 },
              viablesLeves:        { total: dto.vl_total || 0,  mecanico: dto.vl_mecanico || 0,  ambiente: dto.vl_ambiente || 0,  chinches: dto.vl_chinches || 0,  fracturas: dto.vl_fracturas || 0,  otros: dto.vl_otros || 0,  duras: dto.vl_duras || 0 },
              viablesModerados:    { total: dto.vm_total || 0,  mecanico: dto.vm_mecanico || 0,  ambiente: dto.vm_ambiente || 0,  chinches: dto.vm_chinches || 0,  fracturas: dto.vm_fracturas || 0,  otros: dto.vm_otros || 0,  duras: dto.vm_duras || 0 },
              viablesSeveros:      { total: dto.vs_total || 0,  mecanico: dto.vs_mecanico || 0,  ambiente: dto.vs_ambiente || 0,  chinches: dto.vs_chinches || 0,  fracturas: dto.vs_fracturas || 0,  otros: dto.vs_otros || 0,  duras: dto.vs_duras || 0 },
              noViables:           { total: dto.nv_total || 0,  mecanico: dto.nv_mecanico || 0,  ambiente: dto.nv_ambiente || 0,  chinches: dto.nv_chinches || 0,  fracturas: dto.nv_fracturas || 0,  otros: dto.nv_otros || 0,  duras: dto.nv_duras || 0 },
            }));
        } else {
          this.detalles = [this.crearDetalleVacio()];
        }
        // Actualizar reporte automáticamente después de cargar detalles
        this.actualizarCalculosReporte();
      },
      error: (err) => {
        console.error('Error obteniendo detalles:', err);
        this.detalles = [this.crearDetalleVacio()];
        // Actualizar reporte incluso en caso de error
        this.actualizarCalculosReporte();
      }
    });
  }

  private cargarDatos() {
    console.log('Modo creación - limpiando campos');
    // Limpiar campos para creación
    this.estandar = false;
    this.repetido = false;
    this.estandarOriginal = false;
    this.repetidoOriginal = false;
    this.cantidadSemillas = null;
    this.selectedPretratamiento = null;
    this.pretratamientoCustom = '';
    this.selectedConcentracion = null;
    this.concentracionCustom = null;
    this.selectedTincionHs = null;
    this.tincionHsCustom = null;
  this.tincionC = null;
    this.fecha = null;
    this.repeticiones = [
      { numero: 1, viables: 0, noViables: 0, duras: 0 }
    ];
    this.detalles = [this.crearDetalleVacio()];
    // Inicializar reporte con valores por defecto
    this.reporte = {
      vigorAlto: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
      vigorMedio: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
      vigorBajo: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
      limiteCritico: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
      noViables: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
      viabilidad: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
      vigorAcumulado: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } }
    };
    // Inicializar cálculos automáticos del reporte
    this.actualizarCalculosReporte();
  }

  onSubmit() {
    // Prevenir doble envío

    if (this.manejarProblemas()) {
      // Hay errores: cancelar envío y permitir correcciones
      this.isSubmitting = false;
      return;
    }

    if (this.isSubmitting) {
      console.warn('Ya se está procesando una solicitud, ignorando...');
      return;
    }

    this.isSubmitting = true;
    this.errores = [];
    console.log('Iniciando envío del formulario...');

    // Sincronizar repeticiones a repeticionesEntries antes de enviar
    this.repeticionesEntries = this.repeticiones.map((rep, index) => ({
      id: this.repeticionesEntries[index]?.id || null,
      numero: rep.numero,
      viables: rep.viables,
      noViables: rep.noViables,
      duras: rep.duras,
      tetrazolioId: this.editingId
    }));

    const tetrazolioData: Partial<TetrazolioDto> = {
      repeticion: this.repeticiones.length > 0 ? this.repeticiones[0].numero : 1,
      viables: this.getTotalViables(),
      noViables: this.getTotalNoViables(),
      duras: this.getTotalDuras(),
      total: (parseFloat(this.getTotalViables()) + parseFloat(this.getTotalNoViables()) + parseFloat(this.getTotalDuras())).toString(),
      promedio: this.promedioViablesRedondeado.toString(),
      promedioNoViables: this.promedioNoViablesRedondeado.toString(),
      promedioDuras: this.promedioDurasRedondeado.toString(),
      estandar: this.estandar || false,
      repetido: this.repetido || false,
      activo: true,
      reciboId: this.reciboId ? parseInt(this.reciboId) : null,
      observaciones: this.comentarios || null,
      fechaRepeticion: null, 
    };

    // Agregar ID para edición
    if (this.isEditing && this.editingId) {
      tetrazolioData.id = this.editingId;
      // PMS-style: Si repetido pasa de false a true, guardar fecha de edición
      if (!this.repetidoOriginal && this.repetido) {
        tetrazolioData.fechaRepeticion = new Date().toISOString().split('T')[0];
      } else {
        tetrazolioData.fechaRepeticion = null;
      }
    }

    // ===== PRIMER CONJUNTO DE DATOS =====
    // Siempre enviar estos campos (incluso si son null) para que se guarden correctamente
    (tetrazolioData as any).nroSemillasPorRepeticion = this.cantidadSemillas;

    // Pretratamiento
    if (this.selectedPretratamiento && this.selectedPretratamiento !== 'custom') {
      (tetrazolioData as any).pretratamiento = this.selectedPretratamiento;
    } else if (this.selectedPretratamiento === 'custom' && this.pretratamientoCustom.trim()) {
      (tetrazolioData as any).pretratamiento = 'OTRO';
    } else {
      (tetrazolioData as any).pretratamiento = null;
    }

    // Concentración
    const conc = this.selectedConcentracion === 'custom' ? this.concentracionCustom : this.selectedConcentracion;
    (tetrazolioData as any).concentracion = (conc !== null && conc !== undefined) ? conc.toString() : null;

    // Tinción horas
    const th = this.selectedTincionHs === 'custom' ? this.tincionHsCustom : this.selectedTincionHs;
    (tetrazolioData as any).tincionHoras = (th !== null && th !== undefined) ? th.toString() : null;

    // Tinción grados
    (tetrazolioData as any).tincionGrados = (this.tincionC !== null && this.tincionC !== undefined) ? this.tincionC.toString() : null;

    // Fecha - convertir string a Date para el backend
    if (this.fecha) {
      try {
        // Crear objeto Date desde el string yyyy-MM-dd
        // Usar UTC para evitar problemas de zona horaria
        const fechaDate = new Date(this.fecha + 'T00:00:00.000Z');
        (tetrazolioData as any).fecha = fechaDate;
        console.log('Fecha original (string):', this.fecha);
        console.log('Fecha convertida para envío (Date):', fechaDate);
        console.log('Fecha ISO string:', fechaDate.toISOString());
      } catch (error) {
        console.error('Error convirtiendo fecha:', error);
        console.log('Fecha original:', this.fecha);
      }
    } else {
      (tetrazolioData as any).fecha = null;
    }

    // ===== SEGUNDO CONJUNTO DE DATOS =====
    // Siempre enviar estos campos (incluso si son null) para que se guarden correctamente
    (tetrazolioData as any).nroSemillasPorRepeticion2 = this.cantidadSemillas2;

    // Pretratamiento 2
    if (this.selectedPretratamiento2 && this.selectedPretratamiento2 !== 'custom') {
      (tetrazolioData as any).pretratamiento2 = this.selectedPretratamiento2;
    } else if (this.selectedPretratamiento2 === 'custom' && this.pretratamientoCustom2.trim()) {
      (tetrazolioData as any).pretratamiento2 = 'OTRO';
    } else {
      (tetrazolioData as any).pretratamiento2 = null;
    }

    // Concentración 2
    const conc2 = this.selectedConcentracion2 === 'custom' ? this.concentracionCustom2 : this.selectedConcentracion2;
    (tetrazolioData as any).concentracion2 = (conc2 !== null && conc2 !== undefined) ? conc2.toString() : null;

    // Tinción horas 2
    const th2 = this.selectedTincionHs2 === 'custom' ? this.tincionHsCustom2 : this.selectedTincionHs2;
    (tetrazolioData as any).tincionHoras2 = (th2 !== null && th2 !== undefined) ? th2.toString() : null;

    // Tinción grados 2
    (tetrazolioData as any).tincionGrados2 = (this.tincionC2 !== null && this.tincionC2 !== undefined) ? this.tincionC2.toString() : null;

    // Fecha 2
    if (this.fecha2) {
      try {
        const fechaDate2 = new Date(this.fecha2 + 'T00:00:00.000Z');
        (tetrazolioData as any).fecha2 = fechaDate2;
        console.log('Fecha2 original (string):', this.fecha2);
        console.log('Fecha2 convertida para envío (Date):', fechaDate2);
      } catch (error) {
        console.error('Error convirtiendo fecha2:', error);
      }
    } else {
      (tetrazolioData as any).fecha2 = null;
    }

    // Agregar reporte al DTO
    tetrazolioData.reporte = this.reporte;

    // Calcular y asignar viabilidadVigorTz basado en el porcentaje de viabilidad
    const porcentajeViabilidad = this.getViabilidadReportePct();
    if (!isNaN(porcentajeViabilidad) && porcentajeViabilidad > 0) {
      if (porcentajeViabilidad >= 75) {
        (tetrazolioData as any).viabilidadVigorTz = 'VIGOR_ALTO';
      } else if (porcentajeViabilidad >= 60) {
        (tetrazolioData as any).viabilidadVigorTz = 'VIGOR_MEDIO';
      } else if (porcentajeViabilidad >= 50) {
        (tetrazolioData as any).viabilidadVigorTz = 'VIGOR_BAJO';
      } else {
        (tetrazolioData as any).viabilidadVigorTz = 'LIMITE_CRITICO'; // < 50%
      }
      
      // Calcular porcentajeFinal (redondeado)
      (tetrazolioData as any).porcentajeFinal = Math.round(porcentajeViabilidad);
    } else {
      (tetrazolioData as any).viabilidadVigorTz = null;
      (tetrazolioData as any).porcentajeFinal = null;
    }

    console.log('=== PAYLOAD COMPLETO DE TETRAZOLIO ===');
    console.log('Datos completos a enviar:', JSON.stringify(tetrazolioData, null, 2));

    if (this.isEditing && this.editingId) {
      // Actualizar Tetrazolio existente
      console.log('=== INICIANDO ACTUALIZACIÓN DE TETRAZOLIO ===');
      console.log('ID del tetrazolio a actualizar:', this.editingId);
      console.log('Datos del tetrazolio a actualizar:', tetrazolioData);
      console.log('Cantidad de semillas:', this.cantidadSemillas);
      console.log('Pretratamiento seleccionado:', this.selectedPretratamiento);
      console.log('Concentración:', this.selectedConcentracion === 'custom' ? this.concentracionCustom : this.selectedConcentracion);
      console.log('Tinción horas:', this.selectedTincionHs === 'custom' ? this.tincionHsCustom : this.selectedTincionHs);
      console.log('Tinción grados:', this.tincionC);
      console.log('Fecha (string):', this.fecha);
      console.log('Fecha (Date):', tetrazolioData.fecha);
      console.log('Repeticiones:', this.repeticiones);
      console.log('Repeticiones entries:', this.repeticionesEntries);
      console.log('Detalles de semillas:', this.detalles);

      // Validaciones antes de actualizar
      if (this.manejarProblemas()) {
        console.error('VALIDACIONES FALLIDAS:', this.errores);
        // Restablecer estado de envío para reactivar los botones y mostrar errores en pantalla
        this.isSubmitting = false;
        return;
      }

      console.log('Validaciones pasadas correctamente');
      console.log('Enviando petición de actualización al backend...');
      console.log('Datos finales a enviar:', JSON.stringify(tetrazolioData, null, 2));

      this.tetrazolioService.editar(tetrazolioData as TetrazolioDto).subscribe({
        next: (res) => {
          console.log('Tetrazolio actualizado correctamente en el backend');
          console.log('Respuesta del servidor:', res);

          // Procesar repeticiones y detalles
          console.log('Procesando repeticiones y detalles...');
          this.procesarRepeticiones(this.editingId!)
            .then(() => this.procesarDetalles(this.editingId!))
            .then(() => {
              console.log('Repeticiones y detalles procesados correctamente');
              this.isSubmitting = false;

              const loteId = this.route.snapshot.paramMap.get('loteId');
              if (this.editingId != null) {
                this.logService.crearLog(loteId ? parseInt(loteId) : 0, Number(this.editingId), 'Tetrazolio', 'editado').subscribe();
              }

              this.safeNavigateToListado();
            })
            .catch(err => {
              console.error('Error procesando datos después de editar:', err);
              this.isSubmitting = false;
              this.safeNavigateToListado();
            });
        },
        error: (err) => {
          console.error('Error actualizando Tetrazolio en el backend:', err);
          console.error('Detalles del error:', {
            status: err.status,
            message: err.message,
            error: err.error
          });

          this.isSubmitting = false;

          let errorMessage = 'Error al actualizar el Tetrazolio.';
          if (err.error && err.error.message) {
            errorMessage = err.error.message;
          } else if (err.message) {
            errorMessage = err.message;
          }
          alert(errorMessage);
        }
      });
    } else {
      // Crear nuevo Tetrazolio
      console.log('=== INICIANDO CREACIÓN DE TETRAZOLIO ===');
      console.log('Datos del tetrazolio a crear:', tetrazolioData);
      console.log('Cantidad de semillas:', this.cantidadSemillas);
      console.log('Pretratamiento seleccionado:', this.selectedPretratamiento);
      console.log('Concentración:', this.selectedConcentracion === 'custom' ? this.concentracionCustom : this.selectedConcentracion);
      console.log('Tinción horas:', this.selectedTincionHs === 'custom' ? this.tincionHsCustom : this.selectedTincionHs);
      console.log('Tinción grados:', this.tincionC);
      console.log('Fecha (string):', this.fecha);
      console.log('Fecha (Date):', tetrazolioData.fecha);
      console.log('Repeticiones:', this.repeticiones);
      console.log('Repeticiones entries:', this.repeticionesEntries);
      console.log('Detalles de semillas:', this.detalles);

      // Validaciones antes de crear
      if (this.manejarProblemas()) {
        console.error('VALIDACIONES FALLIDAS:', this.errores);
        // Restablecer estado de envío para reactivar los botones y mostrar errores en pantalla
        this.isSubmitting = false;
        return;
      }

      console.log('Validaciones pasadas correctamente');

      (tetrazolioData as any).fechaCreacion = new Date();
      tetrazolioData.estandar = false;
      tetrazolioData.repetido = false;
      tetrazolioData.reciboId = this.reciboId ? parseInt(this.reciboId) : null;

      console.log('Enviando petición de creación al backend...');
      console.log('Datos finales a enviar:', JSON.stringify(tetrazolioData, null, 2));

      this.tetrazolioService.crear(tetrazolioData as TetrazolioDto).subscribe({
        next: (res) => {
          console.log('Tetrazolio creado correctamente en el backend');
          console.log('Respuesta del servidor:', res);

          const tetrazolioId = parseInt(res.split('ID:')[1]);
          console.log('ID del tetrazolio creado:', tetrazolioId);

          // Procesar repeticiones y detalles
          console.log('Procesando repeticiones y detalles...');
          this.procesarRepeticiones(tetrazolioId)
            .then(() => this.procesarDetalles(tetrazolioId))
            .then(() => {
              console.log('Repeticiones y detalles procesados correctamente');
              this.isSubmitting = false;

              const loteId = this.route.snapshot.paramMap.get('loteId');
              if (tetrazolioId != null) {
                this.logService.crearLog(loteId ? parseInt(loteId) : 0, Number(tetrazolioId), 'Tetrazolio', 'creado').subscribe();
              }

              this.safeNavigateToListado();
            })
            .catch(err => {
              console.error('Error procesando datos después de crear:', err);
              this.isSubmitting = false;
              this.safeNavigateToListado();
            });
        },
        error: (err) => {
          console.error('Error creando Tetrazolio en el backend:', err);
          console.error('Detalles del error:', {
            status: err.status,
            message: err.message,
            error: err.error
          });

          this.isSubmitting = false;

          let errorMessage = 'Error al crear el Tetrazolio.';
          if (err.error && err.error.message) {
            errorMessage = err.error.message;
          } else if (err.message) {
            errorMessage = err.message;
          }
          alert(errorMessage);
        }
      });
    }
  }

  validarFecha(fecha: string ): boolean {
    if (!fecha || fecha.trim() === '') {
      return false; 
    }
    // Normalizar fechas a solo año-mes-día para evitar problemas de hora
    const selectedDate = new Date(fecha + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Solo permitir fechas de hoy o anteriores (no futuras)
    return selectedDate <= today;
  }

  manejarProblemas(): boolean {
    this.errores = []; // Reiniciar errores
    this.advertencias = []; // Reiniciar advertencias

    // Validar cantidadSemillas
    if (this.cantidadSemillas !== null && this.cantidadSemillas !== undefined && this.cantidadSemillas < 0) {
      this.errores.push('La cantidad de semillas no puede ser negativa');
    }

    if (this.tincionC !== null && this.tincionC !== undefined && this.tincionC < 0) {
      this.errores.push('Los grados de tinción no pueden ser menores que cero');
    }

    // Validar repeticiones
    if ( this.repeticiones.length > 0) {

      // Validar que todas las repeticiones tengan datos válidos
      this.repeticiones.forEach((rep, index) => {
        if (rep.viables < 0 || rep.noViables < 0 || rep.duras < 0) {
          this.errores.push(`La repetición ${index + 1} tiene valores negativos. Los valores no pueden ser menores que cero`);
        }

        // ADVERTENCIA: Verificar si la suma de viables + noViables + duras supera cantidadSemillas (PRIMER select)
        if (this.cantidadSemillas !== null && this.cantidadSemillas !== undefined) {
          const sumaRepeticion = (rep.viables || 0) + (rep.noViables || 0) + (rep.duras || 0);
          if (sumaRepeticion > this.cantidadSemillas) {
            this.advertencias.push(`⚠️ Repetición ${index + 1}: La suma de semillas (${sumaRepeticion}) supera la cantidad del primer parámetro (${this.cantidadSemillas})`);
          }
        }
      });
    }

    // Validar detalles de semillas
    if (!this.detalles || this.detalles.length === 0) {
      this.errores.push('Debe tener al menos una tabla de detalles de semillas');
    } else {
      // Validar que todos los valores en detalles sean >= 0
      this.detalles.forEach((det, tablaIndex) => {
        const categorias: Array<{nombre: string, categoria: DetalleCategoria}> = [
          { nombre: 'viables sin defectos', categoria: det.viablesSinDefectos },
          { nombre: 'viables leves', categoria: det.viablesLeves },
          { nombre: 'viables moderados', categoria: det.viablesModerados },
          { nombre: 'viables severos', categoria: det.viablesSeveros },
          { nombre: 'no viables', categoria: det.noViables }
        ];

        categorias.forEach(cat => {
          if (cat.categoria.total < 0 || cat.categoria.mecanico < 0 ||
              cat.categoria.ambiente < 0 || cat.categoria.chinches < 0 ||
              cat.categoria.fracturas < 0 || cat.categoria.otros < 0 ||
              cat.categoria.duras < 0) {
            this.errores.push(`La tabla ${tablaIndex + 1} en ${cat.nombre} tiene valores negativos. Los valores no pueden ser menores que cero`);
          }
        });

        // ADVERTENCIA: Verificar si la suma total de semillas supera cantidadSemillas2 (SEGUNDO select)
        if (this.cantidadSemillas2 !== null && this.cantidadSemillas2 !== undefined) {
          const sumaDetalle = this.getSumaTotal(det);
          if (sumaDetalle > this.cantidadSemillas2) {
            this.advertencias.push(`⚠️ Tabla Detalle de semillas y Daños ${tablaIndex + 1}: La suma de semillas (${sumaDetalle}) supera la cantidad del segundo parámetro (${this.cantidadSemillas2})`);
          }
        }
      });
    }

    return this.errores.length > 0;
  }

  private async procesarRepeticiones(tetrazolioId: number): Promise<void> {
    console.log('Procesando repeticiones para tetrazolio ID:', tetrazolioId);
    console.log('Repeticiones entries antes del mapeo:', this.repeticionesEntries);

    const payload: RepeticionTetrazolioDto[] = this.repeticionesEntries.map((r) => ({
      ...r,
      tetrazolioId: tetrazolioId
    }));

    console.log('Payload de repeticiones a enviar:', payload);
    console.log('Cantidad de repeticiones:', payload.length);

    return new Promise((resolve, reject) => {
      if (!payload || payload.length === 0) {
        console.log('No hay repeticiones para procesar, continuando...');
        return resolve();
      }

      console.log('Enviando repeticiones al backend...');
      // Usar el método apropiado según el modo (creación vs edición)
      if (this.isEditing) {
        this.tetrazolioService.actualizarRepeticiones(tetrazolioId, payload).subscribe({
          next: (resp) => {
            console.log('Repeticiones actualizadas exitosamente en el backend');
            console.log('Respuesta del servidor:', resp);
            resolve();
          },
          error: (err) => {
            console.error('Error actualizando repeticiones:', err);
            console.error('Detalles del error:', {
              status: err.status,
              message: err.message,
              error: err.error
            });
            reject(err);
          }
        });
      } else {
        // Para creación, usar el mismo método pero con lógica diferente
        this.tetrazolioService.actualizarRepeticiones(tetrazolioId, payload).subscribe({
          next: (resp) => {
            console.log('Repeticiones creadas exitosamente en el backend');
            console.log('Respuesta del servidor:', resp);
            resolve();
          },
          error: (err) => {
            console.error('Error creando repeticiones:', err);
            console.error('Detalles del error:', {
              status: err.status,
              message: err.message,
              error: err.error
            });
            reject(err);
          }
        });
      }
    });
  }

  private async procesarDetalles(tetrazolioId: number): Promise<void> {
    console.log('Procesando detalles para tetrazolio ID:', tetrazolioId);

    const payload = this.detalles.map((d, idx) => ({
      id: null,
      tetrazolioId,
      numeroTabla: idx + 1,
      vsd_total: d.viablesSinDefectos.total,
      vsd_mecanico: d.viablesSinDefectos.mecanico,
      vsd_ambiente: d.viablesSinDefectos.ambiente,
      vsd_chinches: d.viablesSinDefectos.chinches,
      vsd_fracturas: d.viablesSinDefectos.fracturas,
      vsd_otros: d.viablesSinDefectos.otros,
      vsd_duras: d.viablesSinDefectos.duras,
      vl_total: d.viablesLeves.total,
      vl_mecanico: d.viablesLeves.mecanico,
      vl_ambiente: d.viablesLeves.ambiente,
      vl_chinches: d.viablesLeves.chinches,
      vl_fracturas: d.viablesLeves.fracturas,
      vl_otros: d.viablesLeves.otros,
      vl_duras: d.viablesLeves.duras,
      vm_total: d.viablesModerados.total,
      vm_mecanico: d.viablesModerados.mecanico,
      vm_ambiente: d.viablesModerados.ambiente,
      vm_chinches: d.viablesModerados.chinches,
      vm_fracturas: d.viablesModerados.fracturas,
      vm_otros: d.viablesModerados.otros,
      vm_duras: d.viablesModerados.duras,
      vs_total: d.viablesSeveros.total,
      vs_mecanico: d.viablesSeveros.mecanico,
      vs_ambiente: d.viablesSeveros.ambiente,
      vs_chinches: d.viablesSeveros.chinches,
      vs_fracturas: d.viablesSeveros.fracturas,
      vs_otros: d.viablesSeveros.otros,
      vs_duras: d.viablesSeveros.duras,
      nv_total: d.noViables.total,
      nv_mecanico: d.noViables.mecanico,
      nv_ambiente: d.noViables.ambiente,
      nv_chinches: d.noViables.chinches,
      nv_fracturas: d.noViables.fracturas,
      nv_otros: d.noViables.otros,
      nv_duras: d.noViables.duras,
      activo: true
    }));

    return new Promise((resolve, reject) => {
      if (!payload || payload.length === 0) {
        console.log('No hay detalles para procesar, continuando...');
        return resolve();
      }

      this.tetrazolioService.actualizarDetalles(tetrazolioId, payload).subscribe({
        next: (resp) => {
          console.log('Detalles guardados/actualizados:', resp);
          resolve();
        },
        error: (err) => {
          console.error('Error guardando detalles:', err);
          reject(err);
        }
      });
    });
  }

  private safeNavigateToListado() {
    console.log('Navegando al listado...');
    console.log('Lote ID:', this.loteId);
    console.log('Recibo ID:', this.reciboId);

    if (this.loteId && this.reciboId) {
      const ruta = `/${this.loteId}/${this.reciboId}/listado-tetrazolio`;
      console.log('Navegando a:', ruta);
      this.router.navigate([ruta]);
    } else {
      console.log('Navegando a home (no hay loteId o reciboId)');
      this.router.navigate(['/home']);
    }
  }

  onCancel() {
    this.safeNavigateToListado();
  }

  
}

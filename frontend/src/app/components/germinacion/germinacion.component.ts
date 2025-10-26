import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { GerminacionTablasService } from '../../../services/GerminacionTablasService';
import { GerminacionService } from '../../../services/GerminacionService';
import { ConteoGerminacionDto } from '../../../models/ConteoGerminacion.dto';
import { NormalPorConteoDto } from '../../../models/NormalPorConteo.dto';
import { RepeticionFinalDto } from '../../../models/RepeticionFinal.dto';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface RepeticionGerminacion {
  numero: number;
  normales: number[]; // 5 valores
  anormales: number;
  duras: number;
  frescas: number;
  muertas: number;
}

@Component({
  selector: 'app-germinacion.component',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    MultiSelectModule,
    TableModule
  ],
  templateUrl: './germinacion.component.html',
  styleUrl: './germinacion.component.scss'
})
export class GerminacionComponent implements OnInit {
  // Variables para manejar navegación
  loteId: string | null = '';
  reciboId: string | null = '';
  
  inia = { pNormales: 0, pAnormales: 0, duras: 0, frescas: 0, muertas: 0, germinacion: 0 };
  inase = { pNormales: 0, pAnormales: 0, duras: 0, frescas: 0, muertas: 0, germinacion: 0 };
  repeticiones: RepeticionGerminacion[] = [];
  private tratamientoSemillasAnterior: string = 'sin curar';

  onTratamientoChange(): void {
    console.log('=== VALIDACION: Cambio de tratamiento detectado ===');
    console.log('VALIDACION: Tratamiento anterior:', this.tratamientoSemillasAnterior);
    console.log('VALIDACION: Tratamiento actual:', this.tratamientoSemillas);
    
    // Normalizar a clave backend (SIN_CURAR | CURADA_PLANTA | CURADA_LABORATORIO)
    const prevKey = this.mapUiTablaToKey(this.tratamientoSemillasAnterior);
    const currKey = this.mapUiTablaToKey(this.tratamientoSemillas);
    
    console.log('VALIDACION: Clave anterior normalizada:', prevKey);
    console.log('VALIDACION: Clave actual normalizada:', currKey);

    // Guardar solo repeticiones del tratamiento anterior
    if (prevKey) {
      this.tratamientosData[prevKey] = this.tratamientosData[prevKey] || {
        comentarios: '', numSemillas: '', metodo: '', temperatura: '', preFrio: '', preTratamiento: '', productoDosis: '',
        fechas: { inicio: '', conteos: [] }, inia: {}, inase: {}, repeticiones: []
      } as any;
      this.tratamientosData[prevKey].repeticiones = JSON.parse(JSON.stringify(this.repeticiones));
    }

    // Cargar repeticiones del tratamiento seleccionado
    const data = this.tratamientosData[currKey];
    if (data && Array.isArray(data.repeticiones) && data.repeticiones.length > 0) {
      this.repeticiones = JSON.parse(JSON.stringify(data.repeticiones));
    } else {
      this.repeticiones = [this.nuevaRepeticion(1)];
      this.repeticiones[0].normales = Array(this.fechas.conteos.length).fill(0);
    }
    this.syncNormalesConConteos();
    // Actualizar el valor anterior (mantener etiqueta UI para el selector pero normalizamos al leer)
    this.tratamientoSemillasAnterior = this.tratamientoSemillas;
  }
  // Promedio global de normales (sin redondeo)
  getPromedioNormalesGlobal(): number {
    let total = 0;
    let count = 0;
    this.repeticiones.forEach(rep => {
      rep.normales.forEach(val => {
        total += val;
        count++;
      });
    });
    return count > 0 ? total / count : 0;
  }
  // Promedios manuales
  promedioManualNormales: number[] = [];
  promedioManualAnormales: number = 0;
  promedioManualDuras: number = 0;
  promedioManualFrescas: number = 0;
  promedioManualMuertas: number = 0;
  promedioManualTotal: number = 0;

  // Métodos para promedios redondeados
  getPromedioNormalesRedondeado(n: number): number {
    return Math.round(this.getPromedioNormales(n));
  }
  getPromedioAnormalesRedondeado(): number {
    return Math.round(this.getPromedioAnormales());
  }
  getPromedioDurasRedondeado(): number {
    return Math.round(this.getPromedioDuras());
  }
  getPromedioFrescasRedondeado(): number {
    return Math.round(this.getPromedioFrescas());
  }
  getPromedioMuertasRedondeado(): number {
    return Math.round(this.getPromedioMuertas());
  }
  getPromedioTotalRedondeado(): number {
    return Math.round(this.getPromedioTotal());
  }
  // Sincroniza el tamaño del array normales en cada repetición con la cantidad de conteos
  syncNormalesConConteos() {
    // Sincronizar array de promedios manuales
    while (this.promedioManualNormales.length < this.fechas.conteos.length) {
      this.promedioManualNormales.push(0);
    }
    while (this.promedioManualNormales.length > this.fechas.conteos.length) {
      this.promedioManualNormales.pop();
    }
    const conteosLength = this.fechas.conteos.length;
    this.repeticiones.forEach(rep => {
      while (rep.normales.length < conteosLength) {
        rep.normales.push(0);
      }
      while (rep.normales.length > conteosLength) {
        rep.normales.pop();
      }
    });
  }

  // Variables para manejar navegación
  isEditing: boolean = false;
  editingId: number | null = null;

  diasPreFrio: string[] = Array.from({length: 13}, (_, i) => `${i+3} dias`); // 3 a 15 días
  tratamientoSemillas: string = 'sin curar';

  // Estructura para almacenar los datos por tratamiento
  tratamientosData: {[key: string]: {
    comentarios: string;
    numSemillas: string;
    metodo: string;
    temperatura: string;
    preFrio: string;
    preTratamiento: string;
    productoDosis: string;
    fechas: any;
    inia: any;
    inase: any;
    repeticiones: RepeticionGerminacion[];
  }} = {};

  // Variables actuales (se actualizan según el tratamiento seleccionado)
  comentarios: string = '';
  numSemillas: string = '';
  metodo: string = '';
  temperatura: string = '';
  preFrio: string = '';
  preTratamiento: string = '';
  productoDosis: string = '';
  fechas = {
    inicio: '',
    conteos: [''],
    get totalDias() {
      const fechasConteo = this.conteos.filter(f => !!f);
      if (!this.inicio || fechasConteo.length === 0) return '';
      const inicio = new Date(this.inicio);
      const ultima = new Date(fechasConteo[fechasConteo.length - 1]);
      if (isNaN(inicio.getTime()) || isNaN(ultima.getTime())) return '';
      const diff = Math.ceil((ultima.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0 ? diff : '';
    }
  };
  // Las variables actuales ya están declaradas arriba, eliminamos duplicados
    // Fecha de salida de pre-frío calculada
    get fechaSalidaPreFrio(): string {
      if (!this.fechas.inicio || this.preFrio === 'No') return '';
      const diasMatch = this.preFrio.match(/(\d+)/);
      const dias = diasMatch ? parseInt(diasMatch[1], 10) : 0;
      if (dias === 0) return '';
      const fechaInicio = new Date(this.fechas.inicio);
      if (isNaN(fechaInicio.getTime())) return '';
      fechaInicio.setDate(fechaInicio.getDate() + dias + 1);
      const dd = String(fechaInicio.getDate()).padStart(2, '0');
      const mm = String(fechaInicio.getMonth() + 1).padStart(2, '0');
      const yyyy = fechaInicio.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    }

      // N° de Dias: suma de totalDias y días de pre-frío
      get numeroDias(): number {
        const totalDias = Number(this.fechas.totalDias) || 0;
        if (!this.preFrio || this.preFrio === 'No') return totalDias;
        const diasMatch = this.preFrio.match(/(\d+)/);
        const diasPreFrio = diasMatch ? parseInt(diasMatch[1], 10) : 0;
        return totalDias + diasPreFrio;
      }

  addConteo() {
  this.fechas.conteos.push('');
  this.syncNormalesConConteos();
  }

  removeConteo(index: number) {
    if (this.fechas.conteos.length > 1) {
      this.fechas.conteos.splice(index, 1);
      this.syncNormalesConConteos();
    }
  }

  // Datos de prueba (deberían venir de un servicio)
  private itemsData: any[] = [
    {
      id: 1,
      comentarios: 'Control de calidad mensual - Muestra estándar',
      numSemillas: '50',
      metodo: 'A',
      temperatura: '20°C',
      preFrio: 'No',
      preTratamiento: 'No',
      productoDosis: 'Producto X',
      tratamientoSemillas: 'sin curar',
      fechas: {
    inicio: '2023-01-15',
    conteos: ['2023-01-16', '2023-01-17']
      },
      inia: { pNormales: 80, pAnormales: 0, duras: 2, frescas: 1, muertas: 0, germinacion: 96 },
      inase: { pNormales: 85, pAnormales: 0, duras: 1, frescas: 2, muertas: 0, germinacion: 98 },
      repeticiones: [
        { numero: 1, normales: [10,12,0,0,0], anormales: 0, duras: 2, frescas: 1, muertas: 0 }
      ]
    }
    // ...otros datos de prueba
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tablasSvc: GerminacionTablasService,
    private germSvc: GerminacionService
  ) {
    // Inicializar con 1 repetición por defecto
    this.repeticiones.push(this.nuevaRepeticion(1));
    // Inicializar datos para el tratamiento inicial
    this.onTratamientoChange();
  }

  ngOnInit() {
    console.log('=== VALIDACION: Inicializando componente Germinacion ===');
    
    // Inicializar variables de navegación
    this.loteId = this.route.snapshot.paramMap.get('loteId');
    this.reciboId = this.route.snapshot.paramMap.get('reciboId');
    console.log('VALIDACION OK: Variables de navegación inicializadas - loteId:', this.loteId, 'reciboId:', this.reciboId);
    
    this.syncNormalesConConteos();
    console.log('VALIDACION OK: Sincronización de normales con conteos completada');
    
    this.onTratamientoChange();
    console.log('VALIDACION OK: Cambio de tratamiento inicial procesado');
    
    this.route.params.subscribe((params: any) => {
      console.log('VALIDACION: Parámetros de ruta recibidos:', params);
      
      if (params['id']) {
        console.log('VALIDACION: Modo edición detectado, ID:', params['id']);
        this.isEditing = true;
        this.editingId = parseInt(params['id']);
        
        if (isNaN(this.editingId) || this.editingId <= 0) {
          console.error('VALIDACION ERROR: ID de edición no válido:', params['id']);
          return;
        }
        
        console.log('VALIDACION OK: ID de edición válido:', this.editingId);
        this.cargarDatosParaEdicion(this.editingId);
        // Cargar resumen desde backend para esta germinación
        this.cargarResumenBackend(this.editingId);
      } else {
        this.isEditing = false;
        this.editingId = null;
        this.cargarDatos();
      }
    });
  }

  private mapUiTablaToKey(tablaUi: string): string {
    const t = (tablaUi || '').trim().toLowerCase();
    if (t.includes('sin')) return 'SIN_CURAR';
    if (t.includes('planta')) return 'CURADA_PLANTA';
    if (t.includes('labor')) return 'CURADA_LABORATORIO';
    return 'SIN_CURAR';
  }

  private mapKeyToUiTabla(key: string | null | undefined): string {
    const k = String(key || '').toUpperCase();
    if (k === 'CURADA_PLANTA') return 'curada planta';
    if (k === 'CURADA_LABORATORIO') return 'curada laboratorio';
    return 'sin curar';
  }

  private mapPreFrioToEnum(val: string | null | undefined): 'PREFRIO' | 'SIN_PREFRIO' | null {
    const v = (val || '').trim().toLowerCase();
    if (!v || v === 'no') return 'SIN_PREFRIO';
    return 'PREFRIO';
  }

  private mapPreTratamientoToEnum(val: string | null | undefined): 'NINGUNO' | 'ESCARIFICADO' | 'OTRO' | null {
    const v = (val || '').trim().toLowerCase();
    if (!v || v === 'no' || v === 'ninguno') return 'NINGUNO';
    // No tenemos un mapeo exacto para KNO3/GA3/Pre-lavado/Pre-secado en el enum backend; usar OTRO
    if (v.includes('escarific')) return 'ESCARIFICADO';
    return 'OTRO';
  }

  private parseTemperaturaToFloat(val: string | null | undefined): number | null {
    const s = (val || '').toString();
    const match = s.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      const num = parseFloat(match[1]);
      return isNaN(num) ? null : num;
    }
    return null;
  }

  private toDateOnlyString(value: any): string {
    if (!value) return '';
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return '';
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    } catch {
      return '';
    }
  }

  cargarResumenBackend(germinacionId: number) {
    console.log('=== VALIDACION: Cargando resumen desde backend ===');
    console.log('VALIDACION: ID de germinación:', germinacionId);
    
    if (!germinacionId || germinacionId <= 0) {
      console.error('VALIDACION ERROR: ID no válido para cargar resumen');
      return;
    }
    
    this.tablasSvc.getResumen(germinacionId).subscribe({
      next: (res: any) => {
        console.log('VALIDACION OK: Resumen obtenido del backend:', res);
        const conteos: ConteoGerminacionDto[] = res?.conteos ?? [];
        const conteosLen = (conteos?.length || 0) > 0 ? conteos.length : 1;
        const conteoIds = (conteos ?? []).map(c => c.id as number).filter(Boolean);
        // Fechas de conteo formateadas a YYYY-MM-DD
        const fechasConteo = Array.from({ length: conteosLen }, (_, i) => {
          const c = conteos[i];
          return (c && (c as any).fechaConteo) ? this.toDateOnlyString((c as any).fechaConteo) : '';
        });
        this.fechas.conteos = [...fechasConteo];
        this.syncNormalesConConteos();

        // Helper para construir repeticiones desde finales + normales
        const buildReps = (tablaKey: string): RepeticionGerminacion[] => {
          let finales: RepeticionFinalDto[] = [];
          let normalesPorConteo: Record<number, NormalPorConteoDto[]> = {} as any;
          if (tablaKey === 'SIN_CURAR') {
            finales = res?.finalesSinCurar ?? [];
          } else if (tablaKey === 'CURADA_PLANTA') {
            finales = res?.finalesCuradaPlanta ?? [];
          } else if (tablaKey === 'CURADA_LABORATORIO') {
            finales = res?.finalesCuradaLaboratorio ?? [];
          }
          for (const cid of conteoIds) {
            if (tablaKey === 'SIN_CURAR') normalesPorConteo[cid] = res?.normalesSinCurar?.[cid] ?? [];
            else if (tablaKey === 'CURADA_PLANTA') normalesPorConteo[cid] = res?.normalesCuradaPlanta?.[cid] ?? [];
            else if (tablaKey === 'CURADA_LABORATORIO') normalesPorConteo[cid] = res?.normalesCuradaLaboratorio?.[cid] ?? [];
          }
          const reps: RepeticionGerminacion[] = [];
          for (const f of (finales || [])) {
            const rep: RepeticionGerminacion = {
              numero: (f.numeroRepeticion ?? 0) as number,
              normales: Array(conteosLen).fill(0),
              anormales: (f.anormal ?? 0) as number,
              duras: (f.duras ?? 0) as number,
              frescas: (f.frescas ?? 0) as number,
              muertas: (f.muertas ?? 0) as number,
            };
            conteoIds.forEach((cid, idx) => {
              const lista = normalesPorConteo[cid] || [];
              const celda = lista.find(n => (n.numeroRepeticion ?? -1) === rep.numero);
              rep.normales[idx] = (celda?.normal ?? 0) as number;
            });
            reps.push(rep);
          }
          if (reps.length === 0) {
            const r = this.nuevaRepeticion(1);
            r.normales = Array(conteosLen).fill(0);
            reps.push(r);
          }
          reps.sort((a, b) => (a.numero || 0) - (b.numero || 0));
          return reps;
        };

        // Construir datasets por cada tabla y guardarlos en tratamientosData
        const tablasKeys = ['SIN_CURAR', 'CURADA_PLANTA', 'CURADA_LABORATORIO'];
        for (const k of tablasKeys) {
          const repsK = buildReps(k);
          this.tratamientosData[k] = this.tratamientosData[k] || {
            comentarios: this.comentarios,
            numSemillas: this.numSemillas,
            metodo: this.metodo,
            temperatura: this.temperatura,
            preFrio: this.preFrio,
            preTratamiento: this.preTratamiento,
            productoDosis: this.productoDosis,
            fechas: { inicio: this.fechas.inicio, conteos: [...fechasConteo] },
            inia: { ...this.inia },
            inase: { ...this.inase },
            repeticiones: [] as RepeticionGerminacion[],
          };
          // Actualizar siempre conteos y repeticiones desde backend
          this.tratamientosData[k].fechas.conteos = [...fechasConteo];
          this.tratamientosData[k].repeticiones = JSON.parse(JSON.stringify(repsK));
        }

        // Reflejar en la UI el tratamiento actualmente seleccionado (usando clave backend)
        const selKey = this.mapUiTablaToKey(this.tratamientoSemillas);
        const dataSel = this.tratamientosData[selKey];
        if (dataSel) {
          this.fechas.conteos = [...dataSel.fechas.conteos];
          this.repeticiones = JSON.parse(JSON.stringify(dataSel.repeticiones));
        }
        this.syncNormalesConConteos();
      },
      error: (err) => {
        console.error('Error al cargar resumen de germinación', err);
      }
    });
  }

  crearConteoBackend() {
    console.log('=== VALIDACION: Creando conteo en backend ===');
    
    if (!this.editingId) {
      console.error('VALIDACION ERROR: No hay ID de edición para crear conteo');
      return;
    }
    
    console.log('VALIDACION OK: ID de edición válido para crear conteo:', this.editingId);
    this.tablasSvc.addConteo(this.editingId).subscribe({
      next: (_) => {
        console.log('VALIDACION OK: Conteo creado exitosamente en backend');
        this.cargarResumenBackend(this.editingId!);
      },
      error: (err) => {
        console.error('VALIDACION ERROR: Error creando conteo en backend:', err);
      }
    });
  }

  crearRepeticionBackend(auto = true, numero?: number) {
    console.log('=== VALIDACION: Creando repetición en backend ===');
    console.log('VALIDACION: Modo automático:', auto, 'Número:', numero);
    
    if (!this.editingId) {
      console.error('VALIDACION ERROR: No hay ID de edición para crear repetición');
      return;
    }
    
    const key = this.mapUiTablaToKey(this.tratamientoSemillas);
    console.log('VALIDACION: Clave de tratamiento:', key);
    
    if (!key) {
      console.error('VALIDACION ERROR: No se pudo mapear el tratamiento de semillas');
      return;
    }
    
    const obs = auto
      ? this.tablasSvc.addRepeticionAuto(this.editingId, key)
      : this.tablasSvc.addRepeticionNumero(this.editingId, key, Number(numero || 0));
    
    console.log('VALIDACION OK: Iniciando creación de repetición en backend');
    obs.subscribe({
      next: (_) => {
        console.log('VALIDACION OK: Repetición creada exitosamente en backend');
        this.cargarResumenBackend(this.editingId!);
      },
      error: (err) => {
        console.error('VALIDACION ERROR: Error creando repetición en backend:', err);
      }
    });
  }

  cargarDatosParaEdicion(id: number) {
    console.log('=== VALIDACION: Cargando datos para edición ===');
    console.log('VALIDACION: ID de germinación:', id);
    
    if (!id || id <= 0) {
      console.error('VALIDACION ERROR: ID no válido para cargar datos de edición');
      return;
    }
    
    this.syncNormalesConConteos();
    console.log('VALIDACION OK: Sincronización de normales completada');
    
    // Cargar datos reales desde backend
    this.germSvc.obtener(id).subscribe({
      next: (dto: any) => {
        console.log('VALIDACION OK: Datos de germinación obtenidos del backend:', dto);
        // Encabezado / metadata
        this.comentarios = dto?.comentarios ?? '';
        this.numSemillas = dto?.nroSemillaPorRepeticion != null ? String(dto.nroSemillaPorRepeticion) : '';
        // El backend devuelve un objeto Metodo; mostrar su nombre si existe
        this.metodo = dto?.metodo?.nombre ?? '';
        this.temperatura = dto?.temperatura != null ? String(dto.temperatura) : '';
        this.preFrio = (dto?.preFrio === 'PREFRIO') ? 'PREFRIO' : 'No';
        this.preTratamiento = dto?.preTratamiento ?? '';
        this.productoDosis = '';
        // Tratamiento (mapear enum a etiqueta UI)
        this.tratamientoSemillas = this.mapKeyToUiTabla(dto?.tratamiento);
        this.tratamientoSemillasAnterior = this.tratamientoSemillas;

        // Fechas
        this.fechas = {
          inicio: this.toDateOnlyString(dto?.fechaInicio),
          conteos: this.fechas?.conteos?.length ? this.fechas.conteos : [''],
          get totalDias() {
            const fechasConteo = this.conteos.filter((f: string) => !!f);
            if (!this.inicio || fechasConteo.length === 0) return '';
            const inicio = new Date(this.inicio);
            const ultima = new Date(fechasConteo[fechasConteo.length - 1]);
            if (isNaN(inicio.getTime()) || isNaN(ultima.getTime())) return '';
            const diff = Math.ceil((ultima.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
            return diff >= 0 ? diff : '';
          }
        };

        // Analisis INIA / INASE
        this.inia = {
          pNormales: Number(dto?.pNormalINIA ?? 0) || 0,
          pAnormales: Number(dto?.pAnormalINIA ?? 0) || 0,
          duras: Number(dto?.semillasDurasINIA ?? 0) || 0,
          frescas: Number(dto?.pFrescasINIA ?? 0) || 0,
          muertas: Number(dto?.pMuertasINIA ?? 0) || 0,
          germinacion: Number(dto?.germinacionINIA ?? 0) || 0,
        };
        this.inase = {
          pNormales: Number(dto?.pNormalINASE ?? 0) || 0,
          pAnormales: Number(dto?.pAnormalINASE ?? 0) || 0,
          duras: Number(dto?.semillasDurasINASE ?? 0) || 0,
          frescas: Number(dto?.pFrescasINASE ?? 0) || 0,
          muertas: Number(dto?.pMuertasINASE ?? 0) || 0,
          germinacion: Number(dto?.germinacionINASE ?? 0) || 0,
        };

        // Inicializar una repetición por defecto; el resumen backend la reemplazará
        this.repeticiones = [this.nuevaRepeticion(1)];
      },
      error: (err) => {
        console.error('Error cargando germinación para edición', err);
      }
    });
  }

  cargarDatos() {
    console.log('=== VALIDACION: Cargando datos iniciales ===');
    
    this.syncNormalesConConteos();
    console.log('VALIDACION OK: Sincronización de normales completada');
    
    // Limpiar campos para creación
    this.comentarios = '';
    this.numSemillas = '';
    this.metodo = '';
    this.temperatura = '';
    this.preFrio = '';
    this.preTratamiento = '';
    this.productoDosis = '';
    this.tratamientoSemillas = '';
    
    console.log('VALIDACION OK: Campos de formulario inicializados');
    
    this.fechas = {
      inicio: '',
      conteos: [''],
      get totalDias() {
        const fechasConteo = this.conteos.filter(f => !!f);
        if (!this.inicio || fechasConteo.length === 0) return '';
        const inicio = new Date(this.inicio);
        const ultima = new Date(fechasConteo[fechasConteo.length - 1]);
        if (isNaN(inicio.getTime()) || isNaN(ultima.getTime())) return '';
        const diff = Math.ceil((ultima.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
        return diff >= 0 ? diff : '';
      }
    };
    
    this.inia = { pNormales: 0, pAnormales: 0, duras: 0, frescas: 0, muertas: 0, germinacion: 0 };
    this.inase = { pNormales: 0, pAnormales: 0, duras: 0, frescas: 0, muertas: 0, germinacion: 0 };
    this.repeticiones = [this.nuevaRepeticion(1)];
    
    console.log('VALIDACION OK: Datos iniciales cargados correctamente');
    console.log('VALIDACION: Repeticiones iniciales:', this.repeticiones.length);
  }

  getPromedioNormales(idx: number): number {
    if (this.repeticiones.length === 0) return 0;
    const suma = this.repeticiones.reduce((acc, rep) => acc + (Number(rep.normales[idx]) || 0), 0);
    return suma / this.repeticiones.length;
  }
  getPromedioAnormales(): number {
    if (this.repeticiones.length === 0) return 0;
    const suma = this.repeticiones.reduce((acc, rep) => acc + (Number(rep.anormales) || 0), 0);
    return suma / this.repeticiones.length;
  }
  getPromedioDuras(): number {
    if (this.repeticiones.length === 0) return 0;
    const suma = this.repeticiones.reduce((acc, rep) => acc + (Number(rep.duras) || 0), 0);
    return suma / this.repeticiones.length;
  }
  getPromedioFrescas(): number {
    if (this.repeticiones.length === 0) return 0;
    const suma = this.repeticiones.reduce((acc, rep) => acc + (Number(rep.frescas) || 0), 0);
    return suma / this.repeticiones.length;
  }
  getPromedioMuertas(): number {
    if (this.repeticiones.length === 0) return 0;
    const suma = this.repeticiones.reduce((acc, rep) => acc + (Number(rep.muertas) || 0), 0);
    return suma / this.repeticiones.length;
  }
  getPromedioTotal(): number {
    if (this.repeticiones.length === 0) return 0;
    const suma = this.repeticiones.reduce((acc, rep) => acc + this.getTotal(rep), 0);
    return suma / this.repeticiones.length;
  }

  nuevaRepeticion(numero: number): RepeticionGerminacion {
    return {
      numero,
      normales: [0, 0, 0, 0, 0],
      anormales: 0,
      duras: 0,
      frescas: 0,
      muertas: 0
    };
  }
  agregarRepeticion() {
    const nuevoNum = this.repeticiones.length + 1;
    this.repeticiones.push(this.nuevaRepeticion(nuevoNum));
  }
  eliminarRepeticion(idx: number) {
    if (this.repeticiones.length > 1) {
      this.repeticiones.splice(idx, 1);
      this.repeticiones.forEach((r, i) => r.numero = i + 1);
    }
  }
  getTotal(rep: RepeticionGerminacion): number {
    const sumaNormales = rep.normales.reduce((a, b) => a + (Number(b) || 0), 0);
    return sumaNormales + (Number(rep.anormales) || 0) + (Number(rep.duras) || 0) + (Number(rep.frescas) || 0) + (Number(rep.muertas) || 0);
  }

  onSubmit() {
    console.log('=== VALIDACION: Iniciando proceso de envío de germinación ===');
    
    // Validar datos básicos requeridos
    const reciboId = Number(this.reciboId) || null;
    if (!reciboId) {
      console.error('VALIDACION ERROR: No se encontró reciboId en la ruta');
      return;
    }
    console.log('VALIDACION OK: ReciboId encontrado:', reciboId);

    // Validar fechas
    if (!this.fechas?.inicio) {
      console.error('VALIDACION ERROR: Fecha de inicio es requerida');
      return;
    }
    console.log('VALIDACION OK: Fecha de inicio:', this.fechas.inicio);

    // Validar tratamiento de semillas
    if (!this.tratamientoSemillas) {
      console.error('VALIDACION ERROR: Tratamiento de semillas es requerido');
      return;
    }
    console.log('VALIDACION OK: Tratamiento de semillas:', this.tratamientoSemillas);

    // Validar número de semillas
    if (!this.numSemillas || Number(this.numSemillas) <= 0) {
      console.error('VALIDACION ERROR: Número de semillas debe ser mayor a 0');
      return;
    }
    console.log('VALIDACION OK: Número de semillas:', this.numSemillas);

    // Validar repeticiones
    if (!this.repeticiones || this.repeticiones.length === 0) {
      console.error('VALIDACION ERROR: Debe existir al menos una repetición');
      return;
    }
    console.log('VALIDACION OK: Número de repeticiones:', this.repeticiones.length);

    // Validar datos de repeticiones
    for (let i = 0; i < this.repeticiones.length; i++) {
      const rep = this.repeticiones[i];
      if (!rep.normales || rep.normales.length === 0) {
        console.error(`VALIDACION ERROR: Repetición ${i + 1} no tiene datos de normales`);
        return;
      }
      console.log(`VALIDACION OK: Repetición ${i + 1} tiene ${rep.normales.length} conteos normales`);
    }

    // Construir payload mínimo compatible con backend (usamos strings cuando aplique)
    const buildPayload = (forEdit = false) => ({
      id: forEdit ? (this.editingId || null) : null,
      fechaInicio: this.fechas?.inicio || null,
      totalDias: Number(this.fechas?.totalDias) || 0,
      tratamiento: this.mapUiTablaToKey(this.tratamientoSemillas),
      nroSemillaPorRepeticion: Number(this.numSemillas) || 0,
      metodo: null,
      temperatura: this.parseTemperaturaToFloat(this.temperatura),
      preFrio: this.mapPreFrioToEnum(this.preFrio),
      preTratamiento: this.mapPreTratamientoToEnum(this.preTratamiento),
      nroDias: this.numeroDias || 0,
      fechaFinal: null,
      pRedondeo: 0,
      pNormalINIA: Number(this.inia?.pNormales ?? 0) || 0,
      pNormalINASE: Number(this.inase?.pNormales ?? 0) || 0,
      pAnormalINIA: Number(this.inia?.pAnormales ?? 0) || 0,
      pAnormalINASE: Number(this.inase?.pAnormales ?? 0) || 0,
      pMuertasINIA: Number(this.inia?.muertas ?? 0) || 0,
      pMuertasINASE: Number(this.inase?.muertas ?? 0) || 0,
      pFrescasINIA: Number(this.inia?.frescas ?? 0) || 0,
      pFrescasINASE: Number(this.inase?.frescas ?? 0) || 0,
      semillasDurasINIA: Number(this.inia?.duras ?? 0) || 0,
      semillasDurasINASE: Number(this.inase?.duras ?? 0) || 0,
      germinacionINIA: Number(this.inia?.germinacion ?? 0) || 0,
      germinacionINASE: Number(this.inase?.germinacion ?? 0) || 0,
      comentarios: this.comentarios || '',
      observaciones: '',
      reciboId: reciboId,
      activo: true,
      repetido: false,
      fechaCreacion: null,
      fechaRepeticion: null,
    });
    const payload: any = buildPayload(false);

    if (this.isEditing && this.editingId) {
      console.log('VALIDACION: Modo edición detectado, ID:', this.editingId);
      const gid = this.editingId;
      const editPayload = buildPayload(true);
      
      // Validar payload de edición
      if (!editPayload.id) {
        console.error('VALIDACION ERROR: ID de edición no válido');
        return;
      }
      console.log('VALIDACION OK: Payload de edición construido correctamente');
      
      // Primero actualizar encabezado (DTO germinación)
      this.germSvc.editar(editPayload as any).subscribe({
        next: () => {
          console.log('VALIDACION OK: Germinación actualizada exitosamente en backend');
          // Luego persistir conteos/repeticiones/normales/finales para TODOS los tratamientos con datos
          this.persistirTodosLosTratamientos(gid, () => {
            this.cargarResumenBackend(gid);
          });
        },
        error: (err) => {
          console.error('VALIDACION ERROR: Error actualizando germinación en backend:', err);
        }
      });
      return;
    }

    console.log('VALIDACION: Iniciando creación de nueva germinación');
    this.germSvc.crear(payload).subscribe({
      next: (text: string) => {
        console.log('VALIDACION OK: Respuesta del backend para creación:', text);
        // El backend devuelve texto tipo: "Germinacion creada correctamente ID:1"
        const match = String(text || '').match(/ID\s*:?\s*(\d+)/i);
        const newId = match ? Number(match[1]) : null;
        
        if (newId) {
          console.log('VALIDACION OK: ID de germinación creada:', newId);
          // Ir a edición y cargar resumen, y además persistir los conteos/repeticiones del formulario en backend
          const loteId = this.loteId;
          const rId = this.reciboId;
          this.isEditing = true;
          this.editingId = newId;
          console.log('VALIDACION: Cambiando a modo edición con ID:', newId);
          // Persistir datos completos (conteos, repeticiones, normales y finales) para TODOS los tratamientos con datos
          this.persistirTodosLosTratamientos(newId, () => {
            // Mantenerse en la misma página: solo refrescar resumen y quedar en modo edición
            this.cargarResumenBackend(newId);
          });
        } else {
          console.error('VALIDACION ERROR: No se pudo parsear el ID de creación de germinación. Respuesta:', text);
        }
      },
      error: (err) => {
        console.error('VALIDACION ERROR: Error creando germinación en backend:', err);
      }
    });
  }

  // Persiste en backend los conteos, repeticiones y valores de la tabla para el tratamiento seleccionado
  private persistirFormularioEnBackend(germinacionId: number, done?: () => void) {
    console.log('=== VALIDACION: Iniciando persistencia de formulario ===');
    console.log('VALIDACION: ID de germinación:', germinacionId);
    
    if (!germinacionId || germinacionId <= 0) {
      console.error('VALIDACION ERROR: ID de germinación no válido para persistencia');
      return;
    }
    
    const deseados = Math.max(1, (this.fechas?.conteos?.length || 1));
    console.log('VALIDACION: Conteos deseados:', deseados);
    
    // 1) Asegurar cantidad de conteos
    this.tablasSvc.listConteos(germinacionId).subscribe({
      next: (existentes: ConteoGerminacionDto[]) => {
        console.log('VALIDACION OK: Conteos existentes obtenidos:', existentes?.length || 0);
        const yaHay = existentes?.length || 0;
        const faltan = Math.max(0, deseados - yaHay);
        console.log('VALIDACION: Conteos faltantes:', faltan);
        const desde = yaHay; // crear desde este índice (0-based)
        const crear$: any[] = [];
        for (let i = desde; i < deseados; i++) {
          const fecha = this.fechas.conteos[i] || null;
          const fechaIso = fecha ? new Date(fecha).toISOString() : null;
          const body: Partial<ConteoGerminacionDto> = { fechaConteo: fechaIso };
          crear$.push(this.tablasSvc.addConteo(germinacionId, body).pipe(catchError(err => { console.error('Error creando conteo', err); return of(null); })));
        }
  const cuandoCreados = crear$.length ? forkJoin(crear$) : of([] as any[]);
        cuandoCreados.subscribe({
          next: () => {
            // 2) Obtener conteos con IDs
            this.tablasSvc.listConteos(germinacionId).subscribe({
              next: (conteosActuales: ConteoGerminacionDto[]) => {
                const conteosOrdenados = (conteosActuales || []).sort((a,b) => (Number(a.numeroConteo||0) - Number(b.numeroConteo||0)));
                const tablaKey = this.mapUiTablaToKey(this.tratamientoSemillas);

                // 3) Crear repeticiones necesarias (por número de fila)
                const crearReps$: any[] = (this.repeticiones || []).map(rep =>
                  this.tablasSvc.addRepeticionNumero(germinacionId, tablaKey, Number(rep.numero || 0))
                    .pipe(catchError(err => { console.error('Error creando repetición', err); return of(null); }))
                );
                const repsListo$ = crearReps$.length ? forkJoin(crearReps$) : of([] as any[]);

                repsListo$.subscribe({
                  next: () => {
                    // 4) Upsert de normales (por celda)
                    const upsertsNormales$: any[] = [];
                    (this.repeticiones || []).forEach(rep => {
                      conteosOrdenados.forEach((c, idx) => {
                        const body: NormalPorConteoDto = {
                          germinacionId: germinacionId,
                          tabla: tablaKey,
                          numeroRepeticion: Number(rep.numero || 0),
                          conteoId: Number(c.id || 0),
                          normal: Number(rep.normales?.[idx] || 0)
                        };
                        upsertsNormales$.push(
                          this.tablasSvc.upsertNormal(tablaKey, body).pipe(catchError(err => { console.error('Error guardando normal', err); return of(null); }))
                        );
                      });
                    });

                    const normalesListo$ = upsertsNormales$.length ? forkJoin(upsertsNormales$) : of([] as any[]);
                    normalesListo$.subscribe({
                      next: () => {
                        // 5) Upsert de finales (por fila)
                        const upsertsFinales$: any[] = (this.repeticiones || []).map(rep => {
                          const finBody: RepeticionFinalDto = {
                            activo: true,
                            germinacionId: germinacionId,
                            numeroRepeticion: Number(rep.numero || 0),
                            anormal: Number(rep.anormales || 0),
                            duras: Number(rep.duras || 0),
                            frescas: Number(rep.frescas || 0),
                            muertas: Number(rep.muertas || 0)
                          };
                          return this.tablasSvc.upsertFinales(tablaKey, finBody).pipe(catchError(err => { console.error('Error guardando finales', err); return of(null); }));
                        });
                        const finalesListo$ = upsertsFinales$.length ? forkJoin(upsertsFinales$) : of([] as any[]);
                        finalesListo$.subscribe({
                          next: () => { if (done) done(); },
                          error: () => { if (done) done(); }
                        });
                      },
                      error: () => { if (done) done(); }
                    });
                  },
                  error: () => { if (done) done(); }
                });
              },
              error: () => { if (done) done(); }
            });
          },
          error: () => { if (done) done(); }
        });
      },
      error: () => { if (done) done(); }
    });
  }

  // Nuevo: persiste los tres tratamientos si el usuario ingresó datos en creación
  private persistirTodosLosTratamientos(germinacionId: number, done?: () => void) {
    const deseados = Math.max(1, (this.fechas?.conteos?.length || 1));
    // 1) Asegurar cantidad de conteos UNA vez
    this.tablasSvc.listConteos(germinacionId).subscribe({
      next: (existentes: ConteoGerminacionDto[]) => {
        const yaHay = existentes?.length || 0;
        const faltan = Math.max(0, deseados - yaHay);
        const crear$: any[] = [];
        for (let i = yaHay; i < deseados; i++) {
          const fecha = this.fechas.conteos[i] || null;
          const fechaIso = fecha ? new Date(fecha).toISOString() : null;
          const body: Partial<ConteoGerminacionDto> = { fechaConteo: fechaIso };
          crear$.push(this.tablasSvc.addConteo(germinacionId, body).pipe(catchError(err => { console.error('Error creando conteo', err); return of(null); })));
        }
        const cuandoCreados = crear$.length ? forkJoin(crear$) : of([] as any[]);
        cuandoCreados.subscribe({
          next: () => {
            // 2) Obtener conteos
            this.tablasSvc.listConteos(germinacionId).subscribe({
              next: (conteosActuales: ConteoGerminacionDto[]) => {
                const conteosOrdenados = (conteosActuales || []).sort((a,b) => (Number(a.numeroConteo||0) - Number(b.numeroConteo||0)));

                const keys = ['SIN_CURAR','CURADA_PLANTA','CURADA_LABORATORIO'];
                const ops$: any[] = [];

                keys.forEach(k => {
                  // Obtener snapshot de repeticiones para cada tratamiento
                  let reps: RepeticionGerminacion[] = [];
                  const selKey = this.mapUiTablaToKey(this.tratamientoSemillas);
                  if (k === selKey) {
                    reps = JSON.parse(JSON.stringify(this.repeticiones || []));
                  } else {
                    reps = JSON.parse(JSON.stringify(this.tratamientosData[k]?.repeticiones || []));
                  }
                  if (!reps || reps.length === 0) {
                    return; // nada que persistir; quedará la repetición 1 vacía creada en backend
                  }

                  // Crear (si falta) la repetición indicada y upsert normales + finales
                  // Crear repeticiones necesarias (por fila)
                  reps.forEach(rep => {
                    ops$.push(
                      this.tablasSvc.addRepeticionNumero(germinacionId, k, Number(rep.numero || 0))
                        .pipe(catchError(err => { console.error('Error creando repetición', err); return of(null); }))
                    );
                  });

                  // Upsert normales por cada conteo
                  reps.forEach(rep => {
                    conteosOrdenados.forEach((c, idx) => {
                      const body: NormalPorConteoDto = {
                        germinacionId: germinacionId,
                        tabla: k,
                        numeroRepeticion: Number(rep.numero || 0),
                        conteoId: Number(c.id || 0),
                        normal: Number(rep.normales?.[idx] || 0)
                      };
                      ops$.push(
                        this.tablasSvc.upsertNormal(k, body).pipe(catchError(err => { console.error('Error guardando normal', err); return of(null); }))
                      );
                    });
                  });

                  // Upsert finales por fila
                  reps.forEach(rep => {
                    const finBody: RepeticionFinalDto = {
                      activo: true,
                      germinacionId: germinacionId,
                      numeroRepeticion: Number(rep.numero || 0),
                      anormal: Number(rep.anormales || 0),
                      duras: Number(rep.duras || 0),
                      frescas: Number(rep.frescas || 0),
                      muertas: Number(rep.muertas || 0)
                    };
                    ops$.push(
                      this.tablasSvc.upsertFinales(k, finBody).pipe(catchError(err => { console.error('Error guardando finales', err); return of(null); }))
                    );
                  });
                });

                const exec$ = ops$.length ? forkJoin(ops$) : of([] as any[]);
                exec$.subscribe({
                  next: () => { if (done) done(); },
                  error: () => { if (done) done(); }
                });
              },
              error: () => { if (done) done(); }
            });
          },
          error: () => { if (done) done(); }
        });
      },
      error: () => { if (done) done(); }
    });
  }

  onCancel() {
    console.log('=== VALIDACION: Cancelando operación ===');
    console.log('VALIDACION: Navegando a listado con loteId:', this.loteId, 'reciboId:', this.reciboId);
    
    // Navegar de vuelta al listado de germinaciones del recibo específico
    this.router.navigate([this.loteId + "/" + this.reciboId + "/listado-germinacion"]);
  }
}

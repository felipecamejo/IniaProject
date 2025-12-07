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
import { AuthService } from '../../../services/AuthService';
import { ConteoGerminacionDto } from '../../../models/ConteoGerminacion.dto';
import { MetodoService } from '../../../services/MetodoService';
import { MetodoDto } from '../../../models/Metodo.dto';
import { NormalPorConteoDto } from '../../../models/NormalPorConteo.dto';
import { RepeticionFinalDto } from '../../../models/RepeticionFinal.dto';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { LogService } from '../../../services/LogService';

export interface RepeticionGerminacion {
  numero: number;
  normales: number[]; // 5 valores
  anormales: number;
  duras: number;
  frescas: number;
  muertas: number;
}

export interface PromediosRedondeados {
  normales: number[];
  anormal: number;
  duras: number;
  frescas: number;
  muertas: number;
  total: number;
}

export interface TratamientoData {
  comentarios: string;
  numSemillas: string;
  metodo: string;
  temperatura: string;
  preFrio: string;
  preTratamiento: string;
  productoDosis: string;
  fechas: { inicio: string; conteos: string[] };
  inia: any;
  inase: any;
  repeticiones: RepeticionGerminacion[];
  promedios: PromediosRedondeados;
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
  isViewing: boolean = false;

  // Agregar propiedades para manejar errores
  errores: string[] = [];

  inia = { pNormales: 0, pAnormales: 0, duras: 0, frescas: 0, muertas: 0, germinacion: 0 };
  inase = { pNormales: 0, pAnormales: 0, duras: 0, frescas: 0, muertas: 0, germinacion: 0 };
  repeticiones: RepeticionGerminacion[] = [];
  private tratamientoSemillasAnterior: string = 'sin curar';

  // Getter para determinar si está en modo readonly
  get isReadonly(): boolean {
    return this.isViewing;
  }

  onTratamientoChange(): void {

    // Normalizar a clave backend (SIN_CURAR | CURADA_PLANTA | CURADA_LABORATORIO)
    const prevKey = this.mapUiTablaToKey(this.tratamientoSemillasAnterior);
    const currKey = this.mapUiTablaToKey(this.tratamientoSemillas);

    // Guardar solo repeticiones del tratamiento anterior
    if (prevKey) {
      this.tratamientosData[prevKey] = this.tratamientosData[prevKey] || {
        comentarios: '', numSemillas: '', metodo: '', temperatura: '', preFrio: '', preTratamiento: '', productoDosis: '',
        fechas: { inicio: '', conteos: [] }, inia: {}, inase: {}, repeticiones: [],
        promedios: { normales: [], anormal: 0, duras: 0, frescas: 0, muertas: 0, total: 0 }
      };
      this.tratamientosData[prevKey].repeticiones = JSON.parse(JSON.stringify(this.repeticiones));
      this.tratamientosData[prevKey].promedios = {
        normales: [...this.promedioManualNormales],
        anormal: this.promedioManualAnormales,
        duras: this.promedioManualDuras,
        frescas: this.promedioManualFrescas,
        muertas: this.promedioManualMuertas,
        total: this.promedioManualTotal
      };
    }

    // Cargar repeticiones del tratamiento seleccionado
    const data = this.tratamientosData[currKey];
    if (data && Array.isArray(data.repeticiones) && data.repeticiones.length > 0) {
      this.repeticiones = JSON.parse(JSON.stringify(data.repeticiones));
      if (data.promedios) {
        this.promedioManualNormales = [...(data.promedios.normales || [])];
        this.promedioManualAnormales = data.promedios.anormal || 0;
        this.promedioManualDuras = data.promedios.duras || 0;
        this.promedioManualFrescas = data.promedios.frescas || 0;
        this.promedioManualMuertas = data.promedios.muertas || 0;
        this.promedioManualTotal = data.promedios.total || 0;
      } else {
        this.resetPromedios();
      }
    } else {
      this.repeticiones = [this.nuevaRepeticion(1)];
      this.repeticiones[0].normales = Array(this.fechas.conteos.length).fill(0);
      this.resetPromedios();
    }
    this.syncNormalesConConteos();
    // Actualizar el valor anterior (mantener etiqueta UI para el selector pero normalizamos al leer)
    this.tratamientoSemillasAnterior = this.tratamientoSemillas;
  }
  // Promedio global de normales (sin redondeo)
  getPromedioNormalesGlobal(): number {
    // Ajuste: el promedio global debe dividirse por la cantidad de repeticiones
    // y NO por la cantidad total de celdas (repeticiones * conteos).
    // Ejemplo: 2 repeticiones y 2 conteos -> 4 valores normales.
    // Fórmula anterior: (n1+n2+n3+n4)/4 (incorrecto según nueva definición)
    // Nueva fórmula: ( (sum(rep1.normales) + sum(rep2.normales)) ) / 2
    if (this.repeticiones.length === 0) return 0;
    const sumaPorRepeticion = this.repeticiones.reduce((acc, rep) => {
      const sumaRep = rep.normales.reduce((s, v) => s + (Number(v) || 0), 0);
      return acc + sumaRep;
    }, 0);
    return sumaPorRepeticion / this.repeticiones.length;
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

  resetPromedios() {
    this.promedioManualNormales = Array(this.fechas.conteos.length).fill(0);
    this.promedioManualAnormales = 0;
    this.promedioManualDuras = 0;
    this.promedioManualFrescas = 0;
    this.promedioManualMuertas = 0;
    this.promedioManualTotal = 0;
  }

  // Variables para manejar navegación
  isEditing: boolean = false;
  editingId: number | null = null;

  diasPreFrio: string[] = Array.from({length: 13}, (_, i) => `${i+3} dias`); // 3 a 15 días
  tratamientoSemillas: string = 'sin curar';

  // Estructura para almacenar los datos por tratamiento
  tratamientosData: {[key: string]: TratamientoData} = {};

  // Variables actuales (se actualizan según el tratamiento seleccionado)
  comentarios: string = '';
  estandar: boolean = false;
  repetido: boolean = false;
  fechaINASE: string = '';

  // Variables para el diálogo de confirmación
  mostrarConfirmEstandar: boolean = false;
  mostrarConfirmRepetido: boolean = false;
  estandarPendiente: boolean = false;
  repetidoPendiente: boolean = false;

  // Variables para controlar si ya está marcado (no se puede cambiar)
  estandarOriginal: boolean = false;
  repetidoOriginal: boolean = false;

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

  // Lógica mutuamente excluyente para checkboxes, usando window.confirm como en PMS
  onEstandarChange() {
    if (this.estandarOriginal) {
      this.estandar = true;
      return;
    }
    if (this.estandar && this.repetido) {
      if (window.confirm('No puedes marcar "Estándar" si "Repetido" ya está seleccionado. ¿Deseas desmarcar "Repetido" y marcar "Estándar"?')) {
        this.repetido = false;
      } else {
        this.estandar = false;
        return;
      }
    }
    if (this.estandar) {
      if (!window.confirm('¿Estás seguro que quieres marcar como "Estándar"? Esta acción no se puede deshacer.')) {
        this.estandar = false;
      }
    }
  }

  onRepetidoChange() {
    if (this.repetidoOriginal) {
      this.repetido = true;
      return;
    }
    if (this.repetido && this.estandar) {
      if (window.confirm('No puedes marcar "Repetido" si "Estándar" ya está seleccionado. ¿Deseas desmarcar "Estándar" y marcar "Repetido"?')) {
        this.estandar = false;
      } else {
        this.repetido = false;
        return;
      }
    }
    if (this.repetido) {
      if (!window.confirm('¿Estás seguro que quieres marcar como "Repetido"? Esta acción no se puede deshacer.')) {
        this.repetido = false;
      }
    }
  }
  numSemillas: string = '';
  // Listado de métodos expuestos por backend y selección actual
  metodos: MetodoDto[] = [];
  metodoId: number | null = null;
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

  // Helper: número de semillas por repetición como número
  get numSemillasNumber(): number {
    return Number(this.numSemillas) || 0;
  }

  // Helper: indica si el total de una repetición supera las semillas por repetición
  superaSemillas(rep: RepeticionGerminacion): boolean {
    const limite = this.numSemillasNumber;
    if (limite <= 0) return false;
    return this.getTotal(rep) > limite;
  }
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

    // Versión ISO (YYYY-MM-DD) para comparaciones con inputs tipo date
    get fechaSalidaPreFrioISO(): string {
      if (!this.fechas.inicio || this.preFrio === 'No') return '';
      const diasMatch = this.preFrio.match(/(\d+)/);
      const dias = diasMatch ? parseInt(diasMatch[1], 10) : 0;
      if (dias === 0) return '';
      const fechaInicio = new Date(this.fechas.inicio);
      if (isNaN(fechaInicio.getTime())) return '';
      fechaInicio.setDate(fechaInicio.getDate() + dias + 1);
      const yyyy = fechaInicio.getFullYear();
      const mm = String(fechaInicio.getMonth() + 1).padStart(2, '0');
      const dd = String(fechaInicio.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }

      // Días de pre-frío: solo los días extraídos del selector de pre-frío
      get diasDuracionPreFrio(): number {
        if (!this.preFrio || this.preFrio === 'No') return 0;
        const diasMatch = this.preFrio.match(/(\d+)/);
        return diasMatch ? parseInt(diasMatch[1], 10) : 0;
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

  // Marca si el conteo i coincide con la fecha de salida de pre-frío
  isConteoSalidaPreFrio(i: number): boolean {
    const salida = this.fechaSalidaPreFrioISO;
    if (!salida) return false;
    const valor = (this.fechas.conteos[i] || '').trim();
    return valor === salida;
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
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private tablasSvc: GerminacionTablasService,
    private germSvc: GerminacionService,
    private metodoService: MetodoService,
    private logService: LogService
  ) {
    // Inicializar con 1 repetición por defecto
    this.repeticiones.push(this.nuevaRepeticion(1));
    // Inicializar datos para el tratamiento inicial
    this.onTratamientoChange();
  }

  ngOnInit() {


    // Inicializar variables de navegación
    this.loteId = this.route.snapshot.paramMap.get('loteId');
    this.reciboId = this.route.snapshot.paramMap.get('reciboId');

    this.syncNormalesConConteos();

    this.onTratamientoChange();

    // Cargar métodos desde backend
    this.metodoService.listar().subscribe({
      next: (lista) => {
        this.metodos = Array.isArray(lista) ? lista : [];
        console.log('VALIDACION OK: Métodos cargados:', this.metodos);
      },
      error: (err) => {
        console.error('VALIDACION ERROR: No se pudieron cargar métodos:', err);
      }
    });

    this.route.params.subscribe((params: any) => {

      if (params['id']) {
        this.editingId = parseInt(params['id']);

        if (isNaN(this.editingId) || this.editingId <= 0) {
          console.error('VALIDACION ERROR: ID no válido:', params['id']);
          return;
        }

        // Verificar si es modo visualización por query parameter
        this.route.queryParams.subscribe(queryParams => {
          this.isViewing = queryParams['view'] === 'true';
          this.isEditing = !this.isViewing;
        });

        this.cargarDatosParaEdicion(this.editingId);
        // Cargar resumen desde backend para esta germinación
        this.cargarResumenBackend(this.editingId);
      } else {
        this.isEditing = false;
        this.isViewing = false;
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
    if (k === 'CURADA_PLANTA') return 'curada en planta';
    if (k === 'CURADA_LABORATORIO') return 'curada en laboratorio';
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

  // Normaliza números escritos con coma o con espacios ("0,5" -> 0.5)
  private parseNumLocale(v: any): number {
    if (v === null || v === undefined) return 0;
    if (typeof v === 'number') return isNaN(v) ? 0 : v;
    const s = String(v).trim().replace(',', '.');
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  }

  private toDateOnlyString(value: any): string {
    if (!value) return '';
    try {
      // Si viene un string ISO, extraer solo la parte de la fecha (YYYY-MM-DD)
      if (typeof value === 'string') {
        // Verificar si tiene formato ISO como "2025-12-06T00:00:00" o "2025-12-06"
        const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
        if (match) {
          console.log(`[toDateOnlyString] Input: "${value}" -> Output: "${match[1]}"`);
          return match[1]; // Retornar solo YYYY-MM-DD
        }
      }
      // Fallback: intentar parsear como Date
      const d = new Date(value);
      if (isNaN(d.getTime())) return '';
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const result = `${yyyy}-${mm}-${dd}`;
      console.log(`[toDateOnlyString FALLBACK] Input: "${value}" -> Output: "${result}"`);
      return result;
    } catch {
      return '';
    }
  }

  cargarResumenBackend(germinacionId: number) {

    if (!germinacionId || germinacionId <= 0) {
      console.error('VALIDACION ERROR: ID no válido para cargar resumen');
      return;
    }

    this.tablasSvc.getResumen(germinacionId).subscribe({
      next: (res: any) => {
        console.log('VALIDACION OK: Resumen obtenido del backend:', res);


        try {
          const keys = Object.keys(res || {});
          console.log('Claves en respuesta:', keys);

          const conteos = res?.conteos ?? [];
          console.table((conteos || []).map((c: any) => ({
            id: c?.id, numeroConteo: c?.numeroConteo, fechaConteo: c?.fechaConteo
          })));
          console.log('Total conteos:', conteos?.length ?? 0);

          const muestras = {
            normalesSinCurar: res?.normalesSinCurar ? Object.entries(res.normalesSinCurar).slice(0, 1) : [],
            normalesCuradaPlanta: res?.normalesCuradaPlanta ? Object.entries(res.normalesCuradaPlanta).slice(0, 1) : [],
            normalesCuradaLaboratorio: res?.normalesCuradaLaboratorio ? Object.entries(res.normalesCuradaLaboratorio).slice(0, 1) : [],
            finalesSinCurar: (res?.finalesSinCurar || []).slice(0, 3),
            finalesCuradaPlanta: (res?.finalesCuradaPlanta || []).slice(0, 3),
            finalesCuradaLaboratorio: (res?.finalesCuradaLaboratorio || []).slice(0, 3),
          } as any;
          console.log('Muestras normales por conteo (primer conteo por tabla):', muestras.normalesSinCurar, muestras.normalesCuradaPlanta, muestras.normalesCuradaLaboratorio);
          console.table(muestras.finalesSinCurar, ['germinacionId','numeroRepeticion','anormal','duras','frescas','muertas']);
          console.table(muestras.finalesCuradaPlanta, ['germinacionId','numeroRepeticion','anormal','duras','frescas','muertas']);
          console.table(muestras.finalesCuradaLaboratorio, ['germinacionId','numeroRepeticion','anormal','duras','frescas','muertas']);

          // Validar correlación: por cada conteoId, normales deben ser arrays
          const conteoIds = (conteos || []).map((c: any) => c?.id).filter(Boolean);
          ['normalesSinCurar','normalesCuradaPlanta','normalesCuradaLaboratorio'].forEach((k) => {
            const seccion: any = (res as any)?.[k] || {};
            conteoIds.forEach((cid: number) => {
              const lista = seccion?.[cid as any];
              if (!Array.isArray(lista)) {
                console.warn(`Sección ${k}[${cid}] debería ser array, recibido:`, typeof lista, lista);
              }
            });
          });
        } catch (e) {
          console.error('DEBUG RESUMEN GERMINACION - Error validando:', e);
        }
        console.groupEnd();
        const conteos: ConteoGerminacionDto[] = res?.conteos ?? [];
        console.log('[cargarResumenBackend] Conteos recibidos:', conteos);
        const conteosLen = (conteos?.length || 0) > 0 ? conteos.length : 1;
        const conteoIds = (conteos ?? []).map(c => c.id as number).filter(Boolean);
        // Fechas de conteo formateadas a YYYY-MM-DD
        const fechasConteo = Array.from({ length: conteosLen }, (_, i) => {
          const c = conteos[i];
          const fechaRaw = (c && (c as any).fechaConteo) ? (c as any).fechaConteo : '';
          const fechaProcessed = fechaRaw ? this.toDateOnlyString(fechaRaw) : '';
          console.log(`[cargarResumenBackend] Conteo ${i+1}: Raw="${fechaRaw}" -> Processed="${fechaProcessed}"`);
          return fechaProcessed;
        });
        this.fechas.conteos = [...fechasConteo];
        console.log('[cargarResumenBackend] fechas.conteos asignadas:', this.fechas.conteos);
        this.syncNormalesConConteos();

        // Helper para construir repeticiones desde finales + normales
        const buildReps = (tablaKey: string): { reps: RepeticionGerminacion[], promedios: PromediosRedondeados } => {
          let finales: RepeticionFinalDto[] = [];
          let normalesPorConteo: Record<number, NormalPorConteoDto[]> = {} as any;
          if (tablaKey === 'SIN_CURAR') {
            finales = res?.finalesSinCurar ?? [];
            console.log('[buildReps] Finales SIN_CURAR:', finales);
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
          console.log(`[buildReps] Normales por conteo para ${tablaKey}:`, normalesPorConteo);
          
          // Extraer promedios de la primera repetición (todos tienen el mismo valor global)
          const primeraFinal = finales[0];
          const promediosFinales = {
            anormal: primeraFinal?.promedioAnormal ?? 0,
            duras: primeraFinal?.promedioDuras ?? 0,
            frescas: primeraFinal?.promedioFrescas ?? 0,
            muertas: primeraFinal?.promedioMuertas ?? 0,
            total: primeraFinal?.promedioTotal ?? 0
          };
          const promediosNormales: number[] = Array(conteosLen).fill(0);
          const primeraRep = finales[0];
          if (primeraRep) {
            conteoIds.forEach((cid, idx) => {
              const lista = normalesPorConteo[cid] || [];
              const celda = lista.find(n => (n.numeroRepeticion ?? -1) === (primeraRep.numeroRepeticion ?? 0));
              promediosNormales[idx] = (celda?.promedioNormal ?? 0) as number;
            });
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
              console.log(`[buildReps] Rep${rep.numero} Conteo${idx+1} (ID=${cid}): celda=`, celda, 'valor=', rep.normales[idx]);
            });
            reps.push(rep);
          }
          if (reps.length === 0) {
            const r = this.nuevaRepeticion(1);
            r.normales = Array(conteosLen).fill(0);
            reps.push(r);
          }
          reps.sort((a, b) => (a.numero || 0) - (b.numero || 0));
          return { 
            reps, 
            promedios: {
              normales: promediosNormales,
              anormal: promediosFinales.anormal,
              duras: promediosFinales.duras,
              frescas: promediosFinales.frescas,
              muertas: promediosFinales.muertas,
              total: promediosFinales.total
            }
          };
        };

        // Construir datasets por cada tabla y guardarlos en tratamientosData
        const tablasKeys = ['SIN_CURAR', 'CURADA_PLANTA', 'CURADA_LABORATORIO'];
        for (const k of tablasKeys) {
          const { reps: repsK, promedios } = buildReps(k);
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
            promedios: { normales: [], anormal: 0, duras: 0, frescas: 0, muertas: 0, total: 0 }
          };
          // Actualizar siempre conteos y repeticiones desde backend
          this.tratamientosData[k].fechas.conteos = [...fechasConteo];
          this.tratamientosData[k].repeticiones = JSON.parse(JSON.stringify(repsK));
          this.tratamientosData[k].promedios = promedios;
        }

        // Reflejar en la UI el tratamiento actualmente seleccionado (usando clave backend)
        const selKey = this.mapUiTablaToKey(this.tratamientoSemillas);
        const dataSel = this.tratamientosData[selKey];
        if (dataSel) {
          this.fechas.conteos = [...dataSel.fechas.conteos];
          this.repeticiones = JSON.parse(JSON.stringify(dataSel.repeticiones));
          if (dataSel.promedios) {
            this.promedioManualNormales = [...dataSel.promedios.normales];
            this.promedioManualAnormales = dataSel.promedios.anormal;
            this.promedioManualDuras = dataSel.promedios.duras;
            this.promedioManualFrescas = dataSel.promedios.frescas;
            this.promedioManualMuertas = dataSel.promedios.muertas;
            this.promedioManualTotal = dataSel.promedios.total;
          }
        }
        this.syncNormalesConConteos();
        
        // DEBUG: Verificar que fechas.inicio no se haya sobrescrito
        console.log('[cargarResumenBackend] FIN - fechas.inicio final:', this.fechas.inicio);
        console.log('[cargarResumenBackend] FIN - fechaINASE final:', this.fechaINASE);
      },
      error: (err) => {
        console.error('Error al cargar resumen de germinación', err);
      }
    });
  }

  crearConteoBackend() {


    if (!this.editingId) {
      console.error('VALIDACION ERROR: No hay ID de edición para crear conteo');
      return;
    }

    this.tablasSvc.addConteo(this.editingId).subscribe({
      next: (_) => {
        this.cargarResumenBackend(this.editingId!);
      },
      error: (err) => {
        console.error('VALIDACION ERROR: Error creando conteo en backend:', err);
      }
    });
  }

  crearRepeticionBackend(auto = true, numero?: number) {

    if (!this.editingId) {
      console.error('VALIDACION ERROR: No hay ID de edición para crear repetición');
      return;
    }

    const key = this.mapUiTablaToKey(this.tratamientoSemillas);

    if (!key) {
      console.error('VALIDACION ERROR: No se pudo mapear el tratamiento de semillas');
      return;
    }

    const obs = auto
      ? this.tablasSvc.addRepeticionAuto(this.editingId, key)
      : this.tablasSvc.addRepeticionNumero(this.editingId, key, Number(numero || 0));

    obs.subscribe({
      next: (_) => {
        this.cargarResumenBackend(this.editingId!);
      },
      error: (err) => {
        console.error('VALIDACION ERROR: Error creando repetición en backend:', err);
      }
    });
  }

  cargarDatosParaEdicion(id: number) {


    if (!id || id <= 0) {
      console.error('VALIDACION ERROR: ID no válido para cargar datos de edición');
      return;
    }

    this.syncNormalesConConteos();

    // Cargar datos reales desde backend
    this.germSvc.obtener(id).subscribe({
      next: (dto: any) => {
        console.log('VALIDACION OK: Datos de germinación obtenidos del backend:', dto);


        try {
          const pick = (o: any, keys: string[]) =>
            Object.fromEntries(keys.map(k => [k, (o as any)?.[k]]));

          const resumenBasico = pick(dto || {}, [
            'id','reciboId','fechaInicio','fechaFinal','nroDias','totalDias',
            'nroSemillaPorRepeticion','temperatura','tratamiento','comentarios',
            'pNormalINIA','pAnormalINIA','pMuertasINIA','pFrescasINIA','semillasDurasINIA','germinacionINIA',
            'pNormalINASE','pAnormalINASE','pMuertasINASE','pFrescasINASE','semillasDurasINASE','germinacionINASE',
            'fechaINASE'
          ]);
          console.table(resumenBasico);

          console.log('metodo (objeto completo):', dto?.metodo);

          // Tipos esperados
          const checks = [
            ['id', 'number'],
            ['reciboId', 'number'],
            ['nroSemillaPorRepeticion', 'number'],
            ['temperatura', 'number'],
            ['nroDias', 'number'],
            ['totalDias', 'number'],
            ['tratamiento', 'string'],
            ['comentarios', 'string'],
            ['pNormalINIA', 'number'],
            ['pNormalINASE', 'number'],
          ] as const;

          const problemas: string[] = [];
          for (const [k, t] of checks) {
            const v = (dto as any)?.[k as any];
            const tipo = v === null || v === undefined ? 'nullish' : typeof v;
            if (tipo !== t && !(t === 'number' && typeof v === 'string' && !isNaN(Number(v as any)))) {
              problemas.push(`Campo ${k} con tipo inesperado: ${tipo} (valor=${JSON.stringify(v)})`);
            }
          }

          // Fechas
          const fechaInicioOk = (dto as any)?.fechaInicio ? !isNaN(new Date((dto as any).fechaInicio).getTime()) : true;
          const fechaFinalOk = (dto as any)?.fechaFinal ? !isNaN(new Date((dto as any).fechaFinal).getTime()) : true;
          if (!fechaInicioOk) problemas.push(`fechaInicio inválida: ${(dto as any)?.fechaInicio}`);
          if (!fechaFinalOk) problemas.push(`fechaFinal inválida: ${(dto as any)?.fechaFinal}`);

          // Metodo
          if ((dto as any)?.metodo && typeof (dto as any).metodo !== 'object') {
            problemas.push(`metodo debería ser objeto, recibido: ${typeof (dto as any).metodo}`);
          }

          if (problemas.length) {
            problemas.forEach(p => console.warn(' -', p));
          } else {
            console.log('DEBUG GERMINACION DTO - Sin problemas de estructura/Tipos detectados');
          }
        } catch (e) {
          console.error('DEBUG GERMINACION DTO - Error validando:', e);
        }
        console.groupEnd();
        // Encabezado / metadata
        this.comentarios = dto?.comentarios ?? '';
        this.estandar = dto?.estandar ?? false;
        this.repetido = dto?.repetido ?? false;
        this.fechaINASE = this.toDateOnlyString(dto?.fechaINASE);
        // Guardar valores originales para deshabilitar checkboxes si ya están marcados
        this.estandarOriginal = dto?.estandar ?? false;
        this.repetidoOriginal = dto?.repetido ?? false;
        this.numSemillas = dto?.nroSemillaPorRepeticion != null ? String(dto.nroSemillaPorRepeticion) : '';
        // Método: seleccionar por id si viene del backend
        this.metodoId = dto?.metodo?.id ?? null;
        this.metodo = dto?.metodo?.nombre ?? '';
        // Temperatura: mapear número del backend a opción del selector
        if (dto?.temperatura != null) {
          const t = Number(dto.temperatura);
          if ([15, 20, 25].includes(t)) {
            this.temperatura = `${t}°C`;
          } else {
            this.temperatura = String(dto.temperatura);
          }
        } else {
          this.temperatura = '';
        }
        // Pre-frío: el backend solo reporta enum (PREFRIO | SIN_PREFRIO). El selector usa 'No' o días.
        // Si viene PREFRIO, seleccionar el primer valor disponible de días para reflejar "sí hay pre-frío".
        this.preFrio = (dto?.preFrio === 'PREFRIO')
          ? (this.diasPreFrio && this.diasPreFrio.length ? String(this.diasPreFrio[0]) : 'No')
          : 'No';
        // Pre-tratamiento: mapear NINGUNO a 'No', otros a una opción visible (usamos 'KNO3' como comodín UI)
        if (dto?.preTratamiento === 'NINGUNO' || dto?.preTratamiento === 'SIN_PRETRATAMIENTO') {
          this.preTratamiento = 'No';
        } else {
          // Valores como ESCARIFICADO, EP_16_HORAS, AGUA_7_HORAS, OTRO → mostrar una opción válida
          this.preTratamiento = 'KNO3';
        }
        this.productoDosis = dto?.productoDosis || '';
        // Tratamiento (mapear enum a etiqueta UI)
        this.tratamientoSemillas = this.mapKeyToUiTabla(dto?.tratamiento);
        this.tratamientoSemillasAnterior = this.tratamientoSemillas;

        // DEBUG: Ver qué fechas llegan del backend
        console.log('[cargarDatosParaEdicion] Fechas recibidas del DTO:', {
          fechaInicio: dto?.fechaInicio,
          fechaINASE: dto?.fechaINASE
        });

        // Fechas
        const fechaInicioProcessed = this.toDateOnlyString(dto?.fechaInicio);
        console.log('[cargarDatosParaEdicion] fechaInicio procesada:', fechaInicioProcessed);
        
        this.fechas = {
          inicio: fechaInicioProcessed,
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

    this.syncNormalesConConteos();

    // Limpiar campos para creación
    this.comentarios = '';
    this.numSemillas = '';
    this.metodo = '';
    this.temperatura = '';
    this.preFrio = '';
    this.preTratamiento = '';
    this.productoDosis = '';
    this.tratamientoSemillas = '';
    this.fechaINASE = '';


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

  // Porcentajes basados en: (Promedio sin redondeo / Número de semillas por repetición) * 100
  private getPorcentaje(valorPromedio: number): number {
    const n = this.numSemillasNumber;
    if (n <= 0) return 0;
    return (valorPromedio / n) * 100;
  }

  getPorcentajeNormalesGlobal(): number {
    return this.getPorcentaje(this.getPromedioNormalesGlobal());
  }
  getPorcentajeAnormales(): number {
    return this.getPorcentaje(this.getPromedioAnormales());
  }
  getPorcentajeDuras(): number {
    return this.getPorcentaje(this.getPromedioDuras());
  }
  getPorcentajeFrescas(): number {
    return this.getPorcentaje(this.getPromedioFrescas());
  }
  getPorcentajeMuertas(): number {
    return this.getPorcentaje(this.getPromedioMuertas());
  }
  getPorcentajeTotal(): number {
    return this.getPorcentaje(this.getPromedioTotal());
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

    // Verificar si hay errores antes de continuar
    if (this.manejarProblemas()) {
      console.error('Errores detectados:', this.errores);
      return;
    }

    console.log('=== VALIDACION: Iniciando proceso de envío de germinación ===');

    // Validar datos básicos requeridos
    const reciboId = Number(this.reciboId) || null;
    if (!reciboId) {
      console.error('VALIDACION ERROR: No se encontró reciboId en la ruta');
      return;
    }


    if (this.repeticiones.length > 0) {
      // Validar datos de repeticiones
      for (let i = 0; i < this.repeticiones.length; i++) {
        const rep = this.repeticiones[i];
        if (!rep.normales || rep.normales.length === 0) {
          console.error(`VALIDACION ERROR: Repetición ${i + 1} no tiene datos de normales`);
          return;
        }
      }
    }

    // Construir payload mínimo compatible con backend (usamos strings cuando aplique)
    const buildPayload = (forEdit = false) => ({
      id: forEdit ? (this.editingId || null) : null,
      fechaInicio: this.fechas?.inicio || null,
      totalDias: Number(this.fechas?.totalDias) || 0,
      tratamiento: this.mapUiTablaToKey(this.tratamientoSemillas),
      nroSemillaPorRepeticion: Number(this.numSemillas) || 0,
      metodo: this.metodoId ? { id: Number(this.metodoId) } : null,
      temperatura: this.parseTemperaturaToFloat(this.temperatura),
      preFrio: this.mapPreFrioToEnum(this.preFrio),
      preTratamiento: this.mapPreTratamientoToEnum(this.preTratamiento),
      productoDosis: this.productoDosis || '',
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
      estandar: this.estandar || false,
      repetido: this.repetido || false,
      fechaCreacion: null,
      fechaRepeticion: null,
      fechaINASE: this.fechaINASE || null,
    });
    const payload: any = buildPayload(false);
    
    // DEBUG: Ver qué fechas se están enviando
    console.log('[onSubmit] Fechas en el payload:', {
      fechaInicio: payload.fechaInicio,
      fechaINASE: payload.fechaINASE,
      conteosArray: this.fechas?.conteos
    });

    if (this.isEditing && this.editingId) {
      const gid = this.editingId;
      const editPayload = buildPayload(true);

      // Validar payload de edición
      if (!editPayload.id) {
        console.error('VALIDACION ERROR: ID de edición no válido');
        return;
      }

      // Primero actualizar encabezado (DTO germinación)
      this.germSvc.editar(editPayload as any).subscribe({
        next: () => {
          // Luego persistir conteos/repeticiones/normales/finales para TODOS los tratamientos con datos
          this.persistirTodosLosTratamientos(gid, () => {
            // Log opcional
            const loteId = this.route.snapshot.paramMap.get('loteId');
            if (gid != null) {
              this.logService.crearLog(loteId ? parseInt(loteId) : 0, Number(gid), 'Germinacion', 'editada').subscribe();
            }

            // Redirigir al listado de germinación del lote/recibo
            if (this.loteId && this.reciboId) {
              this.router.navigate([this.loteId, this.reciboId, 'listado-germinacion']);
            } else {
              this.router.navigate(['/listado-germinacion']);
            }
          });
        },
        error: (err) => {
          console.error('VALIDACION ERROR: Error actualizando germinación en backend:', err);
          alert('Error al actualizar la germinación. Por favor intente nuevamente.');
        }
      });
      return;
    }


    this.germSvc.crear(payload).subscribe({
      next: (text: string) => {

        // El backend devuelve texto tipo: "Germinacion creada correctamente ID:1"
        const match = String(text || '').match(/ID\s*:?\s*(\d+)/i);
        const newId = match ? Number(match[1]) : null;

        if (newId) {
          // Persistir datos completos (conteos, repeticiones, normales y finales) para TODOS los tratamientos con datos
          this.persistirTodosLosTratamientos(newId, () => {
            // Redirigir al listado de germinación del lote/recibo
            if (this.loteId && this.reciboId) {
              this.router.navigate([this.loteId, this.reciboId, 'listado-germinacion']);
            } else {
              this.router.navigate(['/listado-germinacion']);
            }
            // Log opcional
            const loteId = this.route.snapshot.paramMap.get('loteId');
            if (newId != null) {
              this.logService.crearLog(loteId ? parseInt(loteId) : 0, Number(newId), 'Germinacion', 'creada').subscribe();
            }
          });
        } else {
          console.error('VALIDACION ERROR: No se pudo parsear el ID de creación de germinación. Respuesta:', text);
          alert('Error: No se pudo obtener el ID de la germinación creada');
        }
      },
      error: (err) => {
        console.error('VALIDACION ERROR: Error creando germinación en backend:', err);
        alert('Error al crear la germinación. Por favor intente nuevamente.');
      }
    });
  }

  // Persiste en backend los conteos, repeticiones y valores de la tabla para el tratamiento seleccionado
  private persistirFormularioEnBackend(germinacionId: number, done?: () => void) {

    if (!germinacionId || germinacionId <= 0) {
      console.error('VALIDACION ERROR: ID de germinación no válido para persistencia');
      return;
    }

    // Alinear largos de normales con cantidad de conteos actuales
    this.syncNormalesConConteos();

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
        
        // Crear conteos faltantes
        for (let i = desde; i < deseados; i++) {
          const fecha = this.fechas.conteos[i] || null;
          console.log(`[persistirFormulario] Crear conteo ${i+1}: fecha="${fecha}"`);
          const body: Partial<ConteoGerminacionDto> = { fechaConteo: fecha };
          crear$.push(this.tablasSvc.addConteo(germinacionId, body).pipe(catchError(err => { console.error('Error creando conteo', err); return of(null); })));
        }
        
        // Actualizar fechas de conteos existentes
        const actualizar$: any[] = [];
        for (let i = 0; i < Math.min(yaHay, this.fechas.conteos.length); i++) {
          const conteoExistente = existentes[i];
          const fechaNueva = this.fechas.conteos[i] || null;
          if (conteoExistente && fechaNueva) {
            console.log(`[persistirFormulario] Actualizar conteo ${i+1} (ID=${conteoExistente.id}): fecha="${fechaNueva}"`);
            // Actualizar la fecha del conteo existente
            actualizar$.push(
              this.tablasSvc.updateConteoFecha(conteoExistente.id!, fechaNueva)
                .pipe(catchError(err => { console.error('Error actualizando fecha de conteo', err); return of(null); }))
            );
          }
        }
        
        const todasLasOps$ = [...crear$, ...actualizar$];
        const cuandoCreados = todasLasOps$.length ? forkJoin(todasLasOps$) : of([] as any[]);
        cuandoCreados.subscribe({
          next: () => {
            // 2) Obtener conteos con IDs
            this.tablasSvc.listConteos(germinacionId).subscribe({
              next: (conteosActuales: ConteoGerminacionDto[]) => {
                const conteosOrdenados = (conteosActuales || []).sort((a,b) => (Number(a.numeroConteo||0) - Number(b.numeroConteo||0)));
                const tablaKey = this.mapUiTablaToKey(this.tratamientoSemillas);

                // 3) Crear repeticiones necesarias (por número de fila)
                const crearReps$: any[] = (this.repeticiones || []).map(rep =>
                  this.tablasSvc.addRepeticionNumero(germinacionId, tablaKey, this.parseNumLocale(rep.numero))
                    .pipe(catchError(err => { console.error('Error creando repetición', err); return of(null); }))
                );
                const repsListo$ = crearReps$.length ? forkJoin(crearReps$) : of([] as any[]);

                repsListo$.subscribe({
                  next: () => {
                    // 4) Upsert de normales (por celda) mapeando por numeroConteo
                    const upsertsNormales$: any[] = [];
                    const mapaConteo = new Map<number, ConteoGerminacionDto>();
                    conteosOrdenados.forEach(c => {
                      const n = Number((c as any)?.numeroConteo || 0);
                      if (n > 0) mapaConteo.set(n, c);
                    });
                    (this.repeticiones || []).forEach(rep => {
                      for (let n = 1; n <= conteosOrdenados.length; n++) {
                        const c = mapaConteo.get(n) || conteosOrdenados[n - 1];
                        if (!c?.id) { console.error('VALIDACION ERROR: Conteo sin id para numeroConteo', n, c); continue; }
                        const idx = n - 1;
                        const body: NormalPorConteoDto = {
                          germinacionId: germinacionId,
                          tabla: tablaKey,
                          numeroRepeticion: this.parseNumLocale(rep.numero),
                          conteoId: Number(c.id),
                          normal: this.parseNumLocale(rep.normales?.[idx])
                        };
                        upsertsNormales$.push(
                          this.tablasSvc.upsertNormal(tablaKey, body).pipe(catchError(err => { console.error('Error guardando normal', err, body); return of(null); }))
                        );
                      }
                    });

                    const normalesListo$ = upsertsNormales$.length ? forkJoin(upsertsNormales$) : of([] as any[]);
                    normalesListo$.subscribe({
                      next: () => {
                        // 5) Upsert de finales (por fila)
                        const upsertsFinales$: any[] = (this.repeticiones || []).map(rep => {
                          const finBody: RepeticionFinalDto = {
                            activo: true,
                            germinacionId: germinacionId,
                            numeroRepeticion: this.parseNumLocale(rep.numero),
                            anormal: this.parseNumLocale(rep.anormales),
                            duras: this.parseNumLocale(rep.duras),
                            frescas: this.parseNumLocale(rep.frescas),
                            muertas: this.parseNumLocale(rep.muertas)
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

    if (!germinacionId || germinacionId <= 0) {
      console.error('VALIDACION ERROR: ID de germinación no válido para persistir tratamientos');
      if (done) done();
      return;
    }

    const deseados = Math.max(1, (this.fechas?.conteos?.length || 1));

    // 1) Asegurar cantidad de conteos UNA vez
    this.tablasSvc.listConteos(germinacionId).subscribe({
      next: (existentes: ConteoGerminacionDto[]) => {
        const yaHay = existentes?.length || 0;
        const faltan = Math.max(0, deseados - yaHay);
        const crear$: any[] = [];
        const actualizar$: any[] = [];
        
        // Crear conteos faltantes
        for (let i = yaHay; i < deseados; i++) {
          const fecha = this.fechas.conteos[i] || null;
          console.log(`[persistirTodosLosTratamientos] Crear conteo ${i+1}: fecha="${fecha}"`);
          const body: Partial<ConteoGerminacionDto> = { fechaConteo: fecha };
          crear$.push(this.tablasSvc.addConteo(germinacionId, body).pipe(catchError(err => { console.error('Error creando conteo', err); return of(null); })));
        }
        
        // Actualizar fechas de conteos existentes
        for (let i = 0; i < Math.min(yaHay, this.fechas.conteos.length); i++) {
          const conteoExistente = existentes[i];
          const fechaNueva = this.fechas.conteos[i] || null;
          if (conteoExistente && fechaNueva) {
            console.log(`[persistirTodosLosTratamientos] Actualizar conteo ${i+1} (ID=${conteoExistente.id}): fecha="${fechaNueva}"`);
            actualizar$.push(
              this.tablasSvc.updateConteoFecha(conteoExistente.id!, fechaNueva)
                .pipe(catchError(err => { console.error('Error actualizando fecha de conteo', err); return of(null); }))
            );
          }
        }
        
        const todasLasOps$ = [...crear$, ...actualizar$];
        const cuandoCreados = todasLasOps$.length ? forkJoin(todasLasOps$) : of([] as any[]);
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
                    console.log('VALIDACION: No hay repeticiones para', k, ', saltando');
                    return; // nada que persistir; quedará la repetición 1 vacía creada en backend
                  }

                  // Alinear largos de normales con cantidad de conteos
                  reps.forEach(r => {
                    if (!Array.isArray(r.normales)) r.normales = [] as any;
                    const need = conteosOrdenados.length;
                    while (r.normales.length < need) { r.normales.push(0); }
                    if (r.normales.length > need) { r.normales = r.normales.slice(0, need); }
                  });

                  // Validar estructura de repeticiones
                  reps.forEach((rep, index) => {
                    if (!rep.normales || !Array.isArray(rep.normales)) {
                      console.error('VALIDACION ERROR: Repetición', index, 'no tiene normales válidos:', rep);
                    }
                    if (rep.numero === undefined || rep.numero === null) {
                      console.error('VALIDACION ERROR: Repetición', index, 'no tiene número válido:', rep);
                    }
                  });

                  // FASE 1: Crear repeticiones primero
                  const crearReps$ = reps.map(rep =>
                    this.tablasSvc.addRepeticionNumero(germinacionId, k, this.parseNumLocale(rep.numero))
                      .pipe(catchError(err => { console.error('Error creando repetición', err); return of(null); }))
                  );
                  
                  ops$.push(
                    (crearReps$.length ? forkJoin(crearReps$) : of([])).pipe(
                      // FASE 2: Después de crear repeticiones, guardar normales y finales
                      switchMap(() => {
                        const datosOps$: any[] = [];
                        
                        // Upsert normales por cada conteo mapeando por numeroConteo
                        const mapaConteo = new Map<number, ConteoGerminacionDto>();
                        conteosOrdenados.forEach(c => {
                          const n = Number((c as any)?.numeroConteo || 0);
                          if (n > 0) mapaConteo.set(n, c);
                        });
                        
                        // Obtener promedios globales de la tabla actual
                        const promediosGlobales = k === selKey ? {
                          normales: this.promedioManualNormales,
                          anormal: this.promedioManualAnormales,
                          duras: this.promedioManualDuras,
                          frescas: this.promedioManualFrescas,
                          muertas: this.promedioManualMuertas,
                          total: this.promedioManualTotal
                        } : (this.tratamientosData[k]?.promedios || { normales: [], anormal: 0, duras: 0, frescas: 0, muertas: 0, total: 0 });
                        
                        console.log(`[persistirTodos] Tabla:${k}, Promedios:`, promediosGlobales);
                        
                        reps.forEach(rep => {
                          for (let n = 1; n <= conteosOrdenados.length; n++) {
                            const c = mapaConteo.get(n) || conteosOrdenados[n - 1];
                            if (!germinacionId || !c?.id || rep.numero === undefined) {
                              console.error('VALIDACION ERROR: Datos incompletos para normal', { germinacionId, conteoId: c?.id, numeroRepeticion: rep.numero, tabla: k });
                              continue;
                            }
                            const idx = n - 1;
                            const valorNormal = this.parseNumLocale(rep.normales?.[idx]);
                            const valorPromedioNormal = this.parseNumLocale(promediosGlobales.normales?.[idx]);
                            const body: NormalPorConteoDto = {
                              germinacionId: germinacionId,
                              tabla: k,
                              numeroRepeticion: this.parseNumLocale(rep.numero),
                              conteoId: Number(c.id),
                              normal: valorNormal,
                              promedioNormal: valorPromedioNormal
                            };
                            console.log(`[persistirTodos] Guardando Normal - Tabla:${k}, Rep:${rep.numero}, Conteo${n}, Normal:${valorNormal}, PromedioNormal:${valorPromedioNormal}`);
                            datosOps$.push(
                              this.tablasSvc.upsertNormal(k, body).pipe(
                                catchError(err => {
                                  console.error('VALIDACION ERROR: Error guardando normal', { error: err, tabla: k, body: body });
                                  return of(null);
                                })
                              )
                            );
                          }
                        });

                        // Upsert finales por fila
                        reps.forEach(rep => {
                          // Validar datos antes de enviar
                          if (!germinacionId || rep.numero === undefined) {
                            console.error('VALIDACION ERROR: Datos incompletos para finales', {
                              germinacionId,
                              numeroRepeticion: rep.numero,
                              tabla: k
                            });
                            return;
                          }

                          const finBody: RepeticionFinalDto = {
                            activo: true,
                            germinacionId: germinacionId,
                            numeroRepeticion: this.parseNumLocale(rep.numero),
                            anormal: this.parseNumLocale(rep.anormales),
                            duras: this.parseNumLocale(rep.duras),
                            frescas: this.parseNumLocale(rep.frescas),
                            muertas: this.parseNumLocale(rep.muertas),
                            promedioAnormal: this.parseNumLocale(promediosGlobales.anormal),
                            promedioDuras: this.parseNumLocale(promediosGlobales.duras),
                            promedioFrescas: this.parseNumLocale(promediosGlobales.frescas),
                            promedioMuertas: this.parseNumLocale(promediosGlobales.muertas),
                            promedioTotal: this.parseNumLocale(promediosGlobales.total)
                          };

                          datosOps$.push(
                            this.tablasSvc.upsertFinales(k, finBody).pipe(
                              catchError(err => {
                                console.error('VALIDACION ERROR: Error guardando finales', {
                                  error: err,
                                  tabla: k,
                                  body: finBody
                                });
                                return of(null);
                              })
                            )
                          );
                        });
                        
                        return datosOps$.length ? forkJoin(datosOps$) : of([]);
                      })
                    )
                  );
                });

                const exec$ = ops$.length ? forkJoin(ops$) : of([] as any[]);
                exec$.subscribe({
                  next: (results) => {
                    console.log('VALIDACION OK: Todas las operaciones completadas:', results);
                    if (done) done();
                  },
                  error: (err) => {
                    console.error('VALIDACION ERROR: Error en operaciones batch:', err);
                    if (done) done();
                  }
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

    // Navegar de vuelta al listado de germinaciones del recibo específico
    this.router.navigate([this.loteId + "/" + this.reciboId + "/listado-germinacion"]);
  }

  validarNumeroNegativo(valor: number): boolean {
    return valor < 0;
  }

  validarPromedioNegativoOMayoraCiento(promedio: number): boolean {
    return promedio < 0 || promedio > 100;
  }

  onSelectChanges() {
    this.manejarProblemas();
    this.onTratamientoChange();
  }

  manejarProblemas(): boolean {
    this.errores = []; // Reiniciar errores

    const hoy = new Date();
    const fecha = this.fechas.inicio ? new Date(this.fechas.inicio ) : null;


    if (this.validarNumeroNegativo(this.fechas.totalDias || 0)) {
      this.errores.push('El total de días no puede ser negativo.');
    }

    // Validar que el número de repetición no sea negativo
    if (this.repeticiones.some(rep => this.validarNumeroNegativo(Number(rep.numero || 0)) || this.validarNumeroNegativo(Number(rep.anormales || 0)) || this.validarNumeroNegativo(Number(rep.duras || 0)) || this.validarNumeroNegativo(Number(rep.frescas || 0)) || this.validarNumeroNegativo(Number(rep.muertas || 0)) || this.getTotal(rep) < 0)) {
      this.errores.push('Las repeticiones no pueden ser negativas.');
    }

    for (let i = 0; i < this.fechas.conteos.length; i++) {
      if (this.validarPromedioNegativoOMayoraCiento(this.getPromedioNormales(i))) {
        this.errores.push('El promedio de normales no puede ser negativo o mayor a 100.');
      }

      if ((this.validarPromedioNegativoOMayoraCiento(this.promedioManualNormales[i] ?? 0))) {
        this.errores.push('El promedio manual de normales no puede ser negativo o mayor a 100.');
      }
    }

    if (this.validarPromedioNegativoOMayoraCiento(this.getPromedioAnormales())) {
      this.errores.push('El promedio de anormales no puede ser negativo o mayor a 100.');
    }

    if (this.validarPromedioNegativoOMayoraCiento(this.getPromedioDuras())) {
      this.errores.push('El promedio de duras no puede ser negativo o mayor a 100.');
    }

    if (this.validarPromedioNegativoOMayoraCiento(this.getPromedioFrescas())) {
      this.errores.push('El promedio de frescas no puede ser negativo o mayor a 100.');
    }

    if (this.validarPromedioNegativoOMayoraCiento(this.getPromedioMuertas())) {
      this.errores.push('El promedio de muertas global no puede ser negativo o mayor a 100.');
    }

    if (this.validarPromedioNegativoOMayoraCiento(this.getPromedioNormalesGlobal())) {
      this.errores.push('El promedio de normales global no puede ser negativo o mayor a 100.');
    }

    if (this.validarPromedioNegativoOMayoraCiento(this.promedioManualAnormales)) {
      this.errores.push('El promedio manual de anormales no puede ser negativo o mayor a 100.');
    }

    if (this.validarPromedioNegativoOMayoraCiento(this.promedioManualDuras)) {
      this.errores.push('El promedio manual de duras no puede ser negativo o mayor a 100.');
    }

    if (this.validarPromedioNegativoOMayoraCiento(this.promedioManualFrescas)) {
      this.errores.push('El promedio manual de frescas no puede ser negativo o mayor a 100.');
    }

    if (this.validarPromedioNegativoOMayoraCiento(this.promedioManualMuertas)) {
      this.errores.push('El promedio manual de muertas no puede ser negativo o mayor a 100.');
    }

    if (this.validarPromedioNegativoOMayoraCiento(this.promedioManualTotal)) {
      this.errores.push('El promedio manual total no puede ser negativo o mayor a 100.');
    }

    if (this.validarNumeroNegativo(this.inia.pNormales)|| this.validarNumeroNegativo(this.inia.pAnormales) || this.validarNumeroNegativo(this.inia.duras) || this.validarNumeroNegativo(this.inia.frescas) || this.validarNumeroNegativo(this.inia.muertas) || this.validarNumeroNegativo(this.inia.germinacion)) {
      this.errores.push('Los valores de INIA no pueden ser negativos.');
    }

    if (this.validarNumeroNegativo(this.inase.pNormales) || this.validarNumeroNegativo(this.inase.pAnormales) || this.validarNumeroNegativo(this.inase.duras) || this.validarNumeroNegativo(this.inase.frescas) || this.validarNumeroNegativo(this.inase.muertas) || this.validarNumeroNegativo(this.inase.germinacion)) {
      this.errores.push('Los valores de INASE no pueden ser negativos.');
    }

    // Validación nueva: total de cada repetición no debe superar número de semillas por repetición
    const semillasPorRep = Number(this.numSemillas) || 0;
    if (semillasPorRep > 0) {
      this.repeticiones.forEach((rep, idx) => {
        const totalRep = this.getTotal(rep);
        if (totalRep > semillasPorRep) {
          this.errores.push(`La repetición ${rep.numero || (idx+1)} supera el número de semillas (${totalRep} > ${semillasPorRep}).`);
        }
      });
    }

    return this.errores.length > 0;
  }

  validarFecha(fecha: string): boolean {
    if (!fecha) return false;
    const selectedDate = new Date(fecha);
    const today = new Date();

    // Ignorar la hora para comparar solo las fechas
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    // Devuelve true si la fecha es inválida (futura)
    return selectedDate > today;
  }

  getTotalDias(): boolean {
    if (this.fechas.totalDias == null || isNaN(Number(this.fechas.totalDias))) {
      return false;
    }

    return Number(this.fechas.totalDias) < 0;
  }

}

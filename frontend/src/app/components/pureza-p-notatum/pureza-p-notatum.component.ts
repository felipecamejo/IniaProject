import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { TabsModule } from 'primeng/tabs';
import { PurezaPNotatumService } from '../../../services/PurezaPNotatumService';
import { PurezaPNotatumDto } from '../../../models/PurezaPNotatum.dto';
import { RepeticionPPN } from '../../../models/RepeticionPPN.dto';
import { LogService } from '../../../services/LogService';

@Component({
  selector: 'app-pureza-p-notatum',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    MultiSelectModule,
    TabsModule
  ],
  templateUrl: './pureza-p-notatum.component.html',
  styleUrl: './pureza-p-notatum.component.scss'
})
export class PurezaPNotatumComponent implements OnInit {
  // Agregar propiedades para manejar errores
  errores: string[] = [];

  // Variables para manejar navegación
  isEditing: boolean = false;
  isViewing: boolean = false;
  editingId: number | null = null;

  loteId: string | null = '';
  reciboId: string | null = '';

  // Propiedades para checkboxes
  repetido: boolean = false;
  estandar: boolean = false;

  // Campos del formulario
  semillaPuraGr: number = 0;
  semillaPuraPct: number = 0;
  semillaCultivosGr: number = 0;
  semillaCultivosPct: number = 0;
  semillaMalezasGr: number = 0;
  semillaMalezasPct: number = 0;
  materiaInerteGr: number = 0;
  materiaInertePct: number = 0;

  comentarios: string = '';
  activo: boolean = true;
  fechaCreacion: string | null = null;
  fechaRepeticion: string | null = null;

  // Tabla de repeticiones
  repeticiones: RepeticionPPN[] = [];

  // Mantener las repeticiones del backend para edición
  repeticionesEntries: RepeticionPPN[] = [];
  deletedRepeticionesIds: number[] = [];
  // Totales para mostrar en el template
  get totalSemillasSanasPeso(): number {
    return this.repeticiones.reduce((acc, rep) => acc + (rep.gramosSemillasSanas || 0), 0);
  }
  get totalSemillasContaminadasPeso(): number {
    return this.repeticiones.reduce((acc, rep) => acc + (rep.gramosContaminadasYVanas || 0), 0);
  }

  // Cálculos automáticos según planilla Excel
  // Pi: peso total de semillas analizadas (suma de peso por repetición)
  get totalPesoAnalizado(): number {
    return this.repeticiones.reduce((acc, rep) => acc + (rep.peso || 0), 0);
  }

  // At: peso total de semillas contaminadas y vanas
  get totalPesoContaminadasYVanas(): number {
    return this.repeticiones.reduce((acc, rep) => acc + (rep.gramosContaminadasYVanas || 0), 0);
  }

  // A% = (At / Pi) * Pu%  (Pu% proviene del bloque superior ISTA)
  get aPct(): number | null {
    const pi = this.totalPesoAnalizado;
    const at = this.totalPesoContaminadasYVanas;
    const pu = this.semillaPuraPct; // porcentaje de semilla pura (Pu%)
    if (!pi || pu == null) return null;
    return (at / pi) * pu;
  }

  // Alias para compatibilidad con el template si usa A% total
  get aPctTotal(): number | null {
    const a = this.aPct;
    const mi = this.materiaInertePct; // porcentaje de materia inerte del bloque ISTA
    if (a == null || mi == null) return null;
    const total = a + mi;
    if (total < 0) return 0;
    return total > 100 ? 100 : total;
  }

  // % semillas llenas y sanas = Pu% - A%
  get pctSemillasLlenasYSanas(): number | null {
    const atotal = this.aPctTotal;
    const pu = this.semillaPuraPct;
    if (atotal == null || pu == null) return null;
    const value = pu - atotal;
    return value < 0 ? 0 : value;
  }

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private purezaPNotatumService: PurezaPNotatumService,
    private logService: LogService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.editingId = parseInt(params['id']);
        // Verificar si es modo visualización por query parameter
        this.route.queryParams.subscribe(queryParams => {
          this.isViewing = queryParams['view'] === 'true';
          this.isEditing = !this.isViewing;
        });
        this.cargarDatosParaEdicion(this.editingId);
      } else {
        this.isEditing = false;
        this.isViewing = false;
        this.editingId = null;
        this.limpiarCampos();
      }
    });
  }

  // Getter para determinar si está en modo readonly
  get isReadonly(): boolean {
    return this.isViewing;
  }

  cargarDatosParaEdicion(id: number) {
    // Cargar los datos reales desde el servicio
    this.purezaPNotatumService.obtener(id).subscribe({
      next: (data: PurezaPNotatumDto) => {
        console.log('Pureza P. notatum obtenido para editar:', data);
        // Mapear los campos del DTO al formulario
        this.semillaPuraGr = data.gramosSemillaPura || 0;
        this.semillaCultivosGr = data.gramosSemillasCultivos || 0;
        this.semillaMalezasGr = data.gramosSemillasMalezas || 0;
        this.materiaInerteGr = data.gramosMateriaInerte || 0;
        this.comentarios = data.observaciones || '';
        this.activo = data.activo ?? true;
        this.repetido = data.repetido ?? false;
        this.fechaCreacion = data.fechaCreacion || null;
        this.fechaRepeticion = data.fechaRepeticion || null;
        this.reciboId = this.route.snapshot.params['reciboId'];

        // Cargar las repeticiones asociadas
        this.purezaPNotatumService.listarRepeticiones(id).subscribe({
          next: (reps: RepeticionPPN[]) => {
            console.log('Repeticiones cargadas para edición:', reps);
            if (reps && reps.length > 0) {
              this.repeticionesEntries = reps.map((r) => ({
                id: r.id ?? null,
                nroSemillasPuras: r.nroSemillasPuras ?? null,
                peso: r.peso ?? null,
                cantidadSemillasSanas: r.cantidadSemillasSanas ?? null,
                gramosSemillasSanas: r.gramosSemillasSanas ?? null,
                contaminadasYVanas: r.contaminadasYVanas ?? null,
                gramosContaminadasYVanas: r.gramosContaminadasYVanas ?? null,
                purezaPNotatum: r.purezaPNotatum ?? null
              } as RepeticionPPN));
              this.repeticiones = [...this.repeticionesEntries];
              console.log('Repeticiones del backend:', reps);
              console.log('RepeticionesEntries mapeadas:', this.repeticionesEntries);
              console.log('Repeticiones mapeadas:', this.repeticiones);
            } else {
              this.repeticionesEntries = [];
              this.repeticiones = [];
            }
          },
          error: (err) => {
            console.error('Error cargando repeticiones:', err);
            this.repeticionesEntries = [];
            this.repeticiones = [];
          }
        });
      },
      error: (err) => {
        console.error('Error obteniendo Pureza P. notatum:', err);
      }
    });
  }

  limpiarCampos() {
    this.repeticiones = [];
    this.repeticionesEntries = [];
    this.deletedRepeticionesIds = [];
    this.semillaPuraGr = 0;
    this.semillaPuraPct = 0;
    this.semillaCultivosGr = 0;
    this.semillaCultivosPct = 0;
    this.semillaMalezasGr = 0;
    this.semillaMalezasPct = 0;
    this.materiaInerteGr = 0;
    this.materiaInertePct = 0;
    this.comentarios = '';
    this.activo = true;
    this.repetido = false;
    this.fechaCreacion = null;
    this.fechaRepeticion = null;
  }

  agregarRepeticion() {
    const nuevaRepeticion: RepeticionPPN = {
      id: null,
      nroSemillasPuras: null,
      peso: null,
      cantidadSemillasSanas: null,
      gramosSemillasSanas: null,
      contaminadasYVanas: null,
      gramosContaminadasYVanas: null,
      purezaPNotatum: null
    };
    this.repeticiones.push(nuevaRepeticion);
    this.repeticionesEntries.push({...nuevaRepeticion});
    console.log('Repetición agregada. Total repeticiones:', this.repeticiones.length);
  }

  eliminarRepeticion(idx: number) {
    if (this.repeticiones.length > 0) {
      this.repeticiones.splice(idx, 1);
      
      // Sincronizar repeticionesEntries
      const removed: RepeticionPPN[] = this.repeticionesEntries.splice(idx, 1);
      if (removed && removed.length > 0 && removed[0].id) {
        this.deletedRepeticionesIds.push(removed[0].id as number);
      }
      
      console.log('Repetición eliminada. Total repeticiones:', this.repeticiones.length);
      console.log('RepeticionesEntries después de eliminar:', this.repeticionesEntries);
    }
  }

  // Método para sincronizar cambios desde los inputs
  onRepeticionChange(index: number, field: keyof RepeticionPPN, value: any) {
    const numericValue = parseFloat(value) || null;

    
    // Actualizar tanto repeticiones como repeticionesEntries
    if (this.repeticiones[index]) {
      (this.repeticiones[index] as any)[field] = numericValue;
    }
    if (this.repeticionesEntries[index]) {
      (this.repeticionesEntries[index] as any)[field] = numericValue;
    }
    console.log('RepeticionesEntries actualizadas:', this.repeticionesEntries);
  }

  onSubmit() {

    if (this.manejarProblemas()) {
      console.error('Errores de validación:', this.errores);
      return;
    }

    // Sincronizar repeticiones a repeticionesEntries antes de enviar
    this.repeticionesEntries = this.repeticiones.map(rep => ({...rep}));
    
    const reciboIdNum = this.route.snapshot.params['reciboId'] ? Number(this.route.snapshot.params['reciboId']) : null;
    
    const purezaData: PurezaPNotatumDto = {
      id: this.editingId ?? null,
      gramosSemillaPura: this.semillaPuraGr,
      gramosSemillasCultivos: this.semillaCultivosGr,
      gramosSemillasMalezas: this.semillaMalezasGr,
      gramosMateriaInerte: this.materiaInerteGr,
      activo: this.activo,
      repetido: this.repetido,
      reciboId: reciboIdNum,
      fechaCreacion: this.fechaCreacion,
      fechaRepeticion: this.fechaRepeticion,
      observaciones: this.comentarios
    };

    if (this.isEditing && this.editingId) {
      // Actualizar Pureza P. notatum existente
      if (this.repetido && (!purezaData.repetido || purezaData.fechaRepeticion == null)) {
        purezaData.repetido = true;
        purezaData.fechaRepeticion = new Date().toISOString().split('T')[0];
      }
      console.log('Actualizando Pureza P. notatum ID:', this.editingId, 'con datos:', purezaData);
      this.purezaPNotatumService.editar(purezaData).subscribe({
        next: (res) => {
          console.log('Pureza P. notatum actualizado correctamente:', res);
          // Procesar repeticiones
          this.procesarRepeticiones(this.editingId!).then(() => {

            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const username = user?.nombre || 'Desconocido';
            const rol = this.obtenerRolMasAlto(user?.roles);

            if (res != null) {
              const mensaje = `Pureza con ID #${res} fue creada por ${username} con rol ${rol}`;
              this.logService.crearLog({ id: null, texto: mensaje, fechaCreacion: new Date().toISOString() }).subscribe();
            }

            this.safeNavigateToListado();
          }).catch(err => {
            console.error('Error procesando repeticiones después de editar:', err);
            this.safeNavigateToListado();
          });
        },
        error: (err) => {
          console.error('Error actualizando Pureza P. notatum:', err);
        }
      });
    } else {
      // Crear nueva Pureza P. notatum
      console.log('Creando nueva Pureza P. notatum:', purezaData);
      purezaData.fechaRepeticion = null;
      purezaData.repetido = false;
      purezaData.fechaCreacion = new Date().toISOString().split('T')[0];
      
      this.purezaPNotatumService.crear(purezaData).subscribe({
        next: (res) => {
          console.log('Pureza P. notatum creado correctamente:', res);
          // Procesar repeticiones
          this.procesarRepeticiones(res).then(() => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const username = user?.nombre || 'Desconocido';
            const rol = this.obtenerRolMasAlto(user?.roles);

            if (res != null) {
              const mensaje = `Pureza con ID #${res} fue creada por ${username} con rol ${rol}`;
              this.logService.crearLog({ id: null, texto: mensaje, fechaCreacion: new Date().toISOString() }).subscribe();
            }

            this.safeNavigateToListado();
          }).catch(err => {
            console.error('Error procesando repeticiones después de crear:', err);
            this.safeNavigateToListado();
          });
        },
        error: (err) => {
          console.error('Error creando Pureza P. notatum:', err);
        }
      });
    }
  }

  private async procesarRepeticiones(purezaPNotatumId: number): Promise<void> {
    const payload: RepeticionPPN[] = this.repeticionesEntries.map((r) => ({
      ...r,
      purezaPNotatum: purezaPNotatumId
    }));
    
    console.log('Payload repeticiones a crear:', payload);
    
    return new Promise((resolve, reject) => {
      if (!payload || payload.length === 0) return resolve();
      this.purezaPNotatumService.actualizarRepeticiones(purezaPNotatumId, payload).subscribe({
        next: (resp) => {
          console.log('Repeticiones creadas exitosamente:', resp);
          resolve();
        },
        error: (err) => reject(err)
      });
    });
  }

    obtenerRolMasAlto(roles: string[] | string | undefined): string {
    // Si no hay roles, retornar 'Desconocido'
    if (!roles) return 'Desconocido';
          
    // Si es un string, convertir a array
    const rolesArray = Array.isArray(roles) ? roles : [roles];
          
    // Definir jerarquía de roles (de mayor a menor)
    if (rolesArray.includes('ADMIN')) return 'Administrador';
    if (rolesArray.includes('ANALISTA')) return 'Analista';
    if (rolesArray.includes('OBSERVADOR')) return 'Observador';
          
    return 'Desconocido';
  }


  onCancel() {
    this.safeNavigateToListado();
  }

  private safeNavigateToListado() {
    const lote = this.route.snapshot.params['loteId'];
    const recibo = this.route.snapshot.params['reciboId'];
    const segments = [] as string[];
    if (lote) segments.push(lote);
    if (recibo) segments.push(recibo);
    segments.push('listado-pureza-p-notatum');
    console.log('Navegando a listado con segmentos:', segments);
    this.router.navigate(segments);
  }

  manejarProblemas(): boolean {
    this.errores = []; // Reiniciar errores

    // Validaciones para las repeticiones
    if (this.repeticiones.some(rep => rep.nroSemillasPuras == null || rep.nroSemillasPuras <= 0)) {
      this.errores.push('Todas las repeticiones deben tener un número de semillas puras válido mayor que 0.');
    }

    if (this.repeticiones.some(rep => rep.peso == null || rep.peso <= 0)) {
      this.errores.push('Todas las repeticiones deben tener un peso válido mayor que 0.');
    }

    if (this.repeticiones.some(rep => rep.cantidadSemillasSanas == null || rep.cantidadSemillasSanas <= 0)) {
      this.errores.push('Todas las repeticiones deben tener un número de semillas sanas válido mayor que 0.');
    }

    if (this.repeticiones.some(rep => rep.gramosSemillasSanas == null || rep.gramosSemillasSanas <= 0)) {
      this.errores.push('Todas las repeticiones deben tener un peso de semillas sanas válido mayor que 0.');
    }

    if (this.repeticiones.some(rep => rep.contaminadasYVanas == null || rep.contaminadasYVanas <= 0)) {
      this.errores.push('Todas las repeticiones deben tener un número de semillas contaminadas y vanas válido mayor que 0.');
    }

    if (this.repeticiones.some(rep => rep.gramosContaminadasYVanas == null || rep.gramosContaminadasYVanas <= 0)) {
      this.errores.push('Todas las repeticiones deben tener un peso de semillas contaminadas y vanas válido mayor que 0.');
    }

    // Validaciones para los campos de porcentaje
    if (this.semillaPuraPct != null && (this.semillaPuraPct < 0 || this.semillaPuraPct > 100)) {
      this.errores.push('El porcentaje de semilla pura debe estar entre 0 y 100.');
    }

    if (this.semillaCultivosPct != null && (this.semillaCultivosPct < 0 || this.semillaCultivosPct > 100)) {
      this.errores.push('El porcentaje de semilla de cultivos debe estar entre 0 y 100.');
    }

    if (this.semillaMalezasPct != null && (this.semillaMalezasPct < 0 || this.semillaMalezasPct > 100)) {
      this.errores.push('El porcentaje de semilla de malezas debe estar entre 0 y 100.');
    }

    if (this.materiaInertePct != null && (this.materiaInertePct < 0 || this.materiaInertePct > 100)) {
      this.errores.push('El porcentaje de materia inerte debe estar entre 0 y 100.');
    }

    // Validaciones adicionales para los gramos
    if (this.semillaPuraGr != null && this.semillaPuraGr < 0) {
      this.errores.push('Los gramos de semilla pura no pueden ser negativos.');
    }

    if (this.semillaCultivosGr != null && this.semillaCultivosGr < 0) {
      this.errores.push('Los gramos de semilla de cultivos no pueden ser negativos.');
    }

    if (this.semillaMalezasGr != null && this.semillaMalezasGr < 0) {
      this.errores.push('Los gramos de semilla de malezas no pueden ser negativos.');
    }

    if (this.materiaInerteGr != null && this.materiaInerteGr < 0) {
      this.errores.push('Los gramos de materia inerte no pueden ser negativos.');
    }

    return this.errores.length > 0;
  }

}

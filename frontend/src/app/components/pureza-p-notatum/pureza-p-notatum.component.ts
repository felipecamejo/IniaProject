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

// Interface local para manejar las repeticiones en el formulario
export interface RepeticionPPNLocal {
  numero: number;
  semillasPuras: number;
  pesoSemillasPuras: number;
  semillasSanasCantidad: number;
  semillasSanasPeso: number;
  semillasContaminadasCantidad: number;
  semillasContaminadasPeso: number;
  controlPesos: number;
}

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
  // Variables para manejar navegación
  isEditing: boolean = false;
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
  repeticiones: RepeticionPPNLocal[] = [];

  // Mantener las repeticiones del backend para edición
  repeticionesEntries: RepeticionPPN[] = [];
  deletedRepeticionesIds: number[] = [];
  // Totales para mostrar en el template
  get totalSemillasSanasPeso(): number {
    return this.repeticiones.reduce((acc, rep) => acc + (rep.semillasSanasPeso || 0), 0);
  }
  get totalSemillasContaminadasPeso(): number {
    return this.repeticiones.reduce((acc, rep) => acc + (rep.semillasContaminadasPeso || 0), 0);
  }

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private purezaPNotatumService: PurezaPNotatumService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditing = true;
        this.editingId = parseInt(params['id']);
        this.cargarDatosParaEdicion(this.editingId);
      } else {
        this.isEditing = false;
        this.editingId = null;
        this.limpiarCampos();
      }
    });
  }

  cargarDatosParaEdicion(id: number) {
    // Cargar los datos reales desde el servicio
    this.purezaPNotatumService.obtener(id).subscribe({
      next: (data: PurezaPNotatumDto) => {
        console.log('Pureza P. notatum obtenido para editar:', data);
        // Mapear los campos del DTO al formulario
        this.semillaPuraGr = data.porcentaje || 0; // Ajustar según el DTO real
        this.semillaPuraPct = data.porcentaje || 0;
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
                gramosControlDePesos: r.gramosControlDePesos ?? null,
                PurezaPPNId: r.PurezaPPNId ?? null
              } as RepeticionPPN));
              
              this.repeticiones = this.repeticionesEntries.map((r, index) => ({
                numero: index + 1,
                semillasPuras: r.nroSemillasPuras ?? 0,
                pesoSemillasPuras: r.peso ?? 0,
                semillasSanasCantidad: r.cantidadSemillasSanas ?? 0,
                semillasSanasPeso: r.gramosSemillasSanas ?? 0,
                semillasContaminadasCantidad: r.contaminadasYVanas ?? 0,
                semillasContaminadasPeso: r.gramosContaminadasYVanas ?? 0,
                controlPesos: r.gramosControlDePesos ?? 0
              }));
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
    const nextNum = this.repeticiones.length + 1;
    this.repeticiones.push({
      numero: nextNum,
      semillasPuras: 0,
      pesoSemillasPuras: 0,
      semillasSanasCantidad: 0,
      semillasSanasPeso: 0,
      semillasContaminadasCantidad: 0,
      semillasContaminadasPeso: 0,
      controlPesos: 0
    });
    this.repeticionesEntries.push({
      id: null,
      nroSemillasPuras: null,
      peso: null,
      cantidadSemillasSanas: null,
      gramosSemillasSanas: null,
      contaminadasYVanas: null,
      gramosContaminadasYVanas: null,
      gramosControlDePesos: null,
      PurezaPPNId: null
    } as RepeticionPPN);
  }

  eliminarRepeticion(idx: number) {
    this.repeticiones.splice(idx, 1);
    // Renumerar las repeticiones restantes
    this.repeticiones.forEach((r, i) => r.numero = i + 1);
    
    // Sincronizar repeticionesEntries
    const removed: RepeticionPPN[] = this.repeticionesEntries.splice(idx, 1);
    if (removed && removed.length > 0 && removed[0].id) {
      this.deletedRepeticionesIds.push(removed[0].id as number);
    }
  }

  // Método para sincronizar cambios desde los inputs
  onRepeticionChange(index: number, field: string, value: any) {
    const numericValue = parseFloat(value) || 0;
    
    if (this.repeticiones[index]) {
      (this.repeticiones[index] as any)[field] = numericValue;
    }
    
    if (this.repeticionesEntries[index]) {
      // Mapear campos locales a campos del DTO
      const fieldMap: any = {
        'semillasPuras': 'nroSemillasPuras',
        'pesoSemillasPuras': 'peso',
        'semillasSanasCantidad': 'cantidadSemillasSanas',
        'semillasSanasPeso': 'gramosSemillasSanas',
        'semillasContaminadasCantidad': 'contaminadasYVanas',
        'semillasContaminadasPeso': 'gramosContaminadasYVanas',
        'controlPesos': 'gramosControlDePesos'
      };
      const dtoField = fieldMap[field];
      if (dtoField) {
        (this.repeticionesEntries[index] as any)[dtoField] = numericValue;
      }
    }
  }

  onSubmit() {
    // Sincronizar repeticiones locales a repeticionesEntries antes de enviar
    this.repeticiones.forEach((rep, index) => {
      if (this.repeticionesEntries[index]) {
        this.repeticionesEntries[index].nroSemillasPuras = rep.semillasPuras;
        this.repeticionesEntries[index].peso = rep.pesoSemillasPuras;
        this.repeticionesEntries[index].cantidadSemillasSanas = rep.semillasSanasCantidad;
        this.repeticionesEntries[index].gramosSemillasSanas = rep.semillasSanasPeso;
        this.repeticionesEntries[index].contaminadasYVanas = rep.semillasContaminadasCantidad;
        this.repeticionesEntries[index].gramosContaminadasYVanas = rep.semillasContaminadasPeso;
        this.repeticionesEntries[index].gramosControlDePesos = rep.controlPesos;
      }
    });

    const purezaData: PurezaPNotatumDto = {
      id: this.editingId ?? null,
      porcentaje: this.semillaPuraPct,
      pesoInicial: this.semillaPuraGr,
      repeticiones: this.repeticiones.length,
      Pi: 0, // Ajustar según necesidad
      At: 0, // Ajustar según necesidad
      porcentajeA: 0, // Ajustar según necesidad
      totalA: 0, // Ajustar según necesidad
      semillasLS: 0, // Ajustar según necesidad
      activo: this.activo,
      repetido: this.repetido,
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
          this.procesarRepeticionesDespuesDeGuardar(this.editingId!).then(() => {
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
      
      const reciboIdNum = this.route.snapshot.params['reciboId'] ? Number(this.route.snapshot.params['reciboId']) : null;
      
      this.purezaPNotatumService.crear(purezaData).subscribe({
        next: (res) => {
          console.log('Pureza P. notatum creado correctamente:', res);
          // Asumiendo que el backend devuelve el ID como texto
          const nuevoId = parseInt(res);
          if (!isNaN(nuevoId)) {
            this.procesarRepeticionesDespuesDeCrear(nuevoId).then(() => {
              this.safeNavigateToListado();
            }).catch(err => {
              console.error('Error creando repeticiones después de crear:', err);
              this.safeNavigateToListado();
            });
          } else {
            this.safeNavigateToListado();
          }
        },
        error: (err) => {
          console.error('Error creando Pureza P. notatum:', err);
        }
      });
    }
  }

  private async procesarRepeticionesDespuesDeCrear(purezaPNotatumId: number): Promise<void> {
    const payload: RepeticionPPN[] = this.repeticionesEntries.map((r) => ({
      ...r,
      PurezaPPNId: purezaPNotatumId
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

  private async procesarRepeticionesDespuesDeGuardar(purezaPNotatumId: number): Promise<void> {
    const toSend: RepeticionPPN[] = this.repeticionesEntries.map((r) => ({
      ...r,
      PurezaPPNId: purezaPNotatumId
    }));
    
    console.log('Payload repeticiones a editar:', toSend);
    console.log('IDs de repeticiones a eliminar:', this.deletedRepeticionesIds);
    
    return new Promise((resolve, reject) => {
      if (toSend.length === 0 && this.deletedRepeticionesIds.length === 0) return resolve();
      
      this.purezaPNotatumService.actualizarRepeticiones(purezaPNotatumId, toSend).subscribe({
        next: (resp) => {
          console.log('Repeticiones actualizadas exitosamente:', resp);
          resolve();
        },
        error: (err) => reject(err)
      });
    });
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
}

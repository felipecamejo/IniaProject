import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SanitarioDto } from '../../../models/Sanitario.dto';
import { SanitarioHongoDTO } from '../../../models/SanitarioHongo.dto';
import { TipoHongoSanitario } from '../../../models/enums';
import { SanitarioService } from '../../../services/SanitarioService';
import { HongoService } from '../../../services/HongoService';
import { HongoDto } from '../../../models/Hongo.dto';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-sanitario.component',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    DialogModule,
    CheckboxModule,
    TableModule,
    MultiSelectModule
  ],
  templateUrl: './sanitario.component.html',
  styleUrl: './sanitario.component.scss'
})

export class SanitarioComponent implements OnInit {
  
  repetido: boolean = false;

  // Variables para manejar navegación
  isEditing: boolean = false;
  isViewing: boolean = false;
  editingId: number | null = null;

  loteId: string | null = '';
  reciboId: string | null = '';

  // Lista de hongos cargada desde el servicio
  hongos: HongoDto[] = [];
  
  // Arrays separados para cada tipo de hongo (evitar conflictos de selección)
  hongosPatogenos: HongoDto[] = [];
  hongosCampo: HongoDto[] = [];
  hongosAlmacenaje: HongoDto[] = [];

  // Arrays de selección completamente independientes para cada campo
  selectedHongosPatogenos: number[] = [];
  selectedHongosContaminantes: number[] = [];
  selectedHongosAlmacenajeNuevo: number[] = [];

  // Propiedades enlazadas con ngModel (DEPRECATED - usar las nuevas arrays)
  selectedMetodo: string = '';
  selectedEstado: string = '';

  // Tabla de hongos seleccionados
  hongosTable: Array<{tipoHongo: string, repeticion: number | null, valor: number | null, incidencia: number | null}> = [];
  hongosCampoTable: Array<{tipoHongo: string, repeticion: number | null, valor: number | null, incidencia: number | null}> = [];
  hongosAlmacenajeTable: Array<{tipoHongo: string, repeticion: number | null, valor: number | null, incidencia: number | null}> = [];

  // Estado anterior para comparación (solo en modo edición)
  hongosOriginales: SanitarioHongoDTO[] = [];

  // Control del dropdown personalizado
  isHongosDropdownOpen: boolean = false;
  hongosSearchText: string = '';
  isHongosCampoDropdownOpen: boolean = false;
  hongosCampoSearchText: string = '';
  isHongosAlmacenajeDropdownOpen: boolean = false;
  hongosAlmacenajeSearchText: string = '';

  // Campos de fecha
  fechaSiembra: string | null = null;
  fecha: string = '';

  // Campos numéricos
  nLab: number = 0;
  temperatura: number = 0;

  // Campos de texto
  observaciones: string = '';

  metodos = [
      { label: 'METODO_A', id: 1 },
      { label: 'METODO_B', id: 2 },
      { label: 'METODO_C', id: 3 }
  ];

  // Propiedades actualizadas según el nuevo DTO
  id: number | null = null;
  metodo: string = '';
  horasLuz: number | null = null;
  horasOscuridad: number | null = null;
  nroDias: number | null = null;
  estado: string = '';
  nroSemillasRepeticion: number | null = null;
  activo: boolean = true;
  estandar: boolean = false;
  fechaCreacion: string | null = null;
  fechaRepeticion: string | null = null;

  // Estados de carga
  isLoading: boolean = false;
  isSaving: boolean = false;
  isCargandoDatosIniciales: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitarioService: SanitarioService,
    private hongoService: HongoService
  ) {}

  // Getter para determinar si está en modo readonly
  get isReadonly(): boolean {
    return this.isViewing;
  }

  ngOnInit() {
    this.loteId = this.route.snapshot.params['loteId'];
    this.reciboId = this.route.snapshot.params['reciboId'];

    // Verificar si estamos en modo edición basado en la ruta
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.editingId = parseInt(params['id']);
        // Verificar si es modo visualización por query parameter
        this.route.queryParams.subscribe(queryParams => {
          this.isViewing = queryParams['view'] === 'true';
          this.isEditing = !this.isViewing;
        });
        
        // En modo edición: cargar hongos primero, luego datos de sanitario
        this.cargarHongos(); // Los hongos asociados se cargarán después automáticamente
        this.cargarDatosParaEdicion(this.editingId);
      } else {
        // En modo creación: solo cargar lista de hongos
        this.isEditing = false;
        this.isViewing = false;
        this.editingId = null;
        this.cargarHongos(); // Solo la lista, sin asociados
        this.cargarDatos();
        // Establecer fecha actual en modo creación
        this.fecha = new Date().toISOString().split('T')[0];
      }
    });
  }

  cargarHongos() {
    this.hongoService.listar().subscribe({
      next: (response) => {
        this.hongos = response.hongos;
        this.hongosPatogenos = [...response.hongos];
        this.hongosCampo = [...response.hongos];
        this.hongosAlmacenaje = [...response.hongos];
        
        if (this.editingId && this.isCargandoDatosIniciales) {
          this.cargarHongosAsociados(this.editingId);
        }
      },
      error: (error) => {
        console.error('Error al cargar hongos:', error);
      }
    });
  }

  // Métodos para el multiselect personalizado
  toggleHongosDropdown() {
    this.isHongosDropdownOpen = !this.isHongosDropdownOpen;
    if (this.isHongosDropdownOpen) {
      this.hongosSearchText = ''; // Limpiar búsqueda al abrir
    }
  }

  getFilteredHongos() {
    if (!this.hongosSearchText) {
      return this.hongosPatogenos;
    }
    return this.hongosPatogenos.filter(hongo =>
      hongo.nombre.toLowerCase().includes(this.hongosSearchText.toLowerCase())
    );
  }

  toggleHongoSelection(hongo: any) {
    if (hongo.id === null || hongo.id === undefined) return;
    
    const index = this.selectedHongosPatogenos.indexOf(hongo.id);
    if (index > -1) {
      this.selectedHongosPatogenos.splice(index, 1);
    } else {
      this.selectedHongosPatogenos.push(hongo.id);
    }
    this.onHongosChange();
  }

  isHongoSelected(hongoId: number): boolean {
    return this.selectedHongosPatogenos.includes(hongoId);
  }

  getSelectedHongosText(): string {
    if (this.selectedHongosPatogenos.length === 0) {
      return 'Seleccionar hongos...';
    }
    if (this.selectedHongosPatogenos.length === 1) {
      const hongo = this.hongosPatogenos.find(h => h.id === this.selectedHongosPatogenos[0]);
      return hongo ? hongo.nombre : '';
    }
    return `${this.selectedHongosPatogenos.length} hongos seleccionados`;
  }

  // Cerrar dropdown al hacer clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-multiselect')) {
      this.isHongosDropdownOpen = false;
      this.isHongosCampoDropdownOpen = false;
      this.isHongosAlmacenajeDropdownOpen = false;
    }
  }

  // Método para manejar cambios en el multiselect de hongos
  onHongosChange() {
    this.createHongosTable();
  }

  createHongosTable() {
    const valoresExistentes = new Map<string, any>();
    this.hongosTable.forEach(fila => {
      valoresExistentes.set(fila.tipoHongo, {
        repeticion: fila.repeticion,
        valor: fila.valor,
        incidencia: fila.incidencia
      });
    });

    this.hongosTable = [];
    this.selectedHongosPatogenos.forEach((hongoId: number) => {
      const hongo = this.hongosPatogenos.find(h => h.id === hongoId);
      if (hongo) {
        const valoresPreservados = valoresExistentes.get(hongo.nombre);
        this.hongosTable.push({
          tipoHongo: hongo.nombre,
          repeticion: valoresPreservados?.repeticion || null,
          valor: valoresPreservados?.valor || null,
          incidencia: valoresPreservados?.incidencia || null
        });
      }
    });
  }

  // Métodos para Hongos Contaminantes Campo
  toggleHongosCampoDropdown() {
    this.isHongosCampoDropdownOpen = !this.isHongosCampoDropdownOpen;
    if (this.isHongosCampoDropdownOpen) {
      this.hongosCampoSearchText = '';
    }
  }

  getFilteredHongosCampo() {
    if (!this.hongosCampoSearchText) {
      return this.hongosCampo;
    }
    return this.hongosCampo.filter(hongo =>
      hongo.nombre.toLowerCase().includes(this.hongosCampoSearchText.toLowerCase())
    );
  }

  toggleHongoCampoSelection(hongo: any) {
    if (hongo.id === null || hongo.id === undefined) return;
    
    const index = this.selectedHongosContaminantes.indexOf(hongo.id);
    if (index > -1) {
      this.selectedHongosContaminantes.splice(index, 1);
    } else {
      this.selectedHongosContaminantes.push(hongo.id);
    }
    this.onHongosCampoChange();
  }

  isHongoCampoSelected(hongoId: number): boolean {
    return this.selectedHongosContaminantes.includes(hongoId);
  }

  getSelectedHongosCampoText(): string {
    if (this.selectedHongosContaminantes.length === 0) {
      return 'Seleccionar hongos...';
    }
    if (this.selectedHongosContaminantes.length === 1) {
      const hongo = this.hongosCampo.find(h => h.id === this.selectedHongosContaminantes[0]);
      return hongo ? hongo.nombre : '';
    }
    return `${this.selectedHongosContaminantes.length} hongos seleccionados`;
  }

  onHongosCampoChange() {
    this.createHongosCampoTable();
  }

  createHongosCampoTable() {
    const valoresExistentes = new Map<string, any>();
    this.hongosCampoTable.forEach(fila => {
      valoresExistentes.set(fila.tipoHongo, {
        repeticion: fila.repeticion,
        valor: fila.valor,
        incidencia: fila.incidencia
      });
    });

    this.hongosCampoTable = [];
    this.selectedHongosContaminantes.forEach((hongoId: number) => {
      const hongo = this.hongosCampo.find(h => h.id === hongoId);
      if (hongo) {
        const valoresPreservados = valoresExistentes.get(hongo.nombre);
        this.hongosCampoTable.push({
          tipoHongo: hongo.nombre,
          repeticion: valoresPreservados?.repeticion || null,
          valor: valoresPreservados?.valor || null,
          incidencia: valoresPreservados?.incidencia || null
        });
      }
    });
  }

  // Métodos para Hongos Almacenaje
  toggleHongosAlmacenajeDropdown() {
    this.isHongosAlmacenajeDropdownOpen = !this.isHongosAlmacenajeDropdownOpen;
    if (this.isHongosAlmacenajeDropdownOpen) {
      this.hongosAlmacenajeSearchText = '';
    }
  }

  getFilteredHongosAlmacenaje() {
    if (!this.hongosAlmacenajeSearchText) {
      return this.hongosAlmacenaje;
    }
    return this.hongosAlmacenaje.filter(hongo =>
      hongo.nombre.toLowerCase().includes(this.hongosAlmacenajeSearchText.toLowerCase())
    );
  }

  toggleHongoAlmacenajeSelection(hongo: any) {
    if (hongo.id === null || hongo.id === undefined) return;
    
    const index = this.selectedHongosAlmacenajeNuevo.indexOf(hongo.id);
    if (index > -1) {
      this.selectedHongosAlmacenajeNuevo.splice(index, 1);
    } else {
      this.selectedHongosAlmacenajeNuevo.push(hongo.id);
    }
    this.onHongosAlmacenajeChange();
  }

  isHongoAlmacenajeSelected(hongoId: number): boolean {
    return this.selectedHongosAlmacenajeNuevo.includes(hongoId);
  }

  getSelectedHongosAlmacenajeText(): string {
    if (this.selectedHongosAlmacenajeNuevo.length === 0) {
      return 'Seleccionar hongos...';
    }
    if (this.selectedHongosAlmacenajeNuevo.length === 1) {
      const hongo = this.hongosAlmacenaje.find(h => h.id === this.selectedHongosAlmacenajeNuevo[0]);
      return hongo ? hongo.nombre : '';
    }
    return `${this.selectedHongosAlmacenajeNuevo.length} hongos seleccionados`;
  }

  onHongosAlmacenajeChange() {
    this.createHongosAlmacenajeTable();
  }

  createHongosAlmacenajeTable() {
    const valoresExistentes = new Map<string, any>();
    this.hongosAlmacenajeTable.forEach(fila => {
      valoresExistentes.set(fila.tipoHongo, {
        repeticion: fila.repeticion,
        valor: fila.valor,
        incidencia: fila.incidencia
      });
    });

    this.hongosAlmacenajeTable = [];
    this.selectedHongosAlmacenajeNuevo.forEach((hongoId: number) => {
      const hongo = this.hongosAlmacenaje.find(h => h.id === hongoId);
      if (hongo) {
        const valoresPreservados = valoresExistentes.get(hongo.nombre);
        this.hongosAlmacenajeTable.push({
          tipoHongo: hongo.nombre,
          repeticion: valoresPreservados?.repeticion || null,
          valor: valoresPreservados?.valor || null,
          incidencia: valoresPreservados?.incidencia || null
        });
      }
    });
  }

  // Datos de prueba (deberían venir de un servicio)
  private itemsData: SanitarioDto[] = [];

  private cargarDatosParaEdicion(id: number) {
    this.isLoading = true;
    this.isCargandoDatosIniciales = true;
    
    this.sanitarioService.obtener(id).subscribe({
      next: (item: SanitarioDto) => {
        this.id = item.id;
        this.fechaSiembra = item.fechaSiembra ? this.formatearFechaParaInput(item.fechaSiembra) : '';
        this.fecha = item.fecha ? this.formatearFechaParaInput(item.fecha) : '';
        this.metodo = item.metodo || '';
        this.temperatura = item.temperatura || 0;
        this.horasLuz = item.horasLuz || 0;
        this.horasOscuridad = item.horasOscuridad || 0;
        this.nroDias = item.nroDias || 0;
        this.nroSemillasRepeticion = item.nroSemillasRepeticion || 0;
        this.observaciones = item.observaciones || '';
        this.estado = item.estado || '';
        this.activo = item.activo;
        this.estandar = item.estandar;
        this.repetido = item.repetido;
        this.fechaCreacion = item.fechaCreacion;
        this.fechaRepeticion = item.fechaRepeticion;
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar sanitario:', error);
        this.isLoading = false;
        this.isCargandoDatosIniciales = false;
        alert('Error al cargar los datos del sanitario');
      }
    });
  }

  private cargarDatos() {
    this.isCargandoDatosIniciales = false;
    const fechaActual = new Date().toISOString().split('T')[0];
    
    this.id = null;
    this.fechaSiembra = null;
    this.fecha = fechaActual;
    this.metodo = '';
    this.temperatura = 0;
    this.horasLuz = 0;
    this.horasOscuridad = 0;
    this.nroDias = 0;
    this.estado = '';
    this.observaciones = '';
    this.nroSemillasRepeticion = 0;
    this.activo = true;
    this.estandar = false;
    this.repetido = false;
    this.fechaCreacion = null;
    this.fechaRepeticion = null;
  }

  onSubmit() {
    if (this.isSaving) return;
    
    this.isSaving = true;

    const sanitarioData: SanitarioDto = {
      id: this.isEditing ? this.editingId : null,
      fechaSiembra: this.fechaSiembra,
      fecha: this.fecha,
      metodo: this.metodo,
      temperatura: this.temperatura,
      horasLuz: this.horasLuz,
      horasOscuridad: this.horasOscuridad,
      nroDias: this.nroDias,
      estado: this.estado,
      observaciones: this.observaciones,
      nroSemillasRepeticion: this.nroSemillasRepeticion,
      reciboId: parseInt(this.reciboId || '0'),
      activo: this.activo,
      estandar: this.estandar,
      repetido: this.repetido,
      sanitarioHongoids: null,
      fechaCreacion: this.fechaCreacion,
      fechaRepeticion: this.fechaRepeticion
    };

    // LOG FINAL ANTES DE ENVIAR
    console.log('📋 SANITARIO DTO:', sanitarioData);
    console.log('📋 HONGOS SELECCIONADOS:', {
      patogenos: this.selectedHongosPatogenos,
      contaminantes: this.selectedHongosContaminantes,
      almacenaje: this.selectedHongosAlmacenajeNuevo
    });

    if (this.isEditing && this.editingId) {
      this.actualizarSanitario(sanitarioData);
    } else {
      this.crearNuevoSanitario(sanitarioData);
    }
  }

  private crearNuevoSanitario(sanitarioData: SanitarioDto) {
    const fechaActual = new Date().toISOString();
    
    const sanitarioPayload = {
      id: 0,
      fechaSiembra: this.fechaSiembra ? new Date(this.fechaSiembra).toISOString() : fechaActual,
      fecha: this.fecha ? new Date(this.fecha).toISOString() : fechaActual,
      metodo: this.metodo || "METODO_A",
      temperatura: this.temperatura || 0,
      horasLuz: this.horasLuz || 0,
      horasOscuridad: this.horasOscuridad || 0,
      nroDias: this.nroDias || 0,
      estado: this.estado || "", 
      observaciones: this.observaciones || "",
      nroSemillasRepeticion: this.nroSemillasRepeticion || 0,
      reciboId: parseInt(this.reciboId || '0'),
      activo: this.activo,
      estandar: this.estandar,
      repetido: false,
      sanitarioHongosId: [],
      fechaCreacion: fechaActual,
      fechaRepeticion: null
    };

    this.sanitarioService.crear(sanitarioPayload as any).subscribe({
      next: (sanitarioId: number) => {
        this.crearHongosAsociados(sanitarioId).then(() => {
          this.isSaving = false;
          alert('Sanitario y hongos creados exitosamente');
          this.volverAlListado();
        }).catch((error) => {
          console.error('Error al crear hongos:', error);
          this.isSaving = false;
          alert('Sanitario creado, pero hubo errores al crear algunos hongos');
        });
      },
      error: (error) => {
        console.error('Error al crear sanitario:', error);
        this.isSaving = false;
        alert('Error al crear el sanitario. Por favor, inténtalo de nuevo.');
      }
    });
  }

  private actualizarSanitario(sanitarioData: SanitarioDto) {
    const fechaRepeticionFinal = this.repetido && !sanitarioData.fechaRepeticion ? 
      new Date().toISOString() : 
      (sanitarioData.fechaRepeticion ? new Date(sanitarioData.fechaRepeticion).toISOString() : null);

    const sanitarioPayload = {
      id: this.editingId!,
      fechaSiembra: this.fechaSiembra ? new Date(this.fechaSiembra).toISOString() : new Date().toISOString(),
      fecha: this.fecha ? new Date(this.fecha).toISOString() : new Date().toISOString(),
      metodo: this.metodo || "METODO_A",
      temperatura: this.temperatura || 0,
      horasLuz: this.horasLuz || 0,
      horasOscuridad: this.horasOscuridad || 0,
      nroDias: this.nroDias || 0,
      estado: this.estado || "",
      observaciones: this.observaciones || "",
      nroSemillasRepeticion: this.nroSemillasRepeticion || 0,
      reciboId: parseInt(this.reciboId || '0'),
      activo: this.activo,
      estandar: this.estandar,
      repetido: this.repetido,
      sanitarioHongosId: [],
      fechaCreacion: this.fechaCreacion ? new Date(this.fechaCreacion).toISOString() : new Date().toISOString(),
      fechaRepeticion: fechaRepeticionFinal
    };
    
    this.sanitarioService.editar(sanitarioPayload as any).subscribe({
      next: (response) => {
        this.actualizarHongosAsociados(this.editingId!).then(() => {
          this.isSaving = false;
          alert('Sanitario y hongos actualizados exitosamente');
          this.volverAlListado();
        }).catch((error) => {
          console.error('Error al actualizar hongos:', error);
          this.isSaving = false;
          alert('Sanitario actualizado, pero hubo errores al actualizar algunos hongos');
        });
      },
      error: (error) => {
        console.error('Error al actualizar sanitario:', error);
        this.isSaving = false;
        alert('Error al actualizar el sanitario. Por favor, inténtalo de nuevo.');
      }
    });
  }

  private async crearHongosAsociados(sanitarioId: number): Promise<void> {
    const hongosACrear = this.obtenerHongosActuales(sanitarioId);

    if (hongosACrear.length > 0) {
      return new Promise((resolve, reject) => {
        this.sanitarioService.actualizarHongosCompleto(sanitarioId, hongosACrear).subscribe({
          next: (response) => {
            console.log('✅ Hongos creados exitosamente');
            resolve();
          },
          error: (error) => {
            console.error('❌ Error al crear hongos:', error);
            reject(error);
          }
        });
      });
    } else {
      return Promise.resolve();
    }
  }

  private async actualizarHongosAsociados(sanitarioId: number): Promise<void> {
    const hongosActuales = this.obtenerHongosActuales(sanitarioId);
    
    return new Promise((resolve, reject) => {
      this.sanitarioService.actualizarHongosCompleto(sanitarioId, hongosActuales).subscribe({
        next: (response) => {
          console.log('✅ Hongos actualizados exitosamente');
          resolve();
        },
        error: (error) => {
          console.error('❌ Error al actualizar hongos:', error);
          reject(error);
        }
      });
    });
  }

  private obtenerHongosActuales(sanitarioId: number): SanitarioHongoDTO[] {
    const hongosActuales: SanitarioHongoDTO[] = [];

    this.hongosTable.forEach((hongo) => {
      if (hongo.repeticion !== null || hongo.valor !== null || hongo.incidencia !== null) {
        const hongoInfo = this.hongosPatogenos.find(h => h.nombre === hongo.tipoHongo);
        if (hongoInfo) {
          hongosActuales.push({
            id: null,
            sanitarioId: sanitarioId,
            hongoId: hongoInfo.id,
            repeticion: hongo.repeticion,
            valor: hongo.valor,
            incidencia: hongo.incidencia,
            activo: true,
            tipo: TipoHongoSanitario.PATOGENO
          });
        }
      }
    });

    this.hongosCampoTable.forEach((hongo) => {
      if (hongo.repeticion !== null || hongo.valor !== null || hongo.incidencia !== null) {
        const hongoInfo = this.hongosCampo.find(h => h.nombre === hongo.tipoHongo);
        if (hongoInfo) {
          hongosActuales.push({
            id: null,
            sanitarioId: sanitarioId,
            hongoId: hongoInfo.id,
            repeticion: hongo.repeticion,
            valor: hongo.valor,
            incidencia: hongo.incidencia,
            activo: true,
            tipo: TipoHongoSanitario.CONTAMINANTE
          });
        }
      }
    });

    this.hongosAlmacenajeTable.forEach((hongo) => {
      if (hongo.repeticion !== null || hongo.valor !== null || hongo.incidencia !== null) {
        const hongoInfo = this.hongosAlmacenaje.find(h => h.nombre === hongo.tipoHongo);
        if (hongoInfo) {
          hongosActuales.push({
            id: null,
            sanitarioId: sanitarioId,
            hongoId: hongoInfo.id,
            repeticion: hongo.repeticion,
            valor: hongo.valor,
            incidencia: hongo.incidencia,
            activo: true,
            tipo: TipoHongoSanitario.ALMACENAJE
          });
        }
      }
    });

    return hongosActuales;
  }

  private volverAlListado(): void {
    this.router.navigate([this.loteId, this.reciboId, 'listado-sanitario']);
  }

  private cargarHongosAsociados(sanitarioId: number): void {
    this.sanitarioService.listarHongosPorSanitario(sanitarioId).subscribe({
      next: (hongosAsociados: SanitarioHongoDTO[]) => {
        this.hongosOriginales = [...hongosAsociados];
        this.cargarHongosEnTablas(hongosAsociados);
        this.isCargandoDatosIniciales = false;
      },
      error: (error: any) => {
        console.error('Error al cargar hongos asociados:', error);
        this.hongosOriginales = [];
        this.isCargandoDatosIniciales = false;
      }
    });
  }

  private cargarHongosEnTablas(hongosAsociados: SanitarioHongoDTO[]): void {
    this.selectedHongosPatogenos = [];
    this.selectedHongosContaminantes = [];
    this.selectedHongosAlmacenajeNuevo = [];
    this.hongosTable = [];
    this.hongosCampoTable = [];
    this.hongosAlmacenajeTable = [];

    hongosAsociados.forEach((sanitarioHongo) => {
      const hongo = this.hongos.find(h => h.id === sanitarioHongo.hongoId);
      if (!hongo) return;

      const tablaItem = {
        tipoHongo: hongo.nombre,
        repeticion: sanitarioHongo.repeticion,
        valor: sanitarioHongo.valor,
        incidencia: sanitarioHongo.incidencia
      };

      switch (sanitarioHongo.tipo) {
        case TipoHongoSanitario.PATOGENO:
          if (!this.selectedHongosPatogenos.includes(hongo.id!)) {
            this.selectedHongosPatogenos.push(hongo.id!);
          }
          this.hongosTable.push(tablaItem);
          break;
          
        case TipoHongoSanitario.CONTAMINANTE:
          if (!this.selectedHongosContaminantes.includes(hongo.id!)) {
            this.selectedHongosContaminantes.push(hongo.id!);
          }
          this.hongosCampoTable.push(tablaItem);
          break;
          
        case TipoHongoSanitario.ALMACENAJE:
          if (!this.selectedHongosAlmacenajeNuevo.includes(hongo.id!)) {
            this.selectedHongosAlmacenajeNuevo.push(hongo.id!);
          }
          this.hongosAlmacenajeTable.push(tablaItem);
          break;
      }
    });
  }

  onCancel() {
      this.router.navigate([this.loteId, this.reciboId, 'listado-sanitario']);
  }

  /**
   * Convierte fecha ISO (2025-10-16T22:00:57.145Z) a formato input date (2025-10-16)
   */
  private formatearFechaParaInput(fechaISO: string): string {
    if (!fechaISO) return '';
    try {
      const fecha = new Date(fechaISO);
      return fecha.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error al formatear fecha:', fechaISO, error);
      return '';
    }
  }

}

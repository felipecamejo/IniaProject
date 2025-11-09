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
import { DateService } from '../../../services/DateService';
import { LogService } from '../../../services/LogService';

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

  
  // Agregar propiedades para manejar errores
  errores: string[] = [];

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
  hongosTable: Array<{tipoHongo: string, repeticion: number , valor: number , incidencia: number}> = [];
  hongosCampoTable: Array<{tipoHongo: string, repeticion: number, valor: number , incidencia: number}> = [];
  hongosAlmacenajeTable: Array<{tipoHongo: string, repeticion: number, valor: number, incidencia: number}> = [];

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
    private hongoService: HongoService,
    private logService: LogService
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
          repeticion: valoresPreservados?.repeticion || 0,
          valor: valoresPreservados?.valor || 0,
          incidencia: valoresPreservados?.incidencia || 0
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
          repeticion: valoresPreservados?.repeticion || 0,
          valor: valoresPreservados?.valor || 0,
          incidencia: valoresPreservados?.incidencia || 0
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
          repeticion: valoresPreservados?.repeticion || 0,
          valor: valoresPreservados?.valor || 0,
          incidencia: valoresPreservados?.incidencia || 0
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

    // Ejecutar validaciones finales antes de armar el payload
    if (this.manejarProblemas()) {
      // Hay errores: cancelar envío y permitir correcciones
      this.isSaving = false;
      return;
    }

    const sanitarioData: SanitarioDto = {
      id: this.isEditing ? this.editingId : null,
      fechaSiembra: DateService.ajustarFecha(this.fechaSiembra),
      fecha: DateService.ajustarFecha(this.fecha),
      metodo: this.metodo,
      temperatura: this.temperatura,
      horasLuz: this.horasLuz,
      horasOscuridad: this.horasOscuridad,
      nroDias: this.nroDias,
      estado: this.estado,
      observaciones: this.observaciones,
      nroSemillasRepeticion: this.nroSemillasRepeticion,
      reciboId: this.reciboId ? parseInt(this.reciboId, 10) : null,
      activo: this.activo,
      estandar: this.estandar,
      repetido: this.repetido,
      sanitarioHongosId: null,
      fechaCreacion: DateService.ajustarFecha(this.fechaCreacion),
      fechaRepeticion: DateService.ajustarFecha(this.fechaRepeticion)
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
    const hoyYmd = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const fechaActual = DateService.ajustarFecha(hoyYmd);

    const sanitarioPayload = {
      id: 0,
      fechaSiembra: this.fechaSiembra ? DateService.ajustarFecha(this.fechaSiembra) : fechaActual,
      fecha: this.fecha ? DateService.ajustarFecha(this.fecha) : fechaActual,
      metodo: this.metodo || "METODO_A",
      temperatura: this.temperatura || 0,
      horasLuz: this.horasLuz || 0,
      horasOscuridad: this.horasOscuridad || 0,
      nroDias: this.nroDias || 0,
      estado: this.estado || "", 
      observaciones: this.observaciones || "",
      nroSemillasRepeticion: this.nroSemillasRepeticion || 0,
      reciboId: this.reciboId ? parseInt(this.reciboId, 10) : null,
      activo: this.activo,
      estandar: this.estandar,
      repetido: false,
      sanitarioHongosId: [],
      fechaCreacion: fechaActual,
      fechaRepeticion: null
    };

    this.sanitarioService.crear(sanitarioPayload as any).subscribe({
      next: (sanitarioId: number) => {
        console.log('Sanitario creado con ID:', sanitarioId);
        // Guardar hongos después de crear el sanitario
        this.guardarHongos(sanitarioId);
        this.logService.crearLog(sanitarioId, 'Sanitario', 'creado').subscribe();
      },
      error: (error) => {
        console.error('Error al crear sanitario:', error);
        this.isSaving = false;
        alert('Error al crear el sanitario. Por favor, inténtalo de nuevo.');
      }
    });
  }

  private actualizarSanitario(sanitarioData: SanitarioDto) {
    const hoyYmd = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const fechaRepeticionFinal = this.repetido && !sanitarioData.fechaRepeticion
      ? DateService.ajustarFecha(hoyYmd)
      : (sanitarioData.fechaRepeticion || null);

    const sanitarioPayload = {
      id: this.editingId!,
      fechaSiembra: this.fechaSiembra ? DateService.ajustarFecha(this.fechaSiembra) : DateService.ajustarFecha(hoyYmd),
      fecha: this.fecha ? DateService.ajustarFecha(this.fecha) : DateService.ajustarFecha(hoyYmd),
      metodo: this.metodo || "METODO_A",
      temperatura: this.temperatura || 0,
      horasLuz: this.horasLuz || 0,
      horasOscuridad: this.horasOscuridad || 0,
      nroDias: this.nroDias || 0,
      estado: this.estado || "",
      observaciones: this.observaciones || "",
      nroSemillasRepeticion: this.nroSemillasRepeticion || 0,
      reciboId: this.reciboId ? parseInt(this.reciboId, 10) : null,
      activo: this.activo,
      estandar: this.estandar,
      repetido: this.repetido,
      sanitarioHongosId: [],
      fechaCreacion: this.fechaCreacion ? DateService.ajustarFecha(this.fechaCreacion.slice(0, 10)) : DateService.ajustarFecha(hoyYmd),
      fechaRepeticion: fechaRepeticionFinal
    };
    
    this.sanitarioService.editar(sanitarioPayload as any).subscribe({
      next: (response) => {
        console.log('Sanitario editado exitosamente:', response);
        // Guardar hongos después de editar el sanitario
        this.guardarHongos(this.editingId!);
        
        this.logService.crearLog(this.editingId!, 'Sanitario', 'editado').subscribe();
      },
      error: (error) => {
        console.error('Error al actualizar sanitario:', error);
        this.isSaving = false;
        alert('Error al actualizar el sanitario. Por favor, inténtalo de nuevo.');
      }
    });
  }

  /**
   * Método unificado para guardar hongos (similar a guardarHumedades en recibo.component.ts)
   * Envía todos los hongos al backend y este se encarga de crear/actualizar/eliminar
   */
  guardarHongos(sanitarioId: number) {
    const hongosValidos = this.obtenerHongosActuales(sanitarioId);

    console.log('Todos los hongos a enviar:', hongosValidos);

    // Enviar todos los hongos al método único del servicio
    this.sanitarioService.actualizarHongosCompleto(sanitarioId, hongosValidos).subscribe({
      next: (response) => {
        console.log('✅ Hongos guardados exitosamente:', response);
        this.isSaving = false;
        this.volverAlListado();
      },
      error: (error) => {
        console.error('❌ Error al guardar hongos:', error);
        this.isSaving = false;
      }
    });
  }

  private obtenerHongosActuales(sanitarioId: number): SanitarioHongoDTO[] {
    const hongosActuales: SanitarioHongoDTO[] = [];

    // Hongos Patógenos - Guardar TODOS los hongos seleccionados, tengan valores o no
    this.hongosTable.forEach((hongo) => {
      const hongoInfo = this.hongosPatogenos.find(h => h.nombre === hongo.tipoHongo);
      if (hongoInfo) {
        const hongoOriginal = this.hongosOriginales.find(
          h => h.hongoId === hongoInfo.id && h.tipo === TipoHongoSanitario.PATOGENO
        );

        hongosActuales.push({
          id: hongoOriginal?.id ?? null,
          sanitarioId: sanitarioId,
          hongoId: hongoInfo.id ?? null,
          repeticion: hongo.repeticion ?? 0,
          valor: hongo.valor ?? 0,
          tipo: TipoHongoSanitario.PATOGENO
        });
      }
    });

    // Hongos Contaminantes - Guardar TODOS los hongos seleccionados, tengan valores o no
    this.hongosCampoTable.forEach((hongo) => {
      const hongoInfo = this.hongosCampo.find(h => h.nombre === hongo.tipoHongo);
      if (hongoInfo) {
        const hongoOriginal = this.hongosOriginales.find(
          h => h.hongoId === hongoInfo.id && h.tipo === TipoHongoSanitario.CONTAMINANTE
        );

        hongosActuales.push({
          id: hongoOriginal?.id ?? null,
          sanitarioId: sanitarioId,
          hongoId: hongoInfo.id ?? null,
          repeticion: hongo.repeticion ?? 0,
          valor: hongo.valor ?? 0,
          tipo: TipoHongoSanitario.CONTAMINANTE
        });
      }
    });

    // Hongos Almacenaje - Guardar TODOS los hongos seleccionados, tengan valores o no
    this.hongosAlmacenajeTable.forEach((hongo) => {
      const hongoInfo = this.hongosAlmacenaje.find(h => h.nombre === hongo.tipoHongo);
      if (hongoInfo) {
        const hongoOriginal = this.hongosOriginales.find(
          h => h.hongoId === hongoInfo.id && h.tipo === TipoHongoSanitario.ALMACENAJE
        );

        hongosActuales.push({
          id: hongoOriginal?.id ?? null,
          sanitarioId: sanitarioId,
          hongoId: hongoInfo.id ?? null,
          repeticion: hongo.repeticion ?? 0,
          valor: hongo.valor ?? 0,
          tipo: TipoHongoSanitario.ALMACENAJE
        });
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

  /**
   * Calcula el porcentaje de incidencia para todas las tablas
   * Fórmula: (Valor / Número de semillas por repetición) * 100
   */
  CalcularPorcentajeIncidencia(): void {
    if (!this.nroSemillasRepeticion || this.nroSemillasRepeticion === 0) {
      console.warn('No se puede calcular el porcentaje de incidencia: nroSemillasRepeticion no está definido o es 0');
      return;
    }

    // Calcular porcentaje de incidencia para hongosTable (Patógenos)
    this.hongosTable.forEach(item => {
      if (item.valor !== undefined && item.valor !== null) {
        item.incidencia = (item.valor / this.nroSemillasRepeticion!) * 100;
      }
    });

    // Calcular porcentaje de incidencia para hongosCampoTable (Contaminantes)
    this.hongosCampoTable.forEach(item => {
      if (item.valor !== undefined && item.valor !== null) {
        item.incidencia = (item.valor / this.nroSemillasRepeticion!) * 100;
      }
    });

    // Calcular porcentaje de incidencia para hongosAlmacenajeTable
    this.hongosAlmacenajeTable.forEach(item => {
      if (item.valor !== undefined && item.valor !== null) {
        item.incidencia = (item.valor / this.nroSemillasRepeticion!) * 100;
      }
    });
  }

  /**
   * Actualiza el porcentaje de incidencia cuando cambia el valor en hongosTable (Patógenos)
   */
  onValorPatogenoChange(index: number): void {
    if (!this.nroSemillasRepeticion || this.nroSemillasRepeticion === 0) {
      this.hongosTable[index].incidencia = 0;
      return;
    }
    const valor = this.hongosTable[index].valor ?? 0;
    this.hongosTable[index].incidencia = (valor / this.nroSemillasRepeticion) * 100;
  }

  /**
   * Actualiza el porcentaje de incidencia cuando cambia el valor en hongosCampoTable (Contaminantes)
   */
  onValorContaminanteChange(index: number): void {
    if (!this.nroSemillasRepeticion || this.nroSemillasRepeticion === 0) {
      this.hongosCampoTable[index].incidencia = 0;
      return;
    }
    const valor = this.hongosCampoTable[index].valor ?? 0;
    this.hongosCampoTable[index].incidencia = (valor / this.nroSemillasRepeticion) * 100;
  }

  /**
   * Actualiza el porcentaje de incidencia cuando cambia el valor en hongosAlmacenajeTable
   */
  onValorAlmacenajeChange(index: number): void {
    if (!this.nroSemillasRepeticion || this.nroSemillasRepeticion === 0) {
      this.hongosAlmacenajeTable[index].incidencia = 0;
      return;
    }
    const valor = this.hongosAlmacenajeTable[index].valor ?? 0;
    this.hongosAlmacenajeTable[index].incidencia = (valor / this.nroSemillasRepeticion) * 100;
  }

  /**
   * Cuando cambia el número de semillas por repetición, recalcula todas las incidencias
   */
  onNroSemillasRepeticionChange(): void {
    this.CalcularPorcentajeIncidencia();
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

      // Calcular incidencia: (valor / nroSemillasRepeticion) * 100
      const valor = sanitarioHongo.valor ?? 0;
      const incidencia = this.nroSemillasRepeticion && this.nroSemillasRepeticion > 0
        ? (valor / this.nroSemillasRepeticion) * 100
        : 0;

      const tablaItem = {
        tipoHongo: hongo.nombre,
        repeticion: sanitarioHongo.repeticion ?? 0,
        valor: valor,
        incidencia: incidencia
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

  manejarProblemas(): boolean {
    this.errores = []; // Reiniciar errores

    // Validación: fecha obligatoria
    if (!this.fecha || this.fecha.trim() === '') {
      this.errores.push('Debes ingresar una fecha.');
    }

    if (this.temperatura != null && this.temperatura < 0) {
      this.errores.push('La temperatura no puede ser un número negativo.');
    }

    if (this.horasLuz != null && this.horasLuz < 0) {
      this.errores.push('Las horas de luz no pueden ser un número negativo.');
    }

    if (this.horasOscuridad != null && this.horasOscuridad < 0) {
      this.errores.push('Las horas de oscuridad no pueden ser un número negativo.');
    }

    if (this.nroDias != null && this.nroDias < 0) {
      this.errores.push('El número de días no puede ser un número negativo.');
    }

    if (this.nroSemillasRepeticion != null && this.nroSemillasRepeticion < 0) {
      this.errores.push('El número de semillas no puede ser un número negativo.');
    }

    if (this.hongosTable.some(h => !this.validarNumero(h.repeticion)) ||
        this.hongosCampoTable.some(h => !this.validarNumero(h.repeticion)) ||
        this.hongosAlmacenajeTable.some(h => !this.validarNumero(h.repeticion))
      ) {

      this.errores.push('Algunos hongos tienen un número de repetición negativo.');
    }

    if (this.hongosTable.some(h => !this.validarNumero(h.valor)) ||
        this.hongosCampoTable.some(h => !this.validarNumero(h.valor)) ||
        this.hongosAlmacenajeTable.some(h => !this.validarNumero(h.valor))
      ) {
          
        this.errores.push('Algunos hongos tienen un número de valor negativo.');
      }


    if (this.validarFecha(this.fecha)) {
      this.errores.push('La fecha no puede ser futura.');
    }

    if (this.fechaSiembra != null && this.validarFecha(this.fechaSiembra)) {
      this.errores.push('La fecha no puede ser futura.');
    }

    return this.errores.length > 0;
  }

  validarFecha(fecha: string | null): boolean {
    if (!fecha || fecha == null) return false;
    const selectedDate = new Date(fecha);
    const today = new Date();
    return selectedDate >= today;
  }

  validarTablaHongos(hongo: any): boolean {
    return hongo;
  }

  validarNumero (valor: any): boolean {
    if (valor === null || valor === undefined) return false;
    return !isNaN(valor) && valor >= 0;
  }
}

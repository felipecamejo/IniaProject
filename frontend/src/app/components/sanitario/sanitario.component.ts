import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SanitarioDto } from '../../../models/Sanitario.dto';

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
  editingId: number | null = null;

  metodos = [
      { label: 'Metodo A', id: 1 },
      { label: 'Metodo B', id: 2 },
      { label: 'Metodo C', id: 3 }
    ];

  estados = [
      { label: 'Activo', id: 1 },
      { label: 'Inactivo', id: 2 },
      { label: 'Pendiente', id: 3 },
      { label: 'Completado', id: 4 }
    ];

  hongos = [
      { label: 'Hongo A', id: 1 },
      { label: 'Hongo B', id: 2 },
      { label: 'Hongo C', id: 3 },
      { label: 'Hongo D', id: 4 }
  ];

  hongosCampo = [
      { label: 'Fusarium Campo', id: 1 },
      { label: 'Alternaria Campo', id: 2 },
      { label: 'Rhizoctonia Campo', id: 3 },
      { label: 'Pythium Campo', id: 4 }
  ];

  hongosAlmacenaje = [
      { label: 'Aspergillus Almacen', id: 1 },
      { label: 'Penicillium Almacen', id: 2 },
      { label: 'Fusarium Almacen', id: 3 },
      { label: 'Mucor Almacen', id: 4 }
  ];

  // Propiedades enlazadas con ngModel
  selectedMetodo: string = '';
  selectedEstado: string = '';
  selectedHongos: number[] = [];
  selectedHongosCampo: number[] = [];
  selectedHongosAlmacenaje: number[] = [];

  // Tabla de hongos seleccionados
  hongosTable: Array<{tipoHongo: string, repeticion: number | null, valor: number | null, incidencia: number | null}> = [];
  hongosCampoTable: Array<{tipoHongo: string, repeticion: number | null, valor: number | null, incidencia: number | null}> = [];
  hongosAlmacenajeTable: Array<{tipoHongo: string, repeticion: number | null, valor: number | null, incidencia: number | null}> = [];

  // Control del dropdown personalizado
  isHongosDropdownOpen: boolean = false;
  hongosSearchText: string = '';
  isHongosCampoDropdownOpen: boolean = false;
  hongosCampoSearchText: string = '';
  isHongosAlmacenajeDropdownOpen: boolean = false;
  hongosAlmacenajeSearchText: string = '';

  // Campos de fecha
  fechaSiembra: string = '';
  fecha: string = '';

  // Campos numéricos
  nLab: number = 0;
  temperatura: number = 0;
  horasLuzOscuridad: number = 0;
  numeroDias: number = 0;
  numeroSemillasRepeticion: number = 0;

  // Campos de texto
  observaciones: string = '';

  // Propiedades actualizadas según el nuevo DTO
  id: number | null = null;
  metodo: string = '';
  horasLuz: number | null = null;
  horasOscuridad: number | null = null;
  nroDias: number | null = null;
  estadoProductoDosis: string = '';
  nroSemillasRepeticion: number | null = null;
  reciboId: number | null = null;
  activo: boolean = true;
  estandar: boolean = false;
  SanitarioHongoids: number[] | null = null;
  fechaCreacion: string | null = null;
  fechaRepeticion: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Verificar si estamos en modo edición basado en la ruta
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditing = true;
        this.editingId = parseInt(params['id']);
        this.cargarDatosParaEdicion(this.editingId);
      } else {
        this.isEditing = false;
        this.editingId = null;
        this.cargarDatos();
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
      return this.hongos;
    }
    return this.hongos.filter(hongo =>
      hongo.label.toLowerCase().includes(this.hongosSearchText.toLowerCase())
    );
  }

  toggleHongoSelection(hongo: any) {
    const index = this.selectedHongos.indexOf(hongo.id);
    if (index > -1) {
      this.selectedHongos.splice(index, 1);
    } else {
      this.selectedHongos.push(hongo.id);
    }
    this.onHongosChange();
  }

  isHongoSelected(hongoId: number): boolean {
    return this.selectedHongos.includes(hongoId);
  }

  getSelectedHongosText(): string {
    if (this.selectedHongos.length === 0) {
      return 'Seleccionar hongos...';
    }
    if (this.selectedHongos.length === 1) {
      const hongo = this.hongos.find(h => h.id === this.selectedHongos[0]);
      return hongo ? hongo.label : '';
    }
    return `${this.selectedHongos.length} hongos seleccionados`;
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
    console.log('Hongos seleccionados:', this.selectedHongos);
    this.createHongosTable();
  }

  createHongosTable() {
    this.hongosTable = [];
    this.selectedHongos.forEach(hongoId => {
      const hongo = this.hongos.find(h => h.id === hongoId);
      if (hongo) {
        this.hongosTable.push({
          tipoHongo: hongo.label,
          repeticion: null,
          valor: null,
          incidencia: null
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
      hongo.label.toLowerCase().includes(this.hongosCampoSearchText.toLowerCase())
    );
  }

  toggleHongoCampoSelection(hongo: any) {
    const index = this.selectedHongosCampo.indexOf(hongo.id);
    if (index > -1) {
      this.selectedHongosCampo.splice(index, 1);
    } else {
      this.selectedHongosCampo.push(hongo.id);
    }
    this.onHongosCampoChange();
  }

  isHongoCampoSelected(hongoId: number): boolean {
    return this.selectedHongosCampo.includes(hongoId);
  }

  getSelectedHongosCampoText(): string {
    if (this.selectedHongosCampo.length === 0) {
      return 'Seleccionar hongos...';
    }
    if (this.selectedHongosCampo.length === 1) {
      const hongo = this.hongosCampo.find(h => h.id === this.selectedHongosCampo[0]);
      return hongo ? hongo.label : '';
    }
    return `${this.selectedHongosCampo.length} hongos seleccionados`;
  }

  onHongosCampoChange() {
    console.log('Hongos Campo seleccionados:', this.selectedHongosCampo);
    this.createHongosCampoTable();
  }

  createHongosCampoTable() {
    this.hongosCampoTable = [];
    this.selectedHongosCampo.forEach(hongoId => {
      const hongo = this.hongosCampo.find(h => h.id === hongoId);
      if (hongo) {
        this.hongosCampoTable.push({
          tipoHongo: hongo.label,
          repeticion: null,
          valor: null,
          incidencia: null
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
      hongo.label.toLowerCase().includes(this.hongosAlmacenajeSearchText.toLowerCase())
    );
  }

  toggleHongoAlmacenajeSelection(hongo: any) {
    const index = this.selectedHongosAlmacenaje.indexOf(hongo.id);
    if (index > -1) {
      this.selectedHongosAlmacenaje.splice(index, 1);
    } else {
      this.selectedHongosAlmacenaje.push(hongo.id);
    }
    this.onHongosAlmacenajeChange();
  }

  isHongoAlmacenajeSelected(hongoId: number): boolean {
    return this.selectedHongosAlmacenaje.includes(hongoId);
  }

  getSelectedHongosAlmacenajeText(): string {
    if (this.selectedHongosAlmacenaje.length === 0) {
      return 'Seleccionar hongos...';
    }
    if (this.selectedHongosAlmacenaje.length === 1) {
      const hongo = this.hongosAlmacenaje.find(h => h.id === this.selectedHongosAlmacenaje[0]);
      return hongo ? hongo.label : '';
    }
    return `${this.selectedHongosAlmacenaje.length} hongos seleccionados`;
  }

  onHongosAlmacenajeChange() {
    console.log('Hongos Almacenaje seleccionados:', this.selectedHongosAlmacenaje);
    this.createHongosAlmacenajeTable();
  }

  createHongosAlmacenajeTable() {
    this.hongosAlmacenajeTable = [];
    this.selectedHongosAlmacenaje.forEach(hongoId => {
      const hongo = this.hongosAlmacenaje.find(h => h.id === hongoId);
      if (hongo) {
        this.hongosAlmacenajeTable.push({
          tipoHongo: hongo.label,
          repeticion: null,
          valor: null,
          incidencia: null
        });
      }
    });
  }

  // Datos de prueba (deberían venir de un servicio)
  private itemsData: SanitarioDto[] = [
    {
      id: 1,
      fechaSiembra: '2023-01-10',
      fecha: '2023-01-15',
      metodo: 'METODO_A',
      temperatura: 25.5,
      horasLuz: 12,
      horasOscuridad: 12,
      nroDias: 7,
      estadoProductoDosis: 'ESTADO_X',
      observaciones: 'Control de calidad mensual - Muestra estándar',
      nroSemillasRepeticion: 100,
      reciboId: 101,
      activo: true,
      estandar: true,
      repetido: false,
      SanitarioHongoids: [1, 2],
      fechaCreacion: '2023-01-15',
      fechaRepeticion: null
    },
    {
      id: 2,
      fechaSiembra: '2022-02-15',
      fecha: '2022-02-20',
      metodo: 'METODO_B',
      temperatura: 23.8,
      horasLuz: 14,
      horasOscuridad: 10,
      nroDias: 10,
      estadoProductoDosis: 'ESTADO_Y',
      observaciones: 'Lote especial - Requiere repetición',
      nroSemillasRepeticion: 150,
      reciboId: 102,
      activo: true,
      estandar: false,
      repetido: true,
      SanitarioHongoids: [3, 4, 5],
      fechaCreacion: '2022-02-20',
      fechaRepeticion: '2022-02-22'
    }
  ];

  private cargarDatosParaEdicion(id: number) {
    // En un escenario real, esto vendría de un servicio
    const item = this.itemsData.find(sanitario => sanitario.id === id);
    if (item) {
      console.log('Cargando datos para edición:', item);
      this.fechaSiembra = item.fechaSiembra || '';
      this.fecha = item.fecha || '';
      this.temperatura = item.temperatura || 0;
      this.horasLuz = item.horasLuz || 0;
      this.horasOscuridad = item.horasOscuridad || 0;
      this.numeroDias = item.nroDias || 0;
      this.numeroSemillasRepeticion = item.nroSemillasRepeticion || 0;
      this.observaciones = item.observaciones || '';
      // Aquí también podrías cargar el método y estado seleccionados
    }
  }

  private cargarDatos() {
    console.log('Modo creación - limpiando campos');
    // Limpiar campos para creación
    this.id = null;
    this.fechaSiembra = '2025-10-01';
    this.fecha = '2025-10-03';
    this.metodo = 'Metodo A';
    this.temperatura = 22;
    this.horasLuz = 12;
    this.horasOscuridad = 12;
    this.nroDias = 7;
    this.estadoProductoDosis = 'Activo';
    this.observaciones = 'Ejemplo de sanitario actualizado';
    this.nroSemillasRepeticion = 100;
    this.reciboId = 1;
    this.activo = true;
    this.estandar = false;
    this.repetido = false;
    this.SanitarioHongoids = [1, 2];
    this.fechaCreacion = '2025-10-03';
    this.fechaRepeticion = null;
  }

  onSubmit() {
    const sanitarioData: Partial<SanitarioDto> = {
      fechaSiembra: this.fechaSiembra,
      fecha: this.fecha,
      temperatura: this.temperatura,
      horasLuz: this.horasLuz,
      horasOscuridad: this.horasOscuridad,
      nroDias: this.numeroDias,
      nroSemillasRepeticion: this.numeroSemillasRepeticion,
      observaciones: this.observaciones,
      activo: true
      // Aquí también deberías agregar el método y estado seleccionados
    };

    if (this.isEditing && this.editingId) {
      // Actualizar Sanitario existente
      console.log('Actualizando Sanitario ID:', this.editingId, 'con datos:', sanitarioData);
    } else {
      // Crear nuevo Sanitario
      console.log('Creando nuevo Sanitario:', sanitarioData);
    }

    // Navegar de vuelta al listado
    this.router.navigate(['/listado-sanitario']);
  }

  onCancel() {
    // Navegar de vuelta al listado
    this.router.navigate(['/listado-sanitario']);
  }

}

import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PurezaDto } from '../../../models/Pureza.dto';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-pureza.component',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    MultiSelectModule],
  templateUrl: './pureza.component.html',
  styleUrl: './pureza.component.scss'
})
export class PurezaComponent implements OnInit {

  // Variables para manejar navegación
  isEditing: boolean = false;
  editingId: number | null = null;
  repetido: boolean = false;

  // --- Multiselect Malezas tolerancia cero ---
  malezasCeroOptions = [
    { id: 1, label: 'Cuscuta spp.' },
    { id: 2, label: 'Brassica spp.' },
    { id: 3, label: 'Orobanche spp.' }
  ];

  selectedMalezasCero: number[] = [];

  isMalezasCeroDropdownOpen: boolean = false;

  malezasCeroSearchText: string = '';

  toggleMalezasCeroDropdown() { this.isMalezasCeroDropdownOpen = !this.isMalezasCeroDropdownOpen; }

  getFilteredMalezasCero() {
    const search = this.malezasCeroSearchText.toLowerCase();
    return this.malezasCeroOptions.filter(mc => mc.label.toLowerCase().includes(search));
  }

  isMalezaCeroSelected(id: number) {
    return this.selectedMalezasCero.includes(id);
  }

  toggleMalezaCeroSelection(maleza: {id: number, label: string}) {
    if (this.isMalezaCeroSelected(maleza.id)) {
      this.selectedMalezasCero = this.selectedMalezasCero.filter(id => id !== maleza.id);
    } else {
      this.selectedMalezasCero = [...this.selectedMalezasCero, maleza.id];
    }
  }

  getSelectedMalezasCeroText() {
    if (this.selectedMalezasCero.length === 0) return 'Seleccionar malezas tolerancia cero...';
    return this.selectedMalezasCero.map(id => {
      const item = this.malezasCeroOptions.find(mc => mc.id === id);
      return item ? item.label : '';
    }).join(', ');
  }

  // --- Multiselect Malezas comunes ---
  malezasComunesOptions = [
    { id: 1, label: 'Amaranthus retroflexus' },
    { id: 2, label: 'Chenopodium album' },
    { id: 3, label: 'Echinochloa crus-galli' },
    { id: 4, label: 'Solanum nigrum' }
  ];

  selectedMalezasComunes: number[] = [];

  isMalezasComunesDropdownOpen: boolean = false;

  malezasComunesSearchText: string = '';

  toggleMalezasComunesDropdown() {
    this.isMalezasComunesDropdownOpen = !this.isMalezasComunesDropdownOpen;
  }

  getFilteredMalezasComunes() {
    const search = this.malezasComunesSearchText.toLowerCase();
    return this.malezasComunesOptions.filter(m => m.label.toLowerCase().includes(search));
  }

  isMalezaComunSelected(id: number) {
    return this.selectedMalezasComunes.includes(id);
  }

  toggleMalezaComunSelection(maleza: {id: number, label: string}) {
    if (this.isMalezaComunSelected(maleza.id)) {
      this.selectedMalezasComunes = this.selectedMalezasComunes.filter(id => id !== maleza.id);
    } else {
      this.selectedMalezasComunes = [...this.selectedMalezasComunes, maleza.id];
    }
  }
  getSelectedMalezasComunesText() {
    if (this.selectedMalezasComunes.length === 0) return 'Seleccionar malezas comunes...';
    return this.selectedMalezasComunes.map(id => {
      const item = this.malezasComunesOptions.find(m => m.id === id);
      return item ? item.label : '';
    }).join(', ');
  }

  // --- Multiselect Malezas toleradas ---
  malezasToleradasOptions = [
    { id: 1, label: 'Lolium perenne' },
    { id: 2, label: 'Poa annua' },
    { id: 3, label: 'Capsella bursa-pastoris' }
  ];
  selectedMalezasToleradas: number[] = [];
  isMalezasToleradasDropdownOpen: boolean = false;
  malezasToleradasSearchText: string = '';
  toggleMalezasToleradasDropdown() { this.isMalezasToleradasDropdownOpen = !this.isMalezasToleradasDropdownOpen; }
  getFilteredMalezasToleradas() {
    const search = this.malezasToleradasSearchText.toLowerCase();
    return this.malezasToleradasOptions.filter(mt => mt.label.toLowerCase().includes(search));
  }
  isMalezaToleradaSelected(id: number) { return this.selectedMalezasToleradas.includes(id); }
  toggleMalezaToleradaSelection(maleza: {id: number, label: string}) {
    if (this.isMalezaToleradaSelected(maleza.id)) {
      this.selectedMalezasToleradas = this.selectedMalezasToleradas.filter(id => id !== maleza.id);
    } else {
      this.selectedMalezasToleradas = [...this.selectedMalezasToleradas, maleza.id];
    }
  }
  getSelectedMalezasToleradasText() {
    if (this.selectedMalezasToleradas.length === 0) return 'Seleccionar malezas toleradas...';
    return this.selectedMalezasToleradas.map(id => {
      const item = this.malezasToleradasOptions.find(mt => mt.id === id);
      return item ? item.label : '';
    }).join(', ');
  }

  // --- Multiselect Otros cultivos ---
  cultivosOptions = [
    { id: 1, label: 'Trigo' },
    { id: 2, label: 'Cebada' },
    { id: 3, label: 'Avena' },
    { id: 4, label: 'Centeno' }
  ];
  selectedCultivos: number[] = [];

  isCultivosDropdownOpen: boolean = false;

  cultivosSearchText: string = '';

  toggleCultivosDropdown() { this.isCultivosDropdownOpen = !this.isCultivosDropdownOpen; }

  getFilteredCultivos() {
    const search = this.cultivosSearchText.toLowerCase();
    return this.cultivosOptions.filter(c => c.label.toLowerCase().includes(search));
  }

  isCultivoSelected(id: number) {
    return this.selectedCultivos.includes(id);
  }

  toggleCultivoSelection(cultivo: {id: number, label: string}) {
    if (this.isCultivoSelected(cultivo.id)) {
      this.selectedCultivos = this.selectedCultivos.filter(id => id !== cultivo.id);
    } else {
      this.selectedCultivos = [...this.selectedCultivos, cultivo.id];
    }
  }

  getSelectedCultivosText() {
    if (this.selectedCultivos.length === 0) return 'Seleccionar cultivos...';
    return this.selectedCultivos.map(id => {
      const item = this.cultivosOptions.find(c => c.id === id);
      return item ? item.label : '';
    }).join(', ');
  }

  metodos = [
    { label: 'Metodo A', id: 1 },
    { label: 'Metodo B', id: 2 },
    { label: 'Metodo C', id: 3 }
  ];

  selectedMetodo: string = '';

  // Campos de texto simples
  nLab: number = 0;
  especie: number = 0;
  ficha: string = '';
  fechaMedicion: string = '';
  observaciones: string = '';

  // Campos para formulario de pureza
  fecha: string = '';
  pesoInicialGr: number = 0;
  pesoInicialPct: number = 0;
  semillaPuraGr: number = 0;
  semillaPuraPct: number = 0;
  materiaInerteGr: number = 0;
  materiaInertePct: number = 0;
  otrosCultivosGr: number = 0;
  otrosCultivosPct: number = 0;
  malezasGr: number = 0;
  malezasPct: number = 0;
  malezasToleradasGr: number = 0;
  malezasToleradasPct: number = 0;
  pesoTotalGr: number = 0;
  pesoTotalPct: number = 0;
  fechaEstandar: string = '';
  estandar: boolean = false;

  // Listados (select múltiple)
  malezasCero: string[] = [];
  malezasComunes: string[] = [];
  malezasTol: string[] = [];
  otrosCultivosListado: string[] = [];

  // Variables auxiliares para selects dinámicos
  malezaCeroSeleccionada: { id: string, label: string } | null = null;
  malezaComunSeleccionada: { id: string, label: string } | null = null;
  malezaTolSeleccionada: { id: string, label: string } | null = null;
  cultivoSeleccionado: { id: string, label: string } | null = null;

  // Objeto pureza de tipo PurezaDto
  pureza: PurezaDto = {
    id: null,
    fechaInase: null,
    fechaInia: null,
    pesoInicial: 0,
    pesoInicialInase: 0,
    pesoInicialPorcentajeRedondeo: 0,
    pesoInicialPorcentajeRedondeoInase: 0,
    semillaPura: 0,
    semillaPuraInase: 0,
    semillaPuraPorcentajeRedondeo: 0,
    semillaPuraPorcentajeRedondeoInase: 0,
    materialInerte: 0,
    materialInerteInase: 0,
    materialInertePorcentajeRedondeo: 0,
    materialInertePorcentajeRedondeoInase: 0,
    otrosCultivos: 0,
    otrosCultivosInase: 0,
    otrosCultivosPorcentajeRedondeo: 0,
    otrosCultivosPorcentajeRedondeoInase: 0,
    malezas: 0,
    malezasInase: 0,
    malezasPorcentajeRedondeo: 0,
    malezasPorcentajeRedondeoInase: 0,
    malezasToleradas: 0,
    malezasToleradasInase: 0,
    malezasToleradasPorcentajeRedondeo: 0,
    malezasToleradasPorcentajeRedondeoInase: 0,
    malezasToleranciaCero: 0,
    malezasToleranciaCeroInase: 0,
    malezasToleranciaCeroPorcentajeRedondeo: 0,
    malezasToleranciaCeroPorcentajeRedondeoInase: 0,
    pesoTotal: 0,
    fechaEstandar: null,
    estandar: false,
    activo: true,
    reciboId: null,
    repetido: false,
    fechaCreacion: null,
    fechaRepeticion: null
  };

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

  agregarMalezaCero() {
    if (this.malezaCeroSeleccionada && !this.malezasCero.includes(this.malezaCeroSeleccionada.id)) {
      this.malezasCero.push(this.malezaCeroSeleccionada.id);
      this.malezaCeroSeleccionada = null;
    }
  }

  eliminarMalezaCero(idx: number) {
    this.malezasCero.splice(idx, 1);
  }

  agregarMalezaComun() {
    if (this.malezaComunSeleccionada && !this.malezasComunes.includes(this.malezaComunSeleccionada.id)) {
      this.malezasComunes.push(this.malezaComunSeleccionada.id);
      this.malezaComunSeleccionada = null;
    }
  }

  eliminarMalezaComun(idx: number) {
    this.malezasComunes.splice(idx, 1);
  }

  agregarMalezaTol() {
    if (this.malezaTolSeleccionada && !this.malezasTol.includes(this.malezaTolSeleccionada.id)) {
      this.malezasTol.push(this.malezaTolSeleccionada.id);
      this.malezaTolSeleccionada = null;
    }
  }

  eliminarMalezaTol(idx: number) {
    this.malezasTol.splice(idx, 1);
  }

  agregarCultivo() {
    if (this.cultivoSeleccionado && !this.otrosCultivosListado.includes(this.cultivoSeleccionado.id)) {
      this.otrosCultivosListado.push(this.cultivoSeleccionado.id);
      this.cultivoSeleccionado = null;
    }
  }

  eliminarCultivo(idx: number) {
    this.otrosCultivosListado.splice(idx, 1);
  }

  obtenerLabel(id: string, lista: { id: string, label: string }[]): string {
    const found = lista.find(x => x.id === id);
    return found ? found.label : id;
  }

  // Opciones para los listados
  malezasCeroList = [
    { id: 'm1', label: 'Amaranthus retroflexus' },
    { id: 'm2', label: 'Sorghum halepense' },
    { id: 'm3', label: 'Cuscuta spp.' },
    { id: 'm4', label: 'Orobanche spp.' }
  ];

  malezasComunesList = [
    { id: 'mc1', label: 'Chenopodium album' },
    { id: 'mc2', label: 'Echinochloa crus-galli' },
    { id: 'mc3', label: 'Polygonum aviculare' }
  ];

  malezasTolList = [
    { id: 'mt1', label: 'Lolium perenne' },
    { id: 'mt2', label: 'Poa annua' },
    { id: 'mt3', label: 'Setaria viridis' }
  ];

  otrosCultivosList = [
    { id: 'oc1', label: 'Trigo' },
    { id: 'oc2', label: 'Cebada' },
    { id: 'oc3', label: 'Avena' },
    { id: 'oc4', label: 'Maíz' }
  ];

  // Datos de prueba (deberían venir de un servicio)
  private itemsData: PurezaDto[] = [
    {
      id: 1,
      fecha: '2023-01-15',
      pesoInicial: 100,
      semillaPura: 95,
      materialInerte: 2,
      otrosCultivos: 1.5,
      malezas: 1,
      malezasToleradas: 0.5,
      pesoTotal: 100,
      otrosCultivo: 1.5,
      fechaEstandar: '2023-01-15',
      estandar: true,
      activo: true,
      repetido: false,
      fechaCreacion: '2023-01-15',
      fechaRepeticion: null
    },
    {
      id: 2,
      fecha: '2022-02-20',
      pesoInicial: 90,
      semillaPura: 88,
      materialInerte: 1.5,
      otrosCultivos: 0.3,
      malezas: 0.2,
      malezasToleradas: 0,
      pesoTotal: 90,
      otrosCultivo: 0.3,
      fechaEstandar: '2022-02-20',
      estandar: false,
      activo: true,
      repetido: true,
      fechaCreacion: '2022-02-20',
      fechaRepeticion: '2022-02-22'
    }
  ];

  private cargarDatosParaEdicion(id: number) {
    // En un escenario real, esto vendría de un servicio
    const item = this.itemsData.find(pureza => pureza.id === id);
    if (item) {
      console.log('Cargando datos para edición:', item);
      this.fecha = item.fecha || '';
      this.pesoInicialGr = item.pesoInicial || 0;
      this.semillaPuraGr = item.semillaPura || 0;
      this.materiaInerteGr = item.materialInerte || 0;
      this.otrosCultivosGr = item.otrosCultivos || 0;
      this.malezasGr = item.malezas || 0;
      this.malezasToleradasGr = item.malezasToleradas || 0;
      this.pesoTotalGr = item.pesoTotal || 0;
      this.fechaEstandar = item.fechaEstandar || '';
      this.estandar = item.estandar || false;
      this.repetido = item.repetido || false;
    }
  }

  private cargarDatos() {
    console.log('Modo creación - limpiando campos');
    // Limpiar campos para creación
    this.fecha = '';
    this.pesoInicialGr = 0;
    this.semillaPuraGr = 0;
    this.materiaInerteGr = 0;
    this.otrosCultivosGr = 0;
    this.malezasGr = 0;
    this.malezasToleradasGr = 0;
    this.pesoTotalGr = 0;
    this.fechaEstandar = '';
    this.estandar = false;
    this.repetido = false;
  }

  onSubmit() {
    const purezaData: Partial<PurezaDto> = {
      fecha: this.fecha,
      pesoInicial: this.pesoInicialGr,
      semillaPura: this.semillaPuraGr,
      materialInerte: this.materiaInerteGr,
      otrosCultivos: this.otrosCultivosGr,
      malezas: this.malezasGr,
      malezasToleradas: this.malezasToleradasGr,
      pesoTotal: this.pesoTotalGr,
      fechaEstandar: this.fechaEstandar,
      estandar: this.estandar,
      repetido: this.repetido,
      activo: true
    };

    if (this.isEditing && this.editingId) {
      // Actualizar Pureza existente
      console.log('Actualizando Pureza ID:', this.editingId, 'con datos:', purezaData);
    } else {
      // Crear nueva Pureza
      console.log('Creando nueva Pureza:', purezaData);
    }

    // Navegar de vuelta al listado
    this.router.navigate(['/listado-pureza']);
  }

  onCancel() {
    // Navegar de vuelta al listado
    this.router.navigate(['/listado-pureza']);
  }

}

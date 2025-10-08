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
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-pureza.component',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    MultiSelectModule,
    TableModule],
  templateUrl: './pureza.component.html',
  styleUrl: './pureza.component.scss'
})
export class PurezaComponent implements OnInit {

  // Variables para manejar navegación
  isEditing: boolean = false;
  isViewing: boolean = false;
  editingId: number | null = null;
  repetido: boolean = false;

   loteId: string | null = '';
    reciboId: string | null = '';

  // --- Multiselect Malezas tolerancia cero ---
  malezasCeroOptions = [
    { id: 1, label: 'Cuscuta spp.' },
    { id: 2, label: 'Brassica spp.' },
    { id: 3, label: 'Orobanche spp.' }
  ];

  fechaInia: Date | null = null;
  fechaInase: Date | null = null;

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
  malezasToleranciaCeroGr: number = 0;
  malezasToleranciaCeroPct: number = 0;
  pesoTotalGr: number = 0;
  pesoTotalPct: number = 0;
  
  // Variables para porcentajes de redondeo
  pesoInicialPctRedondeo: number = 0;
  semillaPuraPctRedondeo: number = 0;
  materiaInertePctRedondeo: number = 0;
  otrosCultivosPctRedondeo: number = 0;
  malezasPctRedondeo: number = 0;
  malezasToleradasPctRedondeo: number = 0;
  malezasToleranciaCeroPctRedondeo: number = 0;
  pesoTotalPctRedondeo: number = 0;

  // Variables para INASE - gramos
  pesoInicialInaseGr: number = 0;
  semillaPuraInaseGr: number = 0;
  materiaInerteInaseGr: number = 0;
  otrosCultivosInaseGr: number = 0;
  malezasInaseGr: number = 0;
  malezasToleradasInaseGr: number = 0;
  malezasToleranciaCeroInaseGr: number = 0;
  pesoTotalInaseGr: number = 0;

  // Variables para INASE - porcentajes
  pesoInicialInasePct: number = 0;
  semillaPuraInasePct: number = 0;
  materiaInerteInasePct: number = 0;
  otrosCultivosInasePct: number = 0;
  malezasInasePct: number = 0;
  malezasToleradasInasePct: number = 0;
  malezasToleranciaCeroInasePct: number = 0;
  pesoTotalInasePct: number = 0;

  // Variables para INASE - porcentajes de redondeo
  pesoInicialInasePctRedondeo: number = 0;
  semillaPuraInasePctRedondeo: number = 0;
  materiaInerteInasePctRedondeo: number = 0;
  otrosCultivosInasePctRedondeo: number = 0;
  malezasInasePctRedondeo: number = 0;
  malezasToleradasInasePctRedondeo: number = 0;
  malezasToleranciaCeroInasePctRedondeo: number = 0;
  pesoTotalInasePctRedondeo: number = 0;
  
  fechaEstandar: string = '';
  estandar: boolean = false;

  // Datos para la tabla de pureza
  purezaTableRows = [
    { label: 'Peso inicial' },
    { label: 'Semilla pura' },
    { label: 'Materia inerte' },
    { label: 'Otros cultivos' },
    { label: 'Malezas' },
    { label: 'Malezas toleradas' },
    { label: 'Malezas tolerancia cero' },
    { label: 'Peso total' }
  ];

  // Métodos para manejar los valores de la tabla
  getGramosValue(rowIndex: number): number {
    switch(rowIndex) {
      case 0: return this.pesoInicialGr;
      case 1: return this.semillaPuraGr;
      case 2: return this.materiaInerteGr;
      case 3: return this.otrosCultivosGr;
      case 4: return this.malezasGr;
      case 5: return this.malezasToleradasGr;
      case 6: return this.malezasToleranciaCeroGr;
      case 7: return this.pesoTotalGr;
      default: return 0;
    }
  }

  setGramosValue(rowIndex: number, value: number): void {
    switch(rowIndex) {
      case 0: this.pesoInicialGr = value; break;
      case 1: this.semillaPuraGr = value; break;
      case 2: this.materiaInerteGr = value; break;
      case 3: this.otrosCultivosGr = value; break;
      case 4: this.malezasGr = value; break;
      case 5: this.malezasToleradasGr = value; break;
      case 6: this.malezasToleranciaCeroGr = value; break;
      case 7: this.pesoTotalGr = value; break;
    }
  }

  getPorcentajeValue(rowIndex: number): number {
    switch(rowIndex) {
      case 0: return this.pesoInicialPct;
      case 1: return this.semillaPuraPct;
      case 2: return this.materiaInertePct;
      case 3: return this.otrosCultivosPct;
      case 4: return this.malezasPct;
      case 5: return this.malezasToleradasPct;
      case 6: return this.malezasToleranciaCeroPct;
      case 7: return this.pesoTotalPct;
      default: return 0;
    }
  }

  setPorcentajeValue(rowIndex: number, value: number): void {
    switch(rowIndex) {
      case 0: this.pesoInicialPct = value; break;
      case 1: this.semillaPuraPct = value; break;
      case 2: this.materiaInertePct = value; break;
      case 3: this.otrosCultivosPct = value; break;
      case 4: this.malezasPct = value; break;
      case 5: this.malezasToleradasPct = value; break;
      case 6: this.malezasToleranciaCeroPct = value; break;
      case 7: this.pesoTotalPct = value; break;
    }
  }

  getPorcentajeRedondeoValue(rowIndex: number): number {
    switch(rowIndex) {
      case 0: return this.pesoInicialPctRedondeo;
      case 1: return this.semillaPuraPctRedondeo;
      case 2: return this.materiaInertePctRedondeo;
      case 3: return this.otrosCultivosPctRedondeo;
      case 4: return this.malezasPctRedondeo;
      case 5: return this.malezasToleradasPctRedondeo;
      case 6: return this.malezasToleranciaCeroPctRedondeo;
      case 7: return this.pesoTotalPctRedondeo;
      default: return 0;
    }
  }

  setPorcentajeRedondeoValue(rowIndex: number, value: number): void {
    switch(rowIndex) {
      case 0: this.pesoInicialPctRedondeo = value; break;
      case 1: this.semillaPuraPctRedondeo = value; break;
      case 2: this.materiaInertePctRedondeo = value; break;
      case 3: this.otrosCultivosPctRedondeo = value; break;
      case 4: this.malezasPctRedondeo = value; break;
      case 5: this.malezasToleradasPctRedondeo = value; break;
      case 6: this.malezasToleranciaCeroPctRedondeo = value; break;
      case 7: this.pesoTotalPctRedondeo = value; break;
    }
  }

  // Métodos para manejar los valores de la tabla INASE
  getGramosInaseValue(rowIndex: number): number {
    switch(rowIndex) {
      case 0: return this.pesoInicialInaseGr;
      case 1: return this.semillaPuraInaseGr;
      case 2: return this.materiaInerteInaseGr;
      case 3: return this.otrosCultivosInaseGr;
      case 4: return this.malezasInaseGr;
      case 5: return this.malezasToleradasInaseGr;
      case 6: return this.malezasToleranciaCeroInaseGr;
      case 7: return this.pesoTotalInaseGr;
      default: return 0;
    }
  }

  setGramosInaseValue(rowIndex: number, value: number): void {
    switch(rowIndex) {
      case 0: this.pesoInicialInaseGr = value; break;
      case 1: this.semillaPuraInaseGr = value; break;
      case 2: this.materiaInerteInaseGr = value; break;
      case 3: this.otrosCultivosInaseGr = value; break;
      case 4: this.malezasInaseGr = value; break;
      case 5: this.malezasToleradasInaseGr = value; break;
      case 6: this.malezasToleranciaCeroInaseGr = value; break;
      case 7: this.pesoTotalInaseGr = value; break;
    }
  }

  getPorcentajeInaseValue(rowIndex: number): number {
    switch(rowIndex) {
      case 0: return this.pesoInicialInasePct;
      case 1: return this.semillaPuraInasePct;
      case 2: return this.materiaInerteInasePct;
      case 3: return this.otrosCultivosInasePct;
      case 4: return this.malezasInasePct;
      case 5: return this.malezasToleradasInasePct;
      case 6: return this.malezasToleranciaCeroInasePct;
      case 7: return this.pesoTotalInasePct;
      default: return 0;
    }
  }

  setPorcentajeInaseValue(rowIndex: number, value: number): void {
    switch(rowIndex) {
      case 0: this.pesoInicialInasePct = value; break;
      case 1: this.semillaPuraInasePct = value; break;
      case 2: this.materiaInerteInasePct = value; break;
      case 3: this.otrosCultivosInasePct = value; break;
      case 4: this.malezasInasePct = value; break;
      case 5: this.malezasToleradasInasePct = value; break;
      case 6: this.malezasToleranciaCeroInasePct = value; break;
      case 7: this.pesoTotalInasePct = value; break;
    }
  }

  getPorcentajeRedondeoInaseValue(rowIndex: number): number {
    switch(rowIndex) {
      case 0: return this.pesoInicialInasePctRedondeo;
      case 1: return this.semillaPuraInasePctRedondeo;
      case 2: return this.materiaInerteInasePctRedondeo;
      case 3: return this.otrosCultivosInasePctRedondeo;
      case 4: return this.malezasInasePctRedondeo;
      case 5: return this.malezasToleradasInasePctRedondeo;
      case 6: return this.malezasToleranciaCeroInasePctRedondeo;
      case 7: return this.pesoTotalInasePctRedondeo;
      default: return 0;
    }
  }

  setPorcentajeRedondeoInaseValue(rowIndex: number, value: number): void {
    switch(rowIndex) {
      case 0: this.pesoInicialInasePctRedondeo = value; break;
      case 1: this.semillaPuraInasePctRedondeo = value; break;
      case 2: this.materiaInerteInasePctRedondeo = value; break;
      case 3: this.otrosCultivosInasePctRedondeo = value; break;
      case 4: this.malezasInasePctRedondeo = value; break;
      case 5: this.malezasToleradasInasePctRedondeo = value; break;
      case 6: this.malezasToleranciaCeroInasePctRedondeo = value; break;
      case 7: this.pesoTotalInasePctRedondeo = value; break;
    }
  }

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

  // Getter para determinar si está en modo readonly
  get isReadonly(): boolean {
    return this.isViewing;
  }

  ngOnInit() {
    this.loteId = this.route.snapshot.paramMap.get('loteId');
    this.reciboId = this.route.snapshot.paramMap.get('reciboId');

    // Verificar si estamos en modo edición basado en la ruta
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
      fechaInase: null,
      fechaInia: null,
      pesoInicial: 100,
      pesoInicialInase: null,
      pesoInicialPorcentajeRedondeo: null,
      pesoInicialPorcentajeRedondeoInase: null,
      semillaPura: 95,
      semillaPuraInase: null,
      semillaPuraPorcentajeRedondeo: null,
      semillaPuraPorcentajeRedondeoInase: null,
      materialInerte: 2,
      materialInerteInase: null,
      materialInertePorcentajeRedondeo: null,
      materialInertePorcentajeRedondeoInase: null,
      otrosCultivos: 1.5,
      otrosCultivosInase: null,
      otrosCultivosPorcentajeRedondeo: null,
      otrosCultivosPorcentajeRedondeoInase: null,
      malezas: 1,
      malezasInase: null,
      malezasPorcentajeRedondeo: null,
      malezasPorcentajeRedondeoInase: null,
      malezasToleradas: 0.5,
      malezasToleradasInase: null,
      malezasToleradasPorcentajeRedondeo: null,
      malezasToleradasPorcentajeRedondeoInase: null,
      malezasToleranciaCero: null,
      malezasToleranciaCeroInase: null,
      malezasToleranciaCeroPorcentajeRedondeo: null,
      malezasToleranciaCeroPorcentajeRedondeoInase: null,
      pesoTotal: 100,
      fechaEstandar: '2023-01-15',
      estandar: true,
      activo: true,
      reciboId: null,
      repetido: false,
      fechaCreacion: '2023-01-15',
      fechaRepeticion: null
    },
    {
      id: 2,
      fechaInase: null,
      fechaInia: null,
      pesoInicial: 90,
      pesoInicialInase: null,
      pesoInicialPorcentajeRedondeo: null,
      pesoInicialPorcentajeRedondeoInase: null,
      semillaPura: 88,
      semillaPuraInase: null,
      semillaPuraPorcentajeRedondeo: null,
      semillaPuraPorcentajeRedondeoInase: null,
      materialInerte: 1.5,
      materialInerteInase: null,
      materialInertePorcentajeRedondeo: null,
      materialInertePorcentajeRedondeoInase: null,
      otrosCultivos: 0.3,
      otrosCultivosInase: null,
      otrosCultivosPorcentajeRedondeo: null,
      otrosCultivosPorcentajeRedondeoInase: null,
      malezas: 0.2,
      malezasInase: null,
      malezasPorcentajeRedondeo: null,
      malezasPorcentajeRedondeoInase: null,
      malezasToleradas: 0,
      malezasToleradasInase: null,
      malezasToleradasPorcentajeRedondeo: null,
      malezasToleradasPorcentajeRedondeoInase: null,
      malezasToleranciaCero: null,
      malezasToleranciaCeroInase: null,
      malezasToleranciaCeroPorcentajeRedondeo: null,
      malezasToleranciaCeroPorcentajeRedondeoInase: null,
      pesoTotal: 90,
      fechaEstandar: '2022-02-20',
      estandar: false,
      activo: true,
      reciboId: null,
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
      this.fecha = item.fechaCreacion || '';
      this.pesoInicialGr = item.pesoInicial || 0;
      this.semillaPuraGr = item.semillaPura || 0;
      this.materiaInerteGr = item.materialInerte || 0;
      this.otrosCultivosGr = item.otrosCultivos || 0;
      this.malezasGr = item.malezas || 0;
      this.malezasToleradasGr = item.malezasToleradas || 0;
      this.malezasToleranciaCeroGr = item.malezasToleranciaCero || 0;
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
    this.malezasToleranciaCeroGr = 0;
    this.pesoTotalGr = 0;
    this.fechaEstandar = '';
    this.estandar = false;
    this.repetido = false;
  }

  onSubmit() {
    const purezaData: Partial<PurezaDto> = {
      fechaCreacion: this.fecha,
      pesoInicial: this.pesoInicialGr,
      semillaPura: this.semillaPuraGr,
      materialInerte: this.materiaInerteGr,
      otrosCultivos: this.otrosCultivosGr,
      malezas: this.malezasGr,
      malezasToleradas: this.malezasToleradasGr,
      malezasToleranciaCero: this.malezasToleranciaCeroGr,
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
    this.router.navigate([this.loteId + "/" + this.reciboId + "/listado-pureza"]);
  }

}

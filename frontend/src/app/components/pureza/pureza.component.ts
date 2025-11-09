import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PurezaDto } from '../../../models/Pureza.dto';
import { PurezaService } from '../../../services/PurezaService';
import { MalezaService } from '../../../services/MalezaService';
import { CultivoService } from '../../../services/CultivoService';
import { MalezaDto } from '../../../models/Maleza.dto';
import { CultivoDto } from '../../../models/Cultivo.dto';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { LogService } from '../../../services/LogService';


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

  // Agregar propiedades para manejar errores
  errores: string[] = [];
  
  // Variable para prevenir múltiples envíos
  isSubmitting: boolean = false;

  loteId: string | null = '';
  reciboId: string | null = '';
    
  // Campo para mantener fechaCreacion original durante edición
  fechaCreacionOriginal: string | null = null;

  // --- Listas dinámicas desde servicios ---
  malezas: any[] = []; // Lista única de todas las malezas
  cultivos: any[] = []; // Lista de cultivos

  fechaInia: string | null = null;
  fechaInase: string | null = null;

  // --- Selecciones de usuario para cada tipo de maleza ---
  selectedMalezasCero: number[] = [];
  selectedMalezasComunes: number[] = [];
  selectedMalezasToleradas: number[] = [];
  selectedCultivos: number[] = [];

  // --- Estados de dropdowns ---
  isMalezasCeroDropdownOpen: boolean = false;
  isMalezasComunesDropdownOpen: boolean = false;
  isMalezasToleradasDropdownOpen: boolean = false;
  isCultivosDropdownOpen: boolean = false;

  // --- Textos de búsqueda ---
  malezasCeroSearchText: string = '';
  malezasComunesSearchText: string = '';
  malezasToleradasSearchText: string = '';
  cultivosSearchText: string = '';

  gramosInase: number[] = [];
  gramosInia: number[] = [];

  // === MÉTODOS PARA MALEZAS TOLERANCIA CERO ===
  toggleMalezasCeroDropdown() { this.isMalezasCeroDropdownOpen = !this.isMalezasCeroDropdownOpen; }

  getFilteredMalezasCero() {
    const search = this.malezasCeroSearchText.toLowerCase();
    return this.malezas.filter(maleza => maleza.nombre?.toLowerCase().includes(search) || maleza.id.toString().includes(search));
  }

  isMalezaCeroSelected(id: number) {
    return this.selectedMalezasCero.includes(id);
  }

  toggleMalezaCeroSelection(maleza: {id: number, nombre: string}) {
    if (this.isMalezaCeroSelected(maleza.id)) {
      this.selectedMalezasCero = this.selectedMalezasCero.filter(id => id !== maleza.id);
    } else {
      this.selectedMalezasCero = [...this.selectedMalezasCero, maleza.id];
    }
  }

  getSelectedMalezasCeroText() {
    if (this.selectedMalezasCero.length === 0) return 'Seleccionar malezas tolerancia cero...';
    return this.selectedMalezasCero.map(id => {
      const item = this.malezas.find(m => m.id === id);
      return item ? item.nombre : '';
    }).join(', ');
  }

  // === MÉTODOS PARA MALEZAS COMUNES ===
  toggleMalezasComunesDropdown() {
    this.isMalezasComunesDropdownOpen = !this.isMalezasComunesDropdownOpen;
  }

  getFilteredMalezasComunes() {
    const search = this.malezasComunesSearchText.toLowerCase();
    return this.malezas.filter(maleza => maleza.nombre?.toLowerCase().includes(search) || maleza.id.toString().includes(search));
  }

  isMalezaComunSelected(id: number) {
    return this.selectedMalezasComunes.includes(id);
  }

  toggleMalezaComunSelection(maleza: {id: number, nombre: string}) {
    if (this.isMalezaComunSelected(maleza.id)) {
      this.selectedMalezasComunes = this.selectedMalezasComunes.filter(id => id !== maleza.id);
    } else {
      this.selectedMalezasComunes = [...this.selectedMalezasComunes, maleza.id];
    }
  }

  getSelectedMalezasComunesText() {
    if (this.selectedMalezasComunes.length === 0) return 'Seleccionar malezas comunes...';
    return this.selectedMalezasComunes.map(id => {
      const item = this.malezas.find(m => m.id === id);
      return item ? item.nombre : '';
    }).join(', ');
  }

  // === MÉTODOS PARA MALEZAS TOLERADAS ===
  toggleMalezasToleradasDropdown() { this.isMalezasToleradasDropdownOpen = !this.isMalezasToleradasDropdownOpen; }
  
  getFilteredMalezasToleradas() {
    const search = this.malezasToleradasSearchText.toLowerCase();
    return this.malezas.filter(maleza => maleza.nombre?.toLowerCase().includes(search) || maleza.id.toString().includes(search));
  }
  
  isMalezaToleradaSelected(id: number) { 
    return this.selectedMalezasToleradas.includes(id); 
  }
  
  toggleMalezaToleradaSelection(maleza: {id: number, nombre: string}) {
    if (this.isMalezaToleradaSelected(maleza.id)) {
      this.selectedMalezasToleradas = this.selectedMalezasToleradas.filter(id => id !== maleza.id);
    } else {
      this.selectedMalezasToleradas = [...this.selectedMalezasToleradas, maleza.id];
    }
  }
  
  getSelectedMalezasToleradasText() {
    if (this.selectedMalezasToleradas.length === 0) return 'Seleccionar malezas toleradas...';
    return this.selectedMalezasToleradas.map(id => {
      const item = this.malezas.find(m => m.id === id);
      return item ? item.nombre : '';
    }).join(', ');
  }

  // === MÉTODOS PARA CULTIVOS ===
  toggleCultivosDropdown() { this.isCultivosDropdownOpen = !this.isCultivosDropdownOpen; }

  getFilteredCultivos() {
    const search = this.cultivosSearchText.toLowerCase();
    return this.cultivos.filter(cultivo => cultivo.nombre?.toLowerCase().includes(search) || cultivo.id.toString().includes(search));
  }

  isCultivoSelected(id: number) {
    return this.selectedCultivos.includes(id);
  }

  toggleCultivoSelection(cultivo: {id: number, nombre: string}) {
    if (this.isCultivoSelected(cultivo.id)) {
      this.selectedCultivos = this.selectedCultivos.filter(id => id !== cultivo.id);
    } else {
      this.selectedCultivos = [...this.selectedCultivos, cultivo.id];
    }
  }

  getSelectedCultivosText() {
    if (this.selectedCultivos.length === 0) return 'Seleccionar cultivos...';
    return this.selectedCultivos.map(id => {
      const item = this.cultivos.find(c => c.id === id);
      return item ? item.nombre : '';
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
  
  // Variables para porcentajes de redondeo
  semillaPuraPctRedondeo: number = 0;
  materiaInertePctRedondeo: number = 0;
  otrosCultivosPctRedondeo: number = 0;
  malezasPctRedondeo: number = 0;
  malezasToleradasPctRedondeo: number = 0;
  malezasToleranciaCeroPctRedondeo: number = 0;

  // Campo adicional del DTO
  otrosCultivoField: number = 0;

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
  
  // Variables para materia inerte tipo
  materiaInerteTipo: string = '';
  materiaInerteTipoInase: string = '';
  
  fechaEstandar: string = '';
  estandar: boolean = false;
  activo: boolean = true;

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
      case 0: 
        this.pesoInicialGr = value; 
        this.recalcularPorcentajes(); // Recalcular todos los porcentajes cuando cambie el peso inicial
        break;
      case 1: 
        this.semillaPuraGr = value; 
        this.recalcularPorcentajeIndividual(1);
        this.recalcularPesoTotal(); // Recalcular peso total
        break;
      case 2: 
        this.materiaInerteGr = value; 
        this.recalcularPorcentajeIndividual(2);
        this.recalcularPesoTotal(); // Recalcular peso total
        break;
      case 3: 
        this.otrosCultivosGr = value; 
        this.recalcularPorcentajeIndividual(3);
        this.recalcularPesoTotal(); // Recalcular peso total
        break;
      case 4: 
        this.malezasGr = value; 
        this.recalcularPorcentajeIndividual(4);
        this.recalcularPesoTotal(); // Recalcular peso total
        break;
      case 5: 
        this.malezasToleradasGr = value; 
        this.recalcularPorcentajeIndividual(5);
        this.recalcularPesoTotal(); // Recalcular peso total
        break;
      case 6: 
        this.malezasToleranciaCeroGr = value; 
        this.recalcularPorcentajeIndividual(6);
        this.recalcularPesoTotal(); // Recalcular peso total
        break;
      case 7: 
        this.pesoTotalGr = value; 
        break;
    }
  }

  getPorcentajeValue(rowIndex: number): number {
    // Calcular porcentaje automáticamente basado en peso inicial
    const pesoInicial = this.pesoInicialGr;
    
    if (pesoInicial === 0) {
      return 0; // Evitar división por cero
    }
    
    let gramos = 0;
    switch(rowIndex) {
      case 0: return 0; // pesoInicial - sin porcentaje
      case 1: 
        gramos = this.semillaPuraGr;
        this.semillaPuraPct = (gramos / pesoInicial) * 100;
        return this.semillaPuraPct;
      case 2: 
        gramos = this.materiaInerteGr;
        this.materiaInertePct = (gramos / pesoInicial) * 100;
        return this.materiaInertePct;
      case 3: 
        gramos = this.otrosCultivosGr;
        this.otrosCultivosPct = (gramos / pesoInicial) * 100;
        return this.otrosCultivosPct;
      case 4: 
        gramos = this.malezasGr;
        this.malezasPct = (gramos / pesoInicial) * 100;
        return this.malezasPct;
      case 5: 
        gramos = this.malezasToleradasGr;
        this.malezasToleradasPct = (gramos / pesoInicial) * 100;
        return this.malezasToleradasPct;
      case 6: 
        gramos = this.malezasToleranciaCeroGr;
        this.malezasToleranciaCeroPct = (gramos / pesoInicial) * 100;
        return this.malezasToleranciaCeroPct;
      case 7: return 0; // pesoTotal - sin porcentaje
      default: return 0;
    }
  }

  
  getPorcentajeRedondeoValue(rowIndex: number): number {
    switch(rowIndex) {
      case 0: return 0; // pesoInicial - sin redondeo
      case 1: return this.semillaPuraPctRedondeo;
      case 2: return this.materiaInertePctRedondeo;
      case 3: return this.otrosCultivosPctRedondeo;
      case 4: return this.malezasPctRedondeo;
      case 5: return this.malezasToleradasPctRedondeo;
      case 6: return this.malezasToleranciaCeroPctRedondeo;
      case 7: return 0; // pesoTotal - sin redondeo
      default: return 0;
    }
  }

  setPorcentajeRedondeoValue(rowIndex: number, value: number): void {
    switch(rowIndex) {
      case 0: break; // pesoInicial - sin redondeo
      case 1: this.semillaPuraPctRedondeo = value; break;
      case 2: this.materiaInertePctRedondeo = value; break;
      case 3: this.otrosCultivosPctRedondeo = value; break;
      case 4: this.malezasPctRedondeo = value; break;
      case 5: this.malezasToleradasPctRedondeo = value; break;
      case 6: this.malezasToleranciaCeroPctRedondeo = value; break;
      case 7: break; // pesoTotal - sin redondeo
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
      case 0: 
        this.pesoInicialInaseGr = value; 
        this.recalcularPorcentajesInase(); // Recalcular todos los porcentajes INASE cuando cambie el peso inicial
        break;
      case 1: 
        this.semillaPuraInaseGr = value; 
        this.recalcularPorcentajeInaseIndividual(1);
        this.recalcularPesoTotalInase(); // Recalcular peso total INASE
        break;
      case 2: 
        this.materiaInerteInaseGr = value; 
        this.recalcularPorcentajeInaseIndividual(2);
        this.recalcularPesoTotalInase(); // Recalcular peso total INASE
        break;
      case 3: 
        this.otrosCultivosInaseGr = value; 
        this.recalcularPorcentajeInaseIndividual(3);
        this.recalcularPesoTotalInase(); // Recalcular peso total INASE
        break;
      case 4: 
        this.malezasInaseGr = value; 
        this.recalcularPorcentajeInaseIndividual(4);
        this.recalcularPesoTotalInase(); // Recalcular peso total INASE
        break;
      case 5: 
        this.malezasToleradasInaseGr = value; 
        this.recalcularPorcentajeInaseIndividual(5);
        this.recalcularPesoTotalInase(); // Recalcular peso total INASE
        break;
      case 6: 
        this.malezasToleranciaCeroInaseGr = value; 
        this.recalcularPorcentajeInaseIndividual(6);
        this.recalcularPesoTotalInase(); // Recalcular peso total INASE
        break;
      case 7: 
        this.pesoTotalInaseGr = value; 
        this.recalcularPorcentajeInaseIndividual(7); 
        break;
    }
  }

  getPorcentajeInaseValue(rowIndex: number): number {
    // Calcular porcentaje automáticamente basado en peso inicial INASE
    const pesoInicialInase = this.pesoInicialInaseGr;
    
    if (pesoInicialInase === 0) {
      return 0; // Evitar división por cero
    }
    
    let gramos = 0;
    switch(rowIndex) {
      case 0: 
        this.pesoInicialInasePct = 100; // El peso inicial siempre es 100%
        return this.pesoInicialInasePct;
      case 1: 
        gramos = this.semillaPuraInaseGr;
        this.semillaPuraInasePct = (gramos / pesoInicialInase) * 100;
        return this.semillaPuraInasePct;
      case 2: 
        gramos = this.materiaInerteInaseGr;
        this.materiaInerteInasePct = (gramos / pesoInicialInase) * 100;
        return this.materiaInerteInasePct;
      case 3: 
        gramos = this.otrosCultivosInaseGr;
        this.otrosCultivosInasePct = (gramos / pesoInicialInase) * 100;
        return this.otrosCultivosInasePct;
      case 4: 
        gramos = this.malezasInaseGr;
        this.malezasInasePct = (gramos / pesoInicialInase) * 100;
        return this.malezasInasePct;
      case 5: 
        gramos = this.malezasToleradasInaseGr;
        this.malezasToleradasInasePct = (gramos / pesoInicialInase) * 100;
        return this.malezasToleradasInasePct;
      case 6: 
        gramos = this.malezasToleranciaCeroInaseGr;
        this.malezasToleranciaCeroInasePct = (gramos / pesoInicialInase) * 100;
        return this.malezasToleranciaCeroInasePct;
      case 7: 
        this.pesoTotalInasePct = 100; // El peso total también podría ser 100%
        return this.pesoTotalInasePct;
      default: return 0;
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

  // === MÉTODOS PARA RECÁLCULO AUTOMÁTICO DE PORCENTAJES ===
  
  // Recalcular todos los porcentajes INIA cuando cambia el peso inicial
  recalcularPorcentajes(): void {
    if (this.pesoInicialGr === 0) return;
    
    this.semillaPuraPct = (this.semillaPuraGr / this.pesoInicialGr) * 100;
    this.materiaInertePct = (this.materiaInerteGr / this.pesoInicialGr) * 100;
    this.otrosCultivosPct = (this.otrosCultivosGr / this.pesoInicialGr) * 100;
    this.malezasPct = (this.malezasGr / this.pesoInicialGr) * 100;
    this.malezasToleradasPct = (this.malezasToleradasGr / this.pesoInicialGr) * 100;
    this.malezasToleranciaCeroPct = (this.malezasToleranciaCeroGr / this.pesoInicialGr) * 100;
  }

  // Recalcular porcentaje individual INIA
  recalcularPorcentajeIndividual(rowIndex: number): void {
    if (this.pesoInicialGr === 0) return;
    
    switch(rowIndex) {
      case 1: this.semillaPuraPct = (this.semillaPuraGr / this.pesoInicialGr) * 100; break;
      case 2: this.materiaInertePct = (this.materiaInerteGr / this.pesoInicialGr) * 100; break;
      case 3: this.otrosCultivosPct = (this.otrosCultivosGr / this.pesoInicialGr) * 100; break;
      case 4: this.malezasPct = (this.malezasGr / this.pesoInicialGr) * 100; break;
      case 5: this.malezasToleradasPct = (this.malezasToleradasGr / this.pesoInicialGr) * 100; break;
      case 6: this.malezasToleranciaCeroPct = (this.malezasToleranciaCeroGr / this.pesoInicialGr) * 100; break;
    }
  }

  // Recalcular todos los porcentajes INASE cuando cambia el peso inicial
  recalcularPorcentajesInase(): void {
    if (this.pesoInicialInaseGr === 0) return;
    
    this.pesoInicialInasePct = 100;
    this.semillaPuraInasePct = (this.semillaPuraInaseGr / this.pesoInicialInaseGr) * 100;
    this.materiaInerteInasePct = (this.materiaInerteInaseGr / this.pesoInicialInaseGr) * 100;
    this.otrosCultivosInasePct = (this.otrosCultivosInaseGr / this.pesoInicialInaseGr) * 100;
    this.malezasInasePct = (this.malezasInaseGr / this.pesoInicialInaseGr) * 100;
    this.malezasToleradasInasePct = (this.malezasToleradasInaseGr / this.pesoInicialInaseGr) * 100;
    this.malezasToleranciaCeroInasePct = (this.malezasToleranciaCeroInaseGr / this.pesoInicialInaseGr) * 100;
    this.pesoTotalInasePct = 100;
  }

  // Recalcular porcentaje individual INASE
  recalcularPorcentajeInaseIndividual(rowIndex: number): void {
    if (this.pesoInicialInaseGr === 0) return;
    
    switch(rowIndex) {
      case 0: this.pesoInicialInasePct = 100; break;
      case 1: this.semillaPuraInasePct = (this.semillaPuraInaseGr / this.pesoInicialInaseGr) * 100; break;
      case 2: this.materiaInerteInasePct = (this.materiaInerteInaseGr / this.pesoInicialInaseGr) * 100; break;
      case 3: this.otrosCultivosInasePct = (this.otrosCultivosInaseGr / this.pesoInicialInaseGr) * 100; break;
      case 4: this.malezasInasePct = (this.malezasInaseGr / this.pesoInicialInaseGr) * 100; break;
      case 5: this.malezasToleradasInasePct = (this.malezasToleradasInaseGr / this.pesoInicialInaseGr) * 100; break;
      case 6: this.malezasToleranciaCeroInasePct = (this.malezasToleranciaCeroInaseGr / this.pesoInicialInaseGr) * 100; break;
      case 7: this.pesoTotalInasePct = 100; break;
    }
  }

  // Recalcular peso total INIA (suma de todos los componentes)
  recalcularPesoTotal(): void {
    this.pesoTotalGr = 
      this.semillaPuraGr + 
      this.materiaInerteGr + 
      this.otrosCultivosGr + 
      this.malezasGr + 
      this.malezasToleradasGr + 
      this.malezasToleranciaCeroGr;
  }

  // Recalcular peso total INASE (suma de todos los componentes)
  recalcularPesoTotalInase(): void {
    this.pesoTotalInaseGr = 
      this.semillaPuraInaseGr + 
      this.materiaInerteInaseGr + 
      this.otrosCultivosInaseGr + 
      this.malezasInaseGr + 
      this.malezasToleradasInaseGr + 
      this.malezasToleranciaCeroInaseGr;
  }

  // Método para verificar si un campo de porcentaje debe estar deshabilitado
  isPorcentajeReadonly(rowIndex: number): boolean {
    // Todos los porcentajes (no redondeo) son de solo lectura porque se calculan automáticamente
    return rowIndex !== 0 && rowIndex !== 7; // pesoInicial y pesoTotal no tienen porcentaje
  }

  // Objeto pureza de tipo PurezaDto
  pureza: PurezaDto = {
    id: null,
    fechaInase: null,
    fechaInia: null,
    pesoInicial: 0,
    pesoInicialInase: 0,
    semillaPura: 0,
    semillaPuraInase: 0,
    semillaPuraPorcentajeRedondeo: 0,
    semillaPuraPorcentajeRedondeoInase: 0,
    materialInerte: 0,
    materialInerteInase: 0,
    materialInertePorcentajeRedondeo: 0,
    materialInertePorcentajeRedondeoInase: 0,
    materiaInerteTipo: null,
    materiaInerteTipoInase: null,
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
    otrosCultivo: 0,
    fechaEstandar: null,
    estandar: false,
    activo: true,
    reciboId: null,
    repetido: false,
    fechaCreacion: null,
    fechaRepeticion: null,
    malezasNormalesId: null,
    malezasToleradasId: null,
    malezasToleranciaCeroId: null,
    cultivosId: null,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private purezaService: PurezaService,
    private malezaService: MalezaService,
    private cultivoService: CultivoService,
    private logService: LogService
  ) {}

  // Getter para determinar si está en modo readonly
  get isReadonly(): boolean {
    return this.isViewing;
  }

  ngOnInit() {
    this.loteId = this.route.snapshot.paramMap.get('loteId');
    this.reciboId = this.route.snapshot.paramMap.get('reciboId');

    // Cargar listas de malezas y cultivos
    this.cargarMalezas();
    this.cargarCultivos();

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

  // === MÉTODOS PARA CARGAR DATOS DESDE SERVICIOS ===
  cargarMalezas() {
    this.malezaService.listar().subscribe({
      next: (response) => {
        this.malezas = response.malezas || [];
        console.log('Malezas cargadas:', this.malezas);
      },
      error: (error) => {
        console.error('Error al cargar malezas:', error);
        this.malezas = [];
      }
    });
  }

  cargarCultivos() {
    this.cultivoService.listarCultivos().subscribe({
      next: (cultivos) => {
        this.cultivos = cultivos || [];
        console.log('Cultivos cargados:', this.cultivos);
      },
      error: (error) => {
        console.error('Error al cargar cultivos:', error);
        this.cultivos = [];
      }
    });
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


  private cargarDatosParaEdicion(id: number) {
    // Obtener datos reales del backend
    this.purezaService.obtener(id).subscribe({
      next: (item: PurezaDto) => {
        console.log('Cargando datos para edición:', item);
        
        // Fechas
        this.fechaInia = item.fechaInia ? item.fechaInia.split('T')[0] : null;
        this.fechaInase = item.fechaInase ? item.fechaInase.split('T')[0] : null;
        this.fechaEstandar = item.fechaEstandar ? item.fechaEstandar.split('T')[0] : '';
        
        // Campos INIA - Gramos
        this.pesoInicialGr = item.pesoInicial || 0;
        this.semillaPuraGr = item.semillaPura || 0;
        this.materiaInerteGr = item.materialInerte || 0;
        this.otrosCultivosGr = item.otrosCultivos || 0;
        this.malezasGr = item.malezas || 0;
        this.malezasToleradasGr = item.malezasToleradas || 0;
        this.malezasToleranciaCeroGr = item.malezasToleranciaCero || 0;
        // Recalcular peso total después de cargar los componentes
        this.recalcularPesoTotal();
        
        // Campos INIA - Porcentajes redondeo
        this.semillaPuraPctRedondeo = item.semillaPuraPorcentajeRedondeo || 0;
        this.materiaInertePctRedondeo = item.materialInertePorcentajeRedondeo || 0;
        this.otrosCultivosPctRedondeo = item.otrosCultivosPorcentajeRedondeo || 0;
        this.malezasPctRedondeo = item.malezasPorcentajeRedondeo || 0;
        this.malezasToleradasPctRedondeo = item.malezasToleradasPorcentajeRedondeo || 0;
        this.malezasToleranciaCeroPctRedondeo = item.malezasToleranciaCeroPorcentajeRedondeo || 0;
        
        // Cargar materia inerte tipo INIA
        this.materiaInerteTipo = item.materiaInerteTipo || '';
        
        // Campos INASE - Gramos
        this.pesoInicialInaseGr = item.pesoInicialInase || 0;
        this.semillaPuraInaseGr = item.semillaPuraInase || 0;
        this.materiaInerteInaseGr = item.materialInerteInase || 0;
        this.otrosCultivosInaseGr = item.otrosCultivosInase || 0;
        this.malezasInaseGr = item.malezasInase || 0;
        this.malezasToleradasInaseGr = item.malezasToleradasInase || 0;
        this.malezasToleranciaCeroInaseGr = item.malezasToleranciaCeroInase || 0;
        // Recalcular peso total INASE después de cargar los componentes
        this.recalcularPesoTotalInase();
        
        // Campos INASE - Porcentajes redondeo
        this.semillaPuraInasePctRedondeo = item.semillaPuraPorcentajeRedondeoInase || 0;
        this.materiaInerteInasePctRedondeo = item.materialInertePorcentajeRedondeoInase || 0;
        this.otrosCultivosInasePctRedondeo = item.otrosCultivosPorcentajeRedondeoInase || 0;
        this.malezasInasePctRedondeo = item.malezasPorcentajeRedondeoInase || 0;
        this.malezasToleradasInasePctRedondeo = item.malezasToleradasPorcentajeRedondeoInase || 0;
        this.malezasToleranciaCeroInasePctRedondeo = item.malezasToleranciaCeroPorcentajeRedondeoInase || 0;
        
        // Cargar materia inerte tipo INASE
        this.materiaInerteTipoInase = item.materiaInerteTipoInase || '';
       
        // Campo adicional otrosCultivo
        this.otrosCultivoField = (item as any).otrosCultivo || 0;
        
        // Otros campos
        this.estandar = item.estandar || false;
        this.activo = item.activo !== undefined ? item.activo : true;
        this.repetido = item.repetido || false;
        
        // === CARGAR SELECCIONES DE MALEZAS Y CULTIVOS ===
        this.selectedMalezasComunes = item.malezasNormalesId || [];
        this.selectedMalezasToleradas = item.malezasToleradasId || [];
        this.selectedMalezasCero = item.malezasToleranciaCeroId || [];
        this.selectedCultivos = item.cultivosId || [];
        
        // Guardar fecha de creación original para no perderla en la edición
        this.fechaCreacionOriginal = item.fechaCreacion;
        
        // === ASEGURAR QUE RECIBO_ID SE MANTENGA DESDE LOS PARÁMETROS ===
        // Si el item no tiene reciboId o es null, tomarlo de los parámetros de la ruta
        if (!item.reciboId && this.reciboId) {
          console.log('reciboId era null, tomándolo de parámetros:', this.reciboId);
        } else if (item.reciboId) {
          // Si viene del backend, actualizar la variable local
          this.reciboId = item.reciboId.toString();
          console.log('reciboId cargado desde backend:', this.reciboId);
        }
      },
      error: (error: any) => {
        console.error('Error al cargar datos para edición:', error);
      }
    });
  }

  private cargarDatos() {
    console.log('Modo creación - limpiando campos');
    // Limpiar campos para creación
    this.isSubmitting = false; // Resetear estado de envío
    this.fecha = '';
    
    // Campos INIA - Gramos
    this.pesoInicialGr = 0;
    this.semillaPuraGr = 0;
    this.materiaInerteGr = 0;
    this.otrosCultivosGr = 0;
    this.malezasGr = 0;
    this.malezasToleradasGr = 0;
    this.malezasToleranciaCeroGr = 0;
    this.pesoTotalGr = 0;
    
    // Campos INIA - Porcentajes (sin pesoInicial y pesoTotal)
    this.semillaPuraPct = 0;
    this.materiaInertePct = 0;
    this.otrosCultivosPct = 0;
    this.malezasPct = 0;
    this.malezasToleradasPct = 0;
    this.malezasToleranciaCeroPct = 0;
    
    // Campos INIA - Porcentajes de redondeo (sin pesoInicial y pesoTotal)
    this.semillaPuraPctRedondeo = 0;
    this.materiaInertePctRedondeo = 0;
    this.otrosCultivosPctRedondeo = 0;
    this.malezasPctRedondeo = 0;
    this.malezasToleradasPctRedondeo = 0;
    this.malezasToleranciaCeroPctRedondeo = 0;
    
    // Campos INASE - Gramos
    this.pesoInicialInaseGr = 0;
    this.semillaPuraInaseGr = 0;
    this.materiaInerteInaseGr = 0;
    this.otrosCultivosInaseGr = 0;
    this.malezasInaseGr = 0;
    this.malezasToleradasInaseGr = 0;
    this.malezasToleranciaCeroInaseGr = 0;
    this.pesoTotalInaseGr = 0;
    
    // Campos INASE - Porcentajes
    this.pesoInicialInasePct = 0;
    this.semillaPuraInasePct = 0;
    this.materiaInerteInasePct = 0;
    this.otrosCultivosInasePct = 0;
    this.malezasInasePct = 0;
    this.malezasToleradasInasePct = 0;
    this.malezasToleranciaCeroInasePct = 0;
    this.pesoTotalInasePct = 0;
    
    // Campos INASE - Porcentajes de redondeo
    this.pesoInicialInasePctRedondeo = 0;
    this.semillaPuraInasePctRedondeo = 0;
    this.materiaInerteInasePctRedondeo = 0;
    this.otrosCultivosInasePctRedondeo = 0;
    this.malezasInasePctRedondeo = 0;
    this.malezasToleradasInasePctRedondeo = 0;
    this.malezasToleranciaCeroInasePctRedondeo = 0;
    this.pesoTotalInasePctRedondeo = 0;
    
    // Otros campos
    this.otrosCultivoField = 0;
    this.fechaEstandar = '';
    this.estandar = false;
    this.repetido = false;
    this.fechaCreacionOriginal = null;
    
    // Limpiar materia inerte tipo
    this.materiaInerteTipo = '';
    this.materiaInerteTipoInase = '';
    
    // === LIMPIAR SELECCIONES DE MALEZAS Y CULTIVOS ===
    this.selectedMalezasComunes = [];
    this.selectedMalezasToleradas = [];
    this.selectedMalezasCero = [];
    this.selectedCultivos = [];
  }

  onSubmit() {
    if(this.manejarProblemas()) {
      console.log('Errores encontrados, no se puede enviar el formulario');
      return;
    }

    // Prevenir múltiples envíos
    if (this.isSubmitting) {
      console.log('Ya se está enviando el formulario, ignorando nueva llamada');
      return;
    }
    
    // Recalcular los pesos totales antes de enviar
    this.recalcularPesoTotal();
    this.recalcularPesoTotalInase();
    
    this.isSubmitting = true;
    let purezaData: PurezaDto = this.buildPurezaDto();

    // Debugging: mostrar exactamente qué datos se están enviando
    console.log('=== DATOS ENVIADOS AL BACKEND ===');
    console.log('isEditing:', this.isEditing);
    console.log('editingId:', this.editingId);

    if (this.isEditing && this.editingId) {
      // Actualizar Pureza existente - mantener valores no editables
      // El fechaCreacion y otros campos críticos ya vienen del buildPurezaDto()
      console.log('Editando pureza existente con ID:', this.editingId);
      console.log('purezaData:', JSON.stringify(purezaData, null, 2));

      purezaData.fechaCreacion = this.fechaCreacionOriginal ? this.convertirFechaAISO(this.fechaCreacionOriginal) : null;
      console.log("id:", this.getReciboId())
      purezaData.reciboId = this.getReciboId();
      this.purezaService.editar(purezaData).subscribe({
        next: (response: any) => {
          console.log('Pureza actualizada exitosamente:', response);
          this.isSubmitting = false;


          if (response != null) {
            this.logService.crearLog(Number(response), 'Pureza', 'actualizada').subscribe();
          }

          this.router.navigate([this.loteId + "/" + this.reciboId + "/listado-pureza"]);
        },
        error: (error: any) => {
          console.error('Error al actualizar la pureza:', error);
          this.isSubmitting = false;
        }
      });
    } else {
      // Crear nueva Pureza - establecer valores por defecto para creación
      purezaData.id = 0; // Según la estructura que me mostraste
      purezaData.activo = true; 
      purezaData.repetido = false; 
      purezaData.fechaCreacion = new Date().toISOString();
      purezaData.fechaRepeticion = null;
      
      console.log('Creando nueva pureza');
      console.log('purezaData:', JSON.stringify(purezaData, null, 2));
      
      this.purezaService.crear(purezaData).subscribe({
        next: (response: any) => {
          this.isSubmitting = false;

          if (response != null) {
            this.logService.crearLog(Number(response), 'Pureza', 'creada').subscribe();
          }

          this.router.navigate([this.loteId + "/" + this.reciboId + "/listado-pureza"]);
        },
        error: (error: any) => {
          console.error('Error al crear la pureza:', error);
          this.isSubmitting = false;
        }
      });
    }
  }


  private buildPurezaDto(): PurezaDto {
    return {
      id: this.isEditing && this.editingId ? this.editingId : 0,
      fechaInase: this.fechaInase ? this.convertirFechaAISO(this.fechaInase) : null,
      fechaInia: this.fechaInia ? this.convertirFechaAISO(this.fechaInia) : null,
      
      pesoInicial: this.pesoInicialGr || 0,
      pesoInicialInase: this.pesoInicialInaseGr || 0,
      
      semillaPura: this.semillaPuraGr || 0,
      semillaPuraInase: this.semillaPuraInaseGr || 0,
      semillaPuraPorcentajeRedondeo: this.semillaPuraPctRedondeo || 0,
      semillaPuraPorcentajeRedondeoInase: this.semillaPuraInasePctRedondeo || 0,

      materialInerte: this.materiaInerteGr || 0,
      materialInerteInase: this.materiaInerteInaseGr || 0,
      materialInertePorcentajeRedondeo: this.materiaInertePctRedondeo || 0,
      materialInertePorcentajeRedondeoInase: this.materiaInerteInasePctRedondeo || 0,
      materiaInerteTipo: this.materiaInerteTipo || null,
      materiaInerteTipoInase: this.materiaInerteTipoInase || null,

      otrosCultivos: this.otrosCultivosGr || 0,
      otrosCultivosInase: this.otrosCultivosInaseGr || 0,
      otrosCultivosPorcentajeRedondeo: this.otrosCultivosPctRedondeo || 0,
      otrosCultivosPorcentajeRedondeoInase: this.otrosCultivosInasePctRedondeo || 0,

      malezas: this.malezasGr || 0,
      malezasInase: this.malezasInaseGr || 0,
      malezasPorcentajeRedondeo: this.malezasPctRedondeo || 0,
      malezasPorcentajeRedondeoInase: this.malezasInasePctRedondeo || 0,

      malezasToleradas: this.malezasToleradasGr || 0,
      malezasToleradasInase: this.malezasToleradasInaseGr || 0,
      malezasToleradasPorcentajeRedondeo: this.malezasToleradasPctRedondeo || 0,
      malezasToleradasPorcentajeRedondeoInase: this.malezasToleradasInasePctRedondeo || 0,

      malezasToleranciaCero: this.malezasToleranciaCeroGr || 0,
      malezasToleranciaCeroInase: this.malezasToleranciaCeroInaseGr || 0,
      malezasToleranciaCeroPorcentajeRedondeo: this.malezasToleranciaCeroPctRedondeo || 0,
      malezasToleranciaCeroPorcentajeRedondeoInase: this.malezasToleranciaCeroInasePctRedondeo || 0,

      
      // Campo adicional del DTO
      otrosCultivo: this.otrosCultivoField || 0,

      // === NUEVOS CAMPOS PARA IDS DE SELECCIONES ===
      malezasNormalesId: this.selectedMalezasComunes.length > 0 ? this.selectedMalezasComunes : null,
      malezasToleradasId: this.selectedMalezasToleradas.length > 0 ? this.selectedMalezasToleradas : null,
      malezasToleranciaCeroId: this.selectedMalezasCero.length > 0 ? this.selectedMalezasCero : null,
      cultivosId: this.selectedCultivos.length > 0 ? this.selectedCultivos : null,

      fechaEstandar: this.fechaEstandar ? this.convertirFechaAISO(this.fechaEstandar) : null,
      estandar: this.estandar || false,
      activo: this.activo !== undefined ? this.activo : true,
      reciboId: this.getReciboId(),
      repetido: this.repetido || false,
      // En edición mantener valores originales, en creación serán establecidos en onSubmit
      fechaCreacion: this.isEditing ? this.fechaCreacionOriginal : null,
      fechaRepeticion: this.repetido ? new Date().toISOString() : null
    };
  }

  private convertirFechaAISO(fecha: string): string {
    // Si la fecha ya tiene formato ISO completo, la devolvemos tal como está
    if (fecha.includes('T')) {
      return fecha;
    }
    // Si es solo fecha (YYYY-MM-DD), le agregamos tiempo por defecto
    return new Date(fecha + 'T00:00:00.000Z').toISOString();
  }

  private convertirNumeroONull(valor: number): number | null {
    // Para esta API, 0 es un valor válido, solo convertimos null/undefined
    return valor !== null && valor !== undefined ? valor : null;
  }

  private getReciboId(): number {
    // Prioridad: 1) reciboId de la instancia, 2) parámetro de ruta, 3) valor por defecto
    if (this.reciboId) {
      return parseInt(this.reciboId);
    }
    
    const reciboIdParam = this.route.snapshot.paramMap.get('reciboId');
    if (reciboIdParam) {
      return parseInt(reciboIdParam);
    }
    
    console.warn('No se pudo obtener reciboId, usando 0 por defecto');
    return 0;
  }

  onCancel() {
    this.router.navigate([this.loteId + "/" + this.reciboId + "/listado-pureza"]);
  }

  private validarGramos(): void {
    for (let i = 0; i < 8; i++) {
      const gramos = this.getGramosValue(i);
      if (gramos != null && gramos < 0) {
        this.errores.push(`Los gramos de inia en la fila ${i + 1} no pueden ser un número negativo.`);
      }
    }

    for (let i = 0; i < 8; i++) {
      const gramos = this.getGramosInaseValue(i);
      if (gramos != null && gramos < 0) {
        this.errores.push(`Los gramos de inase en la fila ${i + 1} no pueden ser un número negativo.`);
      }
    }
  }

  manejarProblemas(): boolean {
      this.errores = []; // Reiniciar errores

      const hoy = new Date();
      const fechaMedicion = this.fechaMedicion ? new Date(this.fechaMedicion) : null;
      const fechaInase = this.fechaInase ? new Date(this.fechaInase) : null;
      const fechaInia = this.fechaInia ? new Date(this.fechaInia) : null;

      if (fechaMedicion != null && fechaMedicion > hoy) {
        this.errores.push('La fecha no puede ser mayor a la fecha actual.');
      }

      if (fechaInase != null && fechaInase > hoy) {
        this.errores.push('La fecha INASE no puede ser mayor a la fecha actual.');
      }

      if (fechaInia != null && fechaInia > hoy) {
        this.errores.push('La fecha INIA no puede ser mayor a la fecha actual.');
      } 
      
      // Validar que todos los valores de gramos no sean negativos
      this.validarGramos();

      return this.errores.length > 0;
    }

    validarFecha(fecha: string | null): boolean {
      if (!fecha) return false;
      const selectedDate = new Date(fecha);
      const today = new Date();
      return selectedDate >= today;
    }

}

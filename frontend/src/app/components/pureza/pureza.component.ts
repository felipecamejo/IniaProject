import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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
export class PurezaComponent {
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
  isMalezaCeroSelected(id: number) { return this.selectedMalezasCero.includes(id); }
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
  toggleMalezasComunesDropdown() { this.isMalezasComunesDropdownOpen = !this.isMalezasComunesDropdownOpen; }
  getFilteredMalezasComunes() {
    const search = this.malezasComunesSearchText.toLowerCase();
    return this.malezasComunesOptions.filter(m => m.label.toLowerCase().includes(search));
  }
  isMalezaComunSelected(id: number) { return this.selectedMalezasComunes.includes(id); }
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
  isCultivoSelected(id: number) { return this.selectedCultivos.includes(id); }
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

}
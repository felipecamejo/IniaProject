import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-dosn.component',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    MultiSelectModule
  ],
  templateUrl: './dosn.component.html',
  styleUrl: './dosn.component.scss'
})

export class DOSNComponent {
  isMalezasToleradasDropdownOpen: boolean = false;
  malezasToleradasSearchText: string = '';

  toggleMalezasToleradasDropdown() {
    this.isMalezasToleradasDropdownOpen = !this.isMalezasToleradasDropdownOpen;
  }
  getFilteredMalezasToleradas() {
    const search = this.malezasToleradasSearchText.toLowerCase();
    return this.malezasToleradasOptions.filter(mt => mt.label.toLowerCase().includes(search));
  }
  isMalezaToleradaSelected(id: number) {
    return this.selectedMalezasToleradas.includes(id);
  }
  toggleMalezaToleradaSelection(maleza: {id: number, label: string}) {
    if (this.isMalezaToleradaSelected(maleza.id)) {
      this.selectedMalezasToleradas = this.selectedMalezasToleradas.filter(id => id !== maleza.id);
    } else {
      this.selectedMalezasToleradas = [...this.selectedMalezasToleradas, maleza.id];
    }
  }
  malezasCeroOptions = [
    { id: 1, label: 'Cuscuta spp.' },
    { id: 2, label: 'Brassica spp.' },
    { id: 3, label: 'Orobanche spp.' }
  ];
  selectedMalezasCero: number[] = [];
  malezasToleradasOptions = [
    { id: 1, label: 'Lolium perenne' },
    { id: 2, label: 'Poa annua' },
    { id: 3, label: 'Capsella bursa-pastoris' }
  ];
  selectedMalezasToleradas: number[] = [];
  getSelectedMalezasToleradasText() {
    if (this.selectedMalezasToleradas.length === 0) return 'Seleccionar malezas toleradas...';
    return this.selectedMalezasToleradas.map(id => {
      const item = this.malezasToleradasOptions.find(mt => mt.id === id);
      return item ? item.label : '';
    }).join(', ');
  }
  // ...existing code...
  // INASE
  // Campos adicionales para listados y valores
  malezasGr: number | null = null;
  malezasPct: number | null = null;
  malezasToleradasGr: number | null = null;
  malezasToleradasPct: number | null = null;
  pesoTotalGr: number | null = null;
  pesoTotalPct: number | null = null;
  fechaEstandar: string = '';
  estandar: boolean = false;
  fechaInase: string = '';
  gramosInase: number | null = null;
  tipoAnalisisInase: string = '';

  // INIA
  fechaInia: string = '';
  gramosInia: number | null = null;
  tipoAnalisisInia: string = '';

  // Listados dinámicos
  // Malezas multiselect
  malezasOptions = [
    { id: 1, label: 'Amaranthus retroflexus' },
    { id: 2, label: 'Chenopodium album' },
    { id: 3, label: 'Echinochloa crus-galli' },
    { id: 4, label: 'Solanum nigrum' }
  ];
  selectedMalezas: number[] = [];
  isMalezasDropdownOpen: boolean = false;
  malezasSearchText: string = '';

  toggleMalezasDropdown() {
    this.isMalezasDropdownOpen = !this.isMalezasDropdownOpen;
  }
  getFilteredMalezas() {
    const search = this.malezasSearchText.toLowerCase();
    return this.malezasOptions.filter(m => m.label.toLowerCase().includes(search));
  }
  isMalezaSelected(id: number) {
    return this.selectedMalezas.includes(id);
  }
  toggleMalezaSelection(maleza: {id: number, label: string}) {
    if (this.isMalezaSelected(maleza.id)) {
      this.selectedMalezas = this.selectedMalezas.filter(id => id !== maleza.id);
    } else {
      this.selectedMalezas = [...this.selectedMalezas, maleza.id];
    }
  }
  getSelectedMalezasText() {
    if (this.selectedMalezas.length === 0) return 'Seleccionar malezas...';
    return this.selectedMalezas.map(id => {
      const item = this.malezasOptions.find(m => m.id === id);
      return item ? item.label : '';
    }).join(', ');
  }

  // Cultivos multiselect
  cultivosOptions = [
    { id: 1, label: 'Trigo' },
    { id: 2, label: 'Cebada' },
    { id: 3, label: 'Avena' },
    { id: 4, label: 'Centeno' }
  ];
  selectedCultivos: number[] = [];
  isCultivosDropdownOpen: boolean = false;
  cultivosSearchText: string = '';

  toggleCultivosDropdown() {
    this.isCultivosDropdownOpen = !this.isCultivosDropdownOpen;
  }
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

  // Malezas toleradas multiselect
  isMalezasCeroDropdownOpen: boolean = false;
  malezasCeroSearchText: string = '';

  toggleMalezasCeroDropdown() {
    this.isMalezasCeroDropdownOpen = !this.isMalezasCeroDropdownOpen;
  }
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

  // Brassica spp. select simple + chips
  brassicaOptions = [
    { id: 1, label: 'Brassica napus' },
    { id: 2, label: 'Brassica rapa' },
    { id: 3, label: 'Brassica oleracea' }
  ];
  selectedBrassicaSimple: number | null = null;
  brassica: number[] = [];

  addBrassica() {
    if (this.selectedBrassicaSimple && !this.brassica.includes(this.selectedBrassicaSimple)) {
      this.brassica.push(this.selectedBrassicaSimple);
    }
  }
  removeBrassica(id: number) {
    this.brassica = this.brassica.filter(b => b !== id);
  }
  getBrassicaLabel(id: number) {
    const item = this.brassicaOptions.find(b => b.id === id);
    return item ? item.label : '';
  }

  // Cuscuta spp. select simple + chips
  cuscutaOptions = [
    { id: 1, label: 'Cuscuta campestris' },
    { id: 2, label: 'Cuscuta epithymum' },
    { id: 3, label: 'Cuscuta europaea' }
  ];
  selectedCuscutaSimple: number | null = null;
  cuscuta: number[] = [];

  addCuscuta() {
    if (this.selectedCuscutaSimple && !this.cuscuta.includes(this.selectedCuscutaSimple)) {
      this.cuscuta.push(this.selectedCuscutaSimple);
    }
  }
  removeCuscuta(id: number) {
    this.cuscuta = this.cuscuta.filter(cu => cu !== id);
  }
  getCuscutaLabel(id: number) {
    const item = this.cuscutaOptions.find(cu => cu.id === id);
    return item ? item.label : '';
  }
}

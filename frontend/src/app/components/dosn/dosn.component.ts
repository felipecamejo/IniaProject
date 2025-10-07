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

@Component({
  selector: 'app-dosn.component',
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
  templateUrl: './dosn.component.html',
  styleUrl: './dosn.component.scss'
})
// ...existing code...
export class DOSNComponent implements OnInit {
  onSubmit() {
    // Implementar lógica de guardado o edición aquí
    console.log('Formulario DOSN enviado');
  }
  onCancel() {
    // Implementar lógica de cancelación aquí
    console.log('Formulario DOSN cancelado');
  }
  // INASE
  fechaInase: string = '';
  gramosInase: number = 0;
  tipoAnalisisInase: string = '';
  selectedMalezasInase: number[] = [];
  isMalezasDropdownOpenInase: boolean = false;
  malezasSearchTextInase: string = '';
  toggleMalezasDropdownInase() { this.isMalezasDropdownOpenInase = !this.isMalezasDropdownOpenInase; }
  getFilteredMalezasInase() { const search = this.malezasSearchTextInase.toLowerCase(); return this.malezasOptions.filter(m => m.label.toLowerCase().includes(search)); }
  isMalezaSelectedInase(id: number) { return this.selectedMalezasInase.includes(id); }
  toggleMalezaSelectionInase(maleza: {id: number, label: string}) { if (this.isMalezaSelectedInase(maleza.id)) { this.selectedMalezasInase = this.selectedMalezasInase.filter(id => id !== maleza.id); } else { this.selectedMalezasInase = [...this.selectedMalezasInase, maleza.id]; } }
  getSelectedMalezasTextInase() { if (this.selectedMalezasInase.length === 0) return 'Seleccionar malezas...'; return this.selectedMalezasInase.map(id => { const item = this.malezasOptions.find(m => m.id === id); return item ? item.label : ''; }).join(', '); }
  selectedMalezasToleradasInase: number[] = [];
  isMalezasToleradasDropdownOpenInase: boolean = false;
  malezasToleradasSearchTextInase: string = '';
  toggleMalezasToleradasDropdownInase() { this.isMalezasToleradasDropdownOpenInase = !this.isMalezasToleradasDropdownOpenInase; }
  getFilteredMalezasToleradasInase() { const search = this.malezasToleradasSearchTextInase.toLowerCase(); return this.malezasToleradasOptions.filter(mt => mt.label.toLowerCase().includes(search)); }
  isMalezaToleradaSelectedInase(id: number) { return this.selectedMalezasToleradasInase.includes(id); }
  toggleMalezaToleradaSelectionInase(maleza: {id: number, label: string}) { if (this.isMalezaToleradaSelectedInase(maleza.id)) { this.selectedMalezasToleradasInase = this.selectedMalezasToleradasInase.filter(id => id !== maleza.id); } else { this.selectedMalezasToleradasInase = [...this.selectedMalezasToleradasInase, maleza.id]; } }
  getSelectedMalezasToleradasTextInase() { if (this.selectedMalezasToleradasInase.length === 0) return 'Seleccionar malezas toleradas...'; return this.selectedMalezasToleradasInase.map(id => { const item = this.malezasToleradasOptions.find(mt => mt.id === id); return item ? item.label : ''; }).join(', '); }
  selectedMalezasCeroInase: number[] = [];
  isMalezasCeroDropdownOpenInase: boolean = false;
  malezasCeroSearchTextInase: string = '';
  toggleMalezasCeroDropdownInase() { this.isMalezasCeroDropdownOpenInase = !this.isMalezasCeroDropdownOpenInase; }
  getFilteredMalezasCeroInase() { const search = this.malezasCeroSearchTextInase.toLowerCase(); return this.malezasCeroOptions.filter(mc => mc.label.toLowerCase().includes(search)); }
  isMalezaCeroSelectedInase(id: number) { return this.selectedMalezasCeroInase.includes(id); }
  toggleMalezaCeroSelectionInase(maleza: {id: number, label: string}) { if (this.isMalezaCeroSelectedInase(maleza.id)) { this.selectedMalezasCeroInase = this.selectedMalezasCeroInase.filter(id => id !== maleza.id); } else { this.selectedMalezasCeroInase = [...this.selectedMalezasCeroInase, maleza.id]; } }
  getSelectedMalezasCeroTextInase() { if (this.selectedMalezasCeroInase.length === 0) return 'Seleccionar malezas tolerancia cero...'; return this.selectedMalezasCeroInase.map(id => { const item = this.malezasCeroOptions.find(mc => mc.id === id); return item ? item.label : ''; }).join(', '); }

  // INIA
  fechaInia: string = '';
  gramosInia: number = 0;
  tipoAnalisisInia: string = '';
  selectedMalezasInia: number[] = [];
  isMalezasDropdownOpenInia: boolean = false;
  malezasSearchTextInia: string = '';
  toggleMalezasDropdownInia() { this.isMalezasDropdownOpenInia = !this.isMalezasDropdownOpenInia; }
  getFilteredMalezasInia() { const search = this.malezasSearchTextInia.toLowerCase(); return this.malezasOptions.filter(m => m.label.toLowerCase().includes(search)); }
  isMalezaSelectedInia(id: number) { return this.selectedMalezasInia.includes(id); }
  toggleMalezaSelectionInia(maleza: {id: number, label: string}) { if (this.isMalezaSelectedInia(maleza.id)) { this.selectedMalezasInia = this.selectedMalezasInia.filter(id => id !== maleza.id); } else { this.selectedMalezasInia = [...this.selectedMalezasInia, maleza.id]; } }
  getSelectedMalezasTextInia() { if (this.selectedMalezasInia.length === 0) return 'Seleccionar malezas...'; return this.selectedMalezasInia.map(id => { const item = this.malezasOptions.find(m => m.id === id); return item ? item.label : ''; }).join(', '); }
  selectedMalezasToleradasInia: number[] = [];
  isMalezasToleradasDropdownOpenInia: boolean = false;
  malezasToleradasSearchTextInia: string = '';
  toggleMalezasToleradasDropdownInia() { this.isMalezasToleradasDropdownOpenInia = !this.isMalezasToleradasDropdownOpenInia; }
  getFilteredMalezasToleradasInia() { const search = this.malezasToleradasSearchTextInia.toLowerCase(); return this.malezasToleradasOptions.filter(mt => mt.label.toLowerCase().includes(search)); }
  isMalezaToleradaSelectedInia(id: number) { return this.selectedMalezasToleradasInia.includes(id); }
  toggleMalezaToleradaSelectionInia(maleza: {id: number, label: string}) { if (this.isMalezaToleradaSelectedInia(maleza.id)) { this.selectedMalezasToleradasInia = this.selectedMalezasToleradasInia.filter(id => id !== maleza.id); } else { this.selectedMalezasToleradasInia = [...this.selectedMalezasToleradasInia, maleza.id]; } }
  getSelectedMalezasToleradasTextInia() { if (this.selectedMalezasToleradasInia.length === 0) return 'Seleccionar malezas toleradas...'; return this.selectedMalezasToleradasInia.map(id => { const item = this.malezasToleradasOptions.find(mt => mt.id === id); return item ? item.label : ''; }).join(', '); }
  selectedMalezasCeroInia: number[] = [];
  isMalezasCeroDropdownOpenInia: boolean = false;
  malezasCeroSearchTextInia: string = '';
  toggleMalezasCeroDropdownInia() { this.isMalezasCeroDropdownOpenInia = !this.isMalezasCeroDropdownOpenInia; }
  getFilteredMalezasCeroInia() { const search = this.malezasCeroSearchTextInia.toLowerCase(); return this.malezasCeroOptions.filter(mc => mc.label.toLowerCase().includes(search)); }
  isMalezaCeroSelectedInia(id: number) { return this.selectedMalezasCeroInia.includes(id); }
  toggleMalezaCeroSelectionInia(maleza: {id: number, label: string}) { if (this.isMalezaCeroSelectedInia(maleza.id)) { this.selectedMalezasCeroInia = this.selectedMalezasCeroInia.filter(id => id !== maleza.id); } else { this.selectedMalezasCeroInia = [...this.selectedMalezasCeroInia, maleza.id]; } }
  getSelectedMalezasCeroTextInia() { if (this.selectedMalezasCeroInia.length === 0) return 'Seleccionar malezas tolerancia cero...'; return this.selectedMalezasCeroInia.map(id => { const item = this.malezasCeroOptions.find(mc => mc.id === id); return item ? item.label : ''; }).join(', '); }
  ngOnInit(): void {
    // Inicialización si es necesario
  }
  // Opciones globales para los listados
  cultivosOptions = [
    { id: 1, label: 'Trigo' },
    { id: 2, label: 'Cebada' },
    { id: 3, label: 'Avena' },
    { id: 4, label: 'Centeno' }
  ];
  malezasOptions = [
    { id: 1, label: 'Amaranthus retroflexus' },
    { id: 2, label: 'Chenopodium album' },
    { id: 3, label: 'Echinochloa crus-galli' },
    { id: 4, label: 'Solanum nigrum' }
  ];
  // Métodos para multiselect de malezas toleradas
  toggleMalezasToleradasDropdown() {
    this.isMalezasToleradasDropdownOpen = !this.isMalezasToleradasDropdownOpen;
  }

  getSelectedMalezasToleradasText() {
    if (this.selectedMalezasToleradas.length === 0) return 'Seleccionar malezas toleradas...';
    return this.selectedMalezasToleradas.map(id => {
      const item = this.malezasToleradasOptions.find(mt => mt.id === id);
      return item ? item.label : '';
    }).join(', ');
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
  malezasToleradasOptions = [
    { id: 1, label: 'Lolium perenne' },
    { id: 2, label: 'Poa annua' },
    { id: 3, label: 'Capsella bursa-pastoris' }
  ];
  selectedMalezasToleradas: number[] = [];

  malezasCeroOptions = [
    { id: 1, label: 'Cuscuta spp.' },
    { id: 2, label: 'Brassica spp.' },
    { id: 3, label: 'Orobanche spp.' }
  ];
  selectedMalezasCero: number[] = [];
  // Variables para manejar navegación
  isEditing: boolean = false;
  editingId: number | null = null;

  isMalezasToleradasDropdownOpen: boolean = false;
  malezasToleradasSearchText: string = '';
  // ...existing code...

  // Datos de prueba (deberían venir de un servicio)
  private itemsData: any[] = [
    {
      id: 1,
      fechaInase: '2023-01-15',
      gramosInase: 100,
      tipoAnalisisInase: 'Completo',
      fechaInia: '2023-01-16',
      gramosInia: 90,
      tipoAnalisisInia: 'Reducido',
      selectedMalezasInase: [1,2],
      selectedCultivosInase: [1],
      selectedMalezasToleradasInase: [1],
      selectedMalezasCeroInase: [2],
      selectedMalezasInia: [2,3],
      selectedCultivosInia: [2],
      selectedMalezasToleradasInia: [2],
      selectedMalezasCeroInia: [1],
      brassica: [1],
      cuscuta: [2]
    }
    // ...otros datos de prueba
  ];

  // Métodos y variables de INIA/INASE deben estar aquí como propiedades y métodos de la clase, no dentro de itemsData
      // INASE
      selectedCultivosInase: number[] = [];
      isCultivosDropdownOpenInase: boolean = false;
      cultivosSearchTextInase: string = '';
      toggleCultivosDropdownInase() { this.isCultivosDropdownOpenInase = !this.isCultivosDropdownOpenInase; }
      getFilteredCultivosInase() { const search = this.cultivosSearchTextInase.toLowerCase(); return this.cultivosOptions.filter(c => c.label.toLowerCase().includes(search)); }
      isCultivoSelectedInase(id: number) { return this.selectedCultivosInase.includes(id); }
      toggleCultivoSelectionInase(cultivo: {id: number, label: string}) { if (this.isCultivoSelectedInase(cultivo.id)) { this.selectedCultivosInase = this.selectedCultivosInase.filter(id => id !== cultivo.id); } else { this.selectedCultivosInase = [...this.selectedCultivosInase, cultivo.id]; } }
      getSelectedCultivosTextInase() { if (this.selectedCultivosInase.length === 0) return 'Seleccionar cultivos...'; return this.selectedCultivosInase.map(id => { const item = this.cultivosOptions.find(c => c.id === id); return item ? item.label : ''; }).join(', '); }
      // INIA
      selectedCultivosInia: number[] = [];
      isCultivosDropdownOpenInia: boolean = false;
      cultivosSearchTextInia: string = '';
      toggleCultivosDropdownInia() { this.isCultivosDropdownOpenInia = !this.isCultivosDropdownOpenInia; }
      getFilteredCultivosInia() { const search = this.cultivosSearchTextInia.toLowerCase(); return this.cultivosOptions.filter(c => c.label.toLowerCase().includes(search)); }
      isCultivoSelectedInia(id: number) { return this.selectedCultivosInia.includes(id); }
      toggleCultivoSelectionInia(cultivo: {id: number, label: string}) { if (this.isCultivoSelectedInia(cultivo.id)) { this.selectedCultivosInia = this.selectedCultivosInia.filter(id => id !== cultivo.id); } else { this.selectedCultivosInia = [...this.selectedCultivosInia, cultivo.id]; } }
      getSelectedCultivosTextInia() { if (this.selectedCultivosInia.length === 0) return 'Seleccionar cultivos...'; return this.selectedCultivosInia.map(id => { const item = this.cultivosOptions.find(c => c.id === id); return item ? item.label : ''; }).join(', '); }
  // ...existing code...

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

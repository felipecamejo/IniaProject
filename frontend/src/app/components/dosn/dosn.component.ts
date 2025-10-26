import { Component, OnInit } from '@angular/core';
import { DOSNService } from '../../../services/DOSNService';
import { DOSNDto } from '../../../models/DOSN.dto';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
// import { TabsModule } from 'primeng/tabs';
import { CultivoService } from '../../../services/CultivoService';

@Component({
  selector: 'app-dosn.component',
  standalone: true,
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
      styleUrls: ['./dosn.component.scss']
    })
    export class DOSNComponent implements OnInit {
      dosn: DOSNDto | null = null;
      loading: boolean = false;
      editingId: number | null = null;
      loteId: number | null = null;
      reciboId: number | null = null;

      // Todas las propiedades y métodos deben estar dentro de la clase
  constructor(private dosnService: DOSNService, private cultivoService: CultivoService, private route: ActivatedRoute, private router: Router) {}

      brassicaCuscuta = [
        { label: 'Brassica spp.', contiene: false, gramos: 0 },
        { label: 'Cuscuta spp.', contiene: false, gramos: 0 }
      ];

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

      // Opciones globales para los listados
      cultivosOptions: { id: number, label: string }[] = [];
      malezasOptions = [
        { id: 1, label: 'Amaranthus retroflexus' },
        { id: 2, label: 'Chenopodium album' },
        { id: 3, label: 'Echinochloa crus-galli' },
        { id: 4, label: 'Solanum nigrum' }
      ];
      malezasToleradasOptions = [
        { id: 1, label: 'Lolium perenne' },
        { id: 2, label: 'Poa annua' },
        { id: 3, label: 'Capsella bursa-pastoris' }
      ];
      malezasCeroOptions = [
        { id: 1, label: 'Cuscuta spp.' },
        { id: 2, label: 'Brassica spp.' },
        { id: 3, label: 'Orobanche spp.' }
      ];

      // Variables para manejar navegación
      isEditing: boolean = false;
      isViewing: boolean = false;

      // Getter para determinar si está en modo readonly
      get isReadonly(): boolean {
        return this.isViewing;
      }

      // ...existing code...

      ngOnInit(): void {
        // Cargar cultivos reales desde backend
        this.cultivoService.listarCultivos().subscribe({
          next: (cultivos) => {
            this.cultivosOptions = cultivos
              .filter(c => c && c.id != null && c.nombre != null)
              .map(c => ({ id: c.id as number, label: c.nombre }));
          },
          error: () => {
            this.cultivosOptions = [];
          }
        });
        this.route.params.subscribe(params => {
          if (params['loteId']) this.loteId = +params['loteId'];
          if (params['reciboId']) this.reciboId = +params['reciboId'];
          this.isEditing = !!params['id'];
          if (this.isEditing) {
            // Verificar si es modo visualización por query parameter
            this.route.queryParams.subscribe(queryParams => {
              this.isViewing = queryParams['view'] === 'true';
              this.isEditing = !this.isViewing;
            });
            // Modo edición/visualización: cargar DOSN existente
            this.editingId = +params['id'];
            this.cargarDOSN(this.editingId);
          } else {
            // Modo creación: limpiar/valores por defecto si hace falta
            this.editingId = null;
            this.dosn = null;
            this.isViewing = false;
          }
        });
      }

      cargarDOSN(id: number): void {
        this.loading = true;
        this.dosnService.obtener(id).subscribe({
          next: (resp) => {
            this.dosn = resp;
            // Mapear DTO -> estado de la vista (solo para mostrar)
            this.mapDtoToView(resp);
            this.loading = false;
          },
          error: () => {
            this.dosn = null;
            this.loading = false;
          }
        });
      }

      onSubmit() {
            const payload = this.buildPayloadFromView();
            this.loading = true;
            const obs = this.isEditing
              ? this.dosnService.editar(payload)
              : this.dosnService.crear(payload);

            obs.subscribe({
              next: (resp) => {
                this.loading = false;
                try {
                  const texto = typeof resp === 'string' ? resp : '';
                  const idMatch = texto.match(/ID\s*:?\s*(\d+)/i);
                  const id = idMatch ? Number(idMatch[1]) : this.editingId ?? null;
                  const accion = this.isEditing ? 'actualizada' : 'creada';
                  if (id != null) {
                    console.log(`DOSN ${accion} correctamente. ID: ${id}`);
                  } else {
                    console.log(`DOSN ${accion} correctamente.`);
                  }
                } catch (e) {
                  console.log(`DOSN ${this.isEditing ? 'actualizada' : 'creada'} correctamente.`);
                }
                if (this.loteId != null && this.reciboId != null) {
                  this.router.navigate([`/${this.loteId}/${this.reciboId}/listado-dosn`]);
                }
              },
              error: (e) => {
                const detalle = e?.error || e?.message || e;
                console.error(`Error al ${this.isEditing ? 'editar' : 'crear'} DOSN:`, detalle);
                this.loading = false;
              }
            });
      }

      onCancel() {
        // Navegar de vuelta al listado
        if (this.loteId != null && this.reciboId != null) {
          this.router.navigate([`/${this.loteId}/${this.reciboId}/listado-dosn`]);
        }
      }


  selectedMalezasToleradas: number[] = [];
  isMalezasToleradasDropdownOpen: boolean = false;
  malezasToleradasSearchText: string = '';
  toggleMalezasToleradasDropdown() { this.isMalezasToleradasDropdownOpen = !this.isMalezasToleradasDropdownOpen; }
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

 
  selectedMalezasCero: number[] = [];

  // Variables para manejar navegación
  // editingId ya está declarado arriba

  // --- Métodos y variables de INIA/INASE ---
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

  // Helpers de mapeo
  private mapDtoToView(d: DOSNDto): void {
    // INASE
    this.fechaInase = this.toDateInput(d.fechaINASE);
    this.gramosInase = d.gramosAnalizadosINASE ?? 0;
    this.tipoAnalisisInase = this.enumToLabel(d.tiposDeanalisisINASE);
    this.selectedMalezasInase = d.malezasNormalesINASEId ?? [];
    this.selectedMalezasToleradasInase = d.malezasToleradasINASEId ?? [];
    this.selectedMalezasCeroInase = d.malezasToleranciaCeroINASEId ?? [];
    this.selectedCultivosInase = d.cultivosINASEId ?? [];

    // INIA
    this.fechaInia = this.toDateInput(d.fechaINIA);
    this.gramosInia = d.gramosAnalizadosINIA ?? 0;
    this.tipoAnalisisInia = this.enumToLabel(d.tiposDeanalisisINIA);
    this.selectedMalezasInia = d.malezasNormalesINIAId ?? [];
    this.selectedMalezasToleradasInia = d.malezasToleradasINIAId ?? [];
    this.selectedMalezasCeroInia = d.malezasToleranciaCeroINIAId ?? [];
    this.selectedCultivosInia = d.cultivosINIAId ?? [];

    // Determinaciones brassica/cuscuta
    const brassica = this.brassicaCuscuta.find(b => b.label === 'Brassica spp.');
    const cuscuta = this.brassicaCuscuta.find(b => b.label === 'Cuscuta spp.');
    if (brassica) {
      // Back puede mandar null -> casteamos a boolean/0
      brassica.contiene = Boolean(d.determinacionBrassica);
      brassica.gramos = d.determinacionBrassicaGramos ?? 0;
    }
    if (cuscuta) {
      cuscuta.contiene = Boolean(d.determinacionCuscuta);
      cuscuta.gramos = d.determinacionCuscutaGramos ?? 0;
    }
  }

  private toDateInput(value: string | null): string {
    if (!value) return '';
    // Espera formatos tipo ISO: 2025-10-18T00:00:00Z o 2025-10-18T00:00:00
    const idx = value.indexOf('T');
    return idx > 0 ? value.substring(0, idx) : value;
  }

  private enumToLabel(value: string | null): string {
    switch (value) {
      case 'COMPLETO':
        return 'Completo';
      case 'REDUCIDO':
        return 'Reducido';
      case 'LIMITADO':
        return 'Limitado';
      case 'REDUCIDO_LIMITADO':
        return 'Reducido - limitado';
      default:
        return '';
    }
  }

  private labelToEnum(value: string): string | null {
    switch (value) {
      case 'Completo':
        return 'COMPLETO';
      case 'Reducido':
        return 'REDUCIDO';
      case 'Limitado':
        return 'LIMITADO';
      case 'Reducido - limitado':
        return 'REDUCIDO_LIMITADO';
      default:
        return null;
    }
  }

  private buildPayloadFromView(): DOSNDto {
    const brassica = this.brassicaCuscuta.find(b => b.label === 'Brassica spp.');
    const cuscuta = this.brassicaCuscuta.find(b => b.label === 'Cuscuta spp.');

    return {
      id: this.isEditing ? this.editingId! : null,
      reciboId: this.reciboId ?? null,
      // Fechas en formato ISO simple para backend
      fechaINIA: this.fechaInia ? `${this.fechaInia}T00:00:00` : null,
      fechaINASE: this.fechaInase ? `${this.fechaInase}T00:00:00` : null,
      // Gramos analizados
      gramosAnalizadosINIA: this.gramosInia ?? null,
      gramosAnalizadosINASE: this.gramosInase ?? null,
      // Tipos de análisis (enum backend)
      tiposDeanalisisINIA: this.labelToEnum(this.tipoAnalisisInia),
      tiposDeanalisisINASE: this.labelToEnum(this.tipoAnalisisInase),
      // Determinaciones
      determinacionBrassica: brassica ? Boolean(brassica.contiene) : null,
      determinacionBrassicaGramos: brassica && brassica.contiene ? Number(brassica.gramos) : 0,
      determinacionCuscuta: cuscuta ? Boolean(cuscuta.contiene) : null,
      determinacionCuscutaGramos: cuscuta && cuscuta.contiene ? Number(cuscuta.gramos) : 0,
      // Estandar y fecha análisis (preservar si existe)
      estandar: this.dosn?.estandar ?? null,
      fechaAnalisis: this.dosn?.fechaAnalisis ?? null,
      // Colecciones por organismo
      malezasNormalesINIAId: this.selectedMalezasInia ?? [],
      malezasNormalesINASEId: this.selectedMalezasInase ?? [],
      malezasToleradasINIAId: this.selectedMalezasToleradasInia ?? [],
      malezasToleradasINASEId: this.selectedMalezasToleradasInase ?? [],
      malezasToleranciaCeroINIAId: this.selectedMalezasCeroInia ?? [],
      malezasToleranciaCeroINASEId: this.selectedMalezasCeroInase ?? [],
      cultivosINIAId: this.selectedCultivosInia ?? [],
      cultivosINASEId: this.selectedCultivosInase ?? [],
      // Preservar flags y metadatos
      activo: this.dosn?.activo ?? true,
      repetido: this.dosn?.repetido ?? false,
      fechaCreacion: this.dosn?.fechaCreacion ?? null,
      fechaRepeticion: this.dosn?.fechaRepeticion ?? null
    };
  }
}

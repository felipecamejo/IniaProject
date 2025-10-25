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
import { TabsModule } from 'primeng/tabs';

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
    MultiSelectModule,
    TabsModule
      ],
      templateUrl: './dosn.component.html',
      styleUrl: './dosn.component.scss'
    })
    export class DOSNComponent implements OnInit {
      dosn: DOSNDto | null = null;
      loading: boolean = false;
      editingId: number | null = null;

      // Variables para manejar navegación
      isEditing: boolean = false;
      isViewing: boolean = false;
      isSubmitting: boolean = false;
      
      loteId: string | null = '';
      reciboId: string | null = '';
      
      // Campo para mantener fechaCreacion original durante edición
      fechaCreacionOriginal: string | null = null;

      // Campos adicionales del formulario
      estandar: boolean = false;
      fechaAnalisis: string = '';

      // Todas las propiedades y métodos deben estar dentro de la clase
      constructor(private dosnService: DOSNService, private route: ActivatedRoute, private router: Router) {}

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

      // ...existing code...

      ngOnInit(): void {
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
              if (this.editingId) {
                this.cargarDatosParaEdicion(this.editingId);
              }
            });
          }
        });
      }

      private cargarDatosParaEdicion(id: number): void {
        this.loading = true;
        this.dosnService.obtener(id).subscribe({
          next: (item: DOSNDto) => {
            console.log('Cargando datos DOSN para edición:', item);
            this.dosn = item;
            
            // Guardar fechaCreacion original para edición
            this.fechaCreacionOriginal = item.fechaCreacion;
            
            // Mapear DTO -> estado de la vista
            this.mapDtoToView(item);
            this.loading = false;
          },
          error: (error) => {
            console.error('Error al cargar DOSN:', error);
            this.dosn = null;
            this.loading = false;
          }
        });
      }

      onSubmit() {
        // Prevenir múltiples envíos
        if (this.isSubmitting) {
          console.log('Ya se está enviando el formulario, ignorando nueva llamada');
          return;
        }
        
        this.isSubmitting = true;
        let dosnData: DOSNDto = this.buildDosnDto();

        // Debugging: mostrar exactamente qué datos se están enviando
        console.log('=== DATOS ENVIADOS AL BACKEND ===');
        console.log('isEditing:', this.isEditing);
        console.log('editingId:', this.editingId);

        if (this.isEditing && this.editingId) {
          // Actualizar DOSN existente - mantener valores no editables
          console.log('Editando DOSN existente con ID:', this.editingId);
          console.log('dosnData:', JSON.stringify(dosnData, null, 2));

          dosnData.fechaCreacion = this.fechaCreacionOriginal ? this.convertirFechaAISO(this.fechaCreacionOriginal) : null;
          console.log("reciboId:", this.getReciboId());
          this.dosnService.editar(dosnData).subscribe({
            next: (response: any) => {
              console.log('DOSN actualizada exitosamente:', response);
              this.isSubmitting = false;
              this.router.navigate([this.loteId + "/" + this.reciboId + "/listado-dosn"]);
            },
            error: (error: any) => {
              console.error('Error al actualizar el DOSN:', error);
              this.isSubmitting = false;
            }
          });
        } else {
          // Crear nueva DOSN - establecer valores por defecto para creación
          dosnData.id = 0;
          dosnData.activo = true; 
          dosnData.repetido = false; 
          dosnData.fechaCreacion = new Date().toISOString();
          dosnData.fechaRepeticion = null;
          
          console.log('Creando nueva DOSN');
          console.log('dosnData:', JSON.stringify(dosnData, null, 2));
          
          this.dosnService.crear(dosnData).subscribe({
            next: (response: any) => {
              console.log('DOSN creada exitosamente:', response);
              this.isSubmitting = false;
              this.router.navigate([this.loteId + "/" + this.reciboId + "/listado-dosn"]);
            },
            error: (error: any) => {
              console.error('Error al crear el DOSN:', error);
              this.isSubmitting = false;
            }
          });
        }
      }

      onCancel() {
        // Implementar lógica de cancelación aquí
        console.log('Formulario DOSN cancelado');
      }

      private buildDosnDto(): DOSNDto {
        return {
          id: this.isEditing && this.editingId ? this.editingId : 0,
          reciboId: this.getReciboId(),
          
          // Fechas INIA / INASE
          fechaINIA: this.fechaInia ? this.convertirFechaAISO(this.fechaInia) : null,
          fechaINASE: this.fechaInase ? this.convertirFechaAISO(this.fechaInase) : null,
          
          // Gramos analizados INIA / INASE
          gramosAnalizadosINIA: this.gramosInia || 0,
          gramosAnalizadosINASE: this.gramosInase || 0,
          
          // Tipos de análisis
          tiposDeanalisisINIA: this.labelToEnum(this.tipoAnalisisInia),
          tiposDeanalisisINASE: this.labelToEnum(this.tipoAnalisisInase),
          
          // Determinaciones
          determinacionBrassica: this.brassicaCuscuta.find(b => b.label === 'Brassica spp.')?.contiene || false,
          determinacionBrassicaGramos: this.brassicaCuscuta.find(b => b.label === 'Brassica spp.')?.gramos || 0,
          determinacionCuscuta: this.brassicaCuscuta.find(b => b.label === 'Cuscuta spp.')?.contiene || false,
          determinacionCuscutaGramos: this.brassicaCuscuta.find(b => b.label === 'Cuscuta spp.')?.gramos || 0,
          
          estandar: this.estandar || false,
          fechaAnalisis: this.fechaAnalisis ? this.convertirFechaAISO(this.fechaAnalisis) : null,
          
          // Colecciones (IDs)
          malezasNormalesINIAId: this.selectedMalezasInia || [],
          malezasNormalesINASEId: this.selectedMalezasInase || [],
          malezasToleradasINIAId: this.selectedMalezasToleradasInia || [],
          malezasToleradasINASEId: this.selectedMalezasToleradasInase || [],
          malezasToleranciaCeroINIAId: this.selectedMalezasCeroInia || [],
          malezasToleranciaCeroINASEId: this.selectedMalezasCeroInase || [],
          cultivosINIAId: this.selectedCultivosInia || [],
          cultivosINASEId: this.selectedCultivosInase || [],
          
          // Campos de control
          activo: true,
          repetido: false,
          fechaCreacion: null, // Se establecerá en onSubmit
          fechaRepeticion: null
        };
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

  private labelToEnum(value: string | null): string | null {
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

  private getReciboId(): number {
    return this.reciboId ? parseInt(this.reciboId) : 0;
  }

  private convertirFechaAISO(fecha: string): string {
    if (!fecha) return '';
    // Si la fecha ya tiene formato ISO completo, la devolvemos tal como está
    if (fecha.includes('T')) {
      return fecha;
    }
    // Si es formato YYYY-MM-DD, agregamos la hora
    return fecha + 'T00:00:00';
  }
}

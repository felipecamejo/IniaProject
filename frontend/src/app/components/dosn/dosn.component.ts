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
import { MalezaService } from '../../../services/MalezaService';
import { LogService } from '../../../services/LogService';
import { AuthService } from '../../../services/AuthService';


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
      constructor(private dosnService: DOSNService, private cultivoService: CultivoService, private malezaService: MalezaService, private route: ActivatedRoute, private router: Router, private logService: LogService, private authService: AuthService) {}

      brassicaCuscuta = [
        { label: 'Brassica spp.', contiene: false, gramos: 0 },
        { label: 'Cuscuta spp.', contiene: false, gramos: 0 }
      ];

      observaciones: string = '';

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
      toggleMalezaSelectionInase(maleza: {id: number, label: string}) {
        if (this.isMalezaSelectedInase(maleza.id)) {
          this.selectedMalezasInase = this.selectedMalezasInase.filter(id => id !== maleza.id);
          if (this.malezasInaseCounts) { delete this.malezasInaseCounts[maleza.id]; }
        } else {
          this.selectedMalezasInase = [...this.selectedMalezasInase, maleza.id];
          if (!this.malezasInaseCounts) this.malezasInaseCounts = {} as Record<number, number>;
          if (this.malezasInaseCounts[maleza.id] == null) this.malezasInaseCounts[maleza.id] = 0;
        }
      }
      getSelectedMalezasTextInase() { if (this.selectedMalezasInase.length === 0) return 'Seleccionar malezas...'; return this.selectedMalezasInase.map(id => { const item = this.malezasOptions.find(m => m.id === id); return item ? item.label : ''; }).join(', '); }
      selectedMalezasToleradasInase: number[] = [];
      isMalezasToleradasDropdownOpenInase: boolean = false;
      malezasToleradasSearchTextInase: string = '';
      toggleMalezasToleradasDropdownInase() { this.isMalezasToleradasDropdownOpenInase = !this.isMalezasToleradasDropdownOpenInase; }
      getFilteredMalezasToleradasInase() { const search = this.malezasToleradasSearchTextInase.toLowerCase(); return this.malezasToleradasOptions.filter(mt => mt.label.toLowerCase().includes(search)); }
      isMalezaToleradaSelectedInase(id: number) { return this.selectedMalezasToleradasInase.includes(id); }
      toggleMalezaToleradaSelectionInase(maleza: {id: number, label: string}) {
        if (this.isMalezaToleradaSelectedInase(maleza.id)) {
          this.selectedMalezasToleradasInase = this.selectedMalezasToleradasInase.filter(id => id !== maleza.id);
          if (this.malezasToleradasInaseCounts) { delete this.malezasToleradasInaseCounts[maleza.id]; }
        } else {
          this.selectedMalezasToleradasInase = [...this.selectedMalezasToleradasInase, maleza.id];
          if (!this.malezasToleradasInaseCounts) this.malezasToleradasInaseCounts = {} as Record<number, number>;
          if (this.malezasToleradasInaseCounts[maleza.id] == null) this.malezasToleradasInaseCounts[maleza.id] = 0;
        }
      }
      getSelectedMalezasToleradasTextInase() { if (this.selectedMalezasToleradasInase.length === 0) return 'Seleccionar malezas toleradas...'; return this.selectedMalezasToleradasInase.map(id => { const item = this.malezasToleradasOptions.find(mt => mt.id === id); return item ? item.label : ''; }).join(', '); }
      selectedMalezasCeroInase: number[] = [];
      isMalezasCeroDropdownOpenInase: boolean = false;
      malezasCeroSearchTextInase: string = '';
      toggleMalezasCeroDropdownInase() { this.isMalezasCeroDropdownOpenInase = !this.isMalezasCeroDropdownOpenInase; }
      getFilteredMalezasCeroInase() { const search = this.malezasCeroSearchTextInase.toLowerCase(); return this.malezasCeroOptions.filter(mc => mc.label.toLowerCase().includes(search)); }
      isMalezaCeroSelectedInase(id: number) { return this.selectedMalezasCeroInase.includes(id); }
      toggleMalezaCeroSelectionInase(maleza: {id: number, label: string}) {
        if (this.isMalezaCeroSelectedInase(maleza.id)) {
          this.selectedMalezasCeroInase = this.selectedMalezasCeroInase.filter(id => id !== maleza.id);
          if (this.malezasCeroInaseCounts) { delete this.malezasCeroInaseCounts[maleza.id]; }
        } else {
          this.selectedMalezasCeroInase = [...this.selectedMalezasCeroInase, maleza.id];
          if (!this.malezasCeroInaseCounts) this.malezasCeroInaseCounts = {} as Record<number, number>;
          if (this.malezasCeroInaseCounts[maleza.id] == null) this.malezasCeroInaseCounts[maleza.id] = 0;
        }
      }
  getSelectedMalezasCeroTextInase() { if (this.selectedMalezasCeroInase.length === 0) return 'Seleccionar malezas tolerancia cero...'; return this.selectedMalezasCeroInase.map(id => { const item = this.malezasCeroOptions.find(mc => mc.id === id); return item ? item.label : ''; }).join(', '); }

  // Cantidades por selección (INASE)
  malezasInaseCounts: Record<number, number> = {};
  malezasToleradasInaseCounts: Record<number, number> = {};
  malezasCeroInaseCounts: Record<number, number> = {};
  cultivosInaseCounts: Record<number, number> = {};

  // Agregar propiedades para manejar errores
  errores: string[] = [];

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
      toggleMalezaSelectionInia(maleza: {id: number, label: string}) {
        if (this.isMalezaSelectedInia(maleza.id)) {
          this.selectedMalezasInia = this.selectedMalezasInia.filter(id => id !== maleza.id);
          if (this.malezasIniaCounts) { delete this.malezasIniaCounts[maleza.id]; }
        } else {
          this.selectedMalezasInia = [...this.selectedMalezasInia, maleza.id];
          if (!this.malezasIniaCounts) this.malezasIniaCounts = {} as Record<number, number>;
          if (this.malezasIniaCounts[maleza.id] == null) this.malezasIniaCounts[maleza.id] = 0;
        }
      }
      getSelectedMalezasTextInia() { if (this.selectedMalezasInia.length === 0) return 'Seleccionar malezas...'; return this.selectedMalezasInia.map(id => { const item = this.malezasOptions.find(m => m.id === id); return item ? item.label : ''; }).join(', '); }
      selectedMalezasToleradasInia: number[] = [];
      isMalezasToleradasDropdownOpenInia: boolean = false;
      malezasToleradasSearchTextInia: string = '';
      toggleMalezasToleradasDropdownInia() { this.isMalezasToleradasDropdownOpenInia = !this.isMalezasToleradasDropdownOpenInia; }
      getFilteredMalezasToleradasInia() { const search = this.malezasToleradasSearchTextInia.toLowerCase(); return this.malezasToleradasOptions.filter(mt => mt.label.toLowerCase().includes(search)); }
      isMalezaToleradaSelectedInia(id: number) { return this.selectedMalezasToleradasInia.includes(id); }
      toggleMalezaToleradaSelectionInia(maleza: {id: number, label: string}) {
        if (this.isMalezaToleradaSelectedInia(maleza.id)) {
          this.selectedMalezasToleradasInia = this.selectedMalezasToleradasInia.filter(id => id !== maleza.id);
          if (this.malezasToleradasIniaCounts) { delete this.malezasToleradasIniaCounts[maleza.id]; }
        } else {
          this.selectedMalezasToleradasInia = [...this.selectedMalezasToleradasInia, maleza.id];
          if (!this.malezasToleradasIniaCounts) this.malezasToleradasIniaCounts = {} as Record<number, number>;
          if (this.malezasToleradasIniaCounts[maleza.id] == null) this.malezasToleradasIniaCounts[maleza.id] = 0;
        }
      }
      getSelectedMalezasToleradasTextInia() { if (this.selectedMalezasToleradasInia.length === 0) return 'Seleccionar malezas toleradas...'; return this.selectedMalezasToleradasInia.map(id => { const item = this.malezasToleradasOptions.find(mt => mt.id === id); return item ? item.label : ''; }).join(', '); }
      selectedMalezasCeroInia: number[] = [];
      isMalezasCeroDropdownOpenInia: boolean = false;
      malezasCeroSearchTextInia: string = '';
      toggleMalezasCeroDropdownInia() { this.isMalezasCeroDropdownOpenInia = !this.isMalezasCeroDropdownOpenInia; }
      getFilteredMalezasCeroInia() { const search = this.malezasCeroSearchTextInia.toLowerCase(); return this.malezasCeroOptions.filter(mc => mc.label.toLowerCase().includes(search)); }
      isMalezaCeroSelectedInia(id: number) { return this.selectedMalezasCeroInia.includes(id); }
      toggleMalezaCeroSelectionInia(maleza: {id: number, label: string}) {
        if (this.isMalezaCeroSelectedInia(maleza.id)) {
          this.selectedMalezasCeroInia = this.selectedMalezasCeroInia.filter(id => id !== maleza.id);
          if (this.malezasCeroIniaCounts) { delete this.malezasCeroIniaCounts[maleza.id]; }
        } else {
          this.selectedMalezasCeroInia = [...this.selectedMalezasCeroInia, maleza.id];
          if (!this.malezasCeroIniaCounts) this.malezasCeroIniaCounts = {} as Record<number, number>;
          if (this.malezasCeroIniaCounts[maleza.id] == null) this.malezasCeroIniaCounts[maleza.id] = 0;
        }
      }
  getSelectedMalezasCeroTextInia() { if (this.selectedMalezasCeroInia.length === 0) return 'Seleccionar malezas tolerancia cero...'; return this.selectedMalezasCeroInia.map(id => { const item = this.malezasCeroOptions.find(mc => mc.id === id); return item ? item.label : ''; }).join(', '); }

  // Cantidades por selección (INIA)
  malezasIniaCounts: Record<number, number> = {};
  malezasToleradasIniaCounts: Record<number, number> = {};
  malezasCeroIniaCounts: Record<number, number> = {};
  cultivosIniaCounts: Record<number, number> = {};

      // Opciones globales para los listados
      cultivosOptions: { id: number, label: string }[] = [];
      malezasOptions: { id: number, label: string }[] = [];
      malezasToleradasOptions: { id: number, label: string }[] = [];
      malezasCeroOptions: { id: number, label: string }[] = [];

      // Campos para estándar
      fechaEstandar: string = '';
      estandar: boolean = false;
      repetido: boolean = false;


      estandarPendiente: boolean = false;
      repetidoPendiente: boolean = false;

      // Variables para controlar si ya está marcado (no se puede cambiar)
      estandarOriginal: boolean = false;
      repetidoOriginal: boolean = false;

      // Getters para deshabilitar checkboxes si ya están marcados
      get estandarDeshabilitado(): boolean {
        return this.estandarOriginal;
      }

      get repetidoDeshabilitado(): boolean {
        return this.repetidoOriginal;
      }

      // Getter para verificar si el usuario es admin
      get isAdmin(): boolean {
        return this.authService.isAdmin();
      }

      // Métodos para hacer checkboxes mutuamente excluyentes con confirmación
      onEstandarChange() {
        // Si ya estaba marcado como estándar, no permitir cambiar
        if (this.estandarOriginal) {
          this.estandar = true; // Revertir
          return;
        }

        // Si está intentando marcar como estándar y ya está marcado como repetido
        if (this.estandar && this.repetido) {
          this.repetido = false;
          this.repetidoOriginal = false;
        }

        // Si está intentando marcar como estándar, mostrar confirmación con alert
        if (this.estandar) {
          const confirmar = confirm('¿Estás seguro de que deseas marcar este análisis como estándar? Una vez marcado, no podrás cambiarlo.');
          if (!confirmar) {
            // Revertir el cambio si no se confirma
            this.estandar = false;
            return;
          }
          // Confirmar el cambio
          this.repetido = false;
          this.estandarOriginal = true; // Marcar como original para que no se pueda cambiar
          this.repetidoOriginal = false;
        }
      }

      onRepetidoChange() {
        // Si ya estaba marcado como repetido, no permitir cambiar
        if (this.repetidoOriginal) {
          this.repetido = true; // Revertir
          return;
        }

        // Si está intentando marcar como repetido y ya está marcado como estándar
        if (this.repetido && this.estandar) {
          this.estandar = false;
          this.estandarOriginal = false;
        }

        // Si está intentando marcar como repetido, mostrar confirmación con alert
        if (this.repetido) {
          const confirmar = confirm('¿Estás seguro de que deseas marcar este análisis como repetido? Una vez marcado, no podrás cambiarlo.');
          if (!confirmar) {
            // Revertir el cambio si no se confirma
            this.repetido = false;
            return;
          }
          // Confirmar el cambio
          this.estandar = false;
          this.repetidoOriginal = true; // Marcar como original para que no se pueda cambiar
          this.estandarOriginal = false;
        }
      }

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

        // Cargar todas las malezas desde backend
        this.malezaService.listar().subscribe({
          next: (response) => {
            const malezas = response.malezas || [];
            this.malezasOptions = malezas
              .filter(m => m && m.id != null && m.nombre != null)
              .map(m => ({ id: m.id as number, label: m.nombre }));
            
            // Para malezas toleradas y tolerancia cero, usar las mismas malezas por ahora
            // En el futuro se podría implementar una lógica específica para categorizar malezas
            this.malezasToleradasOptions = [...this.malezasOptions];
            this.malezasCeroOptions = [...this.malezasOptions];
          },
          error: () => {
            this.malezasOptions = [];
            this.malezasToleradasOptions = [];
            this.malezasCeroOptions = [];
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
        // Verificar si hay errores antes de continuar
        if (this.manejarProblemas()) {
          console.error('Errores detectados:', this.errores);
          return;
        }

            const payload = this.buildPayloadFromView();
            this.loading = true;

            console.log('Payload construido', payload);

            if (this.isEditing) {
              // Modo edición: editar devuelve Observable<string>
              //payload.estandar = this.estandar;
              //console.log('Payload para editar DOSN:', payload);
              this.dosnService.editar(payload).subscribe({
                next: (resp: string) => {
                  this.loading = false;
                  const id = this.editingId ?? null;
                  
                  const user = JSON.parse(localStorage.getItem('user') || '{}');
                  const username = user?.nombre || 'Desconocido';
                  const rol = this.obtenerRolMasAlto(user?.roles);

                  if (id != null) {
                    
                    this.logService.crearLog(this.loteId ?? 0, Number(id), 'DOSN', 'editada').subscribe();
                  }

                  console.log(`DOSN editada correctamente con ID: ${id}`);
                  
                  if (this.loteId != null && this.reciboId != null) {
                    this.router.navigate([`/${this.loteId}/${this.reciboId}/listado-dosn`]);
                  }
                },
                error: (e: any) => {
                  const detalle = e?.error || e?.message || e;
                  console.error('Error al editar DOSN:', detalle);
                  this.loading = false;
                }
              });
            } else {
              // Modo creación: crear devuelve Observable<number>
              this.dosnService.crear(payload).subscribe({
                next: (id: number) => {
                  this.loading = false;
 
                  if (id != null) {
                    this.logService.crearLog(this.loteId ?? 0, Number(id), 'DOSN', 'creada').subscribe();
                  }

                  console.log(`DOSN creada correctamente con ID: ${id}`);
                  
                  if (this.loteId != null && this.reciboId != null) {
                    this.router.navigate([`/${this.loteId}/${this.reciboId}/listado-dosn`]);
                  }
                },
                error: (e: any) => {
                  const detalle = e?.error || e?.message || e;
                  console.error('Error al crear DOSN:', detalle);
                  this.loading = false;
                }
              });
            }
      }

      onCancel() {
        // Navegar de vuelta al listado
        if (this.loteId != null && this.reciboId != null) {
          this.router.navigate([`/${this.loteId}/${this.reciboId}/listado-dosn`]);
        }
      }

      obtenerRolMasAlto(roles: string[] | string | undefined): string {
        // Si no hay roles, retornar 'Desconocido'
        if (!roles) return 'Desconocido';
        
        // Si es un string, convertir a array
        const rolesArray = Array.isArray(roles) ? roles : [roles];
        
        // Definir jerarquía de roles (de mayor a menor)
        if (rolesArray.includes('ADMIN')) return 'Administrador';
        if (rolesArray.includes('ANALISTA')) return 'Analista';
        if (rolesArray.includes('OBSERVADOR')) return 'Observador';
        
        return 'Desconocido';
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
  toggleCultivoSelectionInase(cultivo: {id: number, label: string}) {
    if (this.isCultivoSelectedInase(cultivo.id)) {
      this.selectedCultivosInase = this.selectedCultivosInase.filter(id => id !== cultivo.id);
      if (this.cultivosInaseCounts) { delete this.cultivosInaseCounts[cultivo.id]; }
    } else {
      this.selectedCultivosInase = [...this.selectedCultivosInase, cultivo.id];
      if (!this.cultivosInaseCounts) this.cultivosInaseCounts = {} as Record<number, number>;
      if (this.cultivosInaseCounts[cultivo.id] == null) this.cultivosInaseCounts[cultivo.id] = 0;
    }
  }
  getSelectedCultivosTextInase() { if (this.selectedCultivosInase.length === 0) return 'Seleccionar cultivos...'; return this.selectedCultivosInase.map(id => { const item = this.cultivosOptions.find(c => c.id === id); return item ? item.label : ''; }).join(', '); }
  // INIA
  selectedCultivosInia: number[] = [];
  isCultivosDropdownOpenInia: boolean = false;
  cultivosSearchTextInia: string = '';

  toggleCultivosDropdownInia() { this.isCultivosDropdownOpenInia = !this.isCultivosDropdownOpenInia; }
  getFilteredCultivosInia() { const search = this.cultivosSearchTextInia.toLowerCase(); return this.cultivosOptions.filter(c => c.label.toLowerCase().includes(search)); }
  isCultivoSelectedInia(id: number) { return this.selectedCultivosInia.includes(id); }
  toggleCultivoSelectionInia(cultivo: {id: number, label: string}) {
    if (this.isCultivoSelectedInia(cultivo.id)) {
      this.selectedCultivosInia = this.selectedCultivosInia.filter(id => id !== cultivo.id);
      if (this.cultivosIniaCounts) { delete this.cultivosIniaCounts[cultivo.id]; }
    } else {
      this.selectedCultivosInia = [...this.selectedCultivosInia, cultivo.id];
      if (!this.cultivosIniaCounts) this.cultivosIniaCounts = {} as Record<number, number>;
      if (this.cultivosIniaCounts[cultivo.id] == null) this.cultivosIniaCounts[cultivo.id] = 0;
    }
  }
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

  // Helpers UI generales
  getLabelById(options: {id:number,label:string}[], id: number): string {
    const item = options.find(o => o.id === id);
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
    this.observaciones = d.observaciones ?? '';
    // Si vienen cantidades (nuevo backend opcional), mapeamos a los count maps y aseguramos selección
    if (d.malezasNormalesINASE?.length) {
      d.malezasNormalesINASE.forEach(({ id, cantidad }) => {
        this.malezasInaseCounts[id] = cantidad ?? 0;
        if (!this.selectedMalezasInase.includes(id)) this.selectedMalezasInase.push(id);
      });
    }
    if (d.malezasToleradasINASE?.length) {
      d.malezasToleradasINASE.forEach(({ id, cantidad }) => {
        this.malezasToleradasInaseCounts[id] = cantidad ?? 0;
        if (!this.selectedMalezasToleradasInase.includes(id)) this.selectedMalezasToleradasInase.push(id);
      });
    }
    if (d.malezasToleranciaCeroINASE?.length) {
      d.malezasToleranciaCeroINASE.forEach(({ id, cantidad }) => {
        this.malezasCeroInaseCounts[id] = cantidad ?? 0;
        if (!this.selectedMalezasCeroInase.includes(id)) this.selectedMalezasCeroInase.push(id);
      });
    }
    if (d.cultivosINASE?.length) {
      d.cultivosINASE.forEach(({ id, cantidad }) => {
        this.cultivosInaseCounts[id] = cantidad ?? 0;
        if (!this.selectedCultivosInase.includes(id)) this.selectedCultivosInase.push(id);
      });
    }

    // INIA
    this.fechaInia = this.toDateInput(d.fechaINIA);
    this.gramosInia = d.gramosAnalizadosINIA ?? 0;
    this.tipoAnalisisInia = this.enumToLabel(d.tiposDeanalisisINIA);
    this.selectedMalezasInia = d.malezasNormalesINIAId ?? [];
    this.selectedMalezasToleradasInia = d.malezasToleradasINIAId ?? [];
    this.selectedMalezasCeroInia = d.malezasToleranciaCeroINIAId ?? [];
    this.selectedCultivosInia = d.cultivosINIAId ?? [];
    // Cantidades INIA si están presentes
    if (d.malezasNormalesINIA?.length) {
      d.malezasNormalesINIA.forEach(({ id, cantidad }) => {
        this.malezasIniaCounts[id] = cantidad ?? 0;
        if (!this.selectedMalezasInia.includes(id)) this.selectedMalezasInia.push(id);
      });
    }
    if (d.malezasToleradasINIA?.length) {
      d.malezasToleradasINIA.forEach(({ id, cantidad }) => {
        this.malezasToleradasIniaCounts[id] = cantidad ?? 0;
        if (!this.selectedMalezasToleradasInia.includes(id)) this.selectedMalezasToleradasInia.push(id);
      });
    }
    if (d.malezasToleranciaCeroINIA?.length) {
      d.malezasToleranciaCeroINIA.forEach(({ id, cantidad }) => {
        this.malezasCeroIniaCounts[id] = cantidad ?? 0;
        if (!this.selectedMalezasCeroInia.includes(id)) this.selectedMalezasCeroInia.push(id);
      });
    }
    if (d.cultivosINIA?.length) {
      d.cultivosINIA.forEach(({ id, cantidad }) => {
        this.cultivosIniaCounts[id] = cantidad ?? 0;
        if (!this.selectedCultivosInia.includes(id)) this.selectedCultivosInia.push(id);
      });
    }

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

    // Campos estándar
    this.estandar = d.estandar ?? false;
    this.repetido = d.repetido ?? false;
    // Guardar valores originales para deshabilitar checkboxes si ya están marcados
    this.estandarOriginal = d.estandar ?? false;
    this.repetidoOriginal = d.repetido ?? false;
    this.fechaEstandar = this.toDateInput(d.fechaEstandar);
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

    const toCantidadList = (ids: number[] | null | undefined, counts: Record<number, number> | null | undefined) => {
      const list: Array<{ id: number; cantidad: number }> = [];
      (ids ?? []).forEach((id) => {
        const raw = counts ? counts[id] : undefined;
        const cantidad = raw != null && !isNaN(Number(raw)) ? Math.max(0, Number(raw)) : 0;
        list.push({ id, cantidad });
      });
      return list;
    };

    // Manejo de fechas igual que PMS
    let fechaCreacion = this.dosn?.fechaCreacion || null;
    const fechaActual = new Date().toISOString().split('T')[0];

  
    // Si es creación, asignar fecha actual
    if (!this.isEditing) {
      fechaCreacion = fechaActual;
    }

    return {
      id: this.isEditing ? this.editingId! : null,
      reciboId: this.reciboId ?? null,
      // Fechas en formato ISO simple para backend
      fechaINIA: this.fechaInia ? `${this.fechaInia}T00:00:00` : null,
      fechaINASE: this.fechaInase ? `${this.fechaInase}T00:00:00` : null,
      fechaEstandar: this.fechaEstandar ? `${this.fechaEstandar}T00:00:00` : null,
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
      // Estandar y fecha análisis
      estandar: this.estandar ?? false,
      // Colecciones por organismo
      malezasNormalesINIAId: this.selectedMalezasInia ?? [],
      malezasNormalesINASEId: this.selectedMalezasInase ?? [],
      malezasToleradasINIAId: this.selectedMalezasToleradasInia ?? [],
      malezasToleradasINASEId: this.selectedMalezasToleradasInase ?? [],
      malezasToleranciaCeroINIAId: this.selectedMalezasCeroInia ?? [],
      malezasToleranciaCeroINASEId: this.selectedMalezasCeroInase ?? [],
      cultivosINIAId: this.selectedCultivosInia ?? [],
      cultivosINASEId: this.selectedCultivosInase ?? [],
      // Nuevas colecciones con cantidades
      malezasNormalesINIA: toCantidadList(this.selectedMalezasInia, this.malezasIniaCounts),
      malezasNormalesINASE: toCantidadList(this.selectedMalezasInase, this.malezasInaseCounts),
      malezasToleradasINIA: toCantidadList(this.selectedMalezasToleradasInia, this.malezasToleradasIniaCounts),
      malezasToleradasINASE: toCantidadList(this.selectedMalezasToleradasInase, this.malezasToleradasInaseCounts),
      malezasToleranciaCeroINIA: toCantidadList(this.selectedMalezasCeroInia, this.malezasCeroIniaCounts),
      malezasToleranciaCeroINASE: toCantidadList(this.selectedMalezasCeroInase, this.malezasCeroInaseCounts),
      cultivosINIA: toCantidadList(this.selectedCultivosInia, this.cultivosIniaCounts),
      cultivosINASE: toCantidadList(this.selectedCultivosInase, this.cultivosInaseCounts),
      // Preservar flags y metadatos
      activo: this.dosn?.activo ?? true,
      repetido: this.repetido ?? false,
      fechaCreacion,
      observaciones: this.observaciones ?? null
    };
  }

  manejarProblemas(): boolean {
      this.errores = []; // Reiniciar errores

      if (!this.validarNumero(this.gramosInase)) {
        this.errores.push('Los gramos analizados INASE no pueden ser negativos.');
      }

      if (!this.validarNumero(this.gramosInia)) {
        this.errores.push('Los gramos analizados INIA no pueden ser negativos.');
      }

      // Validar cantidades por cada maleza seleccionada en INASE
      if (this.selectedMalezasInase && this.selectedMalezasInase.length > 0) {
        this.selectedMalezasInase.forEach(id => {
          const cantidad = this.malezasInaseCounts ? this.malezasInaseCounts[id] : undefined;
          if (!this.validarNumero(cantidad as number)) {
            const label = this.getLabelById(this.malezasOptions, id);
            this.errores.push(`La cantidad para la maleza "${label || id}" seleccionada en INASE no puede ser negativa.`);
          }
        });
      }

      // Validar cantidades por cada maleza seleccionada en INASE
      if (this.selectedCultivosInase && this.selectedCultivosInase.length > 0) {
        this.selectedCultivosInase.forEach(id => {
          const cantidad = this.cultivosInaseCounts ? this.cultivosInaseCounts[id] : undefined;
          if (!this.validarNumero(cantidad as number)) {
            const label = this.getLabelById(this.cultivosOptions, id);
            this.errores.push(`La cantidad para el cultivo "${label || id}" seleccionado en INASE no puede ser negativa.`);
          }
        });
      }

      // Validar cantidades por cada maleza seleccionada en INASE
      if (this.selectedMalezasToleradasInase && this.selectedMalezasToleradasInase.length > 0) {
        this.selectedMalezasToleradasInase.forEach(id => {
          const cantidad = this.malezasToleradasInaseCounts ? this.malezasToleradasInaseCounts[id] : undefined;
          if (!this.validarNumero(cantidad as number)) {
            const label = this.getLabelById(this.malezasOptions, id);
            this.errores.push(`La cantidad para la maleza "${label || id}" seleccionada en INASE no puede ser negativa.`);
          }
        });
      }

      // Validar cantidades por cada maleza seleccionada en INASE
      if (this.selectedMalezasCeroInase && this.selectedMalezasCeroInase.length > 0) {
        this.selectedMalezasCeroInase.forEach(id => {
          const cantidad = this.malezasCeroInaseCounts ? this.malezasCeroInaseCounts[id] : undefined;
          if (!this.validarNumero(cantidad as number)) {
            const label = this.getLabelById(this.malezasOptions, id);
            this.errores.push(`La cantidad para la maleza cero "${label || id}" seleccionada en INASE no puede ser negativa.`);
          }
        });
      }

       // Validar cantidades por cada maleza seleccionada en INIA
      if (this.selectedMalezasInia && this.selectedMalezasInia.length > 0) {
        this.selectedMalezasInia.forEach(id => {
          const cantidad = this.malezasIniaCounts ? this.malezasIniaCounts[id] : undefined;
          if (!this.validarNumero(cantidad as number)) {
            const label = this.getLabelById(this.malezasOptions, id);
            this.errores.push(`La cantidad para la maleza "${label || id}" seleccionada en INIA no puede ser negativa.`);
          }
        });
      }

      // Validar cantidades por cada maleza seleccionada en INIA
      if (this.selectedCultivosInia && this.selectedCultivosInia.length > 0) {
        this.selectedCultivosInia.forEach(id => {
          const cantidad = this.cultivosIniaCounts ? this.cultivosIniaCounts[id] : undefined;
          if (!this.validarNumero(cantidad as number)) {
            const label = this.getLabelById(this.cultivosOptions, id);
            this.errores.push(`La cantidad para el cultivo "${label || id}" seleccionado en INIA no puede ser negativa.`);
          }
        });
      }

      // Validar cantidades por cada maleza seleccionada en INIA
      if (this.selectedMalezasToleradasInia && this.selectedMalezasToleradasInia.length > 0) {
        this.selectedMalezasToleradasInia.forEach(id => {
          const cantidad = this.malezasToleradasIniaCounts ? this.malezasToleradasIniaCounts[id] : undefined;
          if (!this.validarNumero(cantidad as number)) {
            const label = this.getLabelById(this.malezasOptions, id);
            this.errores.push(`La cantidad para la maleza "${label || id}" seleccionada en INIA no puede ser negativa.`);
          }
        });
      }

      // Validar cantidades por cada maleza seleccionada en INIA
      if (this.selectedMalezasCeroInia && this.selectedMalezasCeroInia.length > 0) {
        this.selectedMalezasCeroInia.forEach(id => {
          const cantidad = this.malezasCeroIniaCounts ? this.malezasCeroIniaCounts[id] : undefined;
          if (!this.validarNumero(cantidad as number)) {
            const label = this.getLabelById(this.malezasOptions, id);
            this.errores.push(`La cantidad para la maleza cero "${label || id}" seleccionada en INIA no puede ser negativa.`);
          }
        });
      }

      return this.errores.length > 0;
  }

  validarNumero(numero: number): boolean {
    return numero != null && Number(numero) >= 0;
  }

  validarFecha(fecha: string): boolean {
    if (!fecha) return false;
    const selectedDate = new Date(fecha);
    const today = new Date();
    return selectedDate >= today;
  }
}

import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
export class SanitarioComponent {
  
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

}

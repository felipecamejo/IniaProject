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

  // Propiedades enlazadas con ngModel
  selectedMetodo: string = '';
  selectedEstado: string = '';
  selectedHongos: number[] = [];
  
  // Tabla de hongos seleccionados
  hongosTable: Array<{tipoHongo: string, repeticion: number | null, valor: number | null, incidencia: number | null}> = [];
  
  // Control del dropdown personalizado
  isHongosDropdownOpen: boolean = false;
  hongosSearchText: string = '';
  
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

}

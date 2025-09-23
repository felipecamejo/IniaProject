import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/AuthService';


@Component({
  selector: 'app-listado-lotes.component',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule],
  templateUrl: './listado-lotes.component.html',
  styleUrl: './listado-lotes.component.scss'
})
export class ListadoLotesComponent {
    metodos = [
      { label: 'Pendiente', id: 1 },
      { label: 'Finalizado', id: 2 },
    ];

    selectedMetodo: string = '';
    selectedMes: string = '';
    selectedAnio: string = '';
    searchText: string = '';

    meses = [
      { label: 'Enero', id: 1 },
      { label: 'Febrero', id: 2 },
      { label: 'Marzo', id: 3 },
      { label: 'Abril', id: 4 },
      { label: 'Mayo', id: 5 },
      { label: 'Junio', id: 6 },
      { label: 'Julio', id: 7 },
      { label: 'Agosto', id: 8 },
      { label: 'Septiembre', id: 9 },
      { label: 'Octubre', id: 10 },
      { label: 'Noviembre', id: 11 },
      { label: 'Diciembre', id: 12 }
    ];

    anios = [
      { label: '2020', id: 2020 },
      { label: '2021', id: 2021 },
      { label: '2022', id: 2022 },
      { label: '2023', id: 2023 },
      { label: '2024', id: 2024 }
    ];

    Lotes = [
      { nombre: 'Lote 1', estado: 'Pendiente', fecha: '15-01-2023', descripcion: '', autor: 'Juan Perez' },
      { nombre: 'Lote 2', estado: 'Finalizado', fecha: '20-02-2022', descripcion: 'Lote especial', autor: 'Maria Gomez' },
      { nombre: 'Lote 3', estado: 'Finalizado', fecha: '10-03-2023', descripcion: '', autor: 'Carlos Ruiz' }
    ];

    // Propiedad computada para obtener lotes filtrados
    get lotesFiltrados() {
      return this.Lotes.filter(lote => {
        // Filtro por nombre (búsqueda de texto)
        const cumpleNombre = !this.searchText || 
          lote.nombre.toLowerCase().includes(this.searchText.toLowerCase());
        
        // Filtro por estado
        const cumpleEstado = !this.selectedMetodo || lote.estado === this.getEstadoLabel(this.selectedMetodo);
        
        // Filtro por mes
        const cumpleMes = !this.selectedMes || this.getMesFromFecha(lote.fecha) === parseInt(this.selectedMes);
        
        // Filtro por año
        const cumpleAnio = !this.selectedAnio || this.getAnioFromFecha(lote.fecha) === parseInt(this.selectedAnio);
        
        return cumpleNombre && cumpleEstado && cumpleMes && cumpleAnio;
      });
    }

    // Función para obtener el label del estado por ID
    getEstadoLabel(estadoId: string): string {
      const estado = this.metodos.find(m => m.id === parseInt(estadoId));
      return estado ? estado.label : '';
    }

    // Función para extraer el mes de la fecha (formato DD-MM-YYYY)
    getMesFromFecha(fecha: string): number {
      const partes = fecha.split('-');
      return parseInt(partes[1]); // El mes está en la posición 1
    }

    // Función para extraer el año de la fecha (formato DD-MM-YYYY)
    getAnioFromFecha(fecha: string): number {
      const partes = fecha.split('-');
      return parseInt(partes[2]); // El año está en la posición 2
    }

    onAnioChange() {
      this.selectedMes = '';
    }
}

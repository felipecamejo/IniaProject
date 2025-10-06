import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/AuthService';
import { LoteDto } from '../../../models/Lote.dto';


@Component({
  selector: 'app-listado-lotes.component',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, DialogModule],
  templateUrl: './listado-lotes.component.html',
  styleUrl: './listado-lotes.component.scss'
})
export class ListadoLotesComponent {
    constructor(private router: Router, private authService: AuthService) {}

    metodos = [
      { label: 'Pendiente', id: 1 },
      { label: 'Finalizado', id: 2 },
    ];

    selectedMetodo: string = '';
    selectedMes: string = '';
    selectedAnio: string = '';
    searchText: string = '';

    // Variables para el modal
    mostrarModal: boolean = false;
    modalNombre: string = '';
    modalDescripcion: string = '';
    modalLoading: boolean = false;
    modalError: string = '';
    modalTitulo: string = 'Crear Lote';
    modalBotonTexto: string = 'Crear Lote';
    itemEditando: any = null;
    itemEditandoId: number | null = null;

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

    items = [
      { nombre: 'Lote 1', estado: 'Pendiente', fecha: '15-01-2023', descripcion: '', autor: 'Juan Perez' },
      { nombre: 'Lote 2', estado: 'Finalizado', fecha: '20-02-2022', descripcion: 'Lote especial', autor: 'Maria Gomez' },
      { nombre: 'Lote 3', estado: 'Finalizado', fecha: '10-03-2023', descripcion: '', autor: 'Carlos Ruiz' }
    ];

    get itemsFiltrados() {
      return this.items.filter(item => {

        const cumpleNombre = !this.searchText || 
          item.nombre.toLowerCase().includes(this.searchText.toLowerCase());
        
        const cumpleEstado = !this.selectedMetodo || item.estado === this.getEstadoLabel(this.selectedMetodo);
        
        const cumpleMes = !this.selectedMes || this.getMesFromFecha(item.fecha) === parseInt(this.selectedMes);
        
        const cumpleAnio = !this.selectedAnio || this.getAnioFromFecha(item.fecha) === parseInt(this.selectedAnio);
        
        return cumpleNombre && cumpleEstado && cumpleMes && cumpleAnio;
      });
    }

    getEstadoLabel(estadoId: string): string {
      const estado = this.metodos.find(m => m.id === parseInt(estadoId));
      return estado ? estado.label : '';
    }

    getMesFromFecha(fecha: string): number {
      const partes = fecha.split('-');
      return parseInt(partes[1]); // El mes está en la posición 1
    }

    getAnioFromFecha(fecha: string): number {
      const partes = fecha.split('-');
      return parseInt(partes[2]); // El año está en la posición 2
    }

    onAnioChange() {
      this.selectedMes = '';
    }

    goToHome() {
      this.router.navigate(['/home']);
    }

    abrirModal() {
      this.modalNombre = '';
      this.modalDescripcion = '';
      this.modalError = '';
      this.modalTitulo = 'Crear Lote';
      this.modalBotonTexto = 'Crear Lote';
      this.itemEditando = null;
      this.itemEditandoId = null;
      this.mostrarModal = true;
    }

    abrirModalEdicion(item: any) {
      this.modalNombre = item.nombre;
      this.modalDescripcion = item.descripcion || '';
      this.modalError = '';
      this.modalTitulo = 'Editar Lote';
      this.modalBotonTexto = 'Actualizar Lote';
      this.itemEditando = item;
      this.itemEditandoId = item.id;
      this.mostrarModal = true;
    }

    cerrarModal() {
      this.mostrarModal = false;
    }

    onSubmitModal(form: any) {
      if (form.invalid || this.modalLoading) return;
      
      this.modalLoading = true;
      this.modalError = '';

      const lote = { 
        id: this.itemEditandoId,
        nombre: this.modalNombre,
        descripcion: this.modalDescripcion,
        estado: 'Pendiente',
        fecha: new Date().toLocaleDateString('es-ES'),
        autor: 'Usuario Actual' // Esto debería venir del servicio de autenticación
      };

      if (this.itemEditando) {
        // Editar lote existente
        const index = this.items.findIndex(item => item.nombre === this.itemEditando.nombre);
        if (index !== -1) {
          this.items[index] = { ...this.items[index], ...lote };
        }
        console.log('Lote editado:', lote);
      } else {
        // Crear nuevo lote
        this.items.push(lote);
        console.log('Nuevo lote creado:', lote);
      }

      this.modalLoading = false;
      this.cerrarModal();
    }

    editarItemModal(lote: any) {
      this.abrirModalEdicion(lote);
    }

    eliminarItem(lote: any) {
      if (confirm(`¿Estás seguro de que deseas eliminar el lote "${lote.nombre}"?`)) {
        const index = this.items.findIndex(item => item.nombre === lote.nombre);
        if (index !== -1) {
          this.items.splice(index, 1);
        }
        console.log('Lote eliminado:', lote);
      }
    }
}

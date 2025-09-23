import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/AuthService';
import { MalezaDto } from '../../../models/Maleza.dto';

@Component({
  selector: 'app-listado-malezas.component',
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, DialogModule],
  templateUrl: './listado-malezas.component.html',
  styleUrls: ['./listado-malezas.component.scss']
})
export class ListadoMalezasComponent {
    constructor(private router: Router, private authService: AuthService) {}

    searchText: string = '';

    // Variables para el modal
    mostrarModal: boolean = false;
    modalNombre: string = '';
    modalDescripcion: string = '';
    modalLoading: boolean = false;
    modalError: string = '';
    modalTitulo: string = 'Crear Maleza';
    modalBotonTexto: string = 'Crear Maleza';
    itemEditando: any = null;
    itemEditandoId: number | null = null;

    items: MalezaDto[] = [
      { id: 1, nombre: 'Maleza A', descripcion: 'Descripción de Maleza A', activo: true },
      { id: 2, nombre: 'Maleza B', descripcion: 'Descripción de Maleza B', activo: true },
      { id: 3, nombre: 'Maleza C', descripcion: 'Descripción de Maleza C', activo: true },
    ];

    get itemsFiltrados() {
      return this.items.filter(item => {

        const cumpleNombre = !this.searchText || 
          item.nombre.toLowerCase().includes(this.searchText.toLowerCase());
        
       
        return cumpleNombre;
      });
    }

    crearMaleza() {
      
      const dto: MalezaDto = { 
        id: null, nombre: this.modalNombre, descripcion: this.modalDescripcion, activo: true
      };
      console.log('Crear nueva maleza', dto);

    }

    abrirModal() {
      this.modalNombre = '';
      this.modalDescripcion = '';
      this.modalError = '';
      this.modalTitulo = 'Crear Maleza';
      this.modalBotonTexto = 'Crear Maleza';
      this.itemEditando = null;
      this.itemEditandoId = null;
      this.mostrarModal = true;
    }

    abrirModalEdicion(item: any) {
      this.modalNombre = item.nombre;
      this.modalDescripcion = item.descripcion || '';
      this.modalError = '';
      this.modalTitulo = 'Editar Maleza';
      this.modalBotonTexto = 'Actualizar Maleza';
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

      //(reemplaza esto con tu lógica real)
      
        
      this.modalLoading = false;
      this.cerrarModal();
    
    }

    goToHome() {
      this.router.navigate(['/home']);
    }

    editarItem(maleza: any) {
      this.abrirModalEdicion(maleza);
    }

    eliminarItem(maleza: any) {
      // Función para eliminar maleza
      console.log('Eliminar maleza:', maleza);
      // Aquí puedes agregar la lógica para eliminar la maleza
      // Por ejemplo, mostrar un diálogo de confirmación
      if (confirm(`¿Estás seguro de que deseas eliminar la maleza "${maleza.nombre}"?`)) {
        
      }
    }
}

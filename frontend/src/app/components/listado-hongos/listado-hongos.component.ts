import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/AuthService';
import { HongoDto } from '../../../models/Hongo.dto';

@Component({
  selector: 'app-listado-hongos.component',
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, DialogModule],
  templateUrl: './listado-hongos.component.html',
  styleUrls: ['./listado-hongos.component.scss']
})
export class ListadoHongosComponent {
    constructor(private router: Router, private authService: AuthService) {}

    searchText: string = '';

    // Variables para el modal
    mostrarModal: boolean = false;
    modalNombre: string = '';
    modalDescripcion: string = '';
    modalLoading: boolean = false;
    modalError: string = '';
    modalTitulo: string = 'Crear Hongo';
    modalBotonTexto: string = 'Crear Hongo';
    itemEditando: any = null;
    itemEditandoId: number | null = null;

    items: HongoDto[] = [
      { id: 1, nombre: 'Hongo A', descripcion: 'Descripción de Hongo A', activo: true },
      { id: 2, nombre: 'Hongo B', descripcion: 'Descripción de Hongo B', activo: true },
      { id: 3, nombre: 'Hongo C', descripcion: 'Descripción de Hongo C', activo: true },
    ];

    get itemsFiltrados() {
      return this.items.filter(item => {

        const cumpleNombre = !this.searchText || 
          item.nombre.toLowerCase().includes(this.searchText.toLowerCase());
        
       
        return cumpleNombre;
      });
    }

    crearItem() {
      
      const dto: HongoDto = { 
        id: null, nombre: this.modalNombre, descripcion: this.modalDescripcion, activo: true
      };
      console.log('Crear nuevo hongo', dto);

    }

    abrirModal() {
      this.modalNombre = '';
      this.modalDescripcion = '';
      this.modalError = '';
      this.modalTitulo = 'Crear Hongo';
      this.modalBotonTexto = 'Crear Hongo';
      this.itemEditando = null;
      this.itemEditandoId = null;
      this.mostrarModal = true;
    }

    abrirModalEdicion(item: any) {
      this.modalNombre = item.nombre;
      this.modalDescripcion = item.descripcion || '';
      this.modalError = '';
      this.modalTitulo = 'Editar Hongo';
      this.modalBotonTexto = 'Actualizar Hongo';
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

    eliminarItem(hongo: any) {
      // Función para eliminar hongo
      console.log('Eliminar Hongo:', hongo);
      // Aquí puedes agregar la lógica para eliminar el hongo
      // Por ejemplo, mostrar un diálogo de confirmación
      if (confirm(`¿Estás seguro de que deseas eliminar el hongo "${hongo.nombre}"?`)) {

      }
    }
}

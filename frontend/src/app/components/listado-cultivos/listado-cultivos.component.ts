import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/AuthService';
import { CultivoDto } from '../../../models/Cultivo.dto';

@Component({
  selector: 'app-listado-cultivos.component',
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, DialogModule],
  templateUrl: './listado-cultivos.component.html',
  styleUrls: ['./listado-cultivos.component.scss']
})
export class ListadoCultivosComponent {
    constructor(private router: Router, private authService: AuthService) {}

    searchText: string = '';

    // Variables para el modal
    mostrarModal: boolean = false;
    modalNombre: string = '';
    modalDescripcion: string = '';
    modalLoading: boolean = false;
    modalError: string = '';
    modalTitulo: string = 'Crear Cultivo';
    modalBotonTexto: string = 'Crear Cultivo';
    itemEditando: any = null;
    itemEditandoId: number | null = null;

    items: CultivoDto[] = [
      { id: 1, nombre: 'Cultivo A', descripcion: 'Descripción de Cultivo A', activo: true },
      { id: 2, nombre: 'Cultivo B', descripcion: 'Descripción de Cultivo B', activo: true },
      { id: 3, nombre: 'Cultivo C', descripcion: 'Descripción de Cultivo C', activo: true },
    ];

    get itemsFiltrados() {
      return this.items.filter(item => {

        const cumpleNombre = !this.searchText || 
          item.nombre.toLowerCase().includes(this.searchText.toLowerCase());
        
       
        return cumpleNombre;
      });
    }

    crearItem() {

      const dto: CultivoDto = {
        id: null, nombre: this.modalNombre, descripcion: this.modalDescripcion, activo: true
      };
      console.log('Crear nuevo cultivo', dto);

    }

    abrirModal() {
      this.modalNombre = '';
      this.modalDescripcion = '';
      this.modalError = '';
      this.modalTitulo = 'Crear Cultivo';
      this.modalBotonTexto = 'Crear Cultivo';
      this.itemEditando = null;
      this.itemEditandoId = null;
      this.mostrarModal = true;
    }

    abrirModalEdicion(item: any) {
      this.modalNombre = item.nombre;
      this.modalDescripcion = item.descripcion || '';
      this.modalError = '';
      this.modalTitulo = 'Editar Cultivo';
      this.modalBotonTexto = 'Actualizar Cultivo';
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

    eliminarItem(cultivo: any) {
      // Función para eliminar cultivo
      console.log('Eliminar Cultivo:', cultivo);
      // Aquí puedes agregar la lógica para eliminar el cultivo
      // Por ejemplo, mostrar un diálogo de confirmación
      if (confirm(`¿Estás seguro de que deseas eliminar el Cultivo "${cultivo.nombre}"?`)) {

      }
    }
}

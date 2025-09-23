import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/AuthService';

@Component({
  selector: 'app-listado-malezas.component',
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, DialogModule],
  templateUrl: './listado-malezas.component.html',
  styleUrls: ['./listado-malezas.component.scss']
})
export class ListadoMalezasComponent {
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
    modalTitulo: string = 'Crear Maleza';
    modalBotonTexto: string = 'Crear Maleza';
    malezaEditando: any = null;
    malezaEditandoId: number | null = null;

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
      { id: 1, nombre: 'Maleza 1', descripcion: 'Descripcion de maleza 1'},
      { id: 2, nombre: 'Maleza 2', descripcion: 'Descripcion de maleza 2'},
      { id: 3, nombre: 'Maleza 3', descripcion: 'Descripcion de maleza 3'}
    ];

    get itemsFiltrados() {
      return this.items.filter(item => {

        const cumpleNombre = !this.searchText || 
          item.nombre.toLowerCase().includes(this.searchText.toLowerCase());
        
       
        return cumpleNombre;
      });
    }

    crearMaleza() {
      // Función para crear nueva maleza
      console.log('Crear nueva maleza');
      // Aquí puedes agregar la lógica para navegar a un formulario de creación
      // this.router.navigate(['/crear-maleza']);
    }

    abrirModal() {
      this.mostrarModal = true;
      this.modalNombre = '';
      this.modalDescripcion = '';
      this.modalError = '';
      this.modalTitulo = 'Crear Maleza';
      this.modalBotonTexto = 'Crear Maleza';
      this.malezaEditando = null;
      this.malezaEditandoId = null;
    }

    abrirModalEdicion(maleza: any) {
      this.mostrarModal = true;
      this.modalNombre = maleza.nombre;
      this.modalDescripcion = maleza.descripcion || '';
      this.modalError = '';
      this.modalTitulo = 'Editar Maleza';
      this.modalBotonTexto = 'Actualizar Maleza';
      this.malezaEditando = maleza;
      this.malezaEditandoId = maleza.id;
    }

    cerrarModal() {
      this.mostrarModal = false;
      this.modalNombre = '';
      this.modalDescripcion = '';
      this.modalError = '';
      this.modalLoading = false;
      this.modalTitulo = 'Crear Maleza';
      this.modalBotonTexto = 'Crear Maleza';
      this.malezaEditando = null;
      this.malezaEditandoId = null;
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
      // Abrir modal con datos precargados para editar
      this.abrirModalEdicion(maleza);
    }

    eliminarItem(maleza: any) {
      // Función para eliminar maleza
      console.log('Eliminar maleza:', maleza);
      // Aquí puedes agregar la lógica para eliminar la maleza
      // Por ejemplo, mostrar un diálogo de confirmación
      if (confirm(`¿Estás seguro de que deseas eliminar la maleza "${maleza.nombre}"?`)) {
        const index = this.items.indexOf(maleza);
        if (index > -1) {
          this.items.splice(index, 1);
          console.log('Maleza eliminada correctamente');
        }
      }
    }
}

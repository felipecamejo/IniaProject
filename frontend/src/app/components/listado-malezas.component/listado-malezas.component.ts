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
      { nombre: 'Maleza 1', descripcion: 'Descripcion de maleza 1'},
      { nombre: 'Maleza 2', descripcion: 'Descripcion de maleza 2'},
      { nombre: 'Maleza 3', descripcion: 'Descripcion de maleza 3'}
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
    }

    cerrarModal() {
      this.mostrarModal = false;
      this.modalNombre = '';
      this.modalDescripcion = '';
      this.modalError = '';
      this.modalLoading = false;
    }

    onSubmitModal(form: any) {
      if (form.invalid || this.modalLoading) return;
      
      this.modalLoading = true;
      this.modalError = '';

      this.authService.login({ email: this.modalNombre, password: this.modalDescripcion }).subscribe({
        next: () => {
          this.modalLoading = false;
          this.cerrarModal();
          // Aquí puedes agregar la lógica para crear la maleza después del login exitoso
          console.log('Login exitoso, procediendo a crear maleza');
        },
        error: () => {
          this.modalLoading = false;
          this.modalError = 'Credenciales inválidas. Intenta nuevamente.';
        }
      });
    }

    goToHome() {
      this.router.navigate(['/home']);
    }
}

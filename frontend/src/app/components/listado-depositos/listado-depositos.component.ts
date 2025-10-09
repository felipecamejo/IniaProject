import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/AuthService';
import { DepositoDto } from '../../../models/Deposito.dto';
import { DepositoService } from '../../../services/DepositoService';

@Component({
  selector: 'app-listado-depositos.component',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, DialogModule],
  templateUrl: './listado-depositos.component.html',
  styleUrls: ['./listado-depositos.component.scss']
})
export class ListadoDepositosComponent {
    constructor(private router: Router, private authService: AuthService, private depositoService: DepositoService) {}

    searchText: string = '';

    // Variables para el modal
    mostrarModal: boolean = false;
    modalNombre: string = '';
    modalLoading: boolean = false;
    modalError: string = '';
    modalTitulo: string = 'Crear Depósito';
    modalBotonTexto: string = 'Crear Depósito';
    itemEditando: any = null;
    itemEditandoId: number | null = null;

    items: DepositoDto[] = [
      { id: 1, nombre: 'Depósito A', activo: true },
      { id: 2, nombre: 'Depósito B', activo: true },
      { id: 3, nombre: 'Depósito C', activo: true },
    ];

    get itemsFiltrados() {
      return this.items.filter(item => {
        const cumpleNombre = !this.searchText || 
          item.nombre.toLowerCase().includes(this.searchText.toLowerCase());
        return cumpleNombre;
      });
    }

    abrirModal() {
      this.modalNombre = '';
      this.modalError = '';
      this.modalTitulo = 'Crear Depósito';
      this.modalBotonTexto = 'Crear Depósito';
      this.itemEditando = null;
      this.itemEditandoId = null;
      this.mostrarModal = true;
    }

    abrirModalEdicion(item: any) {
      this.modalNombre = item.nombre;
      this.modalError = '';
      this.modalTitulo = 'Editar Depósito';
      this.modalBotonTexto = 'Actualizar Depósito';
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

      const deposito: DepositoDto = { 
        id: this.itemEditandoId,
        nombre: this.modalNombre,
        activo: true
      };

      if (this.itemEditando) {
        // Editar depósito existente
        this.depositoService.editarDeposito(deposito).subscribe({
          next: (msg) => {
            console.log(msg);
            this.modalLoading = false;
            this.cerrarModal();
            // Actualizar la lista local
            const index = this.items.findIndex(item => item.id === deposito.id);
            if (index !== -1) {
              this.items[index] = deposito;
            }
          },
          error: (err) => {
            console.error('Error editando depósito', err);
            this.modalError = 'Error al actualizar el depósito';
            this.modalLoading = false;
          }
        });
      } else {
        // Crear nuevo depósito
        this.depositoService.crearDeposito(deposito).subscribe({
          next: (response) => {
            console.log(response);
            this.modalLoading = false;
            this.cerrarModal();
            // Agregar a la lista local
            this.items.push({ ...deposito, id: this.items.length + 1 });
          },
          error: (err) => {
            console.error('Error creando depósito', err);
            this.modalError = 'Error al crear el depósito';
            this.modalLoading = false;
          }
        });
      }
    }

    goToHome() {
      this.router.navigate(['/home']);
    }

    editarItemModal(deposito: any) {
      // Editar usando el modal
      this.abrirModalEdicion(deposito);
    }

    eliminarItem(deposito: any) {
      if (confirm(`¿Estás seguro de que deseas eliminar el depósito "${deposito.nombre}"?`)) {
        // Aquí puedes agregar la lógica para eliminar el depósito
        console.log('Eliminar Depósito:', deposito);
        // Ejemplo de eliminación local
        const index = this.items.findIndex(item => item.id === deposito.id);
        if (index !== -1) {
          this.items.splice(index, 1);
        }
      }
    }
}

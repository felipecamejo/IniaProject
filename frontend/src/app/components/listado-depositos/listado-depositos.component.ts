import { Component, ViewEncapsulation, OnInit } from '@angular/core';
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
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-listado-depositos.component',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, DialogModule, ConfirmDialogComponent],
  templateUrl: './listado-depositos.component.html',
  styleUrls: ['./listado-depositos.component.scss']
})
export class ListadoDepositosComponent implements OnInit {
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

    items: DepositoDto[] = [];
    loading: boolean = false;
    error: string = '';

    // Popup de confirmación de eliminación
    mostrarConfirmEliminar: boolean = false;
    depositoAEliminar: DepositoDto | null = null;
    confirmLoading: boolean = false;

    get itemsFiltrados() {
      return this.items.filter(item => {
        const cumpleNombre = !this.searchText || 
          item.nombre.toLowerCase().includes(this.searchText.toLowerCase());
        return cumpleNombre;
      });
    }

    ngOnInit(): void {
      this.cargarListado();
    }

    cargarListado() {
      this.loading = true;
      this.error = '';
      this.depositoService.listarDepositos().subscribe({
        next: (data) => {
          this.items = data || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Error listando depósitos', err);
          this.error = 'No se pudo cargar el listado de depósitos';
          this.loading = false;
        }
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
            console.log('Depósito editado:', msg);
            this.modalLoading = false;
            this.cerrarModal();
            this.cargarListado(); // Recargar la lista completa
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
            console.log('Depósito creado:', response);
            this.modalLoading = false;
            this.cerrarModal();
            this.cargarListado(); // Recargar la lista completa
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

    eliminarItem(deposito: DepositoDto) {
      this.depositoAEliminar = deposito;
      this.mostrarConfirmEliminar = true;
    }

    confirmarEliminacion() {
      const deposito = this.depositoAEliminar;
      if (!deposito || deposito.id == null) return;
      this.confirmLoading = true;
      this.depositoService.eliminarDeposito(deposito.id).subscribe({
        next: (response: string) => {
          console.log('Depósito eliminado:', response);
          this.confirmLoading = false;
          this.mostrarConfirmEliminar = false;
          this.depositoAEliminar = null;
          this.cargarListado();
        },
        error: (error: any) => {
          console.error('Error al eliminar depósito:', error);
          this.confirmLoading = false;
          this.mostrarConfirmEliminar = false;
          this.depositoAEliminar = null;
          alert('Error al eliminar el depósito. Por favor, inténtalo de nuevo.');
        }
      });
    }

    cancelarEliminacion() {
      this.mostrarConfirmEliminar = false;
      this.depositoAEliminar = null;
    }
}

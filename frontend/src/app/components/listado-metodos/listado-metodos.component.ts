import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../services/AuthService';
import { MetodoDto } from '../../../models/Metodo.dto';
import { MetodoService } from '../../../services/MetodoService';

@Component({
  selector: 'app-listado-metodos.component',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, DialogModule],
  templateUrl: './listado-metodos.component.html',
  styleUrls: ['./listado-metodos.component.scss']
})
export class ListadoMetodosComponent implements OnInit, OnDestroy {
    constructor(private router: Router, private authService: AuthService, private metodoService: MetodoService) {}

    searchText: string = '';

    // Variables para el modal
    mostrarModal: boolean = false;
    modalNombre: string = '';
    modalAutor: string = '';
    modalDescripcion: string = '';
    modalLoading: boolean = false;
    modalError: string = '';
    modalTitulo: string = 'Crear Método';
    modalBotonTexto: string = 'Crear Método';
    itemEditando: any = null;
    itemEditandoId: number | null = null;

    items: MetodoDto[] = [];
    loading: boolean = false;
    error: string = '';
    private navigationSubscription: any;

    // Popup de confirmación de eliminación
    mostrarConfirmEliminar: boolean = false;
    metodoAEliminar: MetodoDto | null = null;
    confirmLoading: boolean = false;

    get itemsFiltrados() {
      return this.items.filter(item => {
        const q = (this.searchText || '').toLowerCase();
        if (!q) return true;
        return (
          item.nombre.toLowerCase().includes(q) ||
          (item.autor || '').toLowerCase().includes(q) ||
          (item.descripcion || '').toLowerCase().includes(q)
        );
      });
    }

    ngOnInit(): void {
      this.cargarListado();
      this.navigationSubscription = this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          if (event.url === '/listado-metodos') {
            this.cargarListado();
          }
        });
    }

    ngOnDestroy(): void {
      if (this.navigationSubscription) {
        this.navigationSubscription.unsubscribe();
      }
    }

    cargarListado() {
      this.loading = true;
      this.error = '';
      this.metodoService.listar().subscribe({
        next: (data) => {
          this.items = data || [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Error listando métodos', err);
          this.error = 'No se pudo cargar el listado de métodos';
          this.loading = false;
        }
      });
    }

    abrirModal() {
      this.modalNombre = '';
      this.modalAutor = '';
      this.modalDescripcion = '';
      this.modalError = '';
      this.modalTitulo = 'Crear Método';
      this.modalBotonTexto = 'Crear Método';
      this.itemEditando = null;
      this.itemEditandoId = null;
      this.mostrarModal = true;
    }

    abrirModalEdicion(item: any) {
      this.modalNombre = item.nombre;
      this.modalAutor = item.autor || '';
      this.modalDescripcion = item.descripcion || '';
      this.modalError = '';
      this.modalTitulo = 'Editar Método';
      this.modalBotonTexto = 'Actualizar Método';
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

      // Validaciones del frontend para evitar errores 400 del backend
      if (!this.modalNombre || this.modalNombre.trim() === '') {
        this.modalError = 'El nombre del método es obligatorio';
        this.modalLoading = false;
        return;
      }

      if (this.modalNombre.match(/\d/)) {
        this.modalError = 'El nombre del método no puede contener números';
        this.modalLoading = false;
        return;
      }

      if (!this.modalAutor || this.modalAutor.trim() === '') {
        this.modalError = 'El autor del método es obligatorio';
        this.modalLoading = false;
        return;
      }

      const metodo: MetodoDto = { 
        id: this.itemEditandoId,
        nombre: this.modalNombre.trim(),
        autor: this.modalAutor.trim(),
        descripcion: this.modalDescripcion?.trim() || '',
        activo: true
      };

      if (this.itemEditando) {
        // Editar método existente
        this.metodoService.editar(metodo).subscribe({
          next: (msg) => {
            console.log('Método editado:', msg);
            this.modalLoading = false;
            this.cerrarModal();
            this.cargarListado(); // Recargar la lista completa
          },
          error: (err) => {
            console.error('Error editando método', err);
            // Mostrar mensaje específico del backend si está disponible
            this.modalError = err.error || 'Error al actualizar el método';
            this.modalLoading = false;
          }
        });
      } else {
        // Crear nuevo método
        this.metodoService.crear(metodo).subscribe({
          next: (response) => {
            console.log('Método creado:', response);
            this.modalLoading = false;
            this.cerrarModal();
            this.cargarListado(); // Recargar la lista completa
          },
          error: (err) => {
            console.error('Error creando método', err);
            // Mostrar mensaje específico del backend si está disponible
            this.modalError = err.error || 'Error al crear el método';
            this.modalLoading = false;
          }
        });
      }
    }

    goToHome() {
      this.router.navigate(['/home']);
    }

    editarItemModal(item: any) {
      // Editar usando el modal
      this.abrirModalEdicion(item);
    }

    eliminarItem(item: MetodoDto) {
      this.metodoAEliminar = item;
      this.mostrarConfirmEliminar = true;
    }

    confirmarEliminacion() {
      const metodo = this.metodoAEliminar;
      if (!metodo || metodo.id == null) return;
      this.confirmLoading = true;
      this.metodoService.eliminar(metodo.id).subscribe({
        next: (response: string) => {
          console.log('Método eliminado:', response);
          this.confirmLoading = false;
          this.mostrarConfirmEliminar = false;
          this.metodoAEliminar = null;
          this.cargarListado();
        },
        error: (error: any) => {
          console.error('Error al eliminar método:', error);
          this.confirmLoading = false;
          this.mostrarConfirmEliminar = false;
          this.metodoAEliminar = null;
          alert('Error al eliminar el método. Por favor, inténtalo de nuevo.');
        }
      });
    }

    cancelarEliminacion() {
      this.mostrarConfirmEliminar = false;
      this.metodoAEliminar = null;
    }
}

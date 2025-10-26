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
import { HongoDto } from '../../../models/Hongo.dto';
import { HongoService } from '../../../services/HongoService';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-listado-hongos.component',
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, DialogModule, ConfirmDialogComponent],
  templateUrl: './listado-hongos.component.html',
  styleUrls: ['./listado-hongos.component.scss']
})
export class ListadoHongosComponent implements OnInit, OnDestroy {
    constructor(private router: Router, private authService: AuthService, private hongoService: HongoService) {}

    searchText: string = '';
    private navigationSubscription: any;

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

    items: HongoDto[] = [];

    // Popup de confirmación de eliminación
    mostrarConfirmEliminar: boolean = false;
    hongoAEliminar: HongoDto | null = null;
    confirmLoading: boolean = false;

    ngOnInit(): void {
        this.cargarHongos();
        
        // Suscribirse a cambios de navegación para recargar cuando se regrese
        this.navigationSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                if (event.url === '/listado-hongos') {
                    this.cargarHongos();
                }
            });
    }

    ngOnDestroy(): void {
        if (this.navigationSubscription) {
            this.navigationSubscription.unsubscribe();
        }
    }

    cargarHongos(): void {
        this.hongoService.listar().subscribe({
            next: (response) => {
                this.items = response?.hongos ?? [];
            },
            error: (error) => {
                console.error('Error al listar hongos', error);
                this.items = [];
            }
        });
    }

    get itemsFiltrados() {
      return this.items.filter(item => {

        const cumpleNombre = !this.searchText || 
          item.nombre.toLowerCase().includes(this.searchText.toLowerCase());
        
       
        return cumpleNombre;
      });
    }

    crearItem() {
      const dto: HongoDto = { 
        id: 0, nombre: this.modalNombre, descripcion: this.modalDescripcion, activo: true
      };
      
      this.hongoService.crear(dto).subscribe({
        next: (response) => {
          console.log('Hongo creado:', response);
          this.cargarHongos();
        },
        error: (error) => {
          console.error('Error al crear hongo:', error);
        }
      });
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

      const hongo: HongoDto = { 
        id: this.itemEditandoId ?? 0,
        nombre: this.modalNombre,
        descripcion: this.modalDescripcion,
        activo: true
      };

      if (this.itemEditando) {
        // Editar hongo existente
        this.hongoService.editar(hongo).subscribe({
          next: (response) => {
            console.log('Hongo editado:', response);
            this.modalLoading = false;
            this.cerrarModal();
            this.cargarHongos();
          },
          error: (error) => {
            console.error('Error al editar hongo:', error);
            this.modalError = 'Error al actualizar el hongo';
            this.modalLoading = false;
          }
        });
      } else {
        // Crear nuevo hongo
        this.hongoService.crear(hongo).subscribe({
          next: (response) => {
            console.log('Hongo creado:', response);
            this.modalLoading = false;
            this.cerrarModal();
            this.cargarHongos();
          },
          error: (error) => {
            console.error('Error al crear hongo:', error);
            this.modalError = 'Error al crear el hongo';
            this.modalLoading = false;
          }
        });
      }
    }

    goToHome() {
      this.router.navigate(['/home']);
    }

    editarItem(maleza: any) {
      this.abrirModalEdicion(maleza);
    }

    eliminarItem(hongo: HongoDto) {
      this.hongoAEliminar = hongo;
      this.mostrarConfirmEliminar = true;
    }

    confirmarEliminacion() {
      const hongo = this.hongoAEliminar;
      if (!hongo || hongo.id == null) return;
      this.confirmLoading = true;
      this.hongoService.eliminar(hongo.id).subscribe({
        next: (response) => {
          console.log('Hongo eliminado:', response);
          this.confirmLoading = false;
          this.mostrarConfirmEliminar = false;
          this.hongoAEliminar = null;
          this.cargarHongos();
        },
        error: (error) => {
          console.error('Error al eliminar hongo:', error);
          this.confirmLoading = false;
          this.mostrarConfirmEliminar = false;
          this.hongoAEliminar = null;
          alert('Error al eliminar el hongo');
        }
      });
    }

    cancelarEliminacion() {
      this.mostrarConfirmEliminar = false;
      this.hongoAEliminar = null;
    }
}

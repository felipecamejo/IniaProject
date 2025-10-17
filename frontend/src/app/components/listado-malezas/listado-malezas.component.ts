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
import { MalezaDto } from '../../../models/Maleza.dto';
import { MalezaService } from '../../../services/MalezaService';

@Component({
  selector: 'app-listado-malezas.component',
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, DialogModule],
  templateUrl: './listado-malezas.component.html',
  styleUrls: ['./listado-malezas.component.scss']
})
export class ListadoMalezasComponent implements OnInit, OnDestroy {
    constructor(private router: Router, private authService: AuthService, private malezaService: MalezaService) {}

    searchText: string = '';
    private navigationSubscription: any;

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

    items: MalezaDto[] = [];

    // Popup de confirmación de eliminación
    mostrarConfirmEliminar: boolean = false;
    malezaAEliminar: MalezaDto | null = null;
    confirmLoading: boolean = false;

    ngOnInit(): void {
        this.cargarMalezas();
        
        // Suscribirse a cambios de navegación para recargar cuando se regrese
        this.navigationSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                if (event.url === '/listado-malezas') {
                    this.cargarMalezas();
                }
            });
    }

    ngOnDestroy(): void {
        if (this.navigationSubscription) {
            this.navigationSubscription.unsubscribe();
        }
    }

    cargarMalezas(): void {
        this.malezaService.listar().subscribe({
            next: (response) => {
                this.items = response?.malezas ?? [];
            },
            error: (error) => {
                console.error('Error al listar malezas', error);
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

    crearMaleza() {
      const dto: MalezaDto = { 
        id: 0, nombre: this.modalNombre, descripcion: this.modalDescripcion, activo: true
      };
      
      this.malezaService.crear(dto).subscribe({
        next: (response) => {
          console.log('Maleza creada:', response);
          this.cargarMalezas();
        },
        error: (error) => {
          console.error('Error al crear maleza:', error);
        }
      });
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

      const maleza: MalezaDto = { 
        id: this.itemEditandoId ?? 0,
        nombre: this.modalNombre,
        descripcion: this.modalDescripcion,
        activo: true
      };

      if (this.itemEditando) {
        // Editar maleza existente
        this.malezaService.editar(maleza).subscribe({
          next: (response) => {
            console.log('Maleza editada:', response);
            this.modalLoading = false;
            this.cerrarModal();
            this.cargarMalezas();
          },
          error: (error) => {
            console.error('Error al editar maleza:', error);
            this.modalError = 'Error al actualizar la maleza';
            this.modalLoading = false;
          }
        });
      } else {
        // Crear nueva maleza
        this.malezaService.crear(maleza).subscribe({
          next: (response) => {
            console.log('Maleza creada:', response);
            this.modalLoading = false;
            this.cerrarModal();
            this.cargarMalezas();
          },
          error: (error) => {
            console.error('Error al crear maleza:', error);
            this.modalError = 'Error al crear la maleza';
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

    eliminarItem(maleza: MalezaDto) {
      this.malezaAEliminar = maleza;
      this.mostrarConfirmEliminar = true;
    }

    confirmarEliminacion() {
      const maleza = this.malezaAEliminar;
      if (!maleza || maleza.id == null) return;
      this.confirmLoading = true;
      this.malezaService.eliminar(maleza.id).subscribe({
        next: (response) => {
          console.log('Maleza eliminada:', response);
          this.confirmLoading = false;
          this.mostrarConfirmEliminar = false;
          this.malezaAEliminar = null;
          this.cargarMalezas();
        },
        error: (error) => {
          console.error('Error al eliminar maleza:', error);
          this.confirmLoading = false;
          this.mostrarConfirmEliminar = false;
          this.malezaAEliminar = null;
          alert('Error al eliminar la maleza');
        }
      });
    }

    cancelarEliminacion() {
      this.mostrarConfirmEliminar = false;
      this.malezaAEliminar = null;
    }
}

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
import { CultivoDto } from '../../../models/Cultivo.dto';
import { CultivoService } from '../../../services/CultivoService';

@Component({
  selector: 'app-listado-cultivos.component',
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, DialogModule],
  templateUrl: './listado-cultivos.component.html',
  styleUrls: ['./listado-cultivos.component.scss']
})
export class ListadoCultivosComponent implements OnInit, OnDestroy {
    constructor(private router: Router, private authService: AuthService, private cultivoService: CultivoService) {}

    searchText: string = '';
    private navigationSubscription: any;

    // Variables para el modal
    mostrarModal: boolean = false;
    modalNombre: string = '';
    modalDescripcion: string = '';
    modalLoading: boolean = false;
    modalError: string = '';
    modalTitulo: string = 'Crear Cultivar';
    modalBotonTexto: string = 'Crear Cultivar';
    itemEditando: any = null;
    itemEditandoId: number | null = null;


    items: CultivoDto[] = [];
    loading: boolean = false;
    error: string = '';

    // Paginación
    page = 0; // 0-based
    size = 12;
    totalElements = 0;
    totalPages = 0;

    // Popup de confirmación de eliminación (misma UX que Usuarios)
    cultivoAEliminar: CultivoDto | null = null;
    confirmLoading: boolean = false;

    ngOnInit(): void {
        this.cargarCultivos();
        
        // Suscribirse a cambios de navegación para recargar cuando se regrese
        this.navigationSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                if (event.url === '/listado-cultivos') {
                    this.cargarCultivos();
                }
            });
    }

    ngOnDestroy(): void {
        if (this.navigationSubscription) {
            this.navigationSubscription.unsubscribe();
        }
    }

    cargarCultivos(): void {
        this.loading = true;
        this.error = '';
        this.cultivoService.listarCultivos().subscribe({
            next: (data) => {
                this.items = data || [];
                this.loading = false;
            },
            error: (error) => {
                console.error('Error al listar cultivos', error);
                this.error = 'No se pudo cargar el listado de cultivos';
                this.items = [];
                this.loading = false;
            }
        });
    }


    get itemsFiltrados() {
      const filtrados = this.items.filter(item => {
        const cumpleNombre = !this.searchText || 
          item.nombre.toLowerCase().includes(this.searchText.toLowerCase());
        return cumpleNombre;
      });

      // Calcular paginación
      this.totalElements = filtrados.length;
      this.totalPages = Math.ceil(this.totalElements / this.size);

      // Paginar los resultados
      const startIndex = this.page * this.size;
      const endIndex = startIndex + this.size;
      return filtrados.slice(startIndex, endIndex);
    }

    nextPage(): void {
      if (this.page < this.totalPages - 1) {
        this.page++;
      }
    }

    prevPage(): void {
      if (this.page > 0) {
        this.page--;
      }
    }

    onPageSizeChange(value: string): void {
      const newSize = parseInt(value, 10);
      if (!isNaN(newSize) && newSize > 0) {
        this.size = newSize;
        this.page = 0; // Reset a primera página
      }
    }

    getFirstItemIndex(): number {
      if (this.totalElements === 0) return 0;
      return this.page * this.size + 1;
    }

    getLastItemIndex(): number {
      if (this.totalElements === 0) return 0;
      const endIndex = this.page * this.size + this.itemsFiltrados.length;
      return endIndex;
    }

    crearItem() {
      const dto: CultivoDto = {
        id: 0, nombre: this.modalNombre, descripcion: this.modalDescripcion, activo: true
      };
      
      this.cultivoService.crearCultivo(dto).subscribe({
        next: (response) => {
          console.log('Cultivar creado:', response);
          this.cargarCultivos();
        },
        error: (error) => {
          console.error('Error al crear cultivar:', error);
        }
      });
    }

    abrirModal() {
      this.modalNombre = '';
      this.modalDescripcion = '';
      this.modalError = '';
      this.modalTitulo = 'Crear Cultivar';
      this.modalBotonTexto = 'Crear Cultivar';
      this.itemEditando = null;
      this.itemEditandoId = null;
      this.mostrarModal = true;
    }

    abrirModalEdicion(item: any) {
      this.modalNombre = item.nombre;
      this.modalDescripcion = item.descripcion || '';
      this.modalError = '';
      this.modalTitulo = 'Editar Cultivar';
      this.modalBotonTexto = 'Actualizar Cultivar';
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

      const cultivo: CultivoDto = { 
        id: this.itemEditandoId ?? 0,
        nombre: this.modalNombre,
        descripcion: this.modalDescripcion,
        activo: true
      };

      if (this.itemEditando) {
        // Editar cultivo existente
        this.cultivoService.editarCultivo(cultivo).subscribe({
          next: (response) => {
            console.log('Cultivar editado:', response);
            this.modalLoading = false;
            this.cerrarModal();
            this.cargarCultivos();
          },
          error: (error) => {
            console.error('Error al editar cultivar:', error);
            this.modalError = 'Error al actualizar el cultivar';
            this.modalLoading = false;
          }
        });
      } else {
        // Crear nuevo cultivo
        this.cultivoService.crearCultivo(cultivo).subscribe({
          next: (response) => {
            console.log('Cultivar creado:', response);
            this.modalLoading = false;
            this.cerrarModal();
            this.cargarCultivos();
          },
          error: (error) => {
            console.error('Error al crear cultivar:', error);
            this.modalError = 'Error al crear el cultivar';
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


    eliminarItem(cultivo: CultivoDto) {
      const confirmed = window.confirm(`¿Estás seguro que deseas eliminar el cultivar "${cultivo.nombre}"?`);
      if (confirmed && cultivo.id != null) {
        this.cultivoService.eliminarCultivo(cultivo.id).subscribe({
          next: (response) => {
            console.log('Cultivar eliminado:', response);
            this.cargarCultivos();
          },
          error: (error) => {
            console.error('Error al eliminar cultivar:', error);
            alert('Error al eliminar el cultivar');
          }
        });
      }
    }

    confirmarEliminacion() {
      const cultivo = this.cultivoAEliminar;
      if (!cultivo || cultivo.id == null) return;
      this.confirmLoading = true;
      this.cultivoService.eliminarCultivo(cultivo.id).subscribe({
        next: (response) => {
          console.log('Cultivar eliminado:', response);
          this.confirmLoading = false;
          this.cultivoAEliminar = null;
          this.cargarCultivos();
        },
        error: (error) => {
          console.error('Error al eliminar cultivar:', error);
          this.confirmLoading = false;
          this.cultivoAEliminar = null;
          alert('Error al eliminar el cultivar');
        }
      });
    }

    cancelarEliminacion() {
      this.cultivoAEliminar = null;
    }
}

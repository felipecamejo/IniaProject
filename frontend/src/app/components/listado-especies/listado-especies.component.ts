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
import { EspecieDto } from '../../../models/Especie.dto';
import { EspecieService } from '../../../services/EspecieService';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-listado-especies.component',
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, DialogModule, ConfirmDialogComponent],
  templateUrl: './listado-especies.component.html',
  styleUrls: ['./listado-especies.component.scss']
})
export class ListadoEspeciesComponent implements OnInit, OnDestroy {
    constructor(private router: Router, private authService: AuthService, private especieService: EspecieService) {}

    searchText: string = '';
    private navigationSubscription: any;

    // Variables para el modal
    mostrarModal: boolean = false;
    modalNombre: string = '';
    modalDescripcion: string = '';
    modalLoading: boolean = false;
    modalError: string = '';
    modalTitulo: string = 'Crear Especie';
    modalBotonTexto: string = 'Crear Especie';
    itemEditando: any = null;
    itemEditandoId: number | null = null;


    items: EspecieDto[] = [];
    loading: boolean = false;
    error: string = '';

    // Paginación
    page = 0; // 0-based
    size = 12;
    totalElements = 0;
    totalPages = 0;

    // Popup de confirmación de eliminación (misma UX que Usuarios)
    especieAEliminar: EspecieDto | null = null;
    confirmLoading: boolean = false;

    ngOnInit(): void {
        this.cargar();

        // Suscribirse a cambios de navegación para recargar cuando se regrese
        this.navigationSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                if (event.url === '/listado-especies') {
                    this.cargar();
                }
            });
    }

    ngOnDestroy(): void {
        if (this.navigationSubscription) {
            this.navigationSubscription.unsubscribe();
        }
    }

    cargar(): void {
        this.loading = true;
        this.error = '';
        this.especieService.listar().subscribe({
            next: (data) => {
                this.items = data || [];
                this.loading = false;
            },
            error: (error) => {
                console.error('Error al listar especies', error);
                this.error = 'No se pudo cargar el listado de especies';
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
      const dto: EspecieDto = {
        id: 0, nombre: this.modalNombre, descripcion: this.modalDescripcion, activo: true
      };

      this.especieService.crear(dto).subscribe({
        next: (response) => {
          console.log('Especie creada:', response);
          this.cargar();
        },
        error: (error) => {
          console.error('Error al crear especie:', error);
        }
      });
    }

    abrirModal() {
      this.modalNombre = '';
      this.modalDescripcion = '';
      this.modalError = '';
      this.modalTitulo = 'Crear Especie';
      this.modalBotonTexto = 'Crear Especie';
      this.itemEditando = null;
      this.itemEditandoId = null;
      this.mostrarModal = true;
    }

    abrirModalEdicion(item: any) {
      this.modalNombre = item.nombre;
      this.modalDescripcion = item.descripcion || '';
      this.modalError = '';
      this.modalTitulo = 'Editar Especie';
      this.modalBotonTexto = 'Actualizar Especie';
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

      const especie: EspecieDto = {
        id: this.itemEditandoId ?? 0,
        nombre: this.modalNombre,
        descripcion: this.modalDescripcion,
        activo: true
      };

      if (this.itemEditando) {
        // Editar especie existente
        this.especieService.editar(especie).subscribe({
          next: (response) => {
            console.log('Especie editada:', response);
            this.modalLoading = false;
            this.cerrarModal();
            this.cargar();
          },
          error: (error) => {
            console.error('Error al editar especie:', error);
            this.modalError = 'Error al actualizar la especie';
            this.modalLoading = false;
          }
        });
      } else {
        // Crear nueva especie
        this.especieService.crear(especie).subscribe({
          next: (response) => {
            console.log('Especie creada:', response);
            this.modalLoading = false;
            this.cerrarModal();
            this.cargar();
          },
          error: (error) => {
            console.error('Error al crear especie:', error);
            this.modalError = 'Error al crear la especie';
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

    eliminarItem(especie: EspecieDto) {
      const confirmed = window.confirm(`¿Estás seguro que deseas eliminar la especie "${especie.nombre}"?`);
      if (confirmed && especie.id != null) {
        this.especieService.eliminar(especie.id).subscribe({
          next: (response) => {
            console.log('Especie eliminada:', response);
            this.cargar();
          },
          error: (error) => {
            console.error('Error al eliminar especie:', error);
            alert('Error al eliminar la especie');
          }
        });
      }
    }

    confirmarEliminacion() {
      const especie = this.especieAEliminar;
      if (!especie || especie.id == null) return;
      this.confirmLoading = true;
      this.especieService.eliminar(especie.id).subscribe({
        next: (response) => {
          console.log('Especie eliminada:', response);
          this.confirmLoading = false;
          this.especieAEliminar = null;
          this.cargar();
        },
        error: (error) => {
          console.error('Error al eliminar especie:', error);
          this.confirmLoading = false;
          this.especieAEliminar = null;
          alert('Error al eliminar la especie');
        }
      });
    }

    cancelarEliminacion() {
      this.especieAEliminar = null;
    }
}

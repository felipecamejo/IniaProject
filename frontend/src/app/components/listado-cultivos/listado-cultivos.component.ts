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
    modalTitulo: string = 'Crear Cultivo';
    modalBotonTexto: string = 'Crear Cultivo';
    itemEditando: any = null;
    itemEditandoId: number | null = null;

    items: CultivoDto[] = [];

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
        this.cultivoService.listar().subscribe({
            next: (response) => {
                this.items = response?.cultivos ?? [];
            },
            error: (error) => {
                console.error('Error al listar cultivos', error);
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
      const dto: CultivoDto = {
        id: 0, nombre: this.modalNombre, descripcion: this.modalDescripcion, activo: true
      };
      
      this.cultivoService.crear(dto).subscribe({
        next: (response) => {
          console.log('Cultivo creado:', response);
          this.cargarCultivos();
        },
        error: (error) => {
          console.error('Error al crear cultivo:', error);
        }
      });
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

      const cultivo: CultivoDto = { 
        id: this.itemEditandoId ?? 0,
        nombre: this.modalNombre,
        descripcion: this.modalDescripcion,
        activo: true
      };

      if (this.itemEditando) {
        // Editar cultivo existente
        this.cultivoService.editar(cultivo).subscribe({
          next: (response) => {
            console.log('Cultivo editado:', response);
            this.modalLoading = false;
            this.cerrarModal();
            this.cargarCultivos();
          },
          error: (error) => {
            console.error('Error al editar cultivo:', error);
            this.modalError = 'Error al actualizar el cultivo';
            this.modalLoading = false;
          }
        });
      } else {
        // Crear nuevo cultivo
        this.cultivoService.crear(cultivo).subscribe({
          next: (response) => {
            console.log('Cultivo creado:', response);
            this.modalLoading = false;
            this.cerrarModal();
            this.cargarCultivos();
          },
          error: (error) => {
            console.error('Error al crear cultivo:', error);
            this.modalError = 'Error al crear el cultivo';
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

    eliminarItem(cultivo: any) {
      if (confirm(`¿Estás seguro de que deseas eliminar el Cultivo "${cultivo.nombre}"?`)) {
        this.cultivoService.eliminar(cultivo.id).subscribe({
          next: (response) => {
            console.log('Cultivo eliminado:', response);
            this.cargarCultivos();
          },
          error: (error) => {
            console.error('Error al eliminar cultivo:', error);
            alert('Error al eliminar el cultivo');
          }
        });
      }
    }
}

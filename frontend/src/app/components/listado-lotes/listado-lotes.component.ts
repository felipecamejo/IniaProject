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
import { LoteDto } from '../../../models/Lote.dto';
import { LoteService } from '../../../services/LoteService';


@Component({
  selector: 'app-listado-lotes.component',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, DialogModule],
  templateUrl: './listado-lotes.component.html',
  styleUrl: './listado-lotes.component.scss'
})
export class ListadoLotesComponent implements OnInit, OnDestroy {
    constructor(private router: Router, private authService: AuthService, private loteService: LoteService) {}

    metodos = [
      { label: 'Pendiente', id: 1 },
      { label: 'Finalizado', id: 2 },
    ];

    selectedMetodo: string = '';
    selectedMes: string = '';
    selectedAnio: string = '';
    searchText: string = '';
    private navigationSubscription: any;

    // Variables para el modal
    mostrarModal: boolean = false;
    modalNombre: string = '';
    modalDescripcion: string = '';
    modalLoading: boolean = false;
    modalError: string = '';
    modalTitulo: string = 'Crear Lote';
    modalBotonTexto: string = 'Crear Lote';
    itemEditando: any = null;
    itemEditandoId: number | null = null;

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

    items: LoteDto[] = [];

    // Popup de confirmación de eliminación
    mostrarConfirmEliminar: boolean = false;
    loteAEliminar: LoteDto | null = null;
    confirmLoading: boolean = false;

    ngOnInit(): void {
        this.cargarLotes();
        
        // Suscribirse a cambios de navegación para recargar cuando se regrese
        this.navigationSubscription = this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                if (event.url === '/listado-lotes') {
                    this.cargarLotes();
                }
            });
    }

    ngOnDestroy(): void {
        if (this.navigationSubscription) {
            this.navigationSubscription.unsubscribe();
        }
    }

    cargarLotes(): void {
        this.loteService.listarLotes().subscribe({
            next: (response) => {
                this.items = response?.lotes ?? [];
            },
            error: (error) => {
                console.error('Error al listar lotes', error);
                this.items = [];
            }
        });
    }

    get itemsFiltrados() {
      return this.items.filter(item => {

        const cumpleNombre = !this.searchText || 
          item.nombre.toLowerCase().includes(this.searchText.toLowerCase());
        
        const cumpleEstado = !this.selectedMetodo || (item.estado && item.estado === this.getEstadoLabel(this.selectedMetodo));
        
        const cumpleMes = !this.selectedMes || (item.fechaCreacion && this.getMesFromFecha(item.fechaCreacion) === parseInt(this.selectedMes));
        
        const cumpleAnio = !this.selectedAnio || (item.fechaCreacion && this.getAnioFromFecha(item.fechaCreacion) === parseInt(this.selectedAnio));
        
        return cumpleNombre && cumpleEstado && cumpleMes && cumpleAnio;
      });
    }

    getEstadoLabel(estadoId: string): string {
      const estado = this.metodos.find(m => m.id === parseInt(estadoId));
      return estado ? estado.label : '';
    }

    getMesFromFecha(fecha: string): number {
      const partes = fecha.split('-');
      return parseInt(partes[1]); // El mes está en la posición 1
    }

    getAnioFromFecha(fecha: string): number {
      const partes = fecha.split('-');
      return parseInt(partes[2]); // El año está en la posición 2
    }

    onAnioChange() {
      this.selectedMes = '';
    }

    goToHome() {
      this.router.navigate(['/home']);
    }

    abrirModal() {
      this.modalNombre = '';
      this.modalDescripcion = '';
      this.modalError = '';
      this.modalTitulo = 'Crear Lote';
      this.modalBotonTexto = 'Crear Lote';
      this.itemEditando = null;
      this.itemEditandoId = null;
      this.mostrarModal = true;
    }

    abrirModalEdicion(item: any) {
      this.modalNombre = item.nombre;
      this.modalDescripcion = item.descripcion || '';
      this.modalError = '';
      this.modalTitulo = 'Editar Lote';
      this.modalBotonTexto = 'Actualizar Lote';
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

      const lote: LoteDto = { 
        id: this.itemEditandoId ?? 0,
        nombre: this.modalNombre,
        descripcion: this.modalDescripcion,
        fechaCreacion: new Date().toISOString().split('T')[0],
        fechaFinalizacion: null,
        usuariosId: null,
        activo: true,
        estado: 'Pendiente',
        autor: this.authService.userData?.nombre || 'Usuario Actual',
        fecha: new Date().toISOString().split('T')[0]
      };

      if (this.itemEditando) {
        // Editar lote existente
        this.loteService.editarLote(lote).subscribe({
          next: (response) => {
            console.log('Lote editado:', response);
            this.modalLoading = false;
            this.cerrarModal();
            this.cargarLotes();
          },
          error: (error) => {
            console.error('Error al editar lote:', error);
            this.modalError = 'Error al actualizar el lote';
            this.modalLoading = false;
          }
        });
      } else {
        // Crear nuevo lote
        this.loteService.crearLote(lote).subscribe({
          next: (response) => {
            console.log('Nuevo lote creado:', response);
            this.modalLoading = false;
            this.cerrarModal();
            this.cargarLotes();
          },
          error: (error) => {
            console.error('Error al crear lote:', error);
            this.modalError = 'Error al crear el lote';
            this.modalLoading = false;
          }
        });
      }
    }

    editarItemModal(lote: any) {
      this.abrirModalEdicion(lote);
    }

    eliminarItem(lote: LoteDto) {
      this.loteAEliminar = lote;
      this.mostrarConfirmEliminar = true;
    }

    confirmarEliminacion() {
      const lote = this.loteAEliminar;
      if (!lote || lote.id == null) return;
      this.confirmLoading = true;
      this.loteService.eliminarLote(lote.id).subscribe({
        next: (response) => {
          console.log('Lote eliminado:', response);
          this.confirmLoading = false;
          this.mostrarConfirmEliminar = false;
          this.loteAEliminar = null;
          this.cargarLotes();
        },
        error: (error) => {
          console.error('Error al eliminar lote:', error);
          this.confirmLoading = false;
          this.mostrarConfirmEliminar = false;
          this.loteAEliminar = null;
          alert('Error al eliminar el lote');
        }
      });
    }

    cancelarEliminacion() {
      this.mostrarConfirmEliminar = false;
      this.loteAEliminar = null;
    }
}

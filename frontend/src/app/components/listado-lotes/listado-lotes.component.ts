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
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-listado-lotes.component',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, DialogModule, ConfirmDialogComponent],
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

    anios: { label: string, id: number }[] = [];

    actualizarAniosDisponibles() {
        const aniosSet = new Set<number>();
        
        this.items.forEach(item => {
            const fechaConTipo = this.getFechaConTipo(item);
            if (fechaConTipo.fecha) {
                const anio = this.getAnioFromFecha(fechaConTipo.fecha);
                if (!isNaN(anio)) {
                    aniosSet.add(anio);
                }
            }
        });

        // Convertir Set a array y ordenar de menor a mayor (más antiguos primero)
        const aniosArray = Array.from(aniosSet).sort((a, b) => a - b);
        
        // Crear el array de objetos con label e id
        this.anios = aniosArray.map(anio => ({
            label: anio.toString(),
            id: anio
        }));

        console.log('Años disponibles:', this.anios);
    }

    items: LoteDto[] = [];
    
    /**
     * Formatea una fecha (posiblemente en ISO o YYYY-MM-DD[T...] ) a DD/MM/YYYY.
     * Devuelve cadena vacía si la fecha es inválida o no está presente.
     */
    formatFecha(fecha: string | null | undefined): string {
      if (!fecha) return '';
      // Extraer la parte de fecha si viene con hora
      const fechaSolo = fecha.split('T')[0];
      const partes = fechaSolo.split('-');
      if (partes.length >= 3 && partes[0].length === 4) {
        const year = partes[0];
        const month = partes[1];
        const day = partes[2];
        return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
      }
      // Intentar parsear con Date como fallback
      const d = new Date(fecha);
      if (isNaN(d.getTime())) return '';
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    }

    getFechaConTipo(item: LoteDto): { fecha: string, tipo: string } {
      return { fecha: item.fechaCreacion || '', tipo: 'Creación' };
    }

    loteAEliminar: LoteDto | null = null;

    // Propiedades para el popup de confirmación
    mostrarConfirmEliminar: boolean = false;
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
                this.actualizarAniosDisponibles();
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

        // Filtro por estado: comparar directamente el estado del item con el label del método seleccionado
        const cumpleEstado = !this.selectedMetodo || (item.estado === this.getEstadoLabel(this.selectedMetodo));

        const cumpleMes = !this.selectedMes || (item.fechaCreacion && this.getMesFromFecha(item.fechaCreacion) === parseInt(this.selectedMes));
        
        const cumpleAnio = !this.selectedAnio || (item.fechaCreacion && this.getAnioFromFecha(item.fechaCreacion) === parseInt(this.selectedAnio));
        
        return cumpleNombre && cumpleEstado && cumpleMes && cumpleAnio;
      });
    }

    getEstadoLabel(estadoId: string): string {
      const estado = this.metodos.find(m => m.id === parseInt(estadoId));
      return estado ? estado.label : '';
    }

    getEstadoFormateado(estado: string | undefined): string {
      if (!estado || estado === undefined) return '';
      return estado.charAt(0) + estado.slice(1).toLowerCase();
    }

    getMesFromFecha(fecha: string): number {
      const partes = fecha.split('-');
      return parseInt(partes[1]); // El mes está en la posición 1
    }

    getAnioFromFecha(fecha: string): number {
      const partes = fecha.split('-');
      return parseInt(partes[0]); // El año está en la posición 0
    }

    onAnioChange() {
      this.selectedMes = '';
    }

    goToHome() {
      this.router.navigate(['/home']);
    }

    menuAnalisis(itemId: number | null) {
      if (itemId == null) {
        console.error('ID de lote no válido');
        return;
      }

      this.loteService.reciboFromLote(itemId).subscribe({
        next: (reciboId: number | null) => {
          console.log('Recibo ID obtenido:', reciboId, 'para Lote ID:', itemId);

          if(reciboId === null || reciboId === 0) {
            this.router.navigate([itemId, 'lote-analisis']);
          } else {
            this.router.navigate([itemId, reciboId, 'lote-analisis']);
          }

        }
      });
    }



    eliminarItem(lote: LoteDto) {
      console.log('Eliminar Lote:', lote);
      this.loteAEliminar = lote;
      this.mostrarConfirmEliminar = true;
    }

    confirmarEliminacion() {
      if (!this.loteAEliminar || this.loteAEliminar.id == null) return;
      this.confirmLoading = true;
      const lote = this.loteAEliminar;
      const loteId = lote.id;

      this.loteService.eliminarLote(loteId!).subscribe({
        next: (res) => {
          console.log('Lote eliminado en backend:', res);
          this.confirmLoading = false;
          this.mostrarConfirmEliminar = false;
          this.loteAEliminar = null;
          // Actualizar lista localmente
          this.items = this.items.filter(loteItem => loteItem.id !== loteId);
        },
        error: (err) => {
          console.error('Error eliminando Lote:', err);
          this.confirmLoading = false;
          this.mostrarConfirmEliminar = false;
          this.loteAEliminar = null;
          alert('Error al eliminar el lote. Por favor, inténtalo de nuevo.');
        }
      });
    }

    cancelarEliminacion() {
      this.mostrarConfirmEliminar = false;
      this.loteAEliminar = null;
      this.confirmLoading = false;
    }
}

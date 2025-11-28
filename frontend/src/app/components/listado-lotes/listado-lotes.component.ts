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
import { LoteService, ResponseListadoLotesPage } from '../../../services/LoteService';
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
  selectedCategoria: string = '';
  searchText: string = '';
  categorias = [
    { label: 'Todas', id: '' },
    { label: 'P', id: 'P' },
    { label: 'FT', id: 'FT' },
    { label: 'M', id: 'M' },
    { label: 'B', id: 'B' },
    { label: 'PB', id: 'PB' },
    { label: 'C1', id: 'C1' },
    { label: 'C2', id: 'C2' },
    { label: 'CO', id: 'CO' },
  ];
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

  items: LoteDto[] = [];
  page = 0;
  size = 12;
  totalElements = 0;
  totalPages = 0;
  loading = false;
  loteAEliminar: LoteDto | null = null;
  mostrarConfirmEliminar: boolean = false;
  confirmLoading: boolean = false;

  ngOnInit(): void {
    this.cargarLotesPage();
    this.navigationSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url === '/listado-lotes') {
          this.cargarLotesPage();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  cargarLotesPage(): void {
    this.loading = true;
    const searchText = this.searchText || '';
    let estado: string | undefined = undefined;
    if (this.selectedMetodo) {
      if (this.selectedMetodo === '1') estado = 'PENDIENTE';
      else if (this.selectedMetodo === '2') estado = 'FINALIZADO';
    }
    const mes = this.selectedMes ? parseInt(this.selectedMes, 10) : undefined;
    const anio = this.selectedAnio ? parseInt(this.selectedAnio, 10) : undefined;
    const params: any = {
      page: this.page,
      size: this.size,
      sort: 'fechaCreacion',
      direction: 'DESC',
      searchText,
      estado,
      mes,
      anio
    };
    if (this.selectedCategoria) {
      params.categoria = this.selectedCategoria;
    }
    this.loteService.listarLotesPage(params).subscribe({
      next: (response: ResponseListadoLotesPage) => {
        this.items = response.content ?? [];
        this.totalElements = response.totalElements ?? 0;
        this.totalPages = response.totalPages ?? 0;
        this.actualizarAniosDisponibles();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al listar lotes paginados', error);
        this.items = [];
        this.totalElements = 0;
        this.totalPages = 0;
        this.loading = false;
      }
    });
  }

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
    const aniosArray = Array.from(aniosSet).sort((a, b) => a - b);
    this.anios = aniosArray.map(anio => ({ label: anio.toString(), id: anio }));
  }

  onSearchTextChange(): void {
    this.page = 0;
    this.cargarLotesPage();
  }
  onEstadoChange(): void {
    this.page = 0;
    this.cargarLotesPage();
  }
  onMesChange(): void {
    this.page = 0;
    this.cargarLotesPage();
  }
  onAnioChange(): void {
    this.selectedMes = '';
    this.page = 0;
    this.cargarLotesPage();
  }
  onCategoriaChange(): void {
    this.page = 0;
    console.log('[Filtro] Categoría seleccionada:', this.selectedCategoria);
    // Log de los parámetros que se enviarán
    const searchText = this.searchText || '';
    let estado: string | undefined = undefined;
    if (this.selectedMetodo) {
      if (this.selectedMetodo === '1') estado = 'PENDIENTE';
      else if (this.selectedMetodo === '2') estado = 'FINALIZADO';
    }
    const mes = this.selectedMes ? parseInt(this.selectedMes, 10) : undefined;
    const anio = this.selectedAnio ? parseInt(this.selectedAnio, 10) : undefined;
    const params: any = {
      page: this.page,
      size: this.size,
      sort: 'fechaCreacion',
      direction: 'DESC',
      searchText,
      estado,
      mes,
      anio
    };
    if (this.selectedCategoria) {
      params.categoria = this.selectedCategoria;
    }
    console.log('[Filtro] Params enviados al backend:', params);
    this.cargarLotesPage();
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.cargarLotesPage();
    }
  }
  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.cargarLotesPage();
    }
  }
  onPageSizeChange(value: string): void {
    const newSize = parseInt(value, 10);
    if (!isNaN(newSize) && newSize > 0) {
      this.size = newSize;
      this.page = 0;
      this.cargarLotesPage();
    }
  }

  get itemsFiltrados() {
    return this.items;
  }

  formatFecha(fecha: string | null | undefined): string {
    if (!fecha) return '';
    const fechaSolo = fecha.split('T')[0];
    const partes = fechaSolo.split('-');
    if (partes.length >= 3 && partes[0].length === 4) {
      const year = partes[0];
      const month = partes[1];
      const day = partes[2];
      return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
    }
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

  getEstadoLabel(estadoId: string): string {
    const estado = this.metodos.find((m: any) => m.id === parseInt(estadoId));
    return estado ? estado.label : '';
  }

  getEstadoFormateado(estado: string | undefined): string {
    if (!estado || estado === undefined) return '';
    return estado.charAt(0) + estado.slice(1).toLowerCase();
  }

  getMesFromFecha(fecha: string): number {
    const partes = fecha.split('-');
    return parseInt(partes[1]);
  }

  getAnioFromFecha(fecha: string): number {
    const partes = fecha.split('-');
    return parseInt(partes[0]);
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
      next: (res: any) => {
        console.log('Lote eliminado en backend:', res);
        this.confirmLoading = false;
        this.mostrarConfirmEliminar = false;
        this.loteAEliminar = null;
        this.items = this.items.filter((loteItem: LoteDto) => loteItem.id !== loteId);
      },
      error: (err: any) => {
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

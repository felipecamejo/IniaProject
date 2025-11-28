import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../services/AuthService';
import { LogDto } from '../../../models/Log.dto';
import { LogService, ResponseListadoLogsPage } from '../../../services/LogService';

import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-listado-logs.components',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DialogModule
  ],
  templateUrl: './listado-logs.components.html',
  styleUrls: ['./listado-logs.components.scss']
})
export class ListadoLogsComponent implements OnInit {
    // --- Métodos utilitarios y de filtrado ---
    actualizarAniosDisponibles() {
      const aniosSet = new Set<number>();
      this.items.forEach((item: LogDto) => {
        const fechaConTipo = this.getFechaConTipo(item);
        if (fechaConTipo.fecha) {
          const anio = this.getAnioFromFecha(fechaConTipo.fecha);
          if (!isNaN(anio)) {
            aniosSet.add(anio);
          }
        }
      });
      // Convertir Set a array y ordenar de menor a mayor (más antiguos primero)
      const aniosArray = Array.from(aniosSet).sort((a, b) => (a as number) - (b as number));
      // Crear el array de objetos con label e id
      this.anios = aniosArray.map((anio: number) => ({
        label: anio.toString(),
        id: anio
      }));
      console.log('Años disponibles:', this.anios);
    }

    get itemsFiltrados() {
      return this.items.filter((item: LogDto) => {
        const searchLower = this.searchText.toLowerCase();
        const cumpleBusqueda = !this.searchText ||
          item.id?.toString().includes(this.searchText) ||
          item.texto.toLowerCase().includes(searchLower);
        const fechaParaFiltro = this.getFechaConTipo(item).fecha;
        const cumpleMes = !this.selectedMes || this.getMesFromFecha(fechaParaFiltro) === parseInt(this.selectedMes);
        const cumpleAnio = !this.selectedAnio || this.getAnioFromFecha(fechaParaFiltro) === parseInt(this.selectedAnio);
        return cumpleBusqueda && cumpleMes && cumpleAnio;
      }).sort((a, b) => {
        // Ordenar por fecha de creación descendente (más reciente primero)
        const fechaA = new Date(a.fechaCreacion || 0).getTime();
        const fechaB = new Date(b.fechaCreacion || 0).getTime();
        return fechaB - fechaA;
      });
    }

    getFechaConTipo(item: LogDto): { fecha: string, tipo: string } {
      return { fecha: item.fechaCreacion || '', tipo: 'Creación' };
    }

    getFechaFormateada(item: LogDto): string {
      const fechaConTipo = this.getFechaConTipo(item);
      return this.formatFecha(fechaConTipo.fecha);
    }

    getMesFromFecha(fecha: string): number {
      const partes = fecha.split('-');
      return parseInt(partes[1]); // El mes está en la posición 1 (YYYY-MM-DD)
    }

    getAnioFromFecha(fecha: string): number {
      const partes = fecha.split('-');
      return parseInt(partes[0]); // El año está en la posición 0 (YYYY-MM-DD)
    }

    formatFecha(fecha: string | null | undefined): string {
      if (!fecha) return '';
      // Intentar parsear con Date
      const d = new Date(fecha);
      if (isNaN(d.getTime())) return '';
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dd}-${mm}-${yyyy}  ${hh}:${min}`;
    }

    goToHome() {
      const loteId = this.route.snapshot.params['loteId'];
      const reciboId = this.route.snapshot.params['reciboId'];
      this.router.navigate([loteId, reciboId, 'lote-analisis']);
    }
  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService, private logService: LogService) {}

  selectedMes: string = '';
  selectedAnio: string = '';
  searchText: string = '';

  loteId: string = '';
  private _reciboId: string = '';
  get reciboId(): string {
    return this._reciboId;
  }
  set reciboId(value: string) {
    this._reciboId = value;
  }

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

  // Paginación
  items: LogDto[] = [];
  page = 0; // 0-based
  size = 12;
  totalElements = 0;
  totalPages = 0;
  loading = false;

  // Propiedades para el popup de confirmación
  mostrarConfirmEliminar: boolean = false;
  logAEliminar: LogDto | null = null;
  confirmLoading: boolean = false;

  navegarAVer(item: LogDto) {
    this.router.navigate([this.loteId, this.reciboId, 'logs', 'ver', item.id], { queryParams: { view: 'true' } });
  }

  ngOnInit() {
    this.loteId = this.route.snapshot.params['loteId'];
    this.cargarLogsPage();
  }

  cargarLogsPage(): void {
    this.loading = true;
    const loteId = this.loteId;
    const params: any = {
      page: this.page,
      size: this.size,
      sort: 'fechaCreacion',
      direction: 'DESC',
      searchText: this.searchText || '',
      mes: this.selectedMes || '',
      anio: this.selectedAnio || ''
    };
    this.logService.listarLogsPage(Number(loteId), params).subscribe({
      next: (response: ResponseListadoLogsPage) => {
        this.items = response.content ?? [];
        this.totalElements = response.totalElements ?? 0;
        this.totalPages = response.totalPages ?? 0;
        this.actualizarAniosDisponibles();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al listar logs paginados', error);
        this.items = [];
        this.totalElements = 0;
        this.totalPages = 0;
        this.loading = false;
      }
    });
  }

  // Navegación de páginas
  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.cargarLogsPage();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.cargarLogsPage();
    }
  }

  goToPage(p: number): void {
    if (p >= 0 && p < this.totalPages) {
      this.page = p;
      this.cargarLogsPage();
    }
  }

  onPageSizeChange(value: string): void {
    const newSize = parseInt(value, 10);
    if (!isNaN(newSize) && newSize > 0) {
      this.size = newSize;
      this.page = 0; // reset page
      this.cargarLogsPage();
    }
  }

  // Filtros: recargar al cambiar
  onSearchTextChange(): void {
    this.page = 0;
    this.cargarLogsPage();
  }
  onMesChange(): void {
    this.page = 0;
    this.cargarLogsPage();
  }
  onAnioChange(): void {
    this.selectedMes = '';
    this.page = 0;
    this.cargarLogsPage();
  }
}

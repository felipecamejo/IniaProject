import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ActivatedRoute, Router } from '@angular/router';
import { GerminacionDto } from '../../../models/Germinacion.dto';
import { GerminacionService } from '../../../services/GerminacionService';
import { LogService } from '../../../services/LogService';

@Component({
  selector: 'app-listado-germinacion',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule],
  templateUrl: './listado-germinacion.component.html',
  styleUrl: './listado-germinacion.component.scss'
})
export class ListadoGerminacionComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute, private germSvc: GerminacionService, private logService : LogService) {}

    selectedMes: string = '';
    selectedAnio: string = '';
    searchText: string = '';
  loteId: string | null = null;
  reciboId: string | null = null;

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

    items: GerminacionDto[] = [];

    // Propiedades de paginación
    page = 0; // 0-based
    size = 12;
    totalElements = 0;
    totalPages = 0;

    // Propiedades para el popup de confirmación
    mostrarConfirmEliminar: boolean = false;
    germinacionAEliminar: GerminacionDto | null = null;
    confirmLoading: boolean = false;

    ngOnInit(): void {
      this.loteId = this.route.snapshot.paramMap.get('loteId');
      this.reciboId = this.route.snapshot.paramMap.get('reciboId');
      const rid = Number(this.reciboId);
      if (rid) {
        this.germSvc.listarPorRecibo(rid).subscribe({
          next: (resp: any) => {
            // API devuelve { germinacion: GerminacionDto[] }
            this.items = Array.isArray(resp?.germinacion) ? resp.germinacion : [];
            this.page = 0; // Reset a primera página cuando se cargan nuevos datos
          },
          error: (err) => {
            console.error('Error listando germinaciones por recibo', err);
            this.items = [];
          }
        });
      } else {
        this.items = [];
      }
    }

    get itemsFiltrados() {
      const filtrados = this.items.filter(item => {
        const cumpleId = !this.searchText || item.id?.toString().includes(this.searchText);
        const fechaParaFiltro = this.getFechaConTipo(item).fecha;
        const cumpleMes = !this.selectedMes || this.getMesFromFecha(fechaParaFiltro) === parseInt(this.selectedMes);
        const cumpleAnio = !this.selectedAnio || this.getAnioFromFecha(fechaParaFiltro) === parseInt(this.selectedAnio);
        return cumpleId && cumpleMes && cumpleAnio;
      }).sort((a, b) => {
        if (a.repetido === b.repetido) {
          return 0;
        }
        return a.repetido ? 1 : -1;
      });

      // Calcular paginación
      this.totalElements = filtrados.length;
      this.totalPages = Math.ceil(this.totalElements / this.size);

      // Paginar los resultados
      const startIndex = this.page * this.size;
      const endIndex = startIndex + this.size;
      return filtrados.slice(startIndex, endIndex);
    }

    getFechaConTipo(item: GerminacionDto): { fecha: string, tipo: string } {
      if (item.repetido && item.fechaRepeticion) {
        return { fecha: item.fechaRepeticion, tipo: 'Repetición' };
      }
      return { fecha: item.fechaCreacion || '', tipo: 'Creación' };
    }

    getMesFromFecha(fecha: string): number {
      if (!fecha) return NaN;
      const d = new Date(fecha);
      if (!isNaN(d.getTime())) return d.getMonth() + 1;
      const partes = fecha.split('-');
      return partes.length > 1 ? parseInt(partes[1], 10) : NaN;
    }

    getAnioFromFecha(fecha: string): number {
      if (!fecha) return NaN;
      const d = new Date(fecha);
      if (!isNaN(d.getTime())) return d.getFullYear();
      const partes = fecha.split('-');
      return partes.length > 0 ? parseInt(partes[0], 10) : NaN;
    }

    onAnioChange() {
      this.selectedMes = '';
    }

    goToHome() {
      this.router.navigate(['/home']);
    }

    crearGerminacion() {
      if (!this.loteId || !this.reciboId) return;
      this.router.navigate(['/', this.loteId, this.reciboId, 'germinacion', 'crear']);
    }

    navegarAEditar(item: GerminacionDto) {
      if (!this.loteId || !this.reciboId || !item?.id) return;
      this.router.navigate(['/', this.loteId, this.reciboId, 'germinacion', 'editar', item.id]);
    }

    navegarAVer(item: GerminacionDto) {
      console.log('Navegando para ver Germinación:', item);
      if (!this.loteId || !this.reciboId || !item?.id) return;
      this.router.navigate([this.loteId, this.reciboId, 'germinacion', item.id], { queryParams: { view: 'true' } });
    }

    eliminarGerminacion(item: GerminacionDto) {
      console.log('Eliminar Germinación:', item);
      const confirmacion = confirm('¿Estás seguro de que quieres eliminar esta Germinación?');
      
      if (!confirmacion) return;
      
      this.germSvc.eliminar(item.id!).subscribe({
        next: () => {
          this.items = this.items.filter(g => g.id !== item.id);
          this.logService.crearLog(this.loteId ? parseInt(this.loteId) : 0, Number(this.reciboId), 'Germinacion', 'eliminada').subscribe();
          alert('Germinación eliminada exitosamente.');
        },
        error: (err) => {
          console.error('Error eliminando germinación', err);
          alert('Error al eliminar la Germinación. Por favor, inténtalo de nuevo.');
        }
      });
    }

    cancelarEliminacion() {
      this.mostrarConfirmEliminar = false;
      this.germinacionAEliminar = null;
      this.confirmLoading = false;
    }

    // Métodos de paginación
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
}

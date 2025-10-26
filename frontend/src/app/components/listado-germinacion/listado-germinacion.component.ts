import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ActivatedRoute, Router } from '@angular/router';
import { GerminacionDto } from '../../../models/Germinacion.dto';
import { GerminacionService } from '../../../services/GerminacionService';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-listado-germinacion',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, ConfirmDialogComponent],
  templateUrl: './listado-germinacion.component.html',
  styleUrl: './listado-germinacion.component.scss'
})
export class ListadoGerminacionComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute, private germSvc: GerminacionService) {}

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
      return this.items.filter(item => {
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
      this.germinacionAEliminar = item;
      this.mostrarConfirmEliminar = true;
    }

    confirmarEliminacion() {
      if (!this.germinacionAEliminar) return;
      this.confirmLoading = true;
      const germinacion = this.germinacionAEliminar;

      // Simular eliminación local (ya que no hay servicio de eliminación implementado)
      this.items = this.items.filter(germ => germ.id !== germinacion.id);
      console.log('Germinación eliminada');
      
      this.confirmLoading = false;
      this.mostrarConfirmEliminar = false;
      this.germinacionAEliminar = null;
    }

    cancelarEliminacion() {
      this.mostrarConfirmEliminar = false;
      this.germinacionAEliminar = null;
      this.confirmLoading = false;
    }
}

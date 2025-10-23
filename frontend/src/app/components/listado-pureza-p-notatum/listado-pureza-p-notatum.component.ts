import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router, ActivatedRoute } from '@angular/router';
import { PurezaPNotatumDto } from '../../../models/PurezaPNotatum.dto';
import { PurezaPNotatumService } from '../../../services/PurezaPNotatumService';

@Component({
  selector: 'app-listado-pureza-p-notatum',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule],
  templateUrl: './listado-pureza-p-notatum.component.html',
  styleUrl: './listado-pureza-p-notatum.component.scss'
})
export class ListadoPurezaPNotatumComponent implements OnInit {
    constructor(private router: Router, private route: ActivatedRoute, private purezaPNotatumService: PurezaPNotatumService) {}

    selectedMes: string = '';
    selectedAnio: string = '';
    searchText: string = '';
    loteId: string = '';
    reciboId: number | null = null;

    ngOnInit() {
      this.loteId = this.route.snapshot.params['loteId'];
      const reciboParam = this.route.snapshot.params['reciboId'];
      this.reciboId = reciboParam != null ? Number(reciboParam) : null;
      this.cargarItems();
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

    items: PurezaPNotatumDto[] = [];

    cargarItems() {
      if (this.reciboId == null || isNaN(this.reciboId)) {
        console.warn('No hay reciboId para listar Pureza P. notatum');
        this.items = [];
        return;
      }
      this.purezaPNotatumService.listarPorRecibo(this.reciboId).subscribe({
        next: (data) => {
          // El servicio devuelve { purezaPNotatun: [...] }
          let resolved: any = data;
          if (resolved == null) {
            this.items = [];
          } else if (Array.isArray(resolved)) {
            this.items = resolved;
          } else if (Array.isArray(resolved.purezaPNotatun)) {
            this.items = resolved.purezaPNotatun;
          } else if (Array.isArray(resolved.data)) {
            this.items = resolved.data;
          } else {
            console.warn('Respuesta inesperada al listar Pureza P. notatum, se esperaba un array o {purezaPNotatun: []}:', resolved);
            this.items = [];
          }
          console.log('Pureza P. notatum cargados:', this.items);
          this.actualizarAniosDisponibles();
        },
        error: (err) => {
          console.error('Error cargando Pureza P. notatum:', err);
          this.items = [];
        }
      });
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

    getFechaConTipo(item: PurezaPNotatumDto): { fecha: string, tipo: string } {
      if (item.repetido && item.fechaRepeticion) {
        return { fecha: item.fechaRepeticion, tipo: 'Repetición' };
      }
      return { fecha: item.fechaCreacion || '', tipo: 'Creación' };
    }

    getMesFromFecha(fecha: string): number {
      const partes = fecha.split('-');
      return parseInt(partes[1]); // El mes está en la posición 1 (YYYY-MM-DD)
    }

    getAnioFromFecha(fecha: string): number {
      const partes = fecha.split('-');
      return parseInt(partes[0]); // El año está en la posición 0 (YYYY-MM-DD)
    }

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

    onAnioChange() {
      this.selectedMes = '';
    }

    goToHome() {
      this.router.navigate([this.loteId, this.reciboId, 'lote-analisis']);
    }

    /**
     * Genera la lista de años disponibles basándose en los items cargados
     */
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

    crearPurezaPNotatum() {
      console.log('Navegando para crear nuevo Pureza P. notatum');
      this.router.navigate([this.loteId, this.reciboId, 'pureza-p-notatum', 'crear']);
    }

    navegarAVer(item: PurezaPNotatumDto) {
      console.log('Navegando para ver Pureza P. notatum:', item);
      this.router.navigate([this.loteId, this.reciboId, 'pureza-p-notatum', item.id], { queryParams: { view: 'true' } });
    }

    navegarAEditar(item: PurezaPNotatumDto) {
      console.log('Navegando para editar Pureza P. notatum:', item);
      this.router.navigate([this.loteId, this.reciboId, 'pureza-p-notatum', 'editar', item.id]);
    }

    eliminarPurezaPNotatum(item: PurezaPNotatumDto) {
      console.log('Eliminar Pureza P. notatum:', item);
      if (confirm(`¿Estás seguro de que quieres eliminar el Pureza P. notatum #${item.id}?`)) {
        if (item.id == null) {
          console.warn('Item no tiene id, no se puede eliminar');
          return;
        }
        this.purezaPNotatumService.eliminar(item.id).subscribe({
          next: (res) => {
            console.log('Pureza P. notatum eliminado en backend:', res);
            // Actualizar lista localmente
            this.items = this.items.filter(pn => pn.id !== item.id);
          },
          error: (err) => {
            console.error('Error eliminando Pureza P. notatum:', err);
            // Aquí podrías mostrar un mensaje de error al usuario
          }
        });
      }
    }
}


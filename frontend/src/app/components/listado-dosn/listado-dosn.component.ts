import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router, ActivatedRoute } from '@angular/router';
import { PMSDto } from '../../../models/PMS.dto';
import { DOSNDto } from '../../../models/DOSN.dto';
import { DOSNService } from '../../../services/DOSNService';

@Component({
  selector: 'app-listado-dosn.component',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule],
  templateUrl: './listado-dosn.component.html',
  styleUrl: './listado-dosn.component.scss'
})
export class ListadoDosnComponent implements OnInit {
    constructor(
        private router: Router, 
        private route: ActivatedRoute,
        private dosnService: DOSNService
    ) {}

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

    items: DOSNDto[] = [];

    ngOnInit() {
       this.loteId = this.route.snapshot.params['loteId'];
       this.reciboId = this.route.snapshot.params['reciboId'];
       this.cargarDosn();
    }

    cargarDosn() {
        this.dosnService.listarPorRecibo(parseInt(this.reciboId)).subscribe({
            next: (response: any) => {
                const lista = response?.DOSN ?? response?.dosn ?? response?.dtos ?? [];
                this.items = Array.isArray(lista) ? lista : [];
                console.log('DOSN cargadas:', this.items);
                // Actualizar años disponibles después de cargar los items
                this.actualizarAniosDisponibles();
            },
            error: (error) => {
                console.error('Error al cargar DOSN:', error);
                // Mantener items como arreglo vacío para evitar errores en template/filtros
                this.items = [];
            }
        });
    }

    /**
     * Genera la lista de años disponibles basándose en los items cargados
     */
    actualizarAniosDisponibles() {
        const aniosSet = new Set<number>();
        const seguros = Array.isArray(this.items) ? this.items : [];
        
        seguros.forEach(item => {
            const fechaConTipo = this.getFechaConTipo(item);
            if (fechaConTipo && fechaConTipo.fecha) {
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

    get itemsFiltrados() {
      const seguros = Array.isArray(this.items) ? this.items : [];
      return seguros.filter(item => {
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

    getFechaConTipo(item: DOSNDto): { fecha: string, tipo: string } {
      if (!item) {
        return { fecha: '', tipo: 'Creación' };
      }
      if (item.repetido && item.fechaRepeticion) {
        return { fecha: item.fechaRepeticion || '', tipo: 'Repetición' };
      }
      return { fecha: item.fechaCreacion || '', tipo: 'Creación' };
    }

    /**
     * Obtiene la fecha formateada según si es pendiente (fechaCreacion) o repetido (fechaRepeticion)
     */
    getFechaFormateada(item: DOSNDto): string {
      const fechaConTipo = this.getFechaConTipo(item);
      return this.formatFecha(fechaConTipo.fecha);
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

    getMesFromFecha(fecha: string): number {
      const partes = fecha.split('-');
      return parseInt(partes[1]); // El mes está en la posición 1 (YYYY-MM-DD)
    }

    getAnioFromFecha(fecha: string): number {
      const partes = fecha.split('-');
      return parseInt(partes[0]); // El año está en la posición 0 (YYYY-MM-DD)
    }

    onAnioChange() {
      this.selectedMes = '';
    }

    goToHome() {
      this.router.navigate([this.loteId, this.reciboId, 'lote-analisis']);
    }

    crearDOSN() {
      console.log('Navegando para crear nuevo DOSN');
      this.router.navigate([this.loteId, this.reciboId, 'dosn', 'crear']);
    }

    navegarAVer(item: DOSNDto) {
      console.log('Navegando para ver DOSN:', item);
      this.router.navigate([this.loteId, this.reciboId, 'dosn', item.id], { queryParams: { view: 'true' } });
    }

    navegarAEditar(item: DOSNDto) {
      console.log('Navegando para editar DOSN:', item);
      this.router.navigate([this.loteId, this.reciboId, 'dosn', 'editar', item.id]);
    }

    eliminarDOSN(item: DOSNDto) {
      console.log('Eliminar DOSN:', item);
      
      if (confirm(`¿Estás seguro de que quieres eliminar el DOSN #${item.id}?`)) {
          if (item.id) {
              this.dosnService.eliminar(item.id).subscribe({
                  next: (response) => {
                      console.log('DOSN eliminado exitosamente:', response);
                      // Recargar la lista después de eliminar
                      this.cargarDosn();
                  },
                  error: (error) => {
                      console.error('Error al eliminar el DOSN:', error);
                  }
              });
          }
      }
    }
}

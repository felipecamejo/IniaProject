import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { SanitarioDto } from '../../../models/Sanitario.dto';
import { ActivatedRoute } from '@angular/router';
import { SanitarioService } from '../../../services/SanitarioService';
import { LogService } from '../../../services/LogService';
import { AuthService } from '../../../services/AuthService';

import { FechaListadosService } from '../../../services/fechaListadosService';

@Component({
  selector: 'app-listado-sanitario.component',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule],
  templateUrl: './listado-sanitario.component.html',
  styleUrls: ['./listado-sanitario.component.scss']
})
export class ListadoSanitarioComponent implements OnInit {
    constructor(
        private router: Router, 
        private route: ActivatedRoute,
        private sanitarioService: SanitarioService,
        private logService: LogService,
        private authService: AuthService,
        private fechaListadosService: FechaListadosService
    ) {}

    selectedMes: string = '';
    selectedAnio: string = '';
    searchText: string = '';

    isObserver: boolean = false;

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

    anios: { label: string, id: number }[] = []; // Se generará dinámicamente desde los datos cargados

    items: SanitarioDto[] = [];

    // Propiedades de paginación
    page = 0; // 0-based
    size = 12;
    totalElements = 0;
    totalPages = 0;

    isLoading: boolean = false;

    // Propiedades para el popup de confirmación
    sanitarioAEliminar: SanitarioDto | null = null;
    confirmLoading: boolean = false;


    get itemsFiltrados() {
      const filtrados = this.items.filter(item => {

        const cumpleId = !this.searchText ||
          item.id?.toString().includes(this.searchText);

        const fechaParaFiltro = this.getFechaConTipo(item).fecha;
        const cumpleMes = !this.selectedMes || this.getMesFromFecha(fechaParaFiltro) === parseInt(this.selectedMes);

        const cumpleAnio = !this.selectedAnio || this.getAnioFromFecha(fechaParaFiltro) === parseInt(this.selectedAnio);

        return cumpleId && cumpleMes && cumpleAnio;
      }).sort((a, b) => {
        // Ordenar: pendientes primero (repetido = false), luego repetidos (repetido = true)
        if (a.repetido === b.repetido) {
          return 0; // Mantener orden original si ambos tienen el mismo estado
        }
        return a.repetido ? 1 : -1; // Pendientes (false) van primero
      });

      // Calcular paginación
      this.totalElements = filtrados.length;
      this.totalPages = Math.ceil(this.totalElements / this.size);

      // Paginar los resultados
      const startIndex = this.page * this.size;
      const endIndex = startIndex + this.size;
      return filtrados.slice(startIndex, endIndex);
    }

    ngOnInit() {
       this.loteId = this.route.snapshot.params['loteId'];
       this.reciboId = this.route.snapshot.params['reciboId'];
       this.cargarSanitarios();
    }

    cargarSanitarios() {
        if (!this.reciboId) {
            console.error('No se encontró el ID del recibo');
            return;
        }

        this.isObserver = this.authService.isObservador();

        this.isLoading = true;
        const reciboIdNumber = parseInt(this.reciboId);
        
        this.sanitarioService.listarPorRecibo(reciboIdNumber).subscribe({
            next: (response) => {
                this.items = response.sanitario || [];
                this.actualizarAniosDisponibles(); // Actualizar años disponibles basados en los datos cargados
                this.page = 0; // Reset a primera página cuando se cargan nuevos datos
                this.isLoading = false;
                console.log('Sanitarios cargados:', this.items);
            },
            error: (error) => {
                console.error('Error al cargar sanitarios:', error);
                this.items = [];
                this.anios = []; // Limpiar años si no hay datos
                this.isLoading = false;
            }
        });
    }

    navegarAVer(item: SanitarioDto) {
          console.log('Navegando para ver Sanitario:', item);
          this.router.navigate([this.loteId, this.reciboId, 'sanitario', item.id], { queryParams: { view: 'true' } });
    }

    getFechaConTipo(item: SanitarioDto): { fecha: string} {
      return this.fechaListadosService.getFechaConTipo(item);
    }

    getMesFromFecha(fecha: string): number {
      const partes = fecha.split('-');
      return parseInt(partes[1]); // El mes está en la posición 1 (YYYY-MM-DD)
    }

    getAnioFromFecha(fecha: string): number {
      const partes = fecha.split('-');
      return parseInt(partes[0]); // El año está en la posición 0 (YYYY-MM-DD)
    }

      formatFecha(fecha: Date | string): string {
        return this.fechaListadosService.formatFecha(fecha);
      }

    onAnioChange() {
      this.selectedMes = '';
    }

    goToHome() {
      this.router.navigate([this.loteId, this.reciboId, 'lote-analisis']);
    }

    crearItem() {
      console.log('Navegando para crear nuevo Sanitario');
      console.log('LoteId:', this.loteId);
      console.log('ReciboId:', this.reciboId);
      this.router.navigate([this.loteId, this.reciboId, 'sanitario', 'crear']);
    }

    navegarAEditar(item: SanitarioDto) {
      console.log('Navegando para editar Sanitario:', item);
      this.router.navigate([this.loteId, this.reciboId, 'sanitario', 'editar', item.id]);
    }

    eliminarItem(item: SanitarioDto) {
      console.log('Eliminar Sanitario:', item);
      if (!item.id) {
        console.error('El sanitario no tiene un ID válido');
        return;
      }
      if (window.confirm('¿Estás seguro que quieres eliminar este sanitario? Esta acción no se puede deshacer.')) {
        this.confirmLoading = true;
        this.sanitarioService.eliminar(item.id).subscribe({
          next: (response) => {
            console.log('Sanitario eliminado:', response);
            this.confirmLoading = false;
            // Recargar la lista después de eliminar
            this.cargarSanitarios();
            this.logService.crearLog(Number(this.loteId), Number(item.id), 'Sanitario', 'eliminado').subscribe();
          },
          error: (error) => {
            console.error('Error al eliminar sanitario:', error);
            this.confirmLoading = false;
            alert('Error al eliminar el sanitario. Por favor, inténtalo de nuevo.');
          }
        });
      }
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

        // Convertir Set a array y ordenar de mayor a menor (más recientes primero)
        const aniosArray = Array.from(aniosSet).sort((a, b) => b - a);
        
        // Crear el array de objetos con label e id
        this.anios = aniosArray.map(anio => ({
            label: anio.toString(),
            id: anio
        }));

        // Limpiar el filtro de año seleccionado si ya no está disponible
        if (this.selectedAnio && !this.anios.some(anio => anio.id.toString() === this.selectedAnio)) {
            this.selectedAnio = '';
            this.selectedMes = ''; // También limpiar el mes si se limpia el año
        }

        console.log('Años disponibles:', this.anios);
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

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ActivatedRoute, Router } from '@angular/router';
import { TetrazolioDto } from '../../../models/Tetrazolio.dto';
import { TetrazolioService } from '../../../services/TetrazolioService';
import { LogService } from '../../../services/LogService';
import { AuthService } from '../../../services/AuthService';

@Component({
  selector: 'app-listado-tetrazolio.component',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule],
  templateUrl: './listado-tetrazolio.component.html',
  styleUrl: './listado-tetrazolio.component.scss'
})
export class ListadoTetrazolioComponent implements OnInit {
    constructor(
        private router: Router, 
        private route: ActivatedRoute,
        private tetrazolioService: TetrazolioService,
        private logService: LogService,
        private authService: AuthService
    ) {}

    selectedMes: string = '';
    selectedAnio: string = '';
    searchText: string = '';

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

    isObserver: boolean = false;

    anios = [
      { label: '2020', id: 2020 },
      { label: '2021', id: 2021 },
      { label: '2022', id: 2022 },
      { label: '2023', id: 2023 },
      { label: '2024', id: 2024 }
    ];

    items: TetrazolioDto[] = [];
    loading: boolean = false;
    error: string | null = null;

    // Propiedades de paginación
    page = 0; // 0-based
    size = 12;
    totalElements = 0;
    totalPages = 0;

    ngOnInit() {
        this.cargarDatos();
    }

    navegarAVer(item: TetrazolioDto) {
      const loteId = this.route.snapshot.paramMap.get('loteId');
      const reciboId = this.route.snapshot.paramMap.get('reciboId');
      console.log('Navegando para ver Tetrazolio:', item);
      this.router.navigate([loteId, reciboId, 'tetrazolio', item.id], { queryParams: { view: 'true' } });
    }

    private cargarDatos() {
        this.loading = true;
        this.error = null;
        
        this.isObserver = this.authService.isObservador();

        // Obtener reciboId de los parámetros de la ruta
        const reciboId = this.route.snapshot.paramMap.get('reciboId');
        
        if (reciboId) {
            // Cargar tetrazolios por recibo específico
            this.tetrazolioService.listarPorRecibo(parseInt(reciboId)).subscribe({
                next: (response) => {
                    this.items = response.tetrazolio || [];
                    this.page = 0; // Reset a primera página cuando se cargan nuevos datos
                    this.loading = false;
                    console.log('Tetrazolios cargados:', this.items);
                },
                error: (err) => {
                    console.error('Error cargando tetrazolios:', err);
                    this.error = 'Error al cargar los tetrazolios';
                    this.loading = false;
                }
            });
        } else {
            // Cargar todos los tetrazolios
            this.tetrazolioService.listar().subscribe({
                next: (response) => {
                    this.items = response.tetrazolio || [];
                    this.page = 0; // Reset a primera página cuando se cargan nuevos datos
                    this.loading = false;
                    console.log('Tetrazolios cargados:', this.items);
                },
                error: (err) => {
                    console.error('Error cargando tetrazolios:', err);
                    this.error = 'Error al cargar los tetrazolios';
                    this.loading = false;
                }
            });
        }
    }

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



    getFechaConTipo(item: TetrazolioDto): { fecha: string, tipo: string } {
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

    onAnioChange() {
      this.selectedMes = '';
    }

    goToHome() {
      const loteId = this.route.snapshot.paramMap.get('loteId');
      const reciboId = this.route.snapshot.paramMap.get('reciboId');

      if (loteId && reciboId) {
        this.router.navigate([`/${loteId}/${reciboId}/lote-analisis`]);
        return;
      }
      if (loteId) {
        this.router.navigate([`/${loteId}/lote-analisis`]);
        return;
      }
      this.router.navigate(['/home']);
    }

    crearTetrazolio() {
      console.log('Navegando para crear nuevo Tetrazolio');
      const loteId = this.route.snapshot.paramMap.get('loteId');
      const reciboId = this.route.snapshot.paramMap.get('reciboId');
      if (loteId && reciboId) {
        this.router.navigate([`/${loteId}/${reciboId}/tetrazolio/crear`]);
      } else {
        this.router.navigate(['/home']);
      }
    }

    navegarAEditar(item: TetrazolioDto) {
      console.log('Navegando para editar Tetrazolio:', item);
      const loteId = this.route.snapshot.paramMap.get('loteId');
      const reciboId = this.route.snapshot.paramMap.get('reciboId');
      if (loteId && reciboId && item.id) {
        this.router.navigate([`/${loteId}/${reciboId}/tetrazolio/editar/${item.id}`]);
      } else {
        console.error('No se puede navegar a edición: faltan parámetros o ID');
        this.router.navigate(['/home']);
      }
    }

    eliminarTetrazolio(item: TetrazolioDto) {
      console.log('Eliminar Tetrazolio:', item);
      
      if (confirm(`¿Estás seguro de que quieres eliminar el Tetrazolio #${item.id}?`)) {
        if (item.id) {
          this.tetrazolioService.eliminar(item.id).subscribe({
            next: (response) => {
              console.log('Tetrazolio eliminado correctamente:', response);
              // Recargar los datos para reflejar los cambios

              const loteId = this.route.snapshot.paramMap.get('loteId');
              this.logService.crearLog(loteId ? parseInt(loteId) : 0, item.id!, 'Tetrazolio', 'eliminado').subscribe();
              this.cargarDatos();
            },
            error: (err) => {
              console.error('Error eliminando tetrazolio:', err);
              this.error = 'Error al eliminar el tetrazolio';
            }
          });
        }
      }
    }

    recargarDatos() {
        this.cargarDatos();
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

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ActivatedRoute, Router } from '@angular/router';
import { TetrazolioDto } from '../../../models/Tetrazolio.dto';
import { TetrazolioService } from '../../../services/TetrazolioService';


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
        private tetrazolioService: TetrazolioService
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

    ngOnInit() {
        this.cargarDatos();
    }

    private cargarDatos() {
        this.loading = true;
        this.error = null;
        
        // Obtener reciboId de los parámetros de la ruta
        const reciboId = this.route.snapshot.paramMap.get('reciboId');
        
        if (reciboId) {
            // Cargar tetrazolios por recibo específico
            this.tetrazolioService.listarPorRecibo(parseInt(reciboId)).subscribe({
                next: (response) => {
                    this.items = response.tetrazolio || [];
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
      return this.items.filter(item => {

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
}

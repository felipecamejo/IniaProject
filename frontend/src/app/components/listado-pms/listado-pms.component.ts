import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router, ActivatedRoute } from '@angular/router';
import { PMSDto } from '../../../models/PMS.dto';
import { PMSService } from '../../../services/PMSService';
import { LogService } from '../../../services/LogService';
import { AuthService } from '../../../services/AuthService';

@Component({
  selector: 'app-listado-pms.component',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule],
  templateUrl: './listado-pms.component.html',
  styleUrl: './listado-pms.component.scss'
})
export class ListadoPmsComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute, private pmsService: PMSService, private logService: LogService) {}

    selectedMes: string = '';
    selectedAnio: string = '';
  searchText: string = '';
  loteId: string = '';
  reciboId: number | null = null;

  isObserver: boolean = false;

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

    items: PMSDto[] = [];

    // Propiedades de paginación
    page = 0; // 0-based
    size = 12;
    totalElements = 0;
    totalPages = 0;

    // Propiedades para el popup de confirmación
    mostrarConfirmEliminar: boolean = false;
    pmsAEliminar: PMSDto | null = null;
    confirmLoading: boolean = false;

    cargarItems() {
      if (this.reciboId == null || isNaN(this.reciboId)) {
        console.warn('No hay reciboId para listar PMS');
        this.items = [];
        return;
      }
      this.isObserver = this.authService.isObservador();
      this.pmsService.listar(this.reciboId).subscribe({
        next: (data: PMSDto[]) => {
          // Algunos endpoints devuelven { pms: [...] } en lugar de [...] directamente.
          // Aceptamos cualquiera de los dos formatos y defensivamente asignamos un array.
          let resolved: any = data;
          if (resolved == null) {
            this.items = [];
          } else if (Array.isArray(resolved)) {
            this.items = resolved;
          } else if (Array.isArray(resolved.pms)) {
            this.items = resolved.pms;
          } else if (Array.isArray(resolved.data)) {
            // otro posible envoltorio común
            this.items = resolved.data;
          } else {
            // No es un array: vaciamos y logueamos para depuración
            console.warn('Respuesta inesperada al listar PMS, se esperaba un array o {pms: []}:', resolved);
            this.items = [];
          }
          console.log('PMS cargados:', this.items);
          this.actualizarAniosDisponibles();
          this.page = 0; // Reset a primera página cuando se cargan nuevos datos
        },
        error: (err) => {
          console.error('Error cargando PMS:', err);
          // En caso de error, mantener lista vacía o mostrar feedback al usuario
          this.items = [];
        }
      });
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



    getFechaConTipo(item: PMSDto): { fecha: string, tipo: string } {
      if (item.repetido && item.fechaRepeticion) {
        return { fecha: item.fechaRepeticion, tipo: 'Repetición' };
      }
      if (item.repetido){
        return { fecha: item.fechaCreacion || '', tipo: 'Repetición' };
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

    crearPMS() {
      console.log('Navegando para crear nuevo PMS');
      this.router.navigate([this.loteId, this.reciboId, 'pms', 'crear']);
    }

    navegarAVer(item: PMSDto) {
      console.log('Navegando para ver PMS:', item);
      this.router.navigate([this.loteId, this.reciboId, 'pms', item.id], { queryParams: { view: 'true' } });
    }

    navegarAEditar(item: PMSDto) {
      console.log('Navegando para editar PMS:', item);
      this.router.navigate([this.loteId, this.reciboId, 'pms', 'editar', item.id]);
    }

    eliminarPMS(item: PMSDto) {
      console.log('Eliminar PMS:', item);
      const confirmacion = confirm('¿Estás seguro de que quieres eliminar este PMS?');
      
      if (!confirmacion || item.id == null) return;
      
      this.pmsService.eliminar(item.id).subscribe({
        next: (res) => {
          console.log('PMS eliminado en backend:', res);
          this.logService.crearLog(Number(this.loteId), Number(item.id), 'PMS', 'eliminado').subscribe();
          // Actualizar lista localmente
          this.items = this.items.filter(pmsItem => pmsItem.id !== item.id);
          alert('PMS eliminado exitosamente.');
        },
        error: (err) => {
          console.error('Error eliminando PMS:', err);
          alert('Error al eliminar el PMS. Por favor, inténtalo de nuevo.');
        }
      });
    }

    cancelarEliminacion() {
      this.mostrarConfirmEliminar = false;
      this.pmsAEliminar = null;
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

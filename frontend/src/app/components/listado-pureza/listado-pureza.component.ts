import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router, ActivatedRoute } from '@angular/router';
import { PurezaDto } from '../../../models/Pureza.dto';
import { PurezaService } from '../../../services/PurezaService';
import { LogService } from '../../../services/LogService';

@Component({
  selector: 'app-listado-pureza.component',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule],
  templateUrl: './listado-pureza.component.html',
  styleUrl: './listado-pureza.component.scss'
})
export class ListadoPurezaComponent implements OnInit {
    constructor(
        private router: Router, 
        private route: ActivatedRoute,
        private purezaService: PurezaService,
        private logService: LogService
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

    items: PurezaDto[] = [];

    navegarAVer(item: PurezaDto) {
          console.log('Navegando para ver Pureza:', item);
          this.router.navigate([this.loteId, this.reciboId, 'pureza', item.id], { queryParams: { view: 'true' } });
    }  

    ngOnInit() {
       this.loteId = this.route.snapshot.params['loteId'];
       this.reciboId = this.route.snapshot.params['reciboId'];
       this.cargarPurezas();
    }

    cargarPurezas() {
        this.purezaService.listar(this.route.snapshot.params['reciboId']).subscribe({
            next: (response) => {
                this.items = response.purezas;
                console.log('Purezas cargadas:', this.items);
                // Actualizar años disponibles después de cargar los items
                this.actualizarAniosDisponibles();
            },
            error: (error) => {
                console.error('Error al cargar purezas:', error);
                // Aquí puedes agregar manejo de errores, como mostrar un mensaje al usuario
            }
        });
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



    getFechaConTipo(item: PurezaDto): { fecha: string, tipo: string } {
      if (item.repetido && item.fechaRepeticion) {
        return { fecha: item.fechaRepeticion, tipo: 'Repetición' };
      }
      return { fecha: item.fechaCreacion || '', tipo: 'Creación' };
    }

    /**
     * Obtiene la fecha formateada según si es pendiente (fechaCreacion) o repetido (fechaRepeticion)
     */
    getFechaFormateada(item: PurezaDto): string {
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

    crearPureza() {
      console.log('Navegando para crear nueva Pureza');
      this.router.navigate([this.loteId, this.reciboId, 'pureza', 'crear']);
    }

    navegarAEditar(item: PurezaDto) {
      console.log('Navegando para editar Pureza:', item);
      this.router.navigate([this.loteId, this.reciboId, 'pureza', 'editar', item.id]);
    }

    eliminarPureza(item: PurezaDto) {
        console.log('Eliminar Pureza:', item);
        const confirmacion = confirm('¿Estás seguro de que quieres eliminar esta Pureza?');
        
        if (!confirmacion || !item.id) return;
        
        this.purezaService.eliminar(item.id).subscribe({
            next: (response) => {
                console.log('Pureza eliminada exitosamente:', response);
                this.logService.crearLog(Number(this.loteId), Number(item.id), 'Pureza', 'eliminada').subscribe();
                alert('Pureza eliminada exitosamente.');
                // Recargar la lista después de eliminar
                this.cargarPurezas();
            },
            error: (error) => {
                console.error('Error al eliminar la pureza:', error);
                alert('Error al eliminar la pureza. Por favor, inténtalo de nuevo.');
            }
        });
    }
}

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
import { LogService } from '../../../services/LogService';

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
export class ListadoLogsComponent {
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
  
      items: LogDto[] = [];
  
      // Propiedades para el popup de confirmación
      mostrarConfirmEliminar: boolean = false;
      logAEliminar: LogDto | null = null;
      confirmLoading: boolean = false;
  
      navegarAVer(item: LogDto) {
        console.log('Navegando para ver Log:', item);
        this.router.navigate([this.loteId, this.reciboId, 'logs', 'ver', item.id], { queryParams: { view: 'true' } });
      }  
  
      ngOnInit() {
        this.cargarLogs();
      }

      cargarLogs() {
        const loteId = this.route.snapshot.params['loteId'];

          this.logService.listarLogs(loteId).subscribe({
              next: (response) => {
                  this.items = response.logs;
                  console.log('Logs cargados:', this.items);
                  // Actualizar años disponibles después de cargar los items
                  this.actualizarAniosDisponibles();
              },
              error: (error) => {
                  console.error('Error al cargar logs:', error);
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
  
      /**
       * Obtiene la fecha formateada según si es pendiente (fechaCreacion) o repetido (fechaRepeticion)
       */
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
  
      /**
       * Formatea una fecha (posiblemente en ISO o YYYY-MM-DD[T...] ) a DD/MM/YYYY HH:mm.
       * Devuelve cadena vacía si la fecha es inválida o no está presente.
       */
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
  
      onAnioChange() {
        this.selectedMes = '';
      }
  
      goToHome() {
        const loteId = this.route.snapshot.params['loteId'];
        const reciboId = this.route.snapshot.params['reciboId'];
        this.router.navigate([loteId, reciboId, 'lote-analisis']);
      }
  
}

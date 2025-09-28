import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { PMSDto } from '../../../models/PMS.dto';


@Component({
  selector: 'app-listado-pms.component',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule],
  templateUrl: './listado-pms.component.html',
  styleUrl: './listado-pms.component.scss'
})
export class ListadoPmsComponent {
    constructor(private router: Router) {}

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

    items: PMSDto[] = [
      {
        id: 1,
        pesoMilSemillas: 25.5,
        humedadPorcentual: 12.3,
        fechaMedicion: '2023-01-15',
        metodo: 'Manual',
        observaciones: 'Control de calidad mensual - Muestra estándar',
        activo: true,
        repetido: false,
        reciboId: 101,
        fechaCreacion: '2023-01-15',
        fechaRepeticion: null
      },
      {
        id: 2,
        pesoMilSemillas: 23.8,
        humedadPorcentual: 11.7,
        fechaMedicion: '2022-02-20',
        metodo: 'Automático',
        observaciones: 'Lote especial - Requiere repetición',
        activo: true,
        repetido: true,
        reciboId: 102,
        fechaCreacion: '2022-02-20',
        fechaRepeticion: '2022-02-22'
      },
      {
        id: 3,
        pesoMilSemillas: 26.1,
        humedadPorcentual: 13.2,
        fechaMedicion: '2023-03-10',
        metodo: 'Manual',
        observaciones: 'Inspección rutinaria de equipos - Repetir análisis',
        activo: true,
        repetido: true,
        reciboId: 103,
        fechaCreacion: '2023-03-10',
        fechaRepeticion: '2023-03-12'
      }
    ];

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



    getFechaConTipo(item: PMSDto): { fecha: string, tipo: string } {
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

    crearPMS() {
      console.log('Navegando para crear nuevo PMS');
      this.router.navigate(['/pms/crear']);
    }

    navegarAEditar(item: PMSDto) {
      console.log('Navegando para editar PMS:', item);
      this.router.navigate(['/pms/editar', item.id]);
    }

    eliminarPMS(item: PMSDto) {
      console.log('Eliminar PMS:', item);
      // Aquí puedes implementar la lógica para eliminar el PMS
      // Por ejemplo, mostrar un modal de confirmación
      if (confirm(`¿Estás seguro de que quieres eliminar el PMS #${item.id}?`)) {
        this.items = this.items.filter(pms => pms.id !== item.id);
        console.log('PMS eliminado');
      }
    }
}

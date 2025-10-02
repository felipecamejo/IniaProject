import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { PurezaDto } from '../../../models/Pureza.dto';


@Component({
  selector: 'app-listado-pureza.component',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule],
  templateUrl: './listado-pureza.component.html',
  styleUrl: './listado-pureza.component.scss'
})
export class ListadoPurezaComponent {
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

    items: PurezaDto[] = [
      {
        id: 1,
        fecha: '2023-01-15',
        pesoInicial: 100.0,
        semillaPura: 85.5,
        materialInerte: 8.2,
        otrosCultivos: 3.1,
        malezas: 2.2,
        malezasToleradas: 1.0,
        pesoTotal: 100.0,
        otrosCultivo: 3.1,
        fechaEstandar: '2023-01-15',
        estandar: true,
        activo: true,
        repetido: false,
        fechaCreacion: '2023-01-15',
        fechaRepeticion: null
      },
      {
        id: 2,
        fecha: '2022-02-20',
        pesoInicial: 100.0,
        semillaPura: 82.3,
        materialInerte: 9.5,
        otrosCultivos: 4.2,
        malezas: 3.0,
        malezasToleradas: 1.0,
        pesoTotal: 100.0,
        otrosCultivo: 4.2,
        fechaEstandar: '2022-02-20',
        estandar: false,
        activo: true,
        repetido: true,
        fechaCreacion: '2022-02-20',
        fechaRepeticion: '2022-02-22'
      },
      {
        id: 3,
        fecha: '2023-03-10',
        pesoInicial: 100.0,
        semillaPura: 88.1,
        materialInerte: 7.3,
        otrosCultivos: 2.6,
        malezas: 1.5,
        malezasToleradas: 0.5,
        pesoTotal: 100.0,
        otrosCultivo: 2.6,
        fechaEstandar: '2023-03-10',
        estandar: true,
        activo: true,
        repetido: true,
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



    getFechaConTipo(item: PurezaDto): { fecha: string, tipo: string } {
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

    crearPureza() {
      console.log('Navegando para crear nueva Pureza');
      this.router.navigate(['/pureza/crear']);
    }

    navegarAEditar(item: PurezaDto) {
      console.log('Navegando para editar Pureza:', item);
      this.router.navigate(['/pureza/editar', item.id]);
    }

    eliminarPureza(item: PurezaDto) {
      console.log('Eliminar Pureza:', item);
      // Aquí puedes implementar la lógica para eliminar la Pureza
      // Por ejemplo, mostrar un modal de confirmación
      if (confirm(`¿Estás seguro de que quieres eliminar la Pureza #${item.id}?`)) {
        this.items = this.items.filter(pureza => pureza.id !== item.id);
        console.log('Pureza eliminada');
      }
    }
}

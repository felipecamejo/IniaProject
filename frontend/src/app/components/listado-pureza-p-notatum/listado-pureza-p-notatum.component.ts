import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { PMSDto } from '../../../models/PMS.dto';
import { PurezaPNotatumDto } from '../../../models/PurezaPNotatum.dto';

@Component({
  selector: 'app-listado-pureza-p-notatum',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule],
  templateUrl: './listado-pureza-p-notatum.component.html',
  styleUrl: './listado-pureza-p-notatum.component.scss'
})
export class ListadoPurezaPNotatumComponent {
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

    items: PurezaPNotatumDto[] = [
      {
        id: 1,
        porcentaje: 98.5,
        pesoInicial: 100,
        repeticiones: 1,
        Pi: 50,
        At: 48,
        porcentajeA: 96,
        totalA: 48,
        semillasLS: 2,
        activo: true,
        repetido: false,
        fechaCreacion: '2023-01-15',
        fechaRepeticion: null,
        observaciones: 'Control de calidad mensual - Muestra estándar'
      },
      {
        id: 2,
        porcentaje: 97.2,
        pesoInicial: 120,
        repeticiones: 2,
        Pi: 60,
        At: 58,
        porcentajeA: 96.7,
        totalA: 58,
        semillasLS: 2,
        activo: true,
        repetido: true,
        fechaCreacion: '2022-02-20',
        fechaRepeticion: '2022-02-22',
        observaciones: 'Lote especial - Requiere repetición'
      },
      {
        id: 3,
        porcentaje: 99.1,
        pesoInicial: 110,
        repeticiones: 1,
        Pi: 55,
        At: 54,
        porcentajeA: 98.2,
        totalA: 54,
        semillasLS: 1,
        activo: true,
        repetido: true,
        fechaCreacion: '2023-03-10',
        fechaRepeticion: '2023-03-12',
        observaciones: 'Inspección rutinaria de equipos - Repetir análisis'
      }
    ];

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

    onAnioChange() {
      this.selectedMes = '';
    }

    goToHome() {
      this.router.navigate(['/home']);
    }

    crearPurezaPNotatum() {
      console.log('Navegando para crear nuevo Pureza P. notatum');
      this.router.navigate(['/pureza-p-notatum/crear']);
    }

    navegarAEditar(item: PurezaPNotatumDto) {
      console.log('Navegando para editar Pureza P. notatum:', item);
      this.router.navigate(['/pureza-p-notatum/editar', item.id]);
    }

    eliminarPurezaPNotatum(item: PurezaPNotatumDto) {
      console.log('Eliminar Pureza P. notatum:', item);
      if (confirm(`¿Estás seguro de que quieres eliminar el Pureza P. notatum #${item.id}?`)) {
        this.items = this.items.filter(pn => pn.id !== item.id);
        console.log('Pureza P. notatum eliminado');
      }
    }
}


import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { PMSDto } from '../../../models/PMS.dto';
import { DOSNDto } from '../../../models/DOSN.dto';

@Component({
  selector: 'app-listado-dosn.component',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule],
  templateUrl: './listado-dosn.component.html',
  styleUrl: './listado-dosn.component.scss'
})
export class ListadoDosnComponent {
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

    items: DOSNDto[] = [
      {
        id: 1,
        fechaINIA: '2023-01-15T00:00:00',
        fechaINASE: '2023-01-16T00:00:00',
        gramosAnalizadosINIA: 100,
        gramosAnalizadosINASE: 120,
        tiposDeanalisisINIA: 'COMPLETO',
        tiposDeanalisisINASE: 'REDUCIDO',
        determinacionBrassica: false,
        determinacionBrassicaGramos: 0,
        determinacionCuscuta: false,
        determinacionCuscutaGramos: 0,
        estandar: true,
        fechaAnalisis: '2023-01-15T00:00:00',
        malezasNormalesINIAId: [1,2],
        malezasNormalesINASEId: [2],
        malezasToleradasINIAId: [],
        malezasToleradasINASEId: [3],
        malezasToleranciaCeroINIAId: [],
        malezasToleranciaCeroINASEId: [],
        cultivosINIAId: [1],
        cultivosINASEId: [2,3],
        activo: true,
        repetido: false,
        fechaCreacion: '2023-01-15',
        fechaRepeticion: null,
        observaciones: 'Sin observaciones'
      },
      {
        id: 2,
        fechaINIA: '2022-02-20T00:00:00',
        fechaINASE: '2022-02-21T00:00:00',
        gramosAnalizadosINIA: 80,
        gramosAnalizadosINASE: 90,
        tiposDeanalisisINIA: 'REDUCIDO',
        tiposDeanalisisINASE: 'LIMITADO',
        determinacionBrassica: true,
        determinacionBrassicaGramos: 0.5,
        determinacionCuscuta: false,
        determinacionCuscutaGramos: 0,
        estandar: false,
        fechaAnalisis: '2022-02-20T00:00:00',
        malezasNormalesINIAId: [],
        malezasNormalesINASEId: [],
        malezasToleradasINIAId: [1],
        malezasToleradasINASEId: [],
        malezasToleranciaCeroINIAId: [],
        malezasToleranciaCeroINASEId: [2],
        cultivosINIAId: [2],
        cultivosINASEId: [],
        activo: true,
        repetido: true,
        fechaCreacion: '2022-02-20',
        fechaRepeticion: '2022-02-22',
        observaciones: null
      },
      {
        id: 3,
        fechaINIA: '2023-03-10T00:00:00',
        fechaINASE: '2023-03-11T00:00:00',
        gramosAnalizadosINIA: 110,
        gramosAnalizadosINASE: 115,
        tiposDeanalisisINIA: 'COMPLETO',
        tiposDeanalisisINASE: 'REDUCIDO_LIMITADO',
        determinacionBrassica: false,
        determinacionBrassicaGramos: 0,
        determinacionCuscuta: true,
        determinacionCuscutaGramos: 0.2,
        estandar: true,
        fechaAnalisis: '2023-03-10T00:00:00',
        malezasNormalesINIAId: [],
        malezasNormalesINASEId: [1],
        malezasToleradasINIAId: [],
        malezasToleradasINASEId: [],
        malezasToleranciaCeroINIAId: [],
        malezasToleranciaCeroINASEId: [],
        cultivosINIAId: [],
        cultivosINASEId: [4],
        activo: true,
        repetido: true,
        fechaCreacion: '2023-03-10',
        fechaRepeticion: '2023-03-12',
        observaciones: 'Revisión completa'
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

    getFechaConTipo(item: DOSNDto): { fecha: string, tipo: string } {
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

    crearDOSN() {
      console.log('Navegando para crear nuevo DOSN');
      this.router.navigate(['/dosn/crear']);
    }

    navegarAEditar(item: DOSNDto) {
      console.log('Navegando para editar DOSN:', item);
      this.router.navigate(['/dosn/editar', item.id]);
    }

    eliminarDOSN(item: DOSNDto) {
      console.log('Eliminar DOSN:', item);
      if (confirm(`¿Estás seguro de que quieres eliminar el DOSN #${item.id}?`)) {
        this.items = this.items.filter(dosn => dosn.id !== item.id);
        console.log('DOSN eliminado');
      }
    }
}

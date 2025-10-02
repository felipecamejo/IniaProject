import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { PMSDto } from '../../../models/PMS.dto';
import { GerminacionDto } from '../../../models/Germinacion.dto';

@Component({
  selector: 'app-listado-germinacion',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule],
  templateUrl: './listado-germinacion.component.html',
  styleUrl: './listado-germinacion.component.scss'
})
export class ListadoGerminacionComponent {
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

    items: GerminacionDto[] = [
      {
        id: 1,
        reciboId: 101,
        activo: true,
        fechaInicio: '2023-01-15',
        fechaConteo1: '2023-01-16',
        fechaConteo2: '2023-01-17',
        fechaConteo3: null,
        fechaConteo4: null,
        fechaConteo5: null,
        totalDias: 7,
        repeticionNormal1: 10,
        repeticionNormal2: 12,
        repeticionNormal3: 0,
        repeticionNormal4: 0,
        repeticionNormal5: 0,
        repeticionDura: 2,
        repeticionFresca: 1,
        repeticionAnormal: 0,
        repeticionMuerta: 0,
        totalRepeticion: 25,
        promedioRepeticiones: 12.5,
        tratamiento: 'T1',
        nroSemillaPorRepeticion: 50,
        metodo: 'A',
        temperatura: 20,
        preFrio: 'NINGUNO',
        preTratamiento: 'NINGUNO',
        nroDias: 7,
        fechaFinal: '2023-01-22',
        pRedondeo: 0,
        pNormal: 80,
        pAnormal: 0,
        pMuertas: 0,
        semillasDuras: 2,
        germinacion: 96,
        comentarios: 'Control de calidad mensual - Muestra estándar',
        repetido: false,
        fechaCreacion: '2023-01-15',
        fechaRepeticion: null
      },
      {
        id: 2,
        reciboId: 102,
        activo: true,
        fechaInicio: '2022-02-20',
        fechaConteo1: '2022-02-21',
        fechaConteo2: '2022-02-22',
        fechaConteo3: null,
        fechaConteo4: null,
        fechaConteo5: null,
        totalDias: 7,
        repeticionNormal1: 11,
        repeticionNormal2: 13,
        repeticionNormal3: 0,
        repeticionNormal4: 0,
        repeticionNormal5: 0,
        repeticionDura: 1,
        repeticionFresca: 2,
        repeticionAnormal: 0,
        repeticionMuerta: 0,
        totalRepeticion: 27,
        promedioRepeticiones: 13.5,
        tratamiento: 'T2',
        nroSemillaPorRepeticion: 50,
        metodo: 'B',
        temperatura: 22,
        preFrio: 'CORTO',
        preTratamiento: 'X',
        nroDias: 7,
        fechaFinal: '2022-02-27',
        pRedondeo: 0,
        pNormal: 85,
        pAnormal: 0,
        pMuertas: 0,
        semillasDuras: 1,
        germinacion: 98,
        comentarios: 'Lote especial - Requiere repetición',
        repetido: true,
        fechaCreacion: '2022-02-20',
        fechaRepeticion: '2022-02-22'
      },
      {
        id: 3,
        reciboId: 103,
        activo: true,
        fechaInicio: '2023-03-10',
        fechaConteo1: '2023-03-11',
        fechaConteo2: '2023-03-12',
        fechaConteo3: null,
        fechaConteo4: null,
        fechaConteo5: null,
        totalDias: 7,
        repeticionNormal1: 12,
        repeticionNormal2: 14,
        repeticionNormal3: 0,
        repeticionNormal4: 0,
        repeticionNormal5: 0,
        repeticionDura: 3,
        repeticionFresca: 1,
        repeticionAnormal: 0,
        repeticionMuerta: 0,
        totalRepeticion: 30,
        promedioRepeticiones: 15,
        tratamiento: 'T1',
        nroSemillaPorRepeticion: 50,
        metodo: 'C',
        temperatura: 24,
        preFrio: 'LARGO',
        preTratamiento: 'Y',
        nroDias: 7,
        fechaFinal: '2023-03-17',
        pRedondeo: 0,
        pNormal: 90,
        pAnormal: 0,
        pMuertas: 0,
        semillasDuras: 3,
        germinacion: 99,
        comentarios: 'Inspección rutinaria de equipos - Repetir análisis',
        repetido: true,
        fechaCreacion: '2023-03-10',
        fechaRepeticion: '2023-03-12'
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

    getFechaConTipo(item: GerminacionDto): { fecha: string, tipo: string } {
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

    crearGerminacion() {
      console.log('Navegando para crear nueva Germinación');
      this.router.navigate(['/germinacion/crear']);
    }

    navegarAEditar(item: GerminacionDto) {
      console.log('Navegando para editar Germinación:', item);
      this.router.navigate(['/germinacion/editar', item.id]);
    }

    eliminarGerminacion(item: GerminacionDto) {
      console.log('Eliminar Germinación:', item);
      if (confirm(`¿Estás seguro de que quieres eliminar la Germinación #${item.id}?`)) {
        this.items = this.items.filter(germ => germ.id !== item.id);
        console.log('Germinación eliminada');
      }
    }
}

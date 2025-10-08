import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { SanitarioDto } from '../../../models/Sanitario.dto';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-listado-sanitario.component',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule],
  templateUrl: './listado-sanitario.component.html',
  styleUrls: ['./listado-sanitario.component.scss']
})
export class ListadoSanitarioComponent implements OnInit {
    constructor(private router: Router, private route: ActivatedRoute) {}

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

    anios = [
      { label: '2020', id: 2020 },
      { label: '2021', id: 2021 },
      { label: '2022', id: 2022 },
      { label: '2023', id: 2023 },
      { label: '2024', id: 2024 }
    ];

    items: SanitarioDto[] = [
      {
        id: 1,
        fechaSiembra: '2023-01-10',
        fecha: '2023-01-15',
        metodo: 'Metodo A',
        temperatura: 25,
        horasLuz: 12,
        horasOscuridad: 12,
        nroDias: 7,
        estadoProductoDosis: 'Activo',
        observaciones: 'Control de calidad mensual - Muestra estándar',
        nroSemillasRepeticion: 100,
        reciboId: 101,
        activo: true,
        estandar: false,
        repetido: false,
        SanitarioHongoids: [1, 2],
        fechaCreacion: '2023-01-15',
        fechaRepeticion: null
      },
      {
        id: 2,
        fechaSiembra: '2022-02-15',
        fecha: '2022-02-20',
        metodo: 'Metodo B',
        temperatura: 23,
        horasLuz: 14,
        horasOscuridad: 10,
        nroDias: 10,
        estadoProductoDosis: 'Pendiente',
        observaciones: 'Lote especial - Requiere repetición',
        nroSemillasRepeticion: 150,
        reciboId: 102,
        activo: true,
        estandar: true,
        repetido: true,
        SanitarioHongoids: [3, 4, 5],
        fechaCreacion: '2022-02-20',
        fechaRepeticion: '2022-02-22'
      },
      {
        id: 3,
        fechaSiembra: '2023-03-05',
        fecha: '2023-03-10',
        metodo: 'Metodo C',
        temperatura: 26,
        horasLuz: 16,
        horasOscuridad: 8,
        nroDias: 14,
        estadoProductoDosis: 'Completado',
        observaciones: 'Inspección rutinaria de equipos - Repetir análisis',
        nroSemillasRepeticion: 200,
        reciboId: 103,
        activo: false,
        estandar: false,
        repetido: true,
        SanitarioHongoids: null,
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

    ngOnInit() {
       this.loteId = this.route.snapshot.params['loteId'];
       this.reciboId = this.route.snapshot.params['reciboId'];
    }

    navegarAVer(item: SanitarioDto) {
          console.log('Navegando para ver Sanitario:', item);
          this.router.navigate([this.loteId, this.reciboId, 'sanitario', item.id], { queryParams: { view: 'true' } });
    }

    getFechaConTipo(item: SanitarioDto): { fecha: string, tipo: string } {
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
      this.router.navigate([this.loteId, this.reciboId, 'lote-analisis']);
    }

    crearItem() {
      console.log('Navegando para crear nuevo Sanitario');
      console.log('LoteId:', this.loteId);
      console.log('ReciboId:', this.reciboId);
      this.router.navigate([this.loteId, this.reciboId, 'sanitario', 'crear']);
    }

    navegarAEditar(item: SanitarioDto) {
      console.log('Navegando para editar Sanitario:', item);
      this.router.navigate([this.loteId, this.reciboId, 'sanitario', 'editar', item.id]);
    }

    eliminarItem(item: SanitarioDto) {
      console.log('Eliminar Sanitario:', item);
      // Aquí puedes implementar la lógica para eliminar el Sanitario
      // Por ejemplo, mostrar un modal de confirmación
      if (confirm(`¿Estás seguro de que quieres eliminar el Sanitario #${item.id}?`)) {
        this.items = this.items.filter(sanitario => sanitario.id !== item.id);
        console.log('Sanitario eliminado');
      }
    }
}

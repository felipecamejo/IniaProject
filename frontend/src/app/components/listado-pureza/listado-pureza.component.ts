import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router, ActivatedRoute } from '@angular/router';
import { PurezaDto } from '../../../models/Pureza.dto';


@Component({
  selector: 'app-listado-pureza.component',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule],
  templateUrl: './listado-pureza.component.html',
  styleUrl: './listado-pureza.component.scss'
})
export class ListadoPurezaComponent implements OnInit {
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

    items: PurezaDto[] = [
      {
        id: 1,
        fechaInase: '2023-01-15',
        fechaInia: '2023-01-16',
        pesoInicial: 100.0,
        pesoInicialInase: 100.0,
        pesoInicialPorcentajeRedondeo: 100.0,
        pesoInicialPorcentajeRedondeoInase: 100.0,
        semillaPura: 85.5,
        semillaPuraInase: 85.5,
        semillaPuraPorcentajeRedondeo: 85.5,
        semillaPuraPorcentajeRedondeoInase: 85.5,
        materialInerte: 8.2,
        materialInerteInase: 8.2,
        materialInertePorcentajeRedondeo: 8.2,
        materialInertePorcentajeRedondeoInase: 8.2,
        otrosCultivos: 3.1,
        otrosCultivosInase: 3.1,
        otrosCultivosPorcentajeRedondeo: 3.1,
        otrosCultivosPorcentajeRedondeoInase: 3.1,
        malezas: 2.2,
        malezasInase: 2.2,
        malezasPorcentajeRedondeo: 2.2,
        malezasPorcentajeRedondeoInase: 2.2,
        malezasToleradas: 1.0,
        malezasToleradasInase: 1.0,
        malezasToleradasPorcentajeRedondeo: 1.0,
        malezasToleradasPorcentajeRedondeoInase: 1.0,
        malezasToleranciaCero: 0.0,
        malezasToleranciaCeroInase: 0.0,
        malezasToleranciaCeroPorcentajeRedondeo: 0.0,
        malezasToleranciaCeroPorcentajeRedondeoInase: 0.0,
        pesoTotal: 100.0,
        fechaEstandar: '2023-01-15',
        estandar: true,
        activo: true,
        reciboId: 1,
        repetido: false,
        fechaCreacion: '2023-01-15',
        fechaRepeticion: null
      },
      {
        id: 2,
        fechaInase: '2022-02-20',
        fechaInia: '2022-02-21',
        pesoInicial: 100.0,
        pesoInicialInase: 100.0,
        pesoInicialPorcentajeRedondeo: 100.0,
        pesoInicialPorcentajeRedondeoInase: 100.0,
        semillaPura: 82.3,
        semillaPuraInase: 82.3,
        semillaPuraPorcentajeRedondeo: 82.3,
        semillaPuraPorcentajeRedondeoInase: 82.3,
        materialInerte: 9.5,
        materialInerteInase: 9.5,
        materialInertePorcentajeRedondeo: 9.5,
        materialInertePorcentajeRedondeoInase: 9.5,
        otrosCultivos: 4.2,
        otrosCultivosInase: 4.2,
        otrosCultivosPorcentajeRedondeo: 4.2,
        otrosCultivosPorcentajeRedondeoInase: 4.2,
        malezas: 3.0,
        malezasInase: 3.0,
        malezasPorcentajeRedondeo: 3.0,
        malezasPorcentajeRedondeoInase: 3.0,
        malezasToleradas: 1.0,
        malezasToleradasInase: 1.0,
        malezasToleradasPorcentajeRedondeo: 1.0,
        malezasToleradasPorcentajeRedondeoInase: 1.0,
        malezasToleranciaCero: 0.0,
        malezasToleranciaCeroInase: 0.0,
        malezasToleranciaCeroPorcentajeRedondeo: 0.0,
        malezasToleranciaCeroPorcentajeRedondeoInase: 0.0,
        pesoTotal: 100.0,
        fechaEstandar: '2022-02-20',
        estandar: false,
        activo: true,
        reciboId: 2,
        repetido: true,
        fechaCreacion: '2022-02-20',
        fechaRepeticion: '2022-02-22'
      },
      {
        id: 3,
        fechaInase: '2023-03-10',
        fechaInia: '2023-03-11',
        pesoInicial: 100.0,
        pesoInicialInase: 100.0,
        pesoInicialPorcentajeRedondeo: 100.0,
        pesoInicialPorcentajeRedondeoInase: 100.0,
        semillaPura: 88.1,
        semillaPuraInase: 88.1,
        semillaPuraPorcentajeRedondeo: 88.1,
        semillaPuraPorcentajeRedondeoInase: 88.1,
        materialInerte: 7.3,
        materialInerteInase: 7.3,
        materialInertePorcentajeRedondeo: 7.3,
        materialInertePorcentajeRedondeoInase: 7.3,
        otrosCultivos: 2.6,
        otrosCultivosInase: 2.6,
        otrosCultivosPorcentajeRedondeo: 2.6,
        otrosCultivosPorcentajeRedondeoInase: 2.6,
        malezas: 1.5,
        malezasInase: 1.5,
        malezasPorcentajeRedondeo: 1.5,
        malezasPorcentajeRedondeoInase: 1.5,
        malezasToleradas: 0.5,
        malezasToleradasInase: 0.5,
        malezasToleradasPorcentajeRedondeo: 0.5,
        malezasToleradasPorcentajeRedondeoInase: 0.5,
        malezasToleranciaCero: 0.0,
        malezasToleranciaCeroInase: 0.0,
        malezasToleranciaCeroPorcentajeRedondeo: 0.0,
        malezasToleranciaCeroPorcentajeRedondeoInase: 0.0,
        pesoTotal: 100.0,
        fechaEstandar: '2023-03-10',
        estandar: true,
        activo: true,
        reciboId: 3,
        repetido: true,
        fechaCreacion: '2023-03-10',
        fechaRepeticion: '2023-03-12'
      }
    ];

    navegarAVer(item: PurezaDto) {
          console.log('Navegando para ver Pureza:', item);
          this.router.navigate([this.loteId, this.reciboId, 'pureza', item.id], { queryParams: { view: 'true' } });
    }  

    ngOnInit() {
       this.loteId = this.route.snapshot.params['loteId'];
       this.reciboId = this.route.snapshot.params['reciboId'];
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
      // Aquí puedes implementar la lógica para eliminar la Pureza
      // Por ejemplo, mostrar un modal de confirmación
      if (confirm(`¿Estás seguro de que quieres eliminar la Pureza #${item.id}?`)) {
        this.items = this.items.filter(pureza => pureza.id !== item.id);
        console.log('Pureza eliminada');
      }
    }
}

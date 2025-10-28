import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ActivatedRoute, Router } from '@angular/router';
import { TetrazolioDto } from '../../../models/Tetrazolio.dto';


@Component({
  selector: 'app-listado-tetrazolio.component',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule],
  templateUrl: './listado-tetrazolio.component.html',
  styleUrl: './listado-tetrazolio.component.scss'
})
export class ListadoTetrazolioComponent {
    constructor(private router: Router, private route: ActivatedRoute) {}

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

    items: TetrazolioDto[] = [
      {
        id: 1,
        repeticion: 1,
        nroSemillasPorRepeticion: 100,
        pretratamientoId: 1,
        concentracion: 1.0,
        tincionHoras: 24,
        tincionGrados: 30,
        fecha: '2023-01-15',
        viables: 85,
        noViables: 10,
        duras: 5,
        total: 100,
        promedio: 85.0,
        porcentaje: 85.0,
        viabilidadPorTetrazolio: 'ALTA',
        nroSemillas: 100,
        daniosNroSemillas: 10,
        daniosMecanicos: 3,
        danioAmbiente: 2,
        daniosChinches: 1,
        daniosFracturas: 2,
        daniosOtros: 2,
        daniosDuras: 5,
        viabilidadVigorTz: 'ALTO',
        porcentajeFinal: 85.0,
        daniosPorPorcentajes: 10.0,
        activo: true,
        repetido: false,
        fechaCreacion: '2023-01-15',
        fechaRepeticion: null
      },
      {
        id: 2,
        repeticion: 2,
        nroSemillasPorRepeticion: 100,
        pretratamientoId: 2,
        concentracion: 0.75,
        tincionHoras: 18,
        tincionGrados: 25,
        fecha: '2022-02-20',
        viables: 72,
        noViables: 20,
        duras: 8,
        total: 100,
        promedio: 72.0,
        porcentaje: 72.0,
        viabilidadPorTetrazolio: 'MEDIA',
        nroSemillas: 100,
        daniosNroSemillas: 20,
        daniosMecanicos: 5,
        danioAmbiente: 4,
        daniosChinches: 3,
        daniosFracturas: 4,
        daniosOtros: 4,
        daniosDuras: 8,
        viabilidadVigorTz: 'MEDIO',
        porcentajeFinal: 72.0,
        daniosPorPorcentajes: 20.0,
        activo: true,
        repetido: true,
        fechaCreacion: '2022-02-20',
        fechaRepeticion: '2022-02-22'
      },
      {
        id: 3,
        repeticion: 1,
        nroSemillasPorRepeticion: 100,
        pretratamientoId: 3,
        concentracion: 1.25,
        tincionHoras: 30,
        tincionGrados: 35,
        fecha: '2023-03-10',
        viables: 92,
        noViables: 6,
        duras: 2,
        total: 100,
        promedio: 92.0,
        porcentaje: 92.0,
        viabilidadPorTetrazolio: 'ALTA',
        nroSemillas: 100,
        daniosNroSemillas: 6,
        daniosMecanicos: 1,
        danioAmbiente: 1,
        daniosChinches: 1,
        daniosFracturas: 1,
        daniosOtros: 2,
        daniosDuras: 2,
        viabilidadVigorTz: 'ALTO',
        porcentajeFinal: 92.0,
        daniosPorPorcentajes: 6.0,
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



    getFechaConTipo(item: TetrazolioDto): { fecha: string, tipo: string } {
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

    crearTetrazolio() {
      console.log('Navegando para crear nuevo Tetrazolio');
      const loteId = this.route.snapshot.paramMap.get('loteId');
      const reciboId = this.route.snapshot.paramMap.get('reciboId');
      if (loteId && reciboId) {
        this.router.navigate([`/${loteId}/${reciboId}/tetrazolio/crear`]);
      } else {
        this.router.navigate(['/home']);
      }
    }

    navegarAEditar(item: TetrazolioDto) {
      console.log('Navegando para editar Tetrazolio:', item);
      const loteId = this.route.snapshot.paramMap.get('loteId');
      const reciboId = this.route.snapshot.paramMap.get('reciboId');
      if (loteId && reciboId) {
        this.router.navigate([`/${loteId}/${reciboId}/tetrazolio/editar`, item.id]);
      } else {
        this.router.navigate(['/home']);
      }
    }

    eliminarTetrazolio(item: TetrazolioDto) {
      console.log('Eliminar Tetrazolio:', item);
      // Aquí puedes implementar la lógica para eliminar el Tetrazolio
      // Por ejemplo, mostrar un modal de confirmación
      if (confirm(`¿Estás seguro de que quieres eliminar el Tetrazolio #${item.id}?`)) {
        this.items = this.items.filter(tetrazolio => tetrazolio.id !== item.id);
        console.log('Tetrazolio eliminado');
      }
    }
}

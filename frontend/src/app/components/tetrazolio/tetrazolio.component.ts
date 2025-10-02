// Estructura para la nueva tabla de detalle
interface DetalleCategoria {
  total: number;
  mecanico: number;
  ambiente: number;
  chinches: number;
  fracturas: number;
  otros: number;
  duras: number;
}

interface DetalleSemillas {
  viablesSinDefectos: DetalleCategoria;
  viablesLeves: DetalleCategoria;
  viablesModerados: DetalleCategoria;
  viablesSeveros: DetalleCategoria;
  noViables: DetalleCategoria;
}
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TetrazolioDto } from '../../../models/Tetrazolio.dto';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';

export interface RepeticionTetrazolio {
  numero: number;
  viables: number;
  noViables: number;
  duras: number;
}

@Component({
  selector: 'app-tetrazolio.component',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    MultiSelectModule
  ],
  templateUrl: './tetrazolio.component.html',
  styleUrl: './tetrazolio.component.scss'
})
export class TetrazolioComponent implements OnInit {
  
  // Variables para manejar navegación
  isEditing: boolean = false;
  editingId: number | null = null;
  repetido: boolean = false;

  repeticiones: RepeticionTetrazolio[] = [
    { numero: 1, viables: 0, noViables: 0, duras: 0 }
  ];

  detalle: DetalleSemillas = {
    viablesSinDefectos: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
    viablesLeves: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
    viablesModerados: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
    viablesSeveros: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
    noViables: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 }
  };

  // Suma de N° de semillas (todas las filas)
  getSumaTotal(): number {
    return this.detalle.viablesSinDefectos.total + this.detalle.viablesLeves.total +
      this.detalle.viablesModerados.total + this.detalle.viablesSeveros.total +
      this.detalle.noViables.total;
  }

  // Semillas viables: suma de todas las filas menos no viables
  getSemillasViablesTotal(): number {
    return this.detalle.viablesSinDefectos.total + this.detalle.viablesLeves.total +
      this.detalle.viablesModerados.total + this.detalle.viablesSeveros.total;
  }

  // Semillas viables por columna de daño
  getSemillasViables(col: keyof DetalleCategoria): number {
    return (this.detalle.viablesSinDefectos[col] || 0) +
      (this.detalle.viablesLeves[col] || 0) +
      (this.detalle.viablesModerados[col] || 0) +
      (this.detalle.viablesSeveros[col] || 0);
  }

  agregarRepeticion() {
    this.repeticiones.push({
      numero: this.repeticiones.length + 1,
      viables: 0,
      noViables: 0,
      duras: 0
    });
  }

  eliminarRepeticion(index: number) {
    if (this.repeticiones.length > 1) {
      this.repeticiones.splice(index, 1);
      // Re-enumerar
      this.repeticiones.forEach((r, i) => r.numero = i + 1);
    }
  }

  getTotalViables(): number {
    return this.repeticiones.reduce((acc, rep) => acc + (Number(rep.viables) || 0), 0);
  }
  getTotalNoViables(): number {
    return this.repeticiones.reduce((acc, rep) => acc + (Number(rep.noViables) || 0), 0);
  }
  getTotalDuras(): number {
    return this.repeticiones.reduce((acc, rep) => acc + (Number(rep.duras) || 0), 0);
  }

  getPromedioViables(redondear: boolean): number {
    const prom = this.getTotalViables() / this.repeticiones.length;
    return redondear ? Math.round(prom) : Number(prom.toFixed(2));
  }
  getPromedioNoViables(redondear: boolean): number {
    const prom = this.getTotalNoViables() / this.repeticiones.length;
    return redondear ? Math.round(prom) : Number(prom.toFixed(2));
  }
  getPromedioDuras(redondear: boolean): number {
    const prom = this.getTotalDuras() / this.repeticiones.length;
    return redondear ? Math.round(prom) : Number(prom.toFixed(2));
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Verificar si estamos en modo edición basado en la ruta
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditing = true;
        this.editingId = parseInt(params['id']);
        this.cargarDatosParaEdicion(this.editingId);
      } else {
        this.isEditing = false;
        this.editingId = null;
        this.cargarDatos();
      }
    });
  }

  // Datos de prueba (deberían venir de un servicio)
  private itemsData: TetrazolioDto[] = [
    {
      id: 1,
      repeticion: 1,
      nroSemillasPorRepeticion: 100,
      pretratamientoId: 1,
      concentracion: 0.5,
      tincionHoras: 24,
      tincionGrados: 25,
      fecha: '2023-01-15',
      viables: 85,
      noViables: 10,
      duras: 5,
      total: 100,
      promedio: 85,
      porcentaje: 85,
      viabilidadPorTetrazolio: 'ALTA',
      nroSemillas: 100,
      daniosNroSemillas: 15,
      daniosMecanicos: 5,
      danioAmbiente: 3,
      daniosChinches: 2,
      daniosFracturas: 3,
      daniosOtros: 2,
      daniosDuras: 5,
      viabilidadVigorTz: 'ALTO',
      porcentajeFinal: 85,
      daniosPorPorcentajes: 15,
      activo: true,
      repetido: false,
      fechaCreacion: '2023-01-15',
      fechaRepeticion: null
    }
  ];

  private cargarDatosParaEdicion(id: number) {
    // En un escenario real, esto vendría de un servicio
    const item = this.itemsData.find(tetrazolio => tetrazolio.id === id);
    if (item) {
      console.log('Cargando datos para edición:', item);
      // Cargar datos básicos
      // Nota: Aquí deberías mapear todos los campos del DTO a las propiedades del componente
      // Por simplicidad, solo cargo algunos campos básicos
      if (item.viables !== null) {
        this.repeticiones[0].viables = item.viables;
      }
      if (item.noViables !== null) {
        this.repeticiones[0].noViables = item.noViables;
      }
      if (item.duras !== null) {
        this.repeticiones[0].duras = item.duras;
      }
      this.repetido = item.repetido || false;
    }
  }

  private cargarDatos() {
    console.log('Modo creación - limpiando campos');
    // Limpiar campos para creación
    this.repetido = false;
    this.repeticiones = [
      { numero: 1, viables: 0, noViables: 0, duras: 0 }
    ];
    this.detalle = {
      viablesSinDefectos: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
      viablesLeves: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
      viablesModerados: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
      viablesSeveros: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
      noViables: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 }
    };
  }

  onSubmit() {
    const tetrazolioData: Partial<TetrazolioDto> = {
      repeticion: this.repeticiones.length > 0 ? this.repeticiones[0].numero : 1,
      viables: this.repeticiones.length > 0 ? this.repeticiones[0].viables : 0,
      noViables: this.repeticiones.length > 0 ? this.repeticiones[0].noViables : 0,
      duras: this.repeticiones.length > 0 ? this.repeticiones[0].duras : 0,
      total: this.getTotalViables() + this.getTotalNoViables() + this.getTotalDuras(),
      promedio: this.getPromedioViables(false),
      repetido: this.repetido,
      activo: true
      // Aquí deberías agregar más campos según necesites
    };

    if (this.isEditing && this.editingId) {
      // Actualizar Tetrazolio existente
      console.log('Actualizando Tetrazolio ID:', this.editingId, 'con datos:', tetrazolioData);
    } else {
      // Crear nuevo Tetrazolio
      console.log('Creando nuevo Tetrazolio:', tetrazolioData);
    }

    // Navegar de vuelta al listado
    this.router.navigate(['/listado-tetrazolio']);
  }

  onCancel() {
    // Navegar de vuelta al listado
    this.router.navigate(['/listado-tetrazolio']);
  }
}

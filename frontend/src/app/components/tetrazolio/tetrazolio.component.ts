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
  // Campos nuevos del formulario
  cantidadSemillas: number | null = null;

  // Pretratamiento: seleccionar o especificar
  pretratamientoOptions: { label: string; value: any }[] = [
    { label: 'EP 16 horas', value: 1 },
    { label: 'EP 18 horas', value: 2 },
    { label: 'S/Pretratamiento', value: 3 },
    { label: 'Agua 7 horas', value: 4 },
    { label: 'Agua 18 horas', value: 5 },
    { label: 'Otro (especificar)', value: 'custom' }
  ];
  selectedPretratamiento: number | 'custom' | null = null;
  pretratamientoCustom: string = '';

  // Concentración (%): seleccionar o especificar
  concentracionOptions: { label: string; value: any }[] = [
    { label: '0 %', value: 0 },
    { label: '1 %', value: 1 },
    { label: '5 %', value: 5 },
    { label: '0.75 %', value: 0.75 },
    { label: 'Otro (especificar)', value: 'custom' }
  ];
  selectedConcentracion: number | 'custom' | null = null;
  concentracionCustom: number | null = null;

  // Tinción (hs): seleccionar o especificar
  tincionHsOptions: { label: string; value: any }[] = [
    { label: '2 h', value: 2 },
    { label: '3 h', value: 3 },
    { label: '16 h', value: 16 },
    { label: '18 h', value: 18 },
    { label: 'Otro (especificar)', value: 'custom' }
  ];
  selectedTincionHs: number | 'custom' | null = null;
  tincionHsCustom: number | null = null;

  // Tinción (°C): ingreso manual
  tincionC: number | null = null;

  // Fecha (yyyy-MM-dd)
  fecha: string | null = null;
  
  // Variables para manejar navegación
  isEditing: boolean = false;
  editingId: number | null = null;
  repetido: boolean = false;

  repeticiones: RepeticionTetrazolio[] = [
    { numero: 1, viables: 0, noViables: 0, duras: 0 }
  ];

  detalles: DetalleSemillas[] = [
    {
      viablesSinDefectos: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
      viablesLeves: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
      viablesModerados: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
      viablesSeveros: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
      noViables: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 }
    }
  ];

  // Suma de N° de semillas (todas las filas)
  getSumaTotal(det: DetalleSemillas): number {
    return det.viablesSinDefectos.total + det.viablesLeves.total +
      det.viablesModerados.total + det.viablesSeveros.total +
      det.noViables.total;
  }

  // Semillas viables: suma de todas las filas menos no viables
  getSemillasViablesTotal(det: DetalleSemillas): number {
    return det.viablesSinDefectos.total + det.viablesLeves.total +
      det.viablesModerados.total + det.viablesSeveros.total;
  }

  // Semillas viables por columna de daño
  getSemillasViables(det: DetalleSemillas, col: keyof DetalleCategoria): number {
    return (det.viablesSinDefectos[col] || 0) +
      (det.viablesLeves[col] || 0) +
      (det.viablesModerados[col] || 0) +
      (det.viablesSeveros[col] || 0);
  }

  private crearDetalleVacio(): DetalleSemillas {
    return {
      viablesSinDefectos: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
      viablesLeves: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
      viablesModerados: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
      viablesSeveros: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
      noViables: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 }
    };
  }

  private clonarDetalle(d: DetalleSemillas): DetalleSemillas {
    return JSON.parse(JSON.stringify(d));
  }

  agregarTablaDetalleClon() {
    if (this.detalles.length >= 8) return;
    const base = this.detalles[this.detalles.length - 1] || this.crearDetalleVacio();
    this.detalles.push(this.clonarDetalle(base));
  }

  eliminarTablaDetalle(index: number) {
    // Solo permitir eliminar tablas clonadas (no la primera R1)
    if (index <= 0) return;
    if (this.detalles.length <= 1) return;
    this.detalles.splice(index, 1);
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
      // Campos nuevos
      this.cantidadSemillas = item.nroSemillasPorRepeticion ?? item.nroSemillas ?? null;

      // Pretratamiento
      const ptOption = this.pretratamientoOptions.find(o => o.value === item.pretratamientoId);
      if (ptOption) {
        this.selectedPretratamiento = item.pretratamientoId as number;
      } else {
        this.selectedPretratamiento = null; // desconocido
      }

      // Concentración
      const concOption = this.concentracionOptions.find(o => o.value === item.concentracion);
      if (concOption) {
        this.selectedConcentracion = item.concentracion as number;
      } else if (item.concentracion !== null && item.concentracion !== undefined) {
        this.selectedConcentracion = 'custom';
        this.concentracionCustom = Number(item.concentracion);
      }

      // Tinción horas
      const thOption = this.tincionHsOptions.find(o => o.value === item.tincionHoras);
      if (thOption) {
        this.selectedTincionHs = item.tincionHoras as number;
      } else if (item.tincionHoras !== null && item.tincionHoras !== undefined) {
        this.selectedTincionHs = 'custom';
        this.tincionHsCustom = Number(item.tincionHoras);
      }

      // Tinción grados (ingreso manual)
      this.tincionC = item.tincionGrados ?? null;

  // Fecha
  this.fecha = item.fecha ?? null;

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

      // Si hay datos de daños en el DTO, los cargamos en la primera tabla R1
      const d = this.detalles[0];
      if (d) {
        d.viablesSinDefectos.total = (item.viables ?? 0); // mapeo aproximado si aplica
        d.noViables.total = (item.noViables ?? 0);
        // Si existiera un mapeo más preciso de daños (mecánico, ambiente, etc.) en el DTO, se asignaría aquí.
        d.viablesSinDefectos.mecanico = item.daniosMecanicos ?? 0;
        d.viablesSinDefectos.ambiente = item.danioAmbiente ?? 0;
        d.viablesSinDefectos.chinches = item.daniosChinches ?? 0;
        d.viablesSinDefectos.fracturas = item.daniosFracturas ?? 0;
        d.viablesSinDefectos.otros = item.daniosOtros ?? 0;
        d.viablesSinDefectos.duras = item.daniosDuras ?? 0;
      }
    }
  }

  private cargarDatos() {
    console.log('Modo creación - limpiando campos');
    // Limpiar campos para creación
    this.repetido = false;
    this.cantidadSemillas = null;
    this.selectedPretratamiento = null;
    this.pretratamientoCustom = '';
    this.selectedConcentracion = null;
    this.concentracionCustom = null;
    this.selectedTincionHs = null;
    this.tincionHsCustom = null;
  this.tincionC = null;
    this.fecha = null;
    this.repeticiones = [
      { numero: 1, viables: 0, noViables: 0, duras: 0 }
    ];
    this.detalles = [this.crearDetalleVacio()];
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

    // Agregar campos nuevos si están definidos
    if (this.cantidadSemillas !== null && this.cantidadSemillas !== undefined) {
      // Preferimos guardar por repetición si aplica
      (tetrazolioData as any).nroSemillasPorRepeticion = this.cantidadSemillas;
    }

    // Pretratamiento: solo incluimos id si es numérico (no custom)
    if (typeof this.selectedPretratamiento === 'number') {
      (tetrazolioData as any).pretratamientoId = this.selectedPretratamiento;
    }

    // Concentración
    const conc = this.selectedConcentracion === 'custom' ? this.concentracionCustom : this.selectedConcentracion;
    if (conc !== null && conc !== undefined) {
      (tetrazolioData as any).concentracion = conc as number;
    }

    // Tinción horas
    const th = this.selectedTincionHs === 'custom' ? this.tincionHsCustom : this.selectedTincionHs;
    if (th !== null && th !== undefined) {
      (tetrazolioData as any).tincionHoras = th as number;
    }

    // Tinción grados
    if (this.tincionC !== null && this.tincionC !== undefined) {
      (tetrazolioData as any).tincionGrados = this.tincionC;
    }

    // Fecha
    if (this.fecha) {
      (tetrazolioData as any).fecha = this.fecha; // ya en formato yyyy-MM-dd
    }

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

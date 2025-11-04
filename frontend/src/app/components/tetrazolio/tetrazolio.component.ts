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
import { TetrazolioDto, ReporteTetrazolio } from '../../../models/Tetrazolio.dto';
import { RepeticionTetrazolioDto } from '../../../models/RepeticionTetrazolioDto';
import { TetrazolioService } from '../../../services/TetrazolioService';
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
  // Errores de validación mostrados en UI (estilo login)
  erroresValidacion: string[] = [];

  // Pretratamiento: seleccionar o especificar
  pretratamientoOptions: { label: string; value: any }[] = [
    { label: 'EP 16 horas', value: 'EP_16_HORAS' },
    { label: 'EP 18 horas', value: 'EP_18_HORAS' },
    { label: 'S/Pretratamiento', value: 'SIN_PRETRATAMIENTO' },
    { label: 'Agua 7 horas', value: 'AGUA_7_HORAS' },
    { label: 'Agua 18 horas', value: 'AGUA_18_HORAS' },
    { label: 'Otro (especificar)', value: 'custom' }
  ];
  selectedPretratamiento: string | 'custom' | null = null;
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
  
  // Prevención de doble envío
  isSubmitting: boolean = false;

  // IDs de contexto
  loteId: string | null = null;
  reciboId: string | null = null;

  repeticiones: RepeticionTetrazolio[] = [
    { numero: 1, viables: 0, noViables: 0, duras: 0 }
  ];

  // Mantener las repeticiones del backend para edición
  repeticionesEntries: RepeticionTetrazolioDto[] = [];
  deletedRepeticionesIds: number[] = [];

  detalles: DetalleSemillas[] = [
    {
      viablesSinDefectos: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
      viablesLeves: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
      viablesModerados: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
      viablesSeveros: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
      noViables: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 }
    }
  ];

  // Estructura para la tabla de reporte
  reporte: ReporteTetrazolio = {
    vigorAlto: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
    vigorMedio: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
    vigorBajo: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
    limiteCritico: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
    noViables: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
    viabilidad: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
    vigorAcumulado: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } }
  };

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
    const nuevaRepeticion: RepeticionTetrazolio = {
      numero: this.repeticiones.length + 1,
      viables: 0,
      noViables: 0,
      duras: 0
    };
    this.repeticiones.push(nuevaRepeticion);
    
    // Sincronizar con repeticionesEntries
    const nuevaRepeticionDto: RepeticionTetrazolioDto = {
      id: null, // null indica que es una nueva repetición que se creará en el backend
      numero: nuevaRepeticion.numero,
      viables: nuevaRepeticion.viables,
      noViables: nuevaRepeticion.noViables,
      duras: nuevaRepeticion.duras,
      tetrazolioId: this.editingId || null // Se asignará correctamente en onSubmit
    };
    this.repeticionesEntries.push(nuevaRepeticionDto);
  }

  eliminarRepeticion(index: number) {
    if (this.repeticiones.length > 1) {
      // Guardar ID de la repetición eliminada si existe
      if (this.repeticionesEntries[index] && this.repeticionesEntries[index].id) {
        this.deletedRepeticionesIds.push(this.repeticionesEntries[index].id!);
      }
      
      this.repeticiones.splice(index, 1);
      this.repeticionesEntries.splice(index, 1);
      
      // Re-enumerar
      this.repeticiones.forEach((r, i) => r.numero = i + 1);
      this.repeticionesEntries.forEach((r, i) => r.numero = i + 1);
    }
  }

  getTotalViables(): string {
    const total = this.repeticiones.reduce((acc, rep) => acc + (Number(rep.viables) || 0), 0);
    return total.toString();
  }
  getTotalNoViables(): string {
    const total = this.repeticiones.reduce((acc, rep) => acc + (Number(rep.noViables) || 0), 0);
    return total.toString();
  }
  getTotalDuras(): string {
    const total = this.repeticiones.reduce((acc, rep) => acc + (Number(rep.duras) || 0), 0);
    return total.toString();
  }

  getPromedioViables(redondear: boolean): string {
    const prom = this.repeticiones.reduce((acc, rep) => acc + (Number(rep.viables) || 0), 0) / this.repeticiones.length;
    return redondear ? Math.round(prom).toString() : prom.toFixed(2);
  }
  getPromedioNoViables(redondear: boolean): string {
    const prom = this.repeticiones.reduce((acc, rep) => acc + (Number(rep.noViables) || 0), 0) / this.repeticiones.length;
    return redondear ? Math.round(prom).toString() : prom.toFixed(2);
  }
  getPromedioDuras(redondear: boolean): string {
    const prom = this.repeticiones.reduce((acc, rep) => acc + (Number(rep.duras) || 0), 0) / this.repeticiones.length;
    return redondear ? Math.round(prom).toString() : prom.toFixed(2);
  }

  // Método para sincronizar cambios desde los inputs
  onRepeticionChange(index: number, field: keyof RepeticionTetrazolio, value: any) {
    const numericValue = parseFloat(value) || 0;

    // Actualizar tanto repeticiones como repeticionesEntries
    if (this.repeticiones[index]) {
      (this.repeticiones[index] as any)[field] = numericValue;
    }
    if (this.repeticionesEntries[index]) {
      (this.repeticionesEntries[index] as any)[field] = numericValue;
    }
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tetrazolioService: TetrazolioService
  ) {}

  ngOnInit() {
    // Verificar si estamos en modo edición basado en la ruta
    this.route.params.subscribe((params: any) => {
      this.loteId = params['loteId'] ?? null;
      this.reciboId = params['reciboId'] ?? null;
      
      // Verificar si hay un ID en la ruta para determinar modo de edición
      const id = params['id'];
      if (id && !isNaN(parseInt(id))) {
        this.isEditing = true;
        this.editingId = parseInt(id);
        console.log('Modo edición detectado, ID:', this.editingId);
        this.cargarDatosParaEdicion(this.editingId);
      } else {
        this.isEditing = false;
        this.editingId = null;
        console.log('Modo creación detectado');
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
      pretratamiento: { id: 1, nombre: 'EP 16 horas' },
      concentracion: '0.5',
      tincionHoras: '24',
      tincionGrados: '25',
      fecha: '2023-01-15',
      viables: '85',
      noViables: '10',
      duras: '5',
      total: '100',
      promedio: '85',
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
      fechaRepeticion: null,
      reciboId: null,
      reporte: null
    }
  ];

  private cargarDatosParaEdicion(id: number) {
    console.log('=== INICIANDO CARGA DE DATOS PARA EDICIÓN ===');
    console.log('ID del tetrazolio a cargar:', id);
    
    // Cargar datos del Tetrazolio desde el backend
    this.tetrazolioService.obtener(id).subscribe({
      next: (item) => {
        console.log('Datos del tetrazolio cargados desde el backend:', item);
        console.log('Tipo de fecha recibida:', typeof item.fecha);
        console.log('Valor de fecha:', item.fecha);
        console.log('Fecha como string:', String(item.fecha));
        
        // Verificar que el tetrazolio existe y está activo
        if (!item) {
          console.error('No se encontró el tetrazolio con ID:', id);
          alert('No se encontró el tetrazolio seleccionado');
          this.safeNavigateToListado();
          return;
        }
        
        if (!item.activo) {
          console.error('El tetrazolio no está activo:', item);
          alert('El tetrazolio seleccionado no está disponible para edición');
          this.safeNavigateToListado();
          return;
        }
        
        // Cargar datos básicos
        this.cantidadSemillas = item.nroSemillasPorRepeticion ?? item.nroSemillas ?? null;

        // Pretratamiento
        if (item.pretratamiento) {
          const pretratamientoValue = String(item.pretratamiento);
          const ptOption = this.pretratamientoOptions.find(o => o.value === pretratamientoValue);
          if (ptOption) {
            this.selectedPretratamiento = pretratamientoValue;
          } else {
            this.selectedPretratamiento = null; // desconocido
          }
        } else {
          this.selectedPretratamiento = null;
        }

        // Concentración
        const concValue = item.concentracion ? parseFloat(item.concentracion) : null;
        const concOption = this.concentracionOptions.find(o => o.value === concValue);
        if (concOption) {
          this.selectedConcentracion = concValue as number;
        } else if (concValue !== null && concValue !== undefined) {
          this.selectedConcentracion = 'custom';
          this.concentracionCustom = concValue;
        }

        // Tinción horas
        const thValue = item.tincionHoras ? parseFloat(item.tincionHoras) : null;
        const thOption = this.tincionHsOptions.find(o => o.value === thValue);
        if (thOption) {
          this.selectedTincionHs = thValue as number;
        } else if (thValue !== null && thValue !== undefined) {
          this.selectedTincionHs = 'custom';
          this.tincionHsCustom = thValue;
        }

        // Tinción grados (ingreso manual)
        this.tincionC = item.tincionGrados ? parseFloat(item.tincionGrados) : null;

        // Fecha - convertir cualquier formato a yyyy-MM-dd para el input HTML
        if (item.fecha) {
          try {
            // Crear objeto Date desde cualquier formato
            const dateObj = new Date(item.fecha);
            
            // Verificar que la fecha es válida
            if (isNaN(dateObj.getTime())) {
              console.warn('Fecha inválida recibida:', item.fecha);
              this.fecha = null;
            } else {
              // Convertir a formato yyyy-MM-dd
              this.fecha = dateObj.toISOString().split('T')[0];
              console.log('Fecha convertida para input HTML:', this.fecha);
            }
          } catch (error) {
            console.warn('Error convirtiendo fecha:', error, 'Valor original:', item.fecha);
            this.fecha = null;
          }
        } else {
          this.fecha = null;
        }

        this.repetido = item.repetido || false;

        // Si hay datos de daños en el DTO, los cargamos en la primera tabla R1
        const d = this.detalles[0];
        if (d) {
          d.viablesSinDefectos.total = item.viables ? parseFloat(item.viables) : 0; // mapeo aproximado si aplica
          d.noViables.total = item.noViables ? parseFloat(item.noViables) : 0;
          // Si existiera un mapeo más preciso de daños (mecánico, ambiente, etc.) en el DTO, se asignaría aquí.
          d.viablesSinDefectos.mecanico = item.daniosMecanicos ?? 0;
          d.viablesSinDefectos.ambiente = item.danioAmbiente ?? 0;
          d.viablesSinDefectos.chinches = item.daniosChinches ?? 0;
          d.viablesSinDefectos.fracturas = item.daniosFracturas ?? 0;
          d.viablesSinDefectos.otros = item.daniosOtros ?? 0;
          d.viablesSinDefectos.duras = item.daniosDuras ?? 0;
        }

        // Cargar reporte desde el backend si existe
        if (item.reporte) {
          this.reporte = item.reporte;
        } else {
          // Inicializar reporte con valores por defecto
          this.reporte = {
            vigorAlto: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
            vigorMedio: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
            vigorBajo: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
            limiteCritico: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
            noViables: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
            viabilidad: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
            vigorAcumulado: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } }
          };
        }

        // Cargar repeticiones y detalles desde el backend
        this.cargarRepeticiones(id);
        this.cargarDetalles(id);
        
        // Log de verificación de datos cargados
        console.log('=== DATOS CARGADOS PARA EDICIÓN ===');
        console.log('Cantidad de semillas:', this.cantidadSemillas);
        console.log('Pretratamiento seleccionado:', this.selectedPretratamiento);
        console.log('Concentración:', this.selectedConcentracion);
        console.log('Tinción horas:', this.selectedTincionHs);
        console.log('Tinción grados:', this.tincionC);
        console.log('Fecha:', this.fecha);
        console.log('Repetido:', this.repetido);
        console.log('Repeticiones:', this.repeticiones);
        console.log('Detalles:', this.detalles);
      },
      error: (err) => {
        console.error('Error obteniendo Tetrazolio:', err);
        this.cargarDatos();
      }
    });
  }

  private cargarRepeticiones(tetrazolioId: number) {
    this.tetrazolioService.listarRepeticiones(tetrazolioId).subscribe({
      next: (repeticiones) => {
        console.log('Repeticiones cargadas:', repeticiones);
        if (repeticiones && repeticiones.length > 0) {
          // Convertir DTOs a la interfaz local
          this.repeticiones = repeticiones.map(rep => ({
            numero: rep.numero,
            viables: rep.viables,
            noViables: rep.noViables,
            duras: rep.duras
          }));
          
          // Mantener las repeticiones del backend para edición
          this.repeticionesEntries = repeticiones.map(rep => ({...rep}));
        } else {
          // Si no hay repeticiones, mantener la estructura por defecto
          this.repeticiones = [{ numero: 1, viables: 0, noViables: 0, duras: 0 }];
          this.repeticionesEntries = [];
        }
      },
      error: (err) => {
        console.error('Error obteniendo repeticiones:', err);
        // Mantener estructura por defecto en caso de error
        this.repeticiones = [{ numero: 1, viables: 0, noViables: 0, duras: 0 }];
        this.repeticionesEntries = [];
      }
    });
  }

  private cargarDetalles(tetrazolioId: number) {
    this.tetrazolioService.listarDetalles(tetrazolioId).subscribe({
      next: (detDtos: any[]) => {
        console.log('Detalles cargados:', detDtos);
        if (detDtos && detDtos.length > 0) {
          this.detalles = detDtos
            .sort((a, b) => (a.numeroTabla || 0) - (b.numeroTabla || 0))
            .map(dto => ({
              viablesSinDefectos: { total: dto.vsd_total || 0, mecanico: dto.vsd_mecanico || 0, ambiente: dto.vsd_ambiente || 0, chinches: dto.vsd_chinches || 0, fracturas: dto.vsd_fracturas || 0, otros: dto.vsd_otros || 0, duras: dto.vsd_duras || 0 },
              viablesLeves:        { total: dto.vl_total || 0,  mecanico: dto.vl_mecanico || 0,  ambiente: dto.vl_ambiente || 0,  chinches: dto.vl_chinches || 0,  fracturas: dto.vl_fracturas || 0,  otros: dto.vl_otros || 0,  duras: dto.vl_duras || 0 },
              viablesModerados:    { total: dto.vm_total || 0,  mecanico: dto.vm_mecanico || 0,  ambiente: dto.vm_ambiente || 0,  chinches: dto.vm_chinches || 0,  fracturas: dto.vm_fracturas || 0,  otros: dto.vm_otros || 0,  duras: dto.vm_duras || 0 },
              viablesSeveros:      { total: dto.vs_total || 0,  mecanico: dto.vs_mecanico || 0,  ambiente: dto.vs_ambiente || 0,  chinches: dto.vs_chinches || 0,  fracturas: dto.vs_fracturas || 0,  otros: dto.vs_otros || 0,  duras: dto.vs_duras || 0 },
              noViables:           { total: dto.nv_total || 0,  mecanico: dto.nv_mecanico || 0,  ambiente: dto.nv_ambiente || 0,  chinches: dto.nv_chinches || 0,  fracturas: dto.nv_fracturas || 0,  otros: dto.nv_otros || 0,  duras: dto.nv_duras || 0 },
            }));
        } else {
          this.detalles = [this.crearDetalleVacio()];
        }
      },
      error: (err) => {
        console.error('Error obteniendo detalles:', err);
        this.detalles = [this.crearDetalleVacio()];
      }
    });
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
    // Inicializar reporte con valores por defecto
    this.reporte = {
      vigorAlto: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
      vigorMedio: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
      vigorBajo: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
      limiteCritico: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
      noViables: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
      viabilidad: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } },
      vigorAcumulado: { porcentaje: null, danios: { mecanicos: null, ambiente: null, chinches: null, fracturas: null, otros: null, duras: null } }
    };
  }

  onSubmit() {
    // Prevenir doble envío
    if (this.isSubmitting) {
      console.warn('Ya se está procesando una solicitud, ignorando...');
      return;
    }
    
    this.isSubmitting = true;
    this.erroresValidacion = [];
    console.log('Iniciando envío del formulario...');
    
    // Sincronizar repeticiones a repeticionesEntries antes de enviar
    this.repeticionesEntries = this.repeticiones.map((rep, index) => ({
      id: this.repeticionesEntries[index]?.id || null,
      numero: rep.numero,
      viables: rep.viables,
      noViables: rep.noViables,
      duras: rep.duras,
      tetrazolioId: this.editingId
    }));

    const tetrazolioData: Partial<TetrazolioDto> = {
      repeticion: this.repeticiones.length > 0 ? this.repeticiones[0].numero : 1,
      viables: this.getTotalViables(),
      noViables: this.getTotalNoViables(),
      duras: this.getTotalDuras(),
      total: (parseFloat(this.getTotalViables()) + parseFloat(this.getTotalNoViables()) + parseFloat(this.getTotalDuras())).toString(),
      promedio: this.getPromedioViables(false),
      repetido: this.repetido,
      activo: true,
      reciboId: this.reciboId ? parseInt(this.reciboId) : null
    };

    // Agregar ID para edición
    if (this.isEditing && this.editingId) {
      tetrazolioData.id = this.editingId;
    }

    // Agregar campos nuevos si están definidos
    if (this.cantidadSemillas !== null && this.cantidadSemillas !== undefined) {
      // Preferimos guardar por repetición si aplica
      (tetrazolioData as any).nroSemillasPorRepeticion = this.cantidadSemillas;
    }

    // Pretratamiento: crear objeto PreTratamiento completo
    if (this.selectedPretratamiento && this.selectedPretratamiento !== 'custom') {
      (tetrazolioData as any).pretratamiento = this.selectedPretratamiento;
    } else if (this.selectedPretratamiento === 'custom' && this.pretratamientoCustom.trim()) {
      (tetrazolioData as any).pretratamiento = 'OTRO';
    } else if (this.selectedPretratamiento === null || this.selectedPretratamiento === undefined) {
      (tetrazolioData as any).pretratamiento = 'NINGUNO';
    }

    // Concentración
    const conc = this.selectedConcentracion === 'custom' ? this.concentracionCustom : this.selectedConcentracion;
    if (conc !== null && conc !== undefined) {
      (tetrazolioData as any).concentracion = conc.toString();
    }

    // Tinción horas
    const th = this.selectedTincionHs === 'custom' ? this.tincionHsCustom : this.selectedTincionHs;
    if (th !== null && th !== undefined) {
      (tetrazolioData as any).tincionHoras = th.toString();
    }

    // Tinción grados
    if (this.tincionC !== null && this.tincionC !== undefined) {
      (tetrazolioData as any).tincionGrados = this.tincionC.toString();
    }

    // Fecha - convertir string a Date para el backend
    if (this.fecha) {
      try {
        // Crear objeto Date desde el string yyyy-MM-dd
        // Usar UTC para evitar problemas de zona horaria
        const fechaDate = new Date(this.fecha + 'T00:00:00.000Z');
        (tetrazolioData as any).fecha = fechaDate;
        console.log('Fecha original (string):', this.fecha);
        console.log('Fecha convertida para envío (Date):', fechaDate);
        console.log('Fecha ISO string:', fechaDate.toISOString());
      } catch (error) {
        console.error('Error convirtiendo fecha:', error);
        console.log('Fecha original:', this.fecha);
      }
    }

    // Agregar reporte al DTO
    tetrazolioData.reporte = this.reporte;

    if (this.isEditing && this.editingId) {
      // Actualizar Tetrazolio existente
      console.log('=== INICIANDO ACTUALIZACIÓN DE TETRAZOLIO ===');
      console.log('ID del tetrazolio a actualizar:', this.editingId);
      console.log('Datos del tetrazolio a actualizar:', tetrazolioData);
      console.log('Cantidad de semillas:', this.cantidadSemillas);
      console.log('Pretratamiento seleccionado:', this.selectedPretratamiento);
      console.log('Concentración:', this.selectedConcentracion === 'custom' ? this.concentracionCustom : this.selectedConcentracion);
      console.log('Tinción horas:', this.selectedTincionHs === 'custom' ? this.tincionHsCustom : this.selectedTincionHs);
      console.log('Tinción grados:', this.tincionC);
      console.log('Fecha (string):', this.fecha);
      console.log('Fecha (Date):', tetrazolioData.fecha);
      console.log('Repeticiones:', this.repeticiones);
      console.log('Repeticiones entries:', this.repeticionesEntries);
      console.log('Detalles de semillas:', this.detalles);
      
      // Validaciones antes de actualizar
      const validaciones = this.validarDatosCreacion();
      if (!validaciones.esValido) {
        console.error('VALIDACIONES FALLIDAS:', validaciones.errores);
        // Restablecer estado de envío para reactivar los botones y mostrar errores en pantalla
        this.isSubmitting = false;
        this.erroresValidacion = validaciones.errores || [];
        return;
      }
      
      console.log('Validaciones pasadas correctamente');
      console.log('Enviando petición de actualización al backend...');
      console.log('Datos finales a enviar:', JSON.stringify(tetrazolioData, null, 2));
      
      this.tetrazolioService.editar(tetrazolioData as TetrazolioDto).subscribe({
        next: (res) => {
          console.log('Tetrazolio actualizado correctamente en el backend');
          console.log('Respuesta del servidor:', res);
          
          // Procesar repeticiones y detalles
          console.log('Procesando repeticiones y detalles...');
          this.procesarRepeticiones(this.editingId!)
            .then(() => this.procesarDetalles(this.editingId!))
            .then(() => {
              console.log('Repeticiones y detalles procesados correctamente');
              this.isSubmitting = false;
              this.safeNavigateToListado();
            })
            .catch(err => {
              console.error('Error procesando datos después de editar:', err);
              this.isSubmitting = false;
              this.safeNavigateToListado();
            });
        },
        error: (err) => {
          console.error('Error actualizando Tetrazolio en el backend:', err);
          console.error('Detalles del error:', {
            status: err.status,
            message: err.message,
            error: err.error
          });
          
          this.isSubmitting = false;
          
          let errorMessage = 'Error al actualizar el Tetrazolio.';
          if (err.error && err.error.message) {
            errorMessage = err.error.message;
          } else if (err.message) {
            errorMessage = err.message;
          }
          alert(errorMessage);
        }
      });
    } else {
      // Crear nuevo Tetrazolio
      console.log('=== INICIANDO CREACIÓN DE TETRAZOLIO ===');
      console.log('Datos del tetrazolio a crear:', tetrazolioData);
      console.log('Cantidad de semillas:', this.cantidadSemillas);
      console.log('Pretratamiento seleccionado:', this.selectedPretratamiento);
      console.log('Concentración:', this.selectedConcentracion === 'custom' ? this.concentracionCustom : this.selectedConcentracion);
      console.log('Tinción horas:', this.selectedTincionHs === 'custom' ? this.tincionHsCustom : this.selectedTincionHs);
      console.log('Tinción grados:', this.tincionC);
      console.log('Fecha (string):', this.fecha);
      console.log('Fecha (Date):', tetrazolioData.fecha);
      console.log('Repeticiones:', this.repeticiones);
      console.log('Repeticiones entries:', this.repeticionesEntries);
      console.log('Detalles de semillas:', this.detalles);
      
      // Validaciones antes de crear
      const validaciones = this.validarDatosCreacion();
      if (!validaciones.esValido) {
        console.error('VALIDACIONES FALLIDAS:', validaciones.errores);
        // Restablecer estado de envío para reactivar los botones y mostrar errores en pantalla
        this.isSubmitting = false;
        this.erroresValidacion = validaciones.errores || [];
        return;
      }
      
      console.log('Validaciones pasadas correctamente');
      
      (tetrazolioData as any).fechaCreacion = new Date();
      tetrazolioData.repetido = false;
      tetrazolioData.reciboId = this.reciboId ? parseInt(this.reciboId) : null;
      
      console.log('Enviando petición de creación al backend...');
      console.log('Datos finales a enviar:', JSON.stringify(tetrazolioData, null, 2));
      
      this.tetrazolioService.crear(tetrazolioData as TetrazolioDto).subscribe({
        next: (res) => {
          console.log('Tetrazolio creado correctamente en el backend');
          console.log('Respuesta del servidor:', res);
          
          const tetrazolioId = parseInt(res.split('ID:')[1]);
          console.log('ID del tetrazolio creado:', tetrazolioId);
          
          // Procesar repeticiones y detalles
          console.log('Procesando repeticiones y detalles...');
          this.procesarRepeticiones(tetrazolioId)
            .then(() => this.procesarDetalles(tetrazolioId))
            .then(() => {
              console.log('Repeticiones y detalles procesados correctamente');
              this.isSubmitting = false;
              this.safeNavigateToListado();
            })
            .catch(err => {
              console.error('Error procesando datos después de crear:', err);
              this.isSubmitting = false;
              this.safeNavigateToListado();
            });
        },
        error: (err) => {
          console.error('Error creando Tetrazolio en el backend:', err);
          console.error('Detalles del error:', {
            status: err.status,
            message: err.message,
            error: err.error
          });
          
          this.isSubmitting = false;
          
          let errorMessage = 'Error al crear el Tetrazolio.';
          if (err.error && err.error.message) {
            errorMessage = err.error.message;
          } else if (err.message) {
            errorMessage = err.message;
          }
          alert(errorMessage);
        }
      });
    }
  }

  private validarDatosCreacion(): { esValido: boolean; errores: string[] } {
    const errores: string[] = [];
    
    console.log('Iniciando validaciones de datos...');
    
    // Validar cantidad de semillas
    if (this.cantidadSemillas === null || this.cantidadSemillas === undefined || this.cantidadSemillas <= 0) {
      errores.push('La cantidad de semillas debe ser mayor a 0');
      console.warn('Cantidad de semillas inválida:', this.cantidadSemillas);
    }
    if (this.cantidadSemillas !== null && this.cantidadSemillas < 0) {
      errores.push('La cantidad de semillas no puede ser menor que cero');
      console.warn('Cantidad de semillas negativa:', this.cantidadSemillas);
    }
    
    // Validar pretratamiento
    if (this.selectedPretratamiento === null || this.selectedPretratamiento === undefined) {
      errores.push('Debe seleccionar un pretratamiento');
      console.warn('Pretratamiento no seleccionado');
    }
    
    // Validar concentración
    const concentracion = this.selectedConcentracion === 'custom' ? this.concentracionCustom : this.selectedConcentracion;
    if (concentracion === null || concentracion === undefined) {
      errores.push('La concentración es requerida');
      console.warn('Concentración no definida');
    } else if (concentracion < 0) {
      errores.push('La concentración no puede ser menor que cero');
      console.warn('Concentración negativa:', concentracion);
    }
    
    // Validar tinción horas
    const tincionHoras = this.selectedTincionHs === 'custom' ? this.tincionHsCustom : this.selectedTincionHs;
    if (tincionHoras === null || tincionHoras === undefined || tincionHoras <= 0) {
      errores.push('Las horas de tinción deben ser un valor válido mayor a 0');
      console.warn('Tinción horas inválida:', tincionHoras);
    }
    if (tincionHoras !== null && tincionHoras !== undefined && tincionHoras < 0) {
      errores.push('Las horas de tinción no pueden ser menores que cero');
      console.warn('Tinción horas negativa:', tincionHoras);
    }
    
    // Validar tinción grados
    if (this.tincionC === null || this.tincionC === undefined || this.tincionC <= 0) {
      errores.push('Los grados de tinción deben ser un valor válido mayor a 0');
      console.warn('Tinción grados inválida:', this.tincionC);
    }
    if (this.tincionC !== null && this.tincionC !== undefined && this.tincionC < 0) {
      errores.push('Los grados de tinción no pueden ser menores que cero');
      console.warn('Tinción grados negativa:', this.tincionC);
    }
    
    // Validar fecha
    if (!this.fecha || this.fecha.trim() === '') {
      errores.push('Debe seleccionar una fecha');
      console.warn('Fecha no seleccionada');
    } else {
      // Validar formato de fecha
      const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!fechaRegex.test(this.fecha)) {
        errores.push('El formato de fecha debe ser YYYY-MM-DD');
        console.warn('Formato de fecha inválido:', this.fecha);
      }
    }
    
    // Validar repeticiones
    if (!this.repeticiones || this.repeticiones.length === 0) {
      errores.push('Debe tener al menos una repetición');
      console.warn('No hay repeticiones definidas');
    } else {
      // Validar que todas las repeticiones tengan datos válidos
      this.repeticiones.forEach((rep, index) => {
        if (rep.viables < 0 || rep.noViables < 0 || rep.duras < 0) {
          errores.push(`La repetición ${index + 1} tiene valores negativos. Los valores no pueden ser menores que cero`);
          console.warn(`Repetición ${index + 1} con valores negativos:`, rep);
        }
        
        const totalRep = rep.viables + rep.noViables + rep.duras;
        if (totalRep === 0) {
          errores.push(`La repetición ${index + 1} no tiene datos ingresados`);
          console.warn(`Repetición ${index + 1} sin datos:`, rep);
        }
      });
    }
    
    // Validar promedios: deben estar entre 0 y 100
    if (this.repeticiones && this.repeticiones.length > 0) {
      const promedioViables = parseFloat(this.getPromedioViables(false));
      if (!isNaN(promedioViables)) {
        if (promedioViables < 0 || promedioViables > 100) {
          errores.push(`El promedio de viables (${promedioViables.toFixed(2)}%) debe estar entre 0 y 100`);
          console.warn('Promedio de viables fuera de rango:', promedioViables);
        }
      }
      
      const promedioNoViables = parseFloat(this.getPromedioNoViables(false));
      if (!isNaN(promedioNoViables)) {
        if (promedioNoViables < 0 || promedioNoViables > 100) {
          errores.push(`El promedio de no viables (${promedioNoViables.toFixed(2)}%) debe estar entre 0 y 100`);
          console.warn('Promedio de no viables fuera de rango:', promedioNoViables);
        }
      }
      
      const promedioDuras = parseFloat(this.getPromedioDuras(false));
      if (!isNaN(promedioDuras)) {
        if (promedioDuras < 0 || promedioDuras > 100) {
          errores.push(`El promedio de duras (${promedioDuras.toFixed(2)}%) debe estar entre 0 y 100`);
          console.warn('Promedio de duras fuera de rango:', promedioDuras);
        }
      }
    }
    
    // Validar detalles de semillas
    if (!this.detalles || this.detalles.length === 0) {
      errores.push('Debe tener al menos una tabla de detalles de semillas');
      console.warn('No hay detalles de semillas definidos');
    } else {
      // Validar que todos los valores en detalles sean >= 0
      this.detalles.forEach((det, tablaIndex) => {
        const categorias: Array<{nombre: string, categoria: DetalleCategoria}> = [
          { nombre: 'viables sin defectos', categoria: det.viablesSinDefectos },
          { nombre: 'viables leves', categoria: det.viablesLeves },
          { nombre: 'viables moderados', categoria: det.viablesModerados },
          { nombre: 'viables severos', categoria: det.viablesSeveros },
          { nombre: 'no viables', categoria: det.noViables }
        ];
        
        categorias.forEach(cat => {
          if (cat.categoria.total < 0 || cat.categoria.mecanico < 0 || 
              cat.categoria.ambiente < 0 || cat.categoria.chinches < 0 || 
              cat.categoria.fracturas < 0 || cat.categoria.otros < 0 || 
              cat.categoria.duras < 0) {
            errores.push(`La tabla ${tablaIndex + 1} en ${cat.nombre} tiene valores negativos. Los valores no pueden ser menores que cero`);
            console.warn(`Tabla ${tablaIndex + 1} - ${cat.nombre} con valores negativos:`, cat.categoria);
          }
        });
      });
    }
    
    const esValido = errores.length === 0;
    
    if (esValido) {
      console.log('Todas las validaciones pasaron correctamente');
    } else {
      console.log('Se encontraron errores de validación:', errores);
    }
    
    return { esValido, errores };
  }

  private async procesarRepeticiones(tetrazolioId: number): Promise<void> {
    console.log('Procesando repeticiones para tetrazolio ID:', tetrazolioId);
    console.log('Repeticiones entries antes del mapeo:', this.repeticionesEntries);
    
    const payload: RepeticionTetrazolioDto[] = this.repeticionesEntries.map((r) => ({
      ...r,
      tetrazolioId: tetrazolioId
    }));
    
    console.log('Payload de repeticiones a enviar:', payload);
    console.log('Cantidad de repeticiones:', payload.length);
    
    return new Promise((resolve, reject) => {
      if (!payload || payload.length === 0) {
        console.log('No hay repeticiones para procesar, continuando...');
        return resolve();
      }
      
      console.log('Enviando repeticiones al backend...');
      // Usar el método apropiado según el modo (creación vs edición)
      if (this.isEditing) {
        this.tetrazolioService.actualizarRepeticiones(tetrazolioId, payload).subscribe({
          next: (resp) => {
            console.log('Repeticiones actualizadas exitosamente en el backend');
            console.log('Respuesta del servidor:', resp);
            resolve();
          },
          error: (err) => {
            console.error('Error actualizando repeticiones:', err);
            console.error('Detalles del error:', {
              status: err.status,
              message: err.message,
              error: err.error
            });
            reject(err);
          }
        });
      } else {
        // Para creación, usar el mismo método pero con lógica diferente
        this.tetrazolioService.actualizarRepeticiones(tetrazolioId, payload).subscribe({
          next: (resp) => {
            console.log('Repeticiones creadas exitosamente en el backend');
            console.log('Respuesta del servidor:', resp);
            resolve();
          },
          error: (err) => {
            console.error('Error creando repeticiones:', err);
            console.error('Detalles del error:', {
              status: err.status,
              message: err.message,
              error: err.error
            });
            reject(err);
          }
        });
      }
    });
  }

  private async procesarDetalles(tetrazolioId: number): Promise<void> {
    console.log('Procesando detalles para tetrazolio ID:', tetrazolioId);

    const payload = this.detalles.map((d, idx) => ({
      id: null,
      tetrazolioId,
      numeroTabla: idx + 1,
      vsd_total: d.viablesSinDefectos.total,
      vsd_mecanico: d.viablesSinDefectos.mecanico,
      vsd_ambiente: d.viablesSinDefectos.ambiente,
      vsd_chinches: d.viablesSinDefectos.chinches,
      vsd_fracturas: d.viablesSinDefectos.fracturas,
      vsd_otros: d.viablesSinDefectos.otros,
      vsd_duras: d.viablesSinDefectos.duras,
      vl_total: d.viablesLeves.total,
      vl_mecanico: d.viablesLeves.mecanico,
      vl_ambiente: d.viablesLeves.ambiente,
      vl_chinches: d.viablesLeves.chinches,
      vl_fracturas: d.viablesLeves.fracturas,
      vl_otros: d.viablesLeves.otros,
      vl_duras: d.viablesLeves.duras,
      vm_total: d.viablesModerados.total,
      vm_mecanico: d.viablesModerados.mecanico,
      vm_ambiente: d.viablesModerados.ambiente,
      vm_chinches: d.viablesModerados.chinches,
      vm_fracturas: d.viablesModerados.fracturas,
      vm_otros: d.viablesModerados.otros,
      vm_duras: d.viablesModerados.duras,
      vs_total: d.viablesSeveros.total,
      vs_mecanico: d.viablesSeveros.mecanico,
      vs_ambiente: d.viablesSeveros.ambiente,
      vs_chinches: d.viablesSeveros.chinches,
      vs_fracturas: d.viablesSeveros.fracturas,
      vs_otros: d.viablesSeveros.otros,
      vs_duras: d.viablesSeveros.duras,
      nv_total: d.noViables.total,
      nv_mecanico: d.noViables.mecanico,
      nv_ambiente: d.noViables.ambiente,
      nv_chinches: d.noViables.chinches,
      nv_fracturas: d.noViables.fracturas,
      nv_otros: d.noViables.otros,
      nv_duras: d.noViables.duras,
      activo: true
    }));

    return new Promise((resolve, reject) => {
      if (!payload || payload.length === 0) {
        console.log('No hay detalles para procesar, continuando...');
        return resolve();
      }

      this.tetrazolioService.actualizarDetalles(tetrazolioId, payload).subscribe({
        next: (resp) => {
          console.log('Detalles guardados/actualizados:', resp);
          resolve();
        },
        error: (err) => {
          console.error('Error guardando detalles:', err);
          reject(err);
        }
      });
    });
  }

  private safeNavigateToListado() {
    console.log('Navegando al listado...');
    console.log('Lote ID:', this.loteId);
    console.log('Recibo ID:', this.reciboId);
    
    if (this.loteId && this.reciboId) {
      const ruta = `/${this.loteId}/${this.reciboId}/listado-tetrazolio`;
      console.log('Navegando a:', ruta);
      this.router.navigate([ruta]);
    } else {
      console.log('Navegando a home (no hay loteId o reciboId)');
      this.router.navigate(['/home']);
    }
  }

  onCancel() {
    this.safeNavigateToListado();
  }
}

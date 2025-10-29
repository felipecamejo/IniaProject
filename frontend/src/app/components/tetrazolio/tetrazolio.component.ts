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
      id: null,
      numero: nuevaRepeticion.numero,
      viables: nuevaRepeticion.viables,
      noViables: nuevaRepeticion.noViables,
      duras: nuevaRepeticion.duras,
      tetrazolioId: this.editingId
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
      reciboId: null
    }
  ];

  private cargarDatosParaEdicion(id: number) {
    // Cargar datos del Tetrazolio desde el backend
    this.tetrazolioService.obtener(id).subscribe({
      next: (item) => {
        console.log('Cargando datos para edición:', item);
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

        // Fecha
        this.fecha = item.fecha ?? null;

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

        // Cargar repeticiones desde el backend
        this.cargarRepeticiones(id);
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
    // Prevenir doble envío
    if (this.isSubmitting) {
      console.warn('Ya se está procesando una solicitud, ignorando...');
      return;
    }
    
    this.isSubmitting = true;
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

    // Agregar campos nuevos si están definidos
    if (this.cantidadSemillas !== null && this.cantidadSemillas !== undefined) {
      // Preferimos guardar por repetición si aplica
      (tetrazolioData as any).nroSemillasPorRepeticion = this.cantidadSemillas;
    }

    // Pretratamiento: crear objeto PreTratamiento completo
    if (typeof this.selectedPretratamiento === 'string' && this.selectedPretratamiento !== 'custom') {
      (tetrazolioData as any).pretratamiento = this.selectedPretratamiento;
    } else if (this.selectedPretratamiento === 'custom' && this.pretratamientoCustom.trim()) {
      (tetrazolioData as any).pretratamiento = 'OTRO';
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

    // Fecha
    if (this.fecha) {
      (tetrazolioData as any).fecha = this.fecha; // ya en formato yyyy-MM-dd
    }

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
      console.log('Fecha:', this.fecha);
      console.log('Repeticiones:', this.repeticiones);
      console.log('Repeticiones entries:', this.repeticionesEntries);
      console.log('Detalles de semillas:', this.detalles);
      
      // Validaciones antes de actualizar
      const validaciones = this.validarDatosCreacion();
      if (!validaciones.esValido) {
        console.error('VALIDACIONES FALLIDAS:', validaciones.errores);
        return;
      }
      
      console.log('Validaciones pasadas correctamente');
      console.log('Enviando petición de actualización al backend...');
      
      this.tetrazolioService.editar(tetrazolioData as TetrazolioDto).subscribe({
        next: (res) => {
          console.log('Tetrazolio actualizado correctamente en el backend');
          console.log('Respuesta del servidor:', res);
          
          // Procesar repeticiones
          console.log('Procesando repeticiones...');
          this.procesarRepeticiones(this.editingId!).then(() => {
            console.log('Repeticiones procesadas correctamente');
            console.log('Navegando al listado...');
            this.isSubmitting = false;
            this.safeNavigateToListado();
          }).catch(err => {
            console.error('Error procesando repeticiones después de editar:', err);
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
      console.log('Fecha:', this.fecha);
      console.log('Repeticiones:', this.repeticiones);
      console.log('Repeticiones entries:', this.repeticionesEntries);
      console.log('Detalles de semillas:', this.detalles);
      
      // Validaciones antes de crear
      const validaciones = this.validarDatosCreacion();
      if (!validaciones.esValido) {
        console.error('VALIDACIONES FALLIDAS:', validaciones.errores);
        return;
      }
      
      console.log('Validaciones pasadas correctamente');
      
      tetrazolioData.fechaCreacion = new Date().toISOString().split('T')[0];
      tetrazolioData.repetido = false;
      tetrazolioData.reciboId = this.reciboId ? parseInt(this.reciboId) : null;
      
      console.log('Enviando petición de creación al backend...');
      
      this.tetrazolioService.crear(tetrazolioData as TetrazolioDto).subscribe({
        next: (res) => {
          console.log('Tetrazolio creado correctamente en el backend');
          console.log('Respuesta del servidor:', res);
          
          const tetrazolioId = parseInt(res.split('ID:')[1]);
          console.log('ID del tetrazolio creado:', tetrazolioId);
          
          // Procesar repeticiones
          console.log('Procesando repeticiones...');
          this.procesarRepeticiones(tetrazolioId).then(() => {
            console.log('Repeticiones procesadas correctamente');
            console.log('Navegando al listado...');
            this.isSubmitting = false;
            this.safeNavigateToListado();
          }).catch(err => {
            console.error('Error procesando repeticiones después de crear:', err);
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
    
    // Validar pretratamiento
    if (this.selectedPretratamiento === null || this.selectedPretratamiento === undefined) {
      errores.push('Debe seleccionar un pretratamiento');
      console.warn('Pretratamiento no seleccionado');
    }
    
    // Validar concentración
    const concentracion = this.selectedConcentracion === 'custom' ? this.concentracionCustom : this.selectedConcentracion;
    if (concentracion === null || concentracion === undefined || concentracion < 0) {
      errores.push('La concentración debe ser un valor válido mayor o igual a 0');
      console.warn('Concentración inválida:', concentracion);
    }
    
    // Validar tinción horas
    const tincionHoras = this.selectedTincionHs === 'custom' ? this.tincionHsCustom : this.selectedTincionHs;
    if (tincionHoras === null || tincionHoras === undefined || tincionHoras <= 0) {
      errores.push('Las horas de tinción deben ser un valor válido mayor a 0');
      console.warn('Tinción horas inválida:', tincionHoras);
    }
    
    // Validar tinción grados
    if (this.tincionC === null || this.tincionC === undefined || this.tincionC <= 0) {
      errores.push('Los grados de tinción deben ser un valor válido mayor a 0');
      console.warn('Tinción grados inválida:', this.tincionC);
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
          errores.push(`La repetición ${index + 1} tiene valores negativos`);
          console.warn(`Repetición ${index + 1} con valores negativos:`, rep);
        }
        
        const totalRep = rep.viables + rep.noViables + rep.duras;
        if (totalRep === 0) {
          errores.push(`La repetición ${index + 1} no tiene datos ingresados`);
          console.warn(`Repetición ${index + 1} sin datos:`, rep);
        }
      });
    }
    
    // Validar detalles de semillas
    if (!this.detalles || this.detalles.length === 0) {
      errores.push('Debe tener al menos una tabla de detalles de semillas');
      console.warn('No hay detalles de semillas definidos');
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

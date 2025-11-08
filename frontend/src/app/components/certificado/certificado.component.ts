import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CertificadoService } from '../../../services/CertificadoService';
import { CertificadoDto, TipoCertificado } from '../../../models/Certificado.dto';
import { DateService } from '../../../services/DateService';
import { ReciboService } from '../../../services/ReciboService';
import { ReciboDto } from '../../../models/Recibo.dto';
import { LoteService } from '../../../services/LoteService';
import { LoteDto } from '../../../models/Lote.dto';
import { PurezaService } from '../../../services/PurezaService';
import { GerminacionService } from '../../../services/GerminacionService';
import { DOSNService } from '../../../services/DOSNService';
import { PurezaDto } from '../../../models/Pureza.dto';
import { GerminacionDto } from '../../../models/Germinacion.dto';
import { DOSNDto } from '../../../models/DOSN.dto';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-certificado',
  standalone: true,
  templateUrl: './certificado.component.html',
  styleUrls: ['./certificado.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    TableModule,
  ]
})
export class CertificadoComponent implements OnInit {
  // Propiedades del formulario
  nombreSolicitante: string = '';
  especie: string = '';
  cultivar: string = '';
  categoria: string = '';
  responsableMuestreo: string = '';
  fechaMuestreo: string = '';
  numeroLote: string = '';
  pesoKg: number | null = null;
  numeroEnvases: number | null = null;
  fechaIngresoLaboratorio: string = '';
  fechaFinalizacionAnalisis: string = '';
  numeroMuestra: string = '';
  numeroCertificado: string = '';
  tipoCertificado: TipoCertificado | null = null;
  fechaEmision: string = '';
  firmante: string = '';

  certificadoId: number = 0;
  loteId: number | null = null;
  reciboId: number | null = null;
  isEditing: boolean = false;
  isViewing: boolean = false;

  // Datos del recibo
  recibo: ReciboDto | null = null;

  // Resultados de análisis (por defecto, luego se extraerán de los análisis)
  // Pureza
  purezaSemillaPura: number | null = null;
  purezaMateriaInerte: number | null = null;
  purezaOtrasSemillas: number | null = null;
  purezaOtrosCultivos: number | null = null;
  purezaMalezas: number | null = null;
  purezaMalezasToleradas: string = 'N';
  purezaPeso1000Semillas: string = 'N';
  purezaHumedad: string = 'N';
  purezaClaseMateriaInerte: string = '';
  purezaOtrasSemillasDescripcion: string = '';

  // DOSN (Determinación de otras semillas por número)
  dosnGramosAnalizados: number | null = null;
  dosnMalezasToleranciaCero: number = 0;
  dosnMalezasTolerancia: number = 0;
  dosnOtrosCultivos: number = 0;
  dosnBrassicaSpp: string = '';

  // Germinación
  germinacionNumeroDias: number | null = null;
  germinacionPlantulasNormales: number | null = null;
  germinacionPlantulasAnormales: number | null = null;
  germinacionSemillasDuras: number = 0;
  germinacionSemillasFrescas: number = 0;
  germinacionSemillasMuertas: number | null = null;
  germinacionSustrato: string = '';
  germinacionTemperatura: number | null = null;
  germinacionPreTratamiento: string = '';

  // Opciones para tipo de certificado
  tipoCertificadoOptions: Array<{label: string, value: TipoCertificado | null}> = [
    { label: 'Seleccionar tipo', value: null },
    { label: 'DEFINITIVO', value: TipoCertificado.DEFINITIVO },
    { label: 'PROVISORIO', value: TipoCertificado.PROVISORIO }
  ];

  // Propiedades para manejar errores
  errores: string[] = [];
  isFechaMuestreoInvalida: boolean = false;
  isFechaIngresoInvalida: boolean = false;
  isFechaFinalizacionInvalida: boolean = false;
  isFechaEmisionInvalida: boolean = false;

  constructor(
    private certificadoService: CertificadoService,
    private reciboService: ReciboService,
    private loteService: LoteService,
    private purezaService: PurezaService,
    private germinacionService: GerminacionService,
    private dosnService: DOSNService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener parámetros de la ruta
    this.route.paramMap.subscribe(params => {
      // Obtener loteId y reciboId de la ruta (si existen)
      if (params.get('loteId')) this.loteId = Number(params.get('loteId'));
      if (params.get('reciboId')) this.reciboId = Number(params.get('reciboId'));
      
      const idParam = params.get('id');
      this.certificadoId = idParam ? Number(idParam) : 0;
      this.isEditing = this.certificadoId !== 0;

      if (this.certificadoId === 0) {
        // Modo creación: verificar si ya existe un certificado para este recibo
        if (this.reciboId) {
          this.verificarCertificadoExistente();
        }
        this.inicializarCampos();
        // Si hay reciboId, cargar datos del recibo (sin extraer análisis por ahora)
        if (this.reciboId) {
          this.cargarDatosRecibo();
        }
      } else {
        this.cargarCertificado(this.certificadoId);
      }
    });

    // Verificar si es modo visualización (suscripción separada)
    this.route.queryParams.subscribe(queryParams => {
      this.isViewing = queryParams['view'] === 'true';
    });
  }

  verificarCertificadoExistente(): void {
    if (!this.reciboId) return;

    this.certificadoService.listarPorRecibo(this.reciboId).subscribe({
      next: (certificados: CertificadoDto[]) => {
        if (certificados && certificados.length > 0) {
          // Verificar si hay algún certificado activo
          const certificadoActivo = certificados.find(c => c.activo);
          if (certificadoActivo && certificadoActivo.id) {
            // Ya existe un certificado, redirigir a editar
            console.log('Ya existe un certificado para este recibo. Redirigiendo a editar...');
            if (this.loteId && this.reciboId) {
              this.router.navigate([`/${this.loteId}/${this.reciboId}/certificado/editar/${certificadoActivo.id}`]);
            } else {
              alert('Ya existe un certificado para este lote. Solo se permite un certificado por lote.');
              this.router.navigate(['/listado-lotes']);
            }
          }
        }
      },
      error: (error) => {
        console.error('Error verificando certificado existente:', error);
      }
    });
  }

  cargarDatosRecibo() {
    if (!this.reciboId) return;

    // Cargar datos del recibo
    this.reciboService.obtenerRecibo(this.reciboId).subscribe({
      next: (recibo: ReciboDto) => {
        this.recibo = recibo;
        // Pre-llenar campos del certificado con datos del recibo
        if (recibo.especie) this.especie = recibo.especie;
        if (recibo.cultivar) this.cultivar = recibo.cultivar;
        if (recibo.kgLimpios) this.pesoKg = recibo.kgLimpios;
        
        // Obtener loteId del recibo si no está en la ruta
        if (!this.loteId && recibo.loteId) {
          this.loteId = recibo.loteId;
        }
        
        // Cargar datos del lote para asignar automáticamente el número de lote
        if (this.loteId) {
          this.cargarDatosLote(this.loteId);
        }
        
        // Por ahora NO extraer análisis automáticamente
        // this.cargarAnalisisDisponibles();
      },
      error: (err) => {
        console.error('Error cargando recibo:', err);
      }
    });
  }

  cargarDatosLote(loteId: number) {
    this.loteService.obtenerLote(loteId).subscribe({
      next: (lote: LoteDto) => {
        // Asignar automáticamente el nombre del lote al campo numeroLote
        if (lote.nombre) {
          this.numeroLote = lote.nombre;
        }
        console.log('Lote cargado y asignado automáticamente:', lote.nombre);
      },
      error: (err) => {
        console.error('Error cargando lote:', err);
      }
    });
  }

  // Método comentado por ahora - no extraer análisis automáticamente
  /*
  cargarAnalisisDisponibles() {
    if (!this.reciboId) return;

    // Cargar análisis de pureza
    this.purezaService.listarPorRecibo(this.reciboId).subscribe({
      next: (response) => {
        if (response.purezas && response.purezas.length > 0) {
          const pureza = response.purezas[0]; // Tomar el primer análisis de pureza
          this.extraerDatosPureza(pureza);
        } else {
          this.inicializarValoresPorDefectoPureza();
        }
      },
      error: (err) => {
        console.error('Error cargando pureza:', err);
        this.inicializarValoresPorDefectoPureza();
      }
    });

    // Cargar análisis de DOSN
    this.dosnService.listarPorRecibo(this.reciboId).subscribe({
      next: (response) => {
        if (response.DOSN && response.DOSN.length > 0) {
          const dosn = response.DOSN[0]; // Tomar el primer análisis DOSN
          this.extraerDatosDOSN(dosn);
        } else {
          this.inicializarValoresPorDefectoDOSN();
        }
      },
      error: (err) => {
        console.error('Error cargando DOSN:', err);
        this.inicializarValoresPorDefectoDOSN();
      }
    });

    // Cargar análisis de germinación
    this.germinacionService.listarPorRecibo(this.reciboId).subscribe({
      next: (response) => {
        if (response.germinacion && response.germinacion.length > 0) {
          const germinacion = response.germinacion[0]; // Tomar el primer análisis de germinación
          this.extraerDatosGerminacion(germinacion);
        } else {
          this.inicializarValoresPorDefectoGerminacion();
        }
      },
      error: (err) => {
        console.error('Error cargando germinación:', err);
        this.inicializarValoresPorDefectoGerminacion();
      }
    });
  }
  */

  extraerDatosPureza(pureza: PurezaDto) {
    // Extraer datos de pureza (usar valores INASE si están disponibles, sino INIA)
    this.purezaSemillaPura = pureza.semillaPuraPorcentajeRedondeoInase ?? pureza.semillaPuraPorcentajeRedondeo ?? null;
    this.purezaMateriaInerte = pureza.materialInertePorcentajeRedondeoInase ?? pureza.materialInertePorcentajeRedondeo ?? null;
    this.purezaOtrasSemillas = pureza.otrosCultivosPorcentajeRedondeoInase ?? pureza.otrosCultivosPorcentajeRedondeo ?? null;
    this.purezaOtrosCultivos = pureza.otrosCultivosPorcentajeRedondeoInase ?? pureza.otrosCultivosPorcentajeRedondeo ?? null;
    this.purezaMalezas = pureza.malezasPorcentajeRedondeoInase ?? pureza.malezasPorcentajeRedondeo ?? null;
    this.purezaMalezasToleradas = pureza.malezasToleradasPorcentajeRedondeoInase != null ? 
      pureza.malezasToleradasPorcentajeRedondeoInase.toString() : 'N';
    this.purezaClaseMateriaInerte = pureza.materiaInerteTipoInase ?? pureza.materiaInerteTipo ?? '';
    this.purezaOtrasSemillasDescripcion = 'No contiene.';
  }

  extraerDatosDOSN(dosn: DOSNDto) {
    // Extraer datos de DOSN
    this.dosnGramosAnalizados = dosn.gramosAnalizadosINASE ?? dosn.gramosAnalizadosINIA ?? null;
    // Por ahora usar valores por defecto, luego se calcularán de las listas de malezas
    this.dosnMalezasToleranciaCero = 0;
    this.dosnMalezasTolerancia = 0;
    this.dosnOtrosCultivos = 0;
    this.dosnBrassicaSpp = dosn.determinacionBrassica ? 'Contiene.' : 'No contiene.';
  }

  extraerDatosGerminacion(germinacion: GerminacionDto) {
    // Extraer datos de germinación
    this.germinacionNumeroDias = germinacion.nroDias ?? null;
    this.germinacionPlantulasNormales = germinacion.pNormal ?? null;
    this.germinacionPlantulasAnormales = germinacion.pAnormal ?? null;
    this.germinacionSemillasDuras = germinacion.semillasDuras ?? 0;
    this.germinacionSemillasFrescas = 0; // No está en el DTO actual
    this.germinacionSemillasMuertas = germinacion.pMuertas ?? null;
    this.germinacionSustrato = 'RP'; // Papel de filtro
    this.germinacionTemperatura = germinacion.temperatura ?? null;
    this.germinacionPreTratamiento = this.formatearPreTratamiento(germinacion.preFrio, germinacion.preTratamiento);
  }

  formatearPreTratamiento(preFrio: string | null, preTratamiento: string | null): string {
    if (preFrio && preFrio !== 'NINGUNO') {
      return `Pre-frío ${preFrio === 'CORTO' ? '5 días' : '10 días'}`;
    }
    if (preTratamiento && preTratamiento !== 'NINGUNO') {
      return preTratamiento;
    }
    return '';
  }

  inicializarValoresPorDefectoPureza() {
    this.purezaSemillaPura = 99.9;
    this.purezaMateriaInerte = 0.1;
    this.purezaOtrasSemillas = 0.0;
    this.purezaOtrosCultivos = 0.0;
    this.purezaMalezas = 0.0;
    this.purezaMalezasToleradas = 'N';
    this.purezaPeso1000Semillas = 'N';
    this.purezaHumedad = 'N';
    this.purezaClaseMateriaInerte = 'Restos vegetales, trozos de semillas.';
    this.purezaOtrasSemillasDescripcion = 'No contiene.';
  }

  inicializarValoresPorDefectoDOSN() {
    this.dosnGramosAnalizados = 1006;
    this.dosnMalezasToleranciaCero = 0;
    this.dosnMalezasTolerancia = 0;
    this.dosnOtrosCultivos = 0;
    this.dosnBrassicaSpp = 'No contiene.';
  }

  inicializarValoresPorDefectoGerminacion() {
    this.germinacionNumeroDias = 9;
    this.germinacionPlantulasNormales = 90;
    this.germinacionPlantulasAnormales = 2;
    this.germinacionSemillasDuras = 0;
    this.germinacionSemillasFrescas = 0;
    this.germinacionSemillasMuertas = 8;
    this.germinacionSustrato = 'RP';
    this.germinacionTemperatura = 20;
    this.germinacionPreTratamiento = 'Pre-frío 5 días';
  }

  inicializarCampos() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const fechaHoy = `${year}-${month}-${day}`;

    this.nombreSolicitante = '';
    this.especie = '';
    this.cultivar = '';
    this.categoria = '';
    this.responsableMuestreo = '';
    this.fechaMuestreo = fechaHoy;
    this.numeroLote = '';
    this.pesoKg = null;
    this.numeroEnvases = null;
    this.fechaIngresoLaboratorio = fechaHoy;
    this.fechaFinalizacionAnalisis = fechaHoy;
    this.numeroMuestra = '';
    this.numeroCertificado = '';
    this.tipoCertificado = null;
    this.fechaEmision = fechaHoy;
    this.firmante = '';

    // Inicializar valores por defecto de análisis
    this.inicializarValoresPorDefectoPureza();
    this.inicializarValoresPorDefectoDOSN();
    this.inicializarValoresPorDefectoGerminacion();
  }

  cargarCertificado(id: number) {
    console.log('Cargando certificado con ID:', id);
    // Guardar loteId y reciboId de la ruta antes de cargar
    const loteIdFromRoute = this.loteId;
    const reciboIdFromRoute = this.reciboId;
    
    this.certificadoService.obtenerCertificado(id).subscribe({
      next: (certificado: CertificadoDto) => {
        console.log('Certificado cargado del backend:', certificado);
        
        // Restaurar loteId y reciboId de la ruta (tienen prioridad)
        if (loteIdFromRoute) this.loteId = loteIdFromRoute;
        if (reciboIdFromRoute) this.reciboId = reciboIdFromRoute;
        
        // Si no hay loteId en la ruta pero el certificado tiene reciboId, obtenerlo del recibo
        if (!this.loteId && certificado.reciboId) {
          this.reciboService.obtenerRecibo(certificado.reciboId).subscribe({
            next: (recibo: ReciboDto) => {
              if (recibo.loteId) {
                this.loteId = recibo.loteId;
                // Cargar datos del lote para asignar automáticamente el número de lote
                this.cargarDatosLote(recibo.loteId);
              }
            }
          });
        } else if (this.loteId) {
          // Si ya tenemos loteId, cargar datos del lote
          this.cargarDatosLote(this.loteId);
        }
        
        // Cargar datos generales
        this.nombreSolicitante = certificado.nombreSolicitante || '';
        this.especie = certificado.especie || '';
        this.cultivar = certificado.cultivar || '';
        this.categoria = certificado.categoria || '';
        this.responsableMuestreo = certificado.responsableMuestreo || '';
        this.fechaMuestreo = this.formatearFechaParaInput(certificado.fechaMuestreo);
        // El numeroLote se asignará automáticamente desde el lote (se sobrescribirá con el nombre actual del lote)
        this.pesoKg = certificado.pesoKg ?? null;
        this.numeroEnvases = certificado.numeroEnvases ?? null;
        this.fechaIngresoLaboratorio = this.formatearFechaParaInput(certificado.fechaIngresoLaboratorio);
        this.fechaFinalizacionAnalisis = this.formatearFechaParaInput(certificado.fechaFinalizacionAnalisis);
        this.numeroMuestra = certificado.numeroMuestra || '';
        this.numeroCertificado = certificado.numeroCertificado || '';
        this.tipoCertificado = certificado.tipoCertificado ?? null;
        this.fechaEmision = this.formatearFechaParaInput(certificado.fechaEmision);
        this.firmante = certificado.firmante || '';
        
        // Solo usar reciboId del certificado si no hay uno en la ruta
        if (!this.reciboId && certificado.reciboId) {
          this.reciboId = certificado.reciboId;
        }
        
        // Cargar resultados de análisis - Pureza
        this.purezaSemillaPura = certificado.purezaSemillaPura ?? null;
        this.purezaMateriaInerte = certificado.purezaMateriaInerte ?? null;
        this.purezaOtrasSemillas = certificado.purezaOtrasSemillas ?? null;
        this.purezaOtrosCultivos = certificado.purezaOtrosCultivos ?? null;
        this.purezaMalezas = certificado.purezaMalezas ?? null;
        this.purezaMalezasToleradas = certificado.purezaMalezasToleradas || 'N';
        this.purezaPeso1000Semillas = certificado.purezaPeso1000Semillas || 'N';
        this.purezaHumedad = certificado.purezaHumedad || 'N';
        this.purezaClaseMateriaInerte = certificado.purezaClaseMateriaInerte || '';
        this.purezaOtrasSemillasDescripcion = certificado.purezaOtrasSemillasDescripcion || '';
        
        // Cargar resultados de análisis - DOSN
        this.dosnGramosAnalizados = certificado.dosnGramosAnalizados ?? null;
        this.dosnMalezasToleranciaCero = certificado.dosnMalezasToleranciaCero ?? 0;
        this.dosnMalezasTolerancia = certificado.dosnMalezasTolerancia ?? 0;
        this.dosnOtrosCultivos = certificado.dosnOtrosCultivos ?? 0;
        this.dosnBrassicaSpp = certificado.dosnBrassicaSpp || '';
        
        // Cargar resultados de análisis - Germinación
        this.germinacionNumeroDias = certificado.germinacionNumeroDias ?? null;
        this.germinacionPlantulasNormales = certificado.germinacionPlantulasNormales ?? null;
        this.germinacionPlantulasAnormales = certificado.germinacionPlantulasAnormales ?? null;
        this.germinacionSemillasDuras = certificado.germinacionSemillasDuras ?? 0;
        this.germinacionSemillasFrescas = certificado.germinacionSemillasFrescas ?? 0;
        this.germinacionSemillasMuertas = certificado.germinacionSemillasMuertas ?? null;
        this.germinacionSustrato = certificado.germinacionSustrato || '';
        this.germinacionTemperatura = certificado.germinacionTemperatura ?? null;
        this.germinacionPreTratamiento = certificado.germinacionPreTratamiento || '';
        
        console.log('Datos del certificado asignados al formulario');
      },
      error: (err) => {
        console.error('Error cargando certificado:', err);
        alert('Error al cargar el certificado. Por favor, intente nuevamente.');
      }
    });
  }

  formatearFechaParaInput(fecha: string | null): string {
    if (!fecha) return '';
    
    // Si la fecha viene en formato ISO con 'T', usar split (más confiable)
    if (fecha.includes('T')) {
      return fecha.split('T')[0];
    }
    
    // Si no, intentar parsear como Date
    try {
      const date = new Date(fecha);
      if (isNaN(date.getTime())) {
        return '';
      }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  }

  manejarProblemas(): boolean {
    this.errores = [];
    this.isFechaMuestreoInvalida = false;
    this.isFechaIngresoInvalida = false;
    this.isFechaFinalizacionInvalida = false;
    this.isFechaEmisionInvalida = false;

    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);

    if (this.pesoKg != null && this.pesoKg < 0) {
      this.errores.push('El peso no puede ser negativo.');
    }

    if (this.numeroEnvases != null && this.numeroEnvases < 0) {
      this.errores.push('El número de envases no puede ser negativo.');
    }

    if (this.fechaMuestreo) {
      const fechaMuestreo = new Date(this.fechaMuestreo);
      if (fechaMuestreo > hoy) {
        this.errores.push('La fecha de muestreo no puede ser futura.');
        this.isFechaMuestreoInvalida = true;
      }
    }

    if (this.fechaIngresoLaboratorio) {
      const fechaIngreso = new Date(this.fechaIngresoLaboratorio);
      if (fechaIngreso > hoy) {
        this.errores.push('La fecha de ingreso al laboratorio no puede ser futura.');
        this.isFechaIngresoInvalida = true;
      }
    }

    if (this.fechaFinalizacionAnalisis) {
      const fechaFinalizacion = new Date(this.fechaFinalizacionAnalisis);
      if (fechaFinalizacion > hoy) {
        this.errores.push('La fecha de finalización del análisis no puede ser futura.');
        this.isFechaFinalizacionInvalida = true;
      }
    }

    if (this.fechaEmision) {
      const fechaEmision = new Date(this.fechaEmision);
      if (fechaEmision > hoy) {
        this.errores.push('La fecha de emisión no puede ser futura.');
        this.isFechaEmisionInvalida = true;
      }
    }

    return this.errores.length > 0;
  }

  onSubmit() {
    if (this.manejarProblemas()) {
      return;
    }

    if (this.isEditing) {
      this.editarCertificado();
    } else {
      this.crearCertificado();
    }
  }

  crearCertificado() {
    // Verificar que no exista ya un certificado para este recibo
    if (this.reciboId) {
      this.certificadoService.listarPorRecibo(this.reciboId).subscribe({
        next: (certificados: CertificadoDto[]) => {
          if (certificados && certificados.length > 0) {
            const certificadoActivo = certificados.find(c => c.activo);
            if (certificadoActivo && certificadoActivo.id) {
              alert('Ya existe un certificado para este recibo. Solo se permite un certificado por lote.');
              // Redirigir a editar el certificado existente
              if (this.loteId && this.reciboId) {
                this.router.navigate([`/${this.loteId}/${this.reciboId}/certificado/editar/${certificadoActivo.id}`]);
              }
              return;
            }
          }
          // Si no existe certificado, proceder con la creación
          this.procesarCreacionCertificado();
        },
        error: (error) => {
          console.error('Error verificando certificado existente:', error);
          // En caso de error, proceder con la creación
          this.procesarCreacionCertificado();
        }
      });
    } else {
      // Si no hay reciboId, proceder directamente
      this.procesarCreacionCertificado();
    }
  }

  procesarCreacionCertificado() {
    // Asegurar que el numeroLote esté asignado desde el lote si no está ya asignado
    if (!this.numeroLote && this.loteId) {
      this.loteService.obtenerLote(this.loteId).subscribe({
        next: (lote: LoteDto) => {
          if (lote.nombre) {
            this.numeroLote = lote.nombre;
          }
          // Continuar con la creación después de asignar el numeroLote
          this.crearCertificadoConPayload();
        },
        error: (err) => {
          console.error('Error cargando lote para asignar numeroLote:', err);
          // Continuar con la creación aunque haya error
          this.crearCertificadoConPayload();
        }
      });
    } else {
      // Si ya tiene numeroLote o no hay loteId, proceder directamente
      this.crearCertificadoConPayload();
    }
  }

  crearCertificadoConPayload() {
    const payload: CertificadoDto = {
      id: null,
      nombreSolicitante: this.nombreSolicitante || null,
      especie: this.especie || null,
      cultivar: this.cultivar || null,
      categoria: this.categoria || null,
      responsableMuestreo: this.responsableMuestreo || null,
      fechaMuestreo: DateService.ajustarFecha(this.fechaMuestreo),
      numeroLote: this.numeroLote || null,
      pesoKg: this.pesoKg ?? null,
      numeroEnvases: this.numeroEnvases ?? null,
      fechaIngresoLaboratorio: DateService.ajustarFecha(this.fechaIngresoLaboratorio),
      fechaFinalizacionAnalisis: DateService.ajustarFecha(this.fechaFinalizacionAnalisis),
      numeroMuestra: this.numeroMuestra || null,
      numeroCertificado: this.numeroCertificado || null,
      tipoCertificado: this.tipoCertificado ?? null,
      fechaEmision: DateService.ajustarFecha(this.fechaEmision),
      firmante: this.firmante || null,
      fechaFirma: null,
      reciboId: this.reciboId ?? null,
      activo: true,
      // Resultados de análisis - Pureza
      purezaSemillaPura: this.purezaSemillaPura ?? null,
      purezaMateriaInerte: this.purezaMateriaInerte ?? null,
      purezaOtrasSemillas: this.purezaOtrasSemillas ?? null,
      purezaOtrosCultivos: this.purezaOtrosCultivos ?? null,
      purezaMalezas: this.purezaMalezas ?? null,
      purezaMalezasToleradas: this.purezaMalezasToleradas || null,
      purezaPeso1000Semillas: this.purezaPeso1000Semillas || null,
      purezaHumedad: this.purezaHumedad || null,
      purezaClaseMateriaInerte: this.purezaClaseMateriaInerte || null,
      purezaOtrasSemillasDescripcion: this.purezaOtrasSemillasDescripcion || null,
      // Resultados de análisis - DOSN
      dosnGramosAnalizados: this.dosnGramosAnalizados ?? null,
      dosnMalezasToleranciaCero: this.dosnMalezasToleranciaCero ?? null,
      dosnMalezasTolerancia: this.dosnMalezasTolerancia ?? null,
      dosnOtrosCultivos: this.dosnOtrosCultivos ?? null,
      dosnBrassicaSpp: this.dosnBrassicaSpp || null,
      // Resultados de análisis - Germinación
      germinacionNumeroDias: this.germinacionNumeroDias ?? null,
      germinacionPlantulasNormales: this.germinacionPlantulasNormales ?? null,
      germinacionPlantulasAnormales: this.germinacionPlantulasAnormales ?? null,
      germinacionSemillasDuras: this.germinacionSemillasDuras ?? null,
      germinacionSemillasFrescas: this.germinacionSemillasFrescas ?? null,
      germinacionSemillasMuertas: this.germinacionSemillasMuertas ?? null,
      germinacionSustrato: this.germinacionSustrato || null,
      germinacionTemperatura: this.germinacionTemperatura ?? null,
      germinacionPreTratamiento: this.germinacionPreTratamiento || null
    };

    this.certificadoService.crearCertificado(payload).subscribe({
      next: (certificadoCreado: CertificadoDto) => {
        console.log('Certificado creado:', certificadoCreado);
        // Navegar según si hay loteId y reciboId
        if (this.loteId != null && this.reciboId != null) {
          this.router.navigate([`/${this.loteId}/${this.reciboId}/lote-analisis`]);
        } else {
          this.router.navigate(['/listado-lotes']);
        }
      },
      error: (err) => {
        console.error('Error creando certificado:', err);
        const errorMessage = err.error?.message || err.error || err.message || '';
        if (errorMessage.includes('certificado') && errorMessage.includes('existe')) {
          alert('Ya existe un certificado para este lote. Solo se permite un certificado por lote.');
          // Intentar redirigir a editar si hay reciboId
          if (this.reciboId) {
            this.certificadoService.listarPorRecibo(this.reciboId).subscribe({
              next: (certificados: CertificadoDto[]) => {
                if (certificados && certificados.length > 0) {
                  const certificadoActivo = certificados.find(c => c.activo);
                  if (certificadoActivo && certificadoActivo.id && this.loteId && this.reciboId) {
                    this.router.navigate([`/${this.loteId}/${this.reciboId}/certificado/editar/${certificadoActivo.id}`]);
                  }
                }
              }
            });
          }
        } else {
          alert('Error al crear el certificado. Por favor, intente nuevamente.');
        }
      }
    });
  }

  editarCertificado() {
    // Asegurar que el numeroLote esté asignado desde el lote si no está ya asignado
    if (!this.numeroLote && this.loteId) {
      this.loteService.obtenerLote(this.loteId).subscribe({
        next: (lote: LoteDto) => {
          if (lote.nombre) {
            this.numeroLote = lote.nombre;
          }
          // Continuar con la edición después de asignar el numeroLote
          this.editarCertificadoConPayload();
        },
        error: (err) => {
          console.error('Error cargando lote para asignar numeroLote:', err);
          // Continuar con la edición aunque haya error
          this.editarCertificadoConPayload();
        }
      });
    } else {
      // Si ya tiene numeroLote o no hay loteId, proceder directamente
      this.editarCertificadoConPayload();
    }
  }

  editarCertificadoConPayload() {
    const payload: CertificadoDto = {
      id: this.certificadoId,
      nombreSolicitante: this.nombreSolicitante || null,
      especie: this.especie || null,
      cultivar: this.cultivar || null,
      categoria: this.categoria || null,
      responsableMuestreo: this.responsableMuestreo || null,
      fechaMuestreo: DateService.ajustarFecha(this.fechaMuestreo),
      numeroLote: this.numeroLote || null,
      pesoKg: this.pesoKg ?? null,
      numeroEnvases: this.numeroEnvases ?? null,
      fechaIngresoLaboratorio: DateService.ajustarFecha(this.fechaIngresoLaboratorio),
      fechaFinalizacionAnalisis: DateService.ajustarFecha(this.fechaFinalizacionAnalisis),
      numeroMuestra: this.numeroMuestra || null,
      numeroCertificado: this.numeroCertificado || null,
      tipoCertificado: this.tipoCertificado ?? null,
      fechaEmision: DateService.ajustarFecha(this.fechaEmision),
      firmante: this.firmante || null,
      fechaFirma: null,
      reciboId: this.reciboId ?? null,
      activo: true,
      // Resultados de análisis - Pureza
      purezaSemillaPura: this.purezaSemillaPura ?? null,
      purezaMateriaInerte: this.purezaMateriaInerte ?? null,
      purezaOtrasSemillas: this.purezaOtrasSemillas ?? null,
      purezaOtrosCultivos: this.purezaOtrosCultivos ?? null,
      purezaMalezas: this.purezaMalezas ?? null,
      purezaMalezasToleradas: this.purezaMalezasToleradas || null,
      purezaPeso1000Semillas: this.purezaPeso1000Semillas || null,
      purezaHumedad: this.purezaHumedad || null,
      purezaClaseMateriaInerte: this.purezaClaseMateriaInerte || null,
      purezaOtrasSemillasDescripcion: this.purezaOtrasSemillasDescripcion || null,
      // Resultados de análisis - DOSN
      dosnGramosAnalizados: this.dosnGramosAnalizados ?? null,
      dosnMalezasToleranciaCero: this.dosnMalezasToleranciaCero ?? null,
      dosnMalezasTolerancia: this.dosnMalezasTolerancia ?? null,
      dosnOtrosCultivos: this.dosnOtrosCultivos ?? null,
      dosnBrassicaSpp: this.dosnBrassicaSpp || null,
      // Resultados de análisis - Germinación
      germinacionNumeroDias: this.germinacionNumeroDias ?? null,
      germinacionPlantulasNormales: this.germinacionPlantulasNormales ?? null,
      germinacionPlantulasAnormales: this.germinacionPlantulasAnormales ?? null,
      germinacionSemillasDuras: this.germinacionSemillasDuras ?? null,
      germinacionSemillasFrescas: this.germinacionSemillasFrescas ?? null,
      germinacionSemillasMuertas: this.germinacionSemillasMuertas ?? null,
      germinacionSustrato: this.germinacionSustrato || null,
      germinacionTemperatura: this.germinacionTemperatura ?? null,
      germinacionPreTratamiento: this.germinacionPreTratamiento || null
    };

    this.certificadoService.editarCertificado(payload).subscribe({
      next: (mensaje: string) => {
        console.log('Certificado actualizado:', mensaje);
        // Navegar según si hay loteId y reciboId
        if (this.loteId != null && this.reciboId != null) {
          this.router.navigate([`/${this.loteId}/${this.reciboId}/lote-analisis`]);
        } else {
          this.router.navigate(['/listado-lotes']);
        }
      },
      error: (err) => {
        console.error('Error actualizando certificado:', err);
      }
    });
  }

  formatearFecha(fecha: string | null): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  }

  onCancel() {
    // Navegar según si hay loteId y reciboId
    if (this.loteId != null && this.reciboId != null) {
      this.router.navigate([`/${this.loteId}/${this.reciboId}/lote-analisis`]);
    } else {
      this.router.navigate(['/listado-lotes']);
    }
  }
}


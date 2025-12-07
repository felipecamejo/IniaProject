import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CertificadoService } from '../../../services/CertificadoService';
import { CertificadoDto, TipoCertificado } from '../../../models/Certificado.dto';
import { DateService } from '../../../services/DateService';
import { ReciboService } from '../../../services/ReciboService';
import { EspecieService } from '../../../services/EspecieService';
import { CultivoService } from '../../../services/CultivoService';
import { ReciboDto } from '../../../models/Recibo.dto';
import { LoteService } from '../../../services/LoteService';
import { LoteDto } from '../../../models/Lote.dto';
import { PurezaService } from '../../../services/PurezaService';
import { GerminacionService } from '../../../services/GerminacionService';
import { DOSNService } from '../../../services/DOSNService';
import { PurezaDto } from '../../../models/Pureza.dto';
import { GerminacionDto } from '../../../models/Germinacion.dto';
import { DOSNDto } from '../../../models/DOSN.dto';
import { jsPDF } from 'jspdf';
// @ts-ignore - jspdf-autotable puede no tener tipos TypeScript completos
import autoTable from 'jspdf-autotable';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

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
    ConfirmDialogComponent,
  ]
})
export class CertificadoComponent implements OnInit {
  // Propiedades del formulario
  viewSeleccionarImagenFirma: boolean = true;
  nombreSolicitante: string = '';
  especie: string = '';
  cultivar: string = '';
  otrasDeterminaciones: string = '';
  nombreFirmante: string = '';
  funcionFirmante: string = '';
  categoria: string = '';
  responsableMuestreo: string = '';
  fechaMuestreo: string = '';
  numeroLote: string = '';
  pesoKg: number = 0;
  numeroEnvases: number | null = null;
  fechaIngresoLaboratorio: string = '';
  fechaFinalizacionAnalisis: string = '';
  numeroMuestra: string = '';
  numeroCertificado: string = '';
  tipoCertificado: TipoCertificado | null = null;
  fechaEmision: string = '';
  firmante: Uint8Array = new Uint8Array(0);
  firmantePreviewUrl: string | null = null;
  firmantePreviewName: string = '';
  /**
   * Maneja la selección de imagen para la firma digital.
   */
  onFirmaImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.firmantePreviewName = file.name;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const base64 = e.target.result as string;
        this.firmantePreviewUrl = base64;
        // Extraer solo la parte base64 si es dataURL
        let base64Data = base64;
        if (base64.startsWith('data:')) {
          base64Data = base64.split(',')[1];
        }
        this.firmante = this.base64ToUint8Array(base64Data);
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Convierte un string base64 a Uint8Array
   */
  base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Convierte un Uint8Array a una imagen base64 para mostrar preview
   */
  uint8ArrayToBase64Image(uint8: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < uint8.length; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    const base64 = window.btoa(binary);
    return 'data:image/png;base64,' + base64;
  }

  certificadoId: number = 0;
  loteId: number | null = null;
  reciboId: number | null = null;
  isEditing: boolean = false;
  isViewing: boolean = false;

  // Datos del recibo
  recibo: ReciboDto | null = null;
  analisisSolicitados: string | null = null;

  // Indicadores de existencia de análisis
  tienePureza: boolean = false;
  tieneDOSN: boolean = false;
  tieneGerminacion: boolean = false;

  // Indicadores de qué análisis deben realizarse
  debeRealizarPureza: boolean = false;
  debeRealizarDOSN: boolean = false;
  debeRealizarGerminacion: boolean = false;

  brassicaContiene: boolean = false;

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
  dosnMalezasToleranciaCero: number | null = null;
  dosnMalezasTolerancia: number | null = null;
  dosnOtrosCultivos: number | null = null;
  dosnBrassicaSpp: number | null = null;

  // Germinación
  germinacionNumeroDias: number | null = null;
  germinacionPlantulasNormales: number | null = null;
  germinacionPlantulasAnormales: number | null = null;
  germinacionSemillasDuras: number | null = null;
  germinacionSemillasFrescas: number | null = null;
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
  isExportingPDF: boolean = false;

  constructor(
    private certificadoService: CertificadoService,
    private reciboService: ReciboService,
    private loteService: LoteService,
    private purezaService: PurezaService,
    private germinacionService: GerminacionService,
    private dosnService: DOSNService,
    private especieService: EspecieService,
    private cultivoService: CultivoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Siempre mostrar los botones al cargar la página
    this.viewSeleccionarImagenFirma = true;
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

  getNumeroLote(): string {
    return this.categoria + " " + this.numeroLote;
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
        // Obtener nombre de especie por ID
        if (recibo.especieId) {
          this.especieService.obtener(recibo.especieId).subscribe({
            next: (especieDto: any) => {
              this.especie = especieDto.nombre || 'Sin Especie';
            },
            error: () => {
              this.especie = 'Sin Especie';
            }
          });
        } else {
          this.especie = 'Sin Especie';
        }
        // Obtener nombre de cultivar por ID
        if (recibo.cultivarId) {
          this.cultivoService.obtener(recibo.cultivarId).subscribe({
            next: (cultivarDto: any) => {
              this.cultivar = cultivarDto.nombre || 'Sin Cultivar';
            },
            error: () => {
              this.cultivar = 'Sin Cultivar';
            }
          });
        } else {
          this.cultivar = 'Sin Cultivar';
        }
        this.pesoKg = recibo.kgLimpios ?? 0;

        // Obtener loteId del recibo si no está en la ruta
        if (!this.loteId && recibo.loteId) {
          this.loteId = recibo.loteId;
        }

        // Cargar datos del lote para asignar automáticamente el número de lote y la categoría
        if (this.loteId) {
          this.cargarDatosLote(this.loteId);
        }

        // Determinar qué análisis deben realizarse (solo para mostrar en la leyenda)
        this.determinarAnalisisSolicitados();

        // Inicializar valores por defecto para análisis (ya no cargar desde análisis del lote)
        this.inicializarValoresPorDefectoPureza();
        this.inicializarValoresPorDefectoDOSN();
        this.inicializarValoresPorDefectoGerminacion();
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
        // Asignar automáticamente la categoría del lote al campo categoria
        if (lote.categoria) {
          this.categoria = lote.categoria;
        }
        console.log('Lote cargado y asignado automáticamente:', lote.nombre);
      },
      error: (err) => {
        console.error('Error cargando lote:', err);
      }
    });
  }

  determinarAnalisisSolicitados() {
    // Determinar qué análisis deben realizarse basado en analisisSolicitados del recibo
    if (!this.analisisSolicitados) {
      this.debeRealizarPureza = false;
      this.debeRealizarDOSN = false;
      this.debeRealizarGerminacion = false;
      return;
    }

    const analisis = this.analisisSolicitados.toLowerCase();
    this.debeRealizarPureza = analisis.includes('pureza');
    this.debeRealizarDOSN = analisis.includes('dosn') || analisis.includes('otras semillas');
    this.debeRealizarGerminacion = analisis.includes('germinacion') || analisis.includes('germinación');
  }


  inicializarValoresPorDefectoPureza() {
    // Marcar que no existe análisis de pureza
    this.tienePureza = false;
    this.purezaSemillaPura = null;
    this.purezaMateriaInerte = null;
    this.purezaOtrasSemillas = null;
    this.purezaOtrosCultivos = null;
    this.purezaMalezas = null;
    this.purezaMalezasToleradas = 'N';
    this.purezaPeso1000Semillas = 'N';
    this.purezaHumedad = 'N';
    this.purezaClaseMateriaInerte = '';
    this.purezaOtrasSemillasDescripcion = '';
  }

  inicializarValoresPorDefectoDOSN() {
    // Marcar que no existe análisis de DOSN
    this.tieneDOSN = false;
    this.dosnGramosAnalizados = null;
    this.dosnMalezasToleranciaCero = null;
    this.dosnMalezasTolerancia = null;
    this.dosnOtrosCultivos = null;
    this.dosnBrassicaSpp = null;
  }

  inicializarValoresPorDefectoGerminacion() {
    // Marcar que no existe análisis de germinación
    this.tieneGerminacion = false;
    this.germinacionNumeroDias = null;
    this.germinacionPlantulasNormales = null;
    this.germinacionPlantulasAnormales = null;
    this.germinacionSemillasDuras = null;
    this.germinacionSemillasFrescas = null;
    this.germinacionSemillasMuertas = null;
    this.germinacionSustrato = '';
    this.germinacionTemperatura = null;
    this.germinacionPreTratamiento = '';
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
    this.pesoKg = 0;
    this.numeroEnvases = null;
    this.fechaIngresoLaboratorio = fechaHoy;
    this.fechaFinalizacionAnalisis = fechaHoy;
    this.numeroMuestra = '';
    this.numeroCertificado = '';
    this.tipoCertificado = null;
    this.fechaEmision = fechaHoy;
    this.firmante = new Uint8Array(0);

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
                // Cargar datos del lote para asignar automáticamente el número de lote y la categoría
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
        this.especie = certificado.especie || 'Sin Especie';
        this.cultivar = certificado.cultivar || 'Sin Cultivar';
        // Si no hay categoría en el certificado, se cargará desde el lote en cargarDatosLote
        this.categoria = certificado.categoria || '';
        this.responsableMuestreo = certificado.responsableMuestreo || '';
        this.fechaMuestreo = this.formatearFechaParaInput(certificado.fechaMuestreo);
        // El numeroLote se asignará automáticamente desde el lote (se sobrescribirá con el nombre actual del lote)
        // El peso se extrae del recibo, no del certificado
        this.numeroEnvases = certificado.numeroEnvases ?? null;
        this.fechaIngresoLaboratorio = this.formatearFechaParaInput(certificado.fechaIngresoLaboratorio);
        this.fechaFinalizacionAnalisis = this.formatearFechaParaInput(certificado.fechaFinalizacionAnalisis);
        this.numeroMuestra = certificado.numeroMuestra || '';
        this.numeroCertificado = certificado.numeroCertificado || '';
        this.tipoCertificado = certificado.tipoCertificado ?? null;
        this.fechaEmision = this.formatearFechaParaInput(certificado.fechaEmision);
        // Adaptación: si el backend retorna una cadena base64, mostrarla como imagen
        if (typeof certificado.firmante === 'string' && (certificado.firmante as string).length > 0) {
          const firmanteStr = certificado.firmante as string;
          if (firmanteStr.startsWith('data:image')) {
            this.firmantePreviewUrl = firmanteStr;
          } else {
            this.firmantePreviewUrl = 'data:image/png;base64,' + firmanteStr;
          }
          let base64Data = firmanteStr;
          if (base64Data.startsWith('data:image')) {
            base64Data = base64Data.split(',')[1];
          }
          this.firmante = this.base64ToUint8Array(base64Data);
          this.firmantePreviewName = 'Firma cargada';
        } else if (Array.isArray(certificado.firmante) && (certificado.firmante as Array<any>).length > 0) {
          this.firmante = new Uint8Array(certificado.firmante as Array<number>);
          this.firmantePreviewUrl = this.uint8ArrayToBase64Image(this.firmante);
          this.firmantePreviewName = 'Firma cargada';
        } else {
          this.firmante = new Uint8Array(0);
          this.firmantePreviewUrl = null;
          this.firmantePreviewName = '';
        }
        // Siempre mostrar los botones al cargar
        this.viewSeleccionarImagenFirma = true;
  

        // Solo usar reciboId del certificado si no hay uno en la ruta
        if (!this.reciboId && certificado.reciboId) {
          this.reciboId = certificado.reciboId;
        }

        // Cargar datos del recibo para extraer el peso y determinar análisis solicitados
        if (this.reciboId) {
          this.reciboService.obtenerRecibo(this.reciboId).subscribe({
            next: (recibo: ReciboDto) => {
              this.recibo = recibo;
              // Extraer el peso del recibo
              this.pesoKg = recibo.kgLimpios ?? 0;
              // Determinar qué análisis deben realizarse (solo para mostrar en la leyenda)
              this.determinarAnalisisSolicitados();
              // Ya no cargar análisis disponibles - los datos vienen del certificado guardado
            },
            error: (err) => {
              console.error('Error cargando recibo para extraer peso:', err);
              // Ya no cargar análisis disponibles
            }
          });
        } else {
          // Ya no cargar análisis disponibles
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
        // Determinar si existe análisis de pureza
        this.tienePureza = this.purezaSemillaPura != null || this.purezaMateriaInerte != null || this.purezaOtrasSemillas != null || this.purezaOtrosCultivos != null || this.purezaMalezas != null;

        // Cargar resultados de análisis - DOSN
        this.dosnGramosAnalizados = certificado.dosnGramosAnalizados ?? null;
        this.dosnMalezasToleranciaCero = certificado.dosnMalezasToleranciaCero ?? null;
        this.dosnMalezasTolerancia = certificado.dosnMalezasTolerancia ?? null;
        this.dosnOtrosCultivos = certificado.dosnOtrosCultivos ?? null;
        // Asignar correctamente dosnBrassicaSpp, permitiendo 0 y valores positivos, y forzando a number
        if (certificado.dosnBrassicaSpp !== undefined && certificado.dosnBrassicaSpp !== null && certificado.dosnBrassicaSpp !== '') {
          const val = Number(certificado.dosnBrassicaSpp);
          this.dosnBrassicaSpp = isNaN(val) ? null : val;
        } else {
          this.dosnBrassicaSpp = null;
        }

        // Asignar correctamente brassicaContiene, permitiendo true/false del backend
        this.brassicaContiene = (typeof certificado.brassicaContiene === 'boolean') ? certificado.brassicaContiene : false;

        this.otrasDeterminaciones = certificado.otrasDeterminaciones || '';
        this.nombreFirmante = certificado.nombreFirmante || '';
        this.funcionFirmante = certificado.funcionFirmante || '';

        // Determinar si existe análisis de DOSN
        this.tieneDOSN = this.dosnGramosAnalizados != null;

        // Cargar resultados de análisis - Germinación
        this.germinacionNumeroDias = certificado.germinacionNumeroDias ?? null;
        this.germinacionPlantulasNormales = certificado.germinacionPlantulasNormales ?? null;
        this.germinacionPlantulasAnormales = certificado.germinacionPlantulasAnormales ?? null;
        this.germinacionSemillasDuras = certificado.germinacionSemillasDuras ?? null;
        this.germinacionSemillasFrescas = certificado.germinacionSemillasFrescas ?? null;
        this.germinacionSemillasMuertas = certificado.germinacionSemillasMuertas ?? null;
        this.germinacionSustrato = certificado.germinacionSustrato || '';
        this.germinacionTemperatura = certificado.germinacionTemperatura ?? null;
        this.germinacionPreTratamiento = certificado.germinacionPreTratamiento || '';
        // Determinar si existe análisis de germinación
        this.tieneGerminacion = this.germinacionNumeroDias != null || this.germinacionPlantulasNormales != null || this.germinacionPlantulasAnormales != null;

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

  /**
   * Normaliza un string, convirtiendo valores vacíos o undefined a null
   */
  private normalizarString(valor: string | null | undefined): string | null {
    if (valor === null || valor === undefined || valor === '') {
      return null;
    }
    const trimmed = valor.trim();
    return trimmed === '' ? null : trimmed;
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
      alert(this.errores.join('\n'));
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
      nombreSolicitante: this.normalizarString(this.nombreSolicitante),
      especie: this.normalizarString(this.especie),
      cultivar: this.normalizarString(this.cultivar),
      categoria: this.normalizarString(this.categoria),
      responsableMuestreo: this.normalizarString(this.responsableMuestreo),
      fechaMuestreo: this.fechaMuestreo ? DateService.ajustarFecha(this.fechaMuestreo) : null,
      numeroLote: this.normalizarString(this.numeroLote),
      numeroEnvases: this.numeroEnvases ?? null,
      fechaIngresoLaboratorio: this.fechaIngresoLaboratorio ? DateService.ajustarFecha(this.fechaIngresoLaboratorio) : null,
      fechaFinalizacionAnalisis: this.fechaFinalizacionAnalisis ? DateService.ajustarFecha(this.fechaFinalizacionAnalisis) : null,
      numeroMuestra: this.normalizarString(this.numeroMuestra),
      numeroCertificado: this.normalizarString(this.numeroCertificado),
      tipoCertificado: this.tipoCertificado ?? null,
      fechaEmision: this.fechaEmision ? DateService.ajustarFecha(this.fechaEmision) : null,
      firmante: this.firmante,
      fechaFirma: null,
      reciboId: this.reciboId ?? null,
      activo: true,
      brassicaContiene: this.brassicaContiene ?? false,
      // Resultados de análisis - Pureza
      purezaSemillaPura: this.purezaSemillaPura ?? null,
      purezaMateriaInerte: this.purezaMateriaInerte ?? null,
      purezaOtrasSemillas: this.purezaOtrasSemillas ?? null,
      purezaOtrosCultivos: this.purezaOtrosCultivos ?? null,
      purezaMalezas: this.purezaMalezas ?? null,
      purezaMalezasToleradas: this.normalizarString(this.purezaMalezasToleradas),
      purezaPeso1000Semillas: this.normalizarString(this.purezaPeso1000Semillas),
      purezaHumedad: this.normalizarString(this.purezaHumedad),
      purezaClaseMateriaInerte: this.normalizarString(this.purezaClaseMateriaInerte),
      purezaOtrasSemillasDescripcion: this.normalizarString(this.purezaOtrasSemillasDescripcion),
      // Resultados de análisis - DOSN
      dosnGramosAnalizados: this.dosnGramosAnalizados ?? null,
      dosnMalezasToleranciaCero: this.dosnMalezasToleranciaCero ?? null,
      dosnMalezasTolerancia: this.dosnMalezasTolerancia ?? null,
      dosnOtrosCultivos: this.dosnOtrosCultivos ?? null,
      dosnBrassicaSpp: this.dosnBrassicaSpp != null && this.dosnBrassicaSpp !== undefined ? String(this.dosnBrassicaSpp) : null,
      otrasDeterminaciones: this.normalizarString(this.otrasDeterminaciones),
      nombreFirmante: this.normalizarString(this.nombreFirmante),
      funcionFirmante: this.normalizarString(this.funcionFirmante),
      // Resultados de análisis - Germinación
      germinacionNumeroDias: this.germinacionNumeroDias ?? null,
      germinacionPlantulasNormales: this.germinacionPlantulasNormales ?? null,
      germinacionPlantulasAnormales: this.germinacionPlantulasAnormales ?? null,
      germinacionSemillasDuras: this.germinacionSemillasDuras ?? null,
      germinacionSemillasFrescas: this.germinacionSemillasFrescas ?? null,
      germinacionSemillasMuertas: this.germinacionSemillasMuertas ?? null,
      germinacionSustrato: this.normalizarString(this.germinacionSustrato),
      germinacionTemperatura: this.germinacionTemperatura ?? null,
      germinacionPreTratamiento: this.normalizarString(this.germinacionPreTratamiento)
    };

    console.log('Payload crear certificado:', payload);
    // Solución: enviar null si la firma está vacía, si no enviar como array de números
    payload.firmante = (this.firmante && this.firmante.length > 0) ? Array.from(this.firmante) : [];
    this.certificadoService.crearCertificado(payload).subscribe({
      next: (certificadoCreado: CertificadoDto) => {
        console.log('Certificado creado:', certificadoCreado);
        alert('Certificado creado exitosamente.');
        // Navegar según si hay loteId y reciboId
        if (this.loteId != null && this.reciboId != null) {
          this.router.navigate([`/${this.loteId}/${this.reciboId}/lote-analisis`]);
        } else {
          this.router.navigate(['/listado-lotes']);
        }
      },
      error: (err) => {
        console.error('Error creando certificado:', err);
        const errorMessage = err.error?.message || err.error || err.message || 'Error desconocido';
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
              },
              error: (listErr) => {
                console.error('Error listando certificados:', listErr);
              }
            });
          }
        } else {
          alert('Error al crear el certificado: ' + errorMessage);
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
      nombreSolicitante: this.normalizarString(this.nombreSolicitante),
      especie: this.normalizarString(this.especie),
      cultivar: this.normalizarString(this.cultivar),
      categoria: this.normalizarString(this.categoria),
      responsableMuestreo: this.normalizarString(this.responsableMuestreo),
      fechaMuestreo: this.fechaMuestreo ? DateService.ajustarFecha(this.fechaMuestreo) : null,
      numeroLote: this.normalizarString(this.numeroLote),
      numeroEnvases: this.numeroEnvases ?? null,
      fechaIngresoLaboratorio: this.fechaIngresoLaboratorio ? DateService.ajustarFecha(this.fechaIngresoLaboratorio) : null,
      fechaFinalizacionAnalisis: this.fechaFinalizacionAnalisis ? DateService.ajustarFecha(this.fechaFinalizacionAnalisis) : null,
      numeroMuestra: this.normalizarString(this.numeroMuestra),
      numeroCertificado: this.normalizarString(this.numeroCertificado),
      tipoCertificado: this.tipoCertificado ?? null,
      fechaEmision: this.fechaEmision ? DateService.ajustarFecha(this.fechaEmision) : null,
      firmante: this.firmante,
      fechaFirma: null,
      reciboId: this.reciboId ?? null,
      activo: true,
      brassicaContiene: this.brassicaContiene ?? false,
      // Resultados de análisis - Pureza
      purezaSemillaPura: this.purezaSemillaPura ?? null,
      purezaMateriaInerte: this.purezaMateriaInerte ?? null,
      purezaOtrasSemillas: this.purezaOtrasSemillas ?? null,
      purezaOtrosCultivos: this.purezaOtrosCultivos ?? null,
      purezaMalezas: this.purezaMalezas ?? null,
      purezaMalezasToleradas: this.normalizarString(this.purezaMalezasToleradas),
      purezaPeso1000Semillas: this.normalizarString(this.purezaPeso1000Semillas),
      purezaHumedad: this.normalizarString(this.purezaHumedad),
      purezaClaseMateriaInerte: this.normalizarString(this.purezaClaseMateriaInerte),
      purezaOtrasSemillasDescripcion: this.normalizarString(this.purezaOtrasSemillasDescripcion),
      // Resultados de análisis - DOSN
      dosnGramosAnalizados: this.dosnGramosAnalizados ?? null,
      dosnMalezasToleranciaCero: this.dosnMalezasToleranciaCero ?? null,
      dosnMalezasTolerancia: this.dosnMalezasTolerancia ?? null,
      dosnOtrosCultivos: this.dosnOtrosCultivos ?? null,
      dosnBrassicaSpp: this.dosnBrassicaSpp != null && this.dosnBrassicaSpp !== undefined ? String(this.dosnBrassicaSpp) : null,
      otrasDeterminaciones: this.normalizarString(this.otrasDeterminaciones),
      nombreFirmante: this.normalizarString(this.nombreFirmante),
      funcionFirmante: this.normalizarString(this.funcionFirmante),
      // Resultados de análisis - Germinación
      germinacionNumeroDias: this.germinacionNumeroDias ?? null,
      germinacionPlantulasNormales: this.germinacionPlantulasNormales ?? null,
      germinacionPlantulasAnormales: this.germinacionPlantulasAnormales ?? null,
      germinacionSemillasDuras: this.germinacionSemillasDuras ?? null,
      germinacionSemillasFrescas: this.germinacionSemillasFrescas ?? null,
      germinacionSemillasMuertas: this.germinacionSemillasMuertas ?? null,
      germinacionSustrato: this.normalizarString(this.germinacionSustrato),
      germinacionTemperatura: this.germinacionTemperatura ?? null,
      germinacionPreTratamiento: this.normalizarString(this.germinacionPreTratamiento)
    };

    console.log('Payload editar certificado:', payload);
    // Solución: enviar null si la firma está vacía, si no enviar como array de números
    payload.firmante = (this.firmante && this.firmante.length > 0) ? Array.from(this.firmante) : [];
    this.certificadoService.editarCertificado(payload).subscribe({
      next: (mensaje: string) => {
        console.log('Certificado actualizado:', mensaje);
        alert('Certificado actualizado exitosamente.');

      },
      error: (err) => {
        console.error('Error actualizando certificado:', err);
        const errorMessage = err.error?.message || err.error || err.message || 'Error desconocido';
        alert('Error al actualizar el certificado: ' + errorMessage);
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

  /**
   * Exporta el certificado a PDF como documento real (no screenshot)
   */
  exportarAPDF(): void {
    if (!this.certificadoId || this.certificadoId === 0) {
      alert('No hay certificado para exportar. Por favor, guarde el certificado primero.');
      return;
    }

    this.isExportingPDF = true;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 18; // Márgenes más profesionales
      const contentWidth = pageWidth - (2 * margin);
      let yPosition = margin;
      
      // Colores oficiales INASE
      const colorAzul: [number, number, number] = [0, 102, 204];
      const colorDoradoClaro: [number, number, number] = [212, 165, 116];
      const colorDoradoOscuro: [number, number, number] = [184, 134, 11];

      // Función helper para formatear números con comas (formato uruguayo/español)
      const formatearNumero = (valor: number | null | undefined): string => {
        if (valor === null || valor === undefined) return 'N';
        return valor.toString().replace('.', ',');
      };

      // Función helper para agregar texto con tipografía mejorada
      const addText = (text: string, x: number, y: number, fontSize: number = 10, isBold: boolean = false, align: 'left' | 'center' | 'right' = 'left', maxWidth?: number, useSerif: boolean = false) => {
        pdf.setFontSize(fontSize);
        // Usar serif (times) para títulos importantes, helvetica para texto normal
        if (useSerif) {
          pdf.setFont('times', isBold ? 'bold' : 'normal');
        } else {
          pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        }
        const lines = maxWidth ? pdf.splitTextToSize(text, maxWidth) : [text];
        pdf.text(lines, x, y, { align });
        return lines.length * (fontSize * 0.4); // Mejor altura de línea
      };

      // Función helper para agregar texto subrayado (para nombres científicos)
      const addTextSubrayado = (text: string, x: number, y: number, fontSize: number = 10, align: 'left' | 'center' | 'right' = 'left') => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(text, contentWidth);
        pdf.text(lines, x, y, { align });
        // Agregar línea de subrayado
        const textWidth = pdf.getTextWidth(text);
        const lineY = y + 1;
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.1);
        if (align === 'center') {
          pdf.line(x - textWidth / 2, lineY, x + textWidth / 2, lineY);
        } else if (align === 'right') {
          pdf.line(x - textWidth, lineY, x, lineY);
        } else {
          pdf.line(x, lineY, x + textWidth, lineY);
        }
        return lines.length * (fontSize * 0.4);
      };

      // Función helper para agregar nueva página si es necesario
      const checkNewPage = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // HEADER PROFESIONAL
      // Línea azul superior (más gruesa)
      pdf.setDrawColor(colorAzul[0], colorAzul[1], colorAzul[2]);
      pdf.setLineWidth(1.0);
      pdf.line(0, yPosition, pageWidth, yPosition);
      yPosition += 4;
      
      // Logos con gradientes mejorados
      // Logo izquierdo (más grande) con gradiente
      const logoLeftX = 25;
      const logoLeftY = yPosition + 10;
      const logoLeftRadius = 9;
      
      // Crear gradiente con múltiples círculos
      for (let i = 0; i < 5; i++) {
        const alpha = 1 - (i * 0.15);
        const r = colorDoradoClaro[0] + (colorDoradoOscuro[0] - colorDoradoClaro[0]) * (i / 4);
        const g = colorDoradoClaro[1] + (colorDoradoOscuro[1] - colorDoradoClaro[1]) * (i / 4);
        const b = colorDoradoClaro[2] + (colorDoradoOscuro[2] - colorDoradoClaro[2]) * (i / 4);
        pdf.setFillColor(r, g, b);
        pdf.circle(logoLeftX, logoLeftY, logoLeftRadius - (i * 0.5), 'F');
      }
      
      // Texto "INASE" en el logo izquierdo
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INASE', logoLeftX, logoLeftY + 2.5, { align: 'center' });
      
      // Logo derecho (más pequeño) con gradiente
      const logoRightX = pageWidth - 25;
      const logoRightY = yPosition + 10;
      const logoRightRadius = 7;
      
      // Crear gradiente con múltiples círculos
      for (let i = 0; i < 5; i++) {
        const alpha = 1 - (i * 0.15);
        const r = colorDoradoClaro[0] + (colorDoradoOscuro[0] - colorDoradoClaro[0]) * (i / 4);
        const g = colorDoradoClaro[1] + (colorDoradoOscuro[1] - colorDoradoClaro[1]) * (i / 4);
        const b = colorDoradoClaro[2] + (colorDoradoOscuro[2] - colorDoradoClaro[2]) * (i / 4);
        pdf.setFillColor(r, g, b);
        pdf.circle(logoRightX, logoRightY, logoRightRadius - (i * 0.4), 'F');
      }
      
      // Texto "INASE" y "URUGUAY" en el logo derecho
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(5.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INASE', logoRightX, logoRightY - 1.8, { align: 'center' });
      pdf.setFontSize(4.5);
      pdf.text('URUGUAY', logoRightX, logoRightY + 2.2, { align: 'center' });
      
      // Línea azul debajo del logo derecho (subrayado)
      pdf.setDrawColor(colorAzul[0], colorAzul[1], colorAzul[2]);
      pdf.setLineWidth(0.8);
      const lineStartX = logoRightX - 9;
      const lineEndX = logoRightX + 9;
      const lineY = logoRightY + logoRightRadius + 2.5;
      pdf.line(lineStartX, lineY, lineEndX, lineY);
      
      // Restaurar color de texto a negro
      pdf.setTextColor(0, 0, 0);
      
      // Texto centralizado con tipografía serif para títulos
      addText('INSTITUTO NACIONAL DE SEMILLAS', pageWidth / 2, yPosition + 8, 12, true, 'center', undefined, true);
      addText('CERTIFICADO DE ANÁLISIS NACIONAL', pageWidth / 2, yPosition + 15, 14, true, 'center', undefined, true);
      addText('laboratorio@inase.uy | www.inase.uy', pageWidth / 2, yPosition + 21, 8.5, false, 'center');
      
      // Línea negra inferior del header (más gruesa)
      yPosition += 32;
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.8);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 12;

      // INFORMACIÓN DEL SOLICITANTE
      checkNewPage(25);
      addText('INFORMACIÓN DEL SOLICITANTE', margin, yPosition, 12, true, 'left', undefined, true);
      yPosition += 10;
      
      const solicitanteData = [
        ['Nombre:', this.nombreSolicitante || ''],
        ['Especie:', this.especie || ''],
        ['Cultivar:', this.cultivar || ''],
        ['Categoría:', this.categoria || '']
      ];
      
      solicitanteData.forEach(([label, value]) => {
        checkNewPage(8);
        addText(label, margin, yPosition, 9.5, true);
        // Si es especie, usar subrayado para nombre científico
        if (label === 'Especie:' && value) {
          addTextSubrayado(value, margin + 50, yPosition, 9.5);
        } else {
          addText(value, margin + 50, yPosition, 9.5, false);
        }
        yPosition += 7;
      });
      
      yPosition += 6;
      pdf.setDrawColor(colorAzul[0], colorAzul[1], colorAzul[2]);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 12;

      // INFORMACIÓN GENERAL
      checkNewPage(25);
      addText('INFORMACIÓN GENERAL', margin, yPosition, 12, true, 'left', undefined, true);
      yPosition += 10;
      
      const generalData = [
        ['Responsable del muestreo:', this.responsableMuestreo || ''],
        ['Número de lote:', this.getNumeroLote() || ''],
        ['Categoría:', this.categoria || ''],
        ['Fecha muestreo:', this.fechaMuestreo ? this.formatearFecha(this.fechaMuestreo) : ''],
        ['Peso (kg):', this.pesoKg?.toString() || ''],
        ['N° de envases:', this.numeroEnvases?.toString() || ''],
        ['Ingreso Laboratorio:', this.fechaIngresoLaboratorio ? this.formatearFecha(this.fechaIngresoLaboratorio) : ''],
        ['Finalización análisis:', this.fechaFinalizacionAnalisis ? this.formatearFecha(this.fechaFinalizacionAnalisis) : ''],
        ['N° de muestra:', this.numeroMuestra || ''],
        ['Certificado:', this.tipoCertificado || '']
      ];
      
      generalData.forEach(([label, value]) => {
        checkNewPage(8);
        const labelWidth = 65;
        addText(label, margin, yPosition, 9.5, true, 'left', labelWidth);
        addText(value, margin + labelWidth + 5, yPosition, 9.5, false);
        yPosition += 7;
      });
      
      yPosition += 6;
      pdf.setDrawColor(colorAzul[0], colorAzul[1], colorAzul[2]);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 12;

      // RESULTADOS DE ANÁLISIS
      checkNewPage(25);
      addText('RESULTADOS DE ANÁLISIS', margin, yPosition, 12, true, 'left', undefined, true);
      yPosition += 10;
      
      // Nombre científico con subrayado
      if (this.especie) {
        addText('Especie (nombre científico): ', margin, yPosition, 9.5, false);
        const textWidth = pdf.getTextWidth('Especie (nombre científico): ');
        addTextSubrayado(this.especie, margin + textWidth, yPosition, 9.5);
      } else {
        addText(`Especie (nombre científico): ${this.especie || ''}`, margin, yPosition, 9.5, false);
      }
      yPosition += 10;

      // Tabla de Pureza
      if (this.tienePureza) {
        checkNewPage(35);
        addText('Pureza (% en peso)', margin, yPosition, 11, true, 'left', undefined, true);
        yPosition += 8;
        
        const purezaHeaders = [
          'Semilla pura',
          'Materia inerte',
          'Otras semillas',
          'Otros cultivos',
          'Malezas',
          'Malezas toleradas',
          'Peso 1000 semillas (g)',
          'Humedad (%)'
        ];
        
        const purezaData = [[
          formatearNumero(this.purezaSemillaPura),
          formatearNumero(this.purezaMateriaInerte),
          formatearNumero(this.purezaOtrasSemillas),
          formatearNumero(this.purezaOtrosCultivos),
          formatearNumero(this.purezaMalezas),
          this.purezaMalezasToleradas || 'N',
          this.purezaPeso1000Semillas || 'N',
          this.purezaHumedad || 'N'
        ]];
      
        // Usar autoTable para las tablas con diseño profesional mejorado
        autoTable(pdf, {
          head: [purezaHeaders],
          body: purezaData,
          startY: yPosition,
          margin: { left: margin, right: margin },
          styles: { 
            fontSize: 8.5, 
            cellPadding: 4,
            halign: 'center',
            valign: 'middle',
            lineColor: [0, 0, 0],
            lineWidth: 0.15,
            font: 'helvetica',
            fontStyle: 'normal'
          },
          headStyles: { 
            fillColor: colorAzul, 
            textColor: [255, 255, 255], 
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle',
            lineColor: [255, 255, 255],
            lineWidth: 0.1,
            fontSize: 8.5
          },
          bodyStyles: {
            halign: 'center',
            valign: 'middle',
            lineColor: [0, 0, 0],
            lineWidth: 0.1
          },
          columnStyles: {
            0: { cellWidth: 22 },
            1: { cellWidth: 22 },
            2: { cellWidth: 22 },
            3: { cellWidth: 22 },
            4: { cellWidth: 18 },
            5: { cellWidth: 22 },
            6: { cellWidth: 28 },
            7: { cellWidth: 18 }
          },
          theme: 'grid',
          tableWidth: 'auto',
          alternateRowStyles: {
            fillColor: [250, 250, 250]
          }
        });
        
        yPosition = (pdf as any).lastAutoTable.finalY + 8;
        
        if (this.purezaClaseMateriaInerte && this.purezaClaseMateriaInerte.trim() !== '') {
          checkNewPage(8);
          addText(`Clase de materia inerte: ${this.purezaClaseMateriaInerte}`, margin, yPosition, 9.5, false);
          yPosition += 7;
        }
        
        if (this.purezaOtrasSemillasDescripcion && this.purezaOtrasSemillasDescripcion.trim() !== '') {
          checkNewPage(8);
          addText(`Otras semillas: ${this.purezaOtrasSemillasDescripcion}`, margin, yPosition, 9.5, false);
          yPosition += 7;
        } else {
          checkNewPage(8);
          addText('Otras semillas: No contiene.', margin, yPosition, 9.5, false);
          yPosition += 7;
        }
      }

      // DOSN
      if (this.tieneDOSN) {
        checkNewPage(28);
        addText(`Determinación de otras semillas en número en ${this.dosnGramosAnalizados || ''} g (análisis limitado)`, margin, yPosition, 10, true, 'left', undefined, true);
        yPosition += 10;
        
        const dosnData = [
          ['N° de semillas de malezas con tolerancia cero:', this.dosnMalezasToleranciaCero?.toString() || '0'],
          ['N° de semillas de malezas con tolerancia:', this.dosnMalezasTolerancia?.toString() || '0'],
          ['N° de semillas de otros cultivos:', this.dosnOtrosCultivos?.toString() || '0']
        ];
        
        dosnData.forEach(([label, value]) => {
          checkNewPage(8);
          addText(label, margin, yPosition, 9.5, true, 'left', 85);
          addText(value, margin + 90, yPosition, 9.5, false);
          yPosition += 7;
        });

        // Determinación de Brassica spp. (separada)
        checkNewPage(8);
        let brassicaText = 'No contiene.';
        if (this.brassicaContiene) {
          brassicaText = 'Contiene.';
        } else if (this.dosnBrassicaSpp != null) {
          brassicaText = this.dosnBrassicaSpp.toString();
        }
        addText(`Determinación de Brassica spp. en ${this.dosnGramosAnalizados || ''} g: ${brassicaText}`, margin, yPosition, 9.5, false);
        yPosition += 10;
      }

      // Tabla de Germinación
      if (this.tieneGerminacion) {
        checkNewPage(35);
        addText('Germinación (% en número)', margin, yPosition, 11, true, 'left', undefined, true);
        yPosition += 8;
        
        const germinacionHeaders = [
          'N° de días',
          'Plántulas normales',
          'Plántulas anormales',
          'Semillas duras',
          'Semillas frescas',
          'Semillas muertas',
          'Sustrato',
          'T (°C)',
          'Pre-tratamiento'
        ];
        
        const germinacionData = [[
          this.germinacionNumeroDias?.toString() || 'N',
          formatearNumero(this.germinacionPlantulasNormales),
          formatearNumero(this.germinacionPlantulasAnormales),
          formatearNumero(this.germinacionSemillasDuras),
          formatearNumero(this.germinacionSemillasFrescas),
          formatearNumero(this.germinacionSemillasMuertas),
          this.germinacionSustrato || 'N',
          this.germinacionTemperatura?.toString() || 'N',
          this.germinacionPreTratamiento || 'N'
        ]];
        
        autoTable(pdf, {
          head: [germinacionHeaders],
          body: germinacionData,
          startY: yPosition,
          margin: { left: margin, right: margin },
          styles: { 
            fontSize: 8.5, 
            cellPadding: 4,
            halign: 'center',
            valign: 'middle',
            lineColor: [0, 0, 0],
            lineWidth: 0.15,
            font: 'helvetica',
            fontStyle: 'normal'
          },
          headStyles: { 
            fillColor: colorAzul, 
            textColor: [255, 255, 255], 
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle',
            lineColor: [255, 255, 255],
            lineWidth: 0.1,
            fontSize: 8.5
          },
          bodyStyles: {
            halign: 'center',
            valign: 'middle',
            lineColor: [0, 0, 0],
            lineWidth: 0.1
          },
          theme: 'grid',
          tableWidth: 'auto',
          alternateRowStyles: {
            fillColor: [250, 250, 250]
          }
        });
        
        yPosition = (pdf as any).lastAutoTable.finalY + 8;
      }

      // Otras determinaciones
      if (this.otrasDeterminaciones && this.otrasDeterminaciones.trim() !== '') {
        checkNewPage(8);
        addText(`Otras determinaciones: ${this.otrasDeterminaciones}`, margin, yPosition, 9.5, false);
        yPosition += 10;
      } else {
        checkNewPage(8);
        addText('Otras determinaciones: -', margin, yPosition, 9.5, false);
        yPosition += 10;
      }

      // FOOTER PROFESIONAL
      checkNewPage(35);
      pdf.setDrawColor(colorAzul[0], colorAzul[1], colorAzul[2]);
      pdf.setLineWidth(0.8);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 12;
      
      // Fecha de emisión con mejor formato
      const fechaEmisionTexto = this.fechaEmision ? this.formatearFecha(this.fechaEmision) : '';
      if (fechaEmisionTexto) {
        addText(fechaEmisionTexto, margin, yPosition, 11, true);
        addText('Fecha de emisión', margin, yPosition + 7, 9.5, false);
      }
      
      // Texto centralizado con tipografía serif
      addText('ESTE CERTIFICADO AMPARA A UN LOTE DE SEMILLAS', pageWidth / 2, yPosition + 18, 11, true, 'center', undefined, true);
      
      addText('LOS RESULTADOS remitidos refieren a la muestra recibida por el laboratorio.', pageWidth / 2, yPosition + 26, 9.5, true, 'center');
      addText('Este informe no debe ser reproducido parcialmente sin la autorización del laboratorio.', pageWidth / 2, yPosition + 33, 9.5, true, 'center');
      
      // Función para guardar PDF
      const guardarPDF = () => {
      const fileName = `Certificado_${this.numeroCertificado || 'N' + this.certificadoId}_${new Date().getTime()}.pdf`;
        pdf.save(fileName);
      this.isExportingPDF = false;
      };
      
      // Función para agregar numeración de páginas
      const agregarNumeracionPaginas = () => {
        const totalPages = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(100, 100, 100);
          pdf.text(
            `${i}`,
            pageWidth / 2,
            pageHeight - 8,
            { align: 'center' }
          );
          pdf.setTextColor(0, 0, 0);
        }
      };
      
      // Firma digital (si existe)
      if (this.firmantePreviewUrl) {
        yPosition += 45;
        checkNewPage(35);
        
        // Agregar imagen de firma
        const img = new Image();
        const firmaUrl = this.firmantePreviewUrl;
        img.src = firmaUrl;
        img.onload = () => {
          const imgWidth = 55;
          const imgHeight = (img.height * imgWidth) / img.width;
          const firmaX = pageWidth - margin - imgWidth;
          const firmaY = yPosition;
          
          pdf.addImage(firmaUrl, 'PNG', firmaX, firmaY, imgWidth, imgHeight);
          
          // Calcular posición final de la firma (imagen + nombre + función)
          let firmaFinalY = firmaY + imgHeight;
          
          if (this.nombreFirmante) {
            addText(this.nombreFirmante, pageWidth - margin - imgWidth / 2, firmaY + imgHeight + 6, 10, true, 'center');
            firmaFinalY += 7;
          }
          if (this.funcionFirmante) {
            addText(this.funcionFirmante, pageWidth - margin - imgWidth / 2, firmaY + imgHeight + 13, 9, false, 'center');
            firmaFinalY += 7;
          }
          
          // Agregar información de firma digital si está disponible
          if (this.fechaEmision) {
            const fechaFirma = new Date().toISOString().replace('T', ' ').substring(0, 19);
            addText(`Firmado digitalmente el ${fechaFirma}`, pageWidth - margin - imgWidth / 2, firmaFinalY + 3, 7, false, 'center');
            firmaFinalY += 5;
          }
          
          // Agregar leyenda justo debajo de la firma
          yPosition = firmaFinalY + 12;
          checkNewPage(12);
          addText('N=no analizado TR=<0,05%', pageWidth / 2, yPosition, 8.5, false, 'center');
          
          // Agregar numeración de páginas
          agregarNumeracionPaginas();
          
          // Guardar PDF
          guardarPDF();
        };
        img.onerror = () => {
          // Si falla la imagen, agregar leyenda y guardar sin ella
          yPosition += 25;
          checkNewPage(12);
          addText('N=no analizado TR=<0,05%', pageWidth / 2, yPosition, 8.5, false, 'center');
          agregarNumeracionPaginas();
          guardarPDF();
        };
      } else {
        // Sin firma, agregar leyenda al final y guardar
        yPosition += 25;
        checkNewPage(12);
        addText('N=no analizado TR=<0,05%', pageWidth / 2, yPosition, 8.5, false, 'center');
        agregarNumeracionPaginas();
        guardarPDF();
      }
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
      this.isExportingPDF = false;
    }
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


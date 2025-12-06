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
import html2canvas from 'html2canvas';

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
  dosnBrassicaSpp: number = 0;

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
        this.analisisSolicitados = recibo.analisisSolicitados;
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

        // Determinar qué análisis deben realizarse
        this.determinarAnalisisSolicitados();

        // Extraer análisis estándar y el último creado
        this.cargarAnalisisDisponibles();
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

  cargarAnalisisDisponibles() {
    if (!this.reciboId) return;

    // Cargar análisis de pureza - solo si está solicitado y solo estándar y el último creado
    if (this.debeRealizarPureza) {
      this.purezaService.listarPorRecibo(this.reciboId).subscribe({
      next: (response) => {
        if (response.purezas && response.purezas.length > 0) {
          // Filtrar solo análisis estándar
          const purezasEstandar = response.purezas.filter(p => p.estandar === true);
          if (purezasEstandar.length > 0) {
            // Ordenar por fechaCreacion descendente y tomar el último creado
            const purezasOrdenadas = purezasEstandar.sort((a, b) => {
              const fechaA = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0;
              const fechaB = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0;
              return fechaB - fechaA; // Orden descendente
            });
            const pureza = purezasOrdenadas[0];
          } else {
            this.inicializarValoresPorDefectoPureza();
          }
        } else {
          this.inicializarValoresPorDefectoPureza();
        }
      },
      error: (err) => {
        console.error('Error cargando pureza:', err);
        this.inicializarValoresPorDefectoPureza();
      }
    });
    } else {
      // Si no está solicitado, no cargar datos pero marcar como no realizado
      this.inicializarValoresPorDefectoPureza();
    }

    // Cargar análisis de DOSN - solo si está solicitado y solo estándar y el último creado
    if (this.debeRealizarDOSN) {
      this.dosnService.listarPorRecibo(this.reciboId).subscribe({
        next: (response) => {
          if (response.DOSN && response.DOSN.length > 0) {
            // Filtrar solo análisis estándar
            const dosnEstandar = response.DOSN.filter(d => d.estandar === true);
            if (dosnEstandar.length > 0) {
              // Ordenar por fechaCreacion descendente y tomar el último creado
              const dosnOrdenados = dosnEstandar.sort((a, b) => {
                const fechaA = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0;
                const fechaB = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0;
                return fechaB - fechaA; // Orden descendente
              });
              const dosn = dosnOrdenados[0];
            } else {
              this.inicializarValoresPorDefectoDOSN();
            }
          } else {
            this.inicializarValoresPorDefectoDOSN();
          }
        },
        error: (err) => {
          console.error('Error cargando DOSN:', err);
          this.inicializarValoresPorDefectoDOSN();
        }
      });
    } else {
      // Si no está solicitado, no cargar datos pero marcar como no realizado
      this.inicializarValoresPorDefectoDOSN();
    }

    // Cargar análisis de germinación - solo si está solicitado y el último creado (verificar si tiene campo estandar)
    if (this.debeRealizarGerminacion) {
      this.germinacionService.listarPorRecibo(this.reciboId).subscribe({
        next: (response) => {
          if (response.germinacion && response.germinacion.length > 0) {
            // Filtrar solo análisis estándar si existe el campo
            const germinacionesEstandar = response.germinacion.filter(g => g.estandar === true);
            const germinacionesParaUsar = germinacionesEstandar.length > 0 ? germinacionesEstandar : response.germinacion;

            // Ordenar por fechaCreacion descendente y tomar el último creado
            const germinacionOrdenadas = germinacionesParaUsar.sort((a, b) => {
              const fechaA = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0;
              const fechaB = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0;
              return fechaB - fechaA; // Orden descendente
            });
            const germinacion = germinacionOrdenadas[0];
          } else {
            this.inicializarValoresPorDefectoGerminacion();
          }
        },
        error: (err) => {
          console.error('Error cargando germinación:', err);
          this.inicializarValoresPorDefectoGerminacion();
        }
      });
    } else {
      // Si no está solicitado, no cargar datos pero marcar como no realizado
      this.inicializarValoresPorDefectoGerminacion();
    }
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
    // Marcar que no existe análisis de pureza
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
    this.dosnGramosAnalizados = null;
    this.dosnMalezasToleranciaCero = null;
    this.dosnMalezasTolerancia = null;
    this.dosnOtrosCultivos = null;

  }

  inicializarValoresPorDefectoGerminacion() {
    // Marcar que no existe análisis de germinación
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
              this.analisisSolicitados = recibo.analisisSolicitados;
              // Extraer el peso del recibo
              this.pesoKg = recibo.kgLimpios ?? 0;
              // Determinar qué análisis deben realizarse
              this.determinarAnalisisSolicitados();
              // Cargar análisis disponibles para verificar si existen análisis estándar
              this.cargarAnalisisDisponibles();
            },
            error: (err) => {
              console.error('Error cargando recibo para extraer peso:', err);
              // Cargar análisis disponibles de todas formas
              this.cargarAnalisisDisponibles();
            }
          });
        } else {
          // Si no hay reciboId, cargar análisis disponibles de todas formas
          this.cargarAnalisisDisponibles();
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
        this.dosnMalezasToleranciaCero = certificado.dosnMalezasToleranciaCero ?? null;
        this.dosnMalezasTolerancia = certificado.dosnMalezasTolerancia ?? null;
        this.dosnOtrosCultivos = certificado.dosnOtrosCultivos ?? null;
        // Asignar correctamente dosnBrassicaSpp, permitiendo 0 y valores positivos, y forzando a number
        if (certificado.dosnBrassicaSpp !== undefined && certificado.dosnBrassicaSpp !== null) {
          const val = Number(certificado.dosnBrassicaSpp);
          this.dosnBrassicaSpp = isNaN(val) ? 0 : val;
        } else {
          this.dosnBrassicaSpp = 0;
        }

        // Asignar correctamente brassicaContiene, permitiendo true/false del backend
        this.brassicaContiene = (typeof certificado.brassicaContiene === 'boolean') ? certificado.brassicaContiene : false;

        this.otrasDeterminaciones = certificado.otrasDeterminaciones || '';
        this.nombreFirmante = certificado.nombreFirmante || '';
        this.funcionFirmante = certificado.funcionFirmante || '';


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
      numeroEnvases: this.numeroEnvases ?? null,
      fechaIngresoLaboratorio: DateService.ajustarFecha(this.fechaIngresoLaboratorio),
      fechaFinalizacionAnalisis: DateService.ajustarFecha(this.fechaFinalizacionAnalisis),
      numeroMuestra: this.numeroMuestra || null,
      numeroCertificado: this.numeroCertificado || null,
      tipoCertificado: this.tipoCertificado ?? null,
      fechaEmision: DateService.ajustarFecha(this.fechaEmision),
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
      dosnBrassicaSpp: Number(this.dosnBrassicaSpp) ?? null,
      otrasDeterminaciones: this.otrasDeterminaciones || null,
      nombreFirmante: this.nombreFirmante || null,
      funcionFirmante: this.funcionFirmante || null,
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

    console.log('Payload crear certificado:', payload);
    // Solución: enviar null si la firma está vacía, si no enviar como array de números
    payload.firmante = (this.firmante && this.firmante.length > 0) ? Array.from(this.firmante) : [];
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
      numeroEnvases: this.numeroEnvases ?? null,
      fechaIngresoLaboratorio: DateService.ajustarFecha(this.fechaIngresoLaboratorio),
      fechaFinalizacionAnalisis: DateService.ajustarFecha(this.fechaFinalizacionAnalisis),
      numeroMuestra: this.numeroMuestra || null,
      numeroCertificado: this.numeroCertificado || null,
      tipoCertificado: this.tipoCertificado ?? null,
      fechaEmision: DateService.ajustarFecha(this.fechaEmision),
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
      dosnBrassicaSpp: Number(this.dosnBrassicaSpp) || 0,
      otrasDeterminaciones: this.otrasDeterminaciones || null,
      nombreFirmante: this.nombreFirmante || null,
      funcionFirmante: this.funcionFirmante || null,
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

    console.log('Payload editar certificado:', payload);
    // Solución: enviar null si la firma está vacía, si no enviar como array de números
    payload.firmante = (this.firmante && this.firmante.length > 0) ? Array.from(this.firmante) : [];
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

  /**
   * Exporta el certificado a PDF
   */
  exportarAPDF(): void {
    if (!this.certificadoId || this.certificadoId === 0) {
      alert('No hay certificado para exportar. Por favor, guarde el certificado primero.');
      return;
    }

    this.isExportingPDF = true;

    // Ocultar los botones justo antes de capturar el PDF
    this.viewSeleccionarImagenFirma = false;

    // Esperar a que el DOM se actualice antes de capturar
    setTimeout(() => {
      const certificadoElement = document.querySelector('.certificado-container') as HTMLElement;
      if (!certificadoElement) {
        alert('Error: No se pudo encontrar el contenido del certificado.');
        this.isExportingPDF = false;
        this.viewSeleccionarImagenFirma = true;
        return;
      }
      const options = {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: certificadoElement.scrollWidth,
        height: certificadoElement.scrollHeight
      };
      html2canvas(certificadoElement, options).then((canvas: HTMLCanvasElement) => {
      const imgData = canvas.toDataURL('image/png');
      
      // Calcular dimensiones del PDF
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Crear PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      // Agregar primera página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Agregar páginas adicionales si es necesario
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Generar nombre del archivo
      const fileName = `Certificado_${this.numeroCertificado || 'N' + this.certificadoId}_${new Date().getTime()}.pdf`;
      
      // Descargar el PDF
      pdf.save(fileName);

      this.viewSeleccionarImagenFirma = true;
      this.isExportingPDF = false;
    }).catch((error: any) => {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
      this.isExportingPDF = false;
      this.viewSeleccionarImagenFirma = true;
    });
  }, 0);
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


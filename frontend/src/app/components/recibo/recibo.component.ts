import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReciboService } from '../../../services/ReciboService';
import { LoteService } from '../../../services/LoteService';
import { EspecieService } from '../../../services/EspecieService';
import { CultivoService } from '../../../services/CultivoService';
import { ReciboDto } from '../../../models/Recibo.dto';
import { ReciboEstado } from '../../../models/enums';
import { ActivatedRoute, Router } from '@angular/router';
import { DepositoService } from '../../../services/DepositoService';
import { DepositoDto } from '../../../models/Deposito.dto';
import { HumedadLugarDto } from '../../../models/HumedadLugar.dto';
import { HumedadReciboDto } from '../../../models/HumedadRecibo.dto';
import { HumedadReciboService } from '../../../services/HumedadReciboService';
import { AuthService } from '../../../services/AuthService';
import { DateService } from '../../../services/DateService';
import { LogService } from '../../../services/LogService';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';


@Component({
  selector: 'app-recibo',
  standalone: true,
  templateUrl: './recibo.component.html',
  styleUrls: ['./recibo.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
  ]
})
export class ReciboComponent implements OnInit {
    /**
     * Devuelve true si el usuario tiene únicamente el rol OBSERVADOR (según localStorage)
     */
    isObservador(): boolean {
      return this.authService.isObservador();
    }
    
  especies: Array<{label: string, value: number}> = [];
  cultivares: Array<{label: string, value: number}> = [];
  selectedEspecieId: number | null = null;
  selectedCultivarId: number | null = null;
  // Estado del recibo
  estadosOptions: Array<{label: string, value: string | null}> = [
    { label: 'Seleccionar estado', value: null },
    { label: 'L', value: ReciboEstado.L },
    { label: 'C', value: ReciboEstado.C },
    { label: 'S', value: ReciboEstado.S }
  ];
  selectedEstado: ReciboEstado | null = null;

  kilos: number = 0;
  fechaRecibo: string = '';

  // Campos de texto simples
  nLab: string = '';
  articulo: number | null = null;
  especie: string = '';
  ficha: string = '';
  lote: number | null = null;
  lote2: number | null = null;
  origen: string = '';
  observaciones: string = '';
  remite: string = '';
  ingresaFrio: string = '';
  saleFrio: string = '';
  observacion: string = '';

  reciboId: number = 0;
  isEditing: boolean = false;

  // Propiedades para análisis
  dosnAnalisisId: number[] | null = null;
  pmsAnalisisId: number[] | null = null;
  purezaAnalisisId: number[] | null = null;
  germinacionAnalisisId: number[] | null = null;
  purezaPNotatumAnalisisId: number[] | null = null;
  sanitarioAnalisisId: number[] | null = null;
  tetrazolioAnalisisId: number[] | null = null;
  humedadesId: number[] | null = null;

  // Guardar el recibo cargado para fusionar en edición y no sobrescribir campos no editados
  originalRecibo: ReciboDto | null = null;

  // Nuevas propiedades para depósitos
  depositos: DepositoDto[] = [];
  selectedDepositoId: number | null = null;

  // Propiedades para tabla de humedades usando HumedadReciboDto[]
  humedades: HumedadReciboDto[] = [];

  // Opciones para el dropdown de lugares de humedad
  lugaresHumedad = [
    { label: 'Cámara 1', value: HumedadLugarDto.Camara1 },
    { label: 'Cámara 2', value: HumedadLugarDto.Camara2 },
    { label: 'Cámara 3', value: HumedadLugarDto.Camara3 },
    { label: 'Cosecha', value: HumedadLugarDto.Cosecha }
  ];

  // Agregar propiedades para manejar errores
  errores: string[] = [];

  // Nueva propiedad para validar la fecha
  isFechaReciboInvalida: boolean = false;

  constructor(
    private reciboService: ReciboService,
    private loteService: LoteService,
    private depositoService: DepositoService,
    private humedadReciboService: HumedadReciboService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private logService: LogService,
    private especieService: EspecieService,
    private cultivoService: CultivoService
  ) {}

  ngOnInit(): void {
    const token = this.authService.token;
    if (!token) {
      console.warn('⚠️ No hay token de autenticación. El usuario debe hacer login primero.');
    }

    // Cargar especies usando el servicio inyectado
    this.especieService.listar().subscribe({
      next: (especies: any[]) => {
        this.especies = especies.map(e => ({ label: e.nombre, value: e.id }));
      },
      error: (err) => {
        console.error('Error cargando especies:', err);
        this.especies = [];
      }
    });

    // Cargar cultivares usando el servicio inyectado
    this.cultivoService.listarCultivos().subscribe({
      next: (cultivares: any[]) => {
        this.cultivares = cultivares.map(c => ({ label: c.nombre, value: c.id }));
      },
      error: (err) => {
        console.error('Error cargando cultivares:', err);
        this.cultivares = [];
      }
    });

    this.depositoService.listarDepositos().subscribe({
      next: (depositos: DepositoDto[]) => {
        this.depositos = depositos;
        console.log('Depósitos cargados:', this.depositos);
      },
      error: (error) => {
        console.error('Error loading depositos:', error);
        this.depositos = []; // Fallback to empty array
      }
    });

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('reciboId');
      const idParamLote = params.get('loteId');

      this.reciboId = idParam ? Number(idParam) : 0;
      this.lote2 = idParamLote ? Number(idParamLote) : 0;
      this.isEditing = this.reciboId !== 0;

      if (this.reciboId === 0) {
        this.inicializarCampos();
      } else {
        this.cargarRecibo(this.reciboId);
      }
    });
  }

  inicializarCampos() {
    this.selectedCultivarId = null;
    this.selectedEspecieId = null;
    this.kilos = 0;
    // Usar fecha local actual sin problemas de zona horaria
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.fechaRecibo = `${year}-${month}-${day}`;
    this.nLab = '';
    this.articulo = null;
    // ...existing code...
    this.ficha = '';
    this.lote = null;
    this.origen = '';
    this.observaciones = '';
    this.remite = '';
    this.ingresaFrio = '';
    this.saleFrio = '';
    this.observacion = '';
    this.selectedDepositoId = null;
  // Estado por defecto: ninguna selección (opción "Seleccionar estado")
  this.selectedEstado = null;
    // Inicializar análisis como null para recibos nuevos
    this.dosnAnalisisId = null;
    this.pmsAnalisisId = null;
    this.purezaAnalisisId = null;
    this.germinacionAnalisisId = null;
    this.purezaPNotatumAnalisisId = null;
    this.sanitarioAnalisisId = null;
    this.tetrazolioAnalisisId = null;
    this.humedadesId = null;

  // Inicializar tabla de humedades vacía (sin filas por defecto)
  this.humedades = [];
  }

  cargarRecibo(id: number) {
    this.reciboService.obtenerRecibo(id).subscribe((recibo: ReciboDto) => {
      // Guardar el recibo original tal como vino del backend
      this.originalRecibo = recibo;
      this.nLab = recibo.nroAnalisis?.toString() || '';
      this.articulo = recibo.articulo;
      this.selectedCultivarId = recibo.cultivarId ?? null;
      this.kilos = recibo.kgLimpios || 0;
      // Conservar fecha original al editar, manejando zona horaria local
      if (recibo.fechaRecibo) {
        const fecha = new Date(recibo.fechaRecibo);
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        this.fechaRecibo = `${year}-${month}-${day}`;
      } else {
        this.fechaRecibo = '';
      }
      this.selectedEspecieId = recibo.especieId || null;
      this.ficha = recibo.ficha || '';
      this.lote = recibo.loteId || null;
      this.origen = recibo.origen || '';
      this.observaciones = ''; // This property doesn't exist in ReciboDto
      this.remite = recibo.remitente || '';
      this.ingresaFrio = ''; // This property doesn't exist in ReciboDto
      this.saleFrio = ''; // This property doesn't exist in ReciboDto
      this.observacion = ''; // This property doesn't exist in ReciboDto
      this.selectedDepositoId = recibo.depositoId || null;

      // Cargar estado existente si está presente
      if (recibo.estado) {
        this.selectedEstado = recibo.estado as ReciboEstado;
      } else {
          // Mantener null si el recibo no tiene estado
          this.selectedEstado = null;
      }

      // Cargar análisis existentes para mantener sus valores al editar
      this.dosnAnalisisId = recibo.dosnAnalisisId || null;
      this.pmsAnalisisId = recibo.pmsAnalisisId || null;
      this.purezaAnalisisId = recibo.purezaAnalisisId || null;
      this.germinacionAnalisisId = recibo.germinacionAnalisisId || null;
      this.purezaPNotatumAnalisisId = recibo.purezaPNotatumAnalisisId || null;
      this.sanitarioAnalisisId = recibo.sanitarioAnalisisId || null;
      this.tetrazolioAnalisisId = recibo.tetrazolioAnalisisId || null;

      // Cargar humedades existentes si estamos editando
      this.cargarHumedadesExistentes(id);
    });
  }

  cargarHumedadesExistentes(reciboId: number) {
    // Intentar cargar las humedades existentes desde el backend
    this.humedadReciboService.listarHumedadesPorRecibo(reciboId).subscribe({
      next: (humedades: HumedadReciboDto[]) => {
        console.log(`Cargando humedades para reciboId ${reciboId}`);
        console.log('Humedades recibidas del backend:', humedades);
        if (humedades && humedades.length > 0) {
          // Usar HumedadReciboDto[] directamente
          this.humedades = humedades.map(h => ({
            id: h.id ?? null,
            reciboId: h.reciboId ?? null,
            numero: h.numero ?? null,
            lugar: (h.lugar as HumedadLugarDto) ?? null
          } as HumedadReciboDto));
        } else {
          // Si no hay humedades, inicializar sin filas por defecto
          this.humedades = [];
          console.log('No se encontraron humedades para este recibo');
        }
      },
      error: (error: any) => {
        console.error('Error cargando humedades:', error);
        // Sin filas por defecto en caso de error
        this.humedades = [];
      }
    });
  }

  manejarProblemas(): boolean {
    this.errores = []; // Reiniciar errores

    const hoy = new Date();
    const fechaRecibo = this.fechaRecibo ? new Date(this.fechaRecibo) : null;

    if (this.articulo != null && this.articulo < 0) {
      this.errores.push('El artículo no puede ser un número negativo.');
    }

    if (this.kilos != null && this.kilos < 0) {
      this.errores.push('Los kilos no pueden ser un número negativo.');
    }

    if (this.humedades.some(h => h.numero != null && h.numero < 0)) {
      this.errores.push('Algunas humedades tienen un número negativo.');
    }

    if (fechaRecibo != null && fechaRecibo > hoy) {
      this.errores.push('La fecha no puede ser mayor a la fecha actual.');
    }

    return this.errores.length > 0;
  }


  crearRecibo() {
    const payload: ReciboDto = {
      id: null,
      nroAnalisis: Number(this.nLab) || null,
      depositoId: Number(this.selectedDepositoId) || null,
      estado: this.selectedEstado ?? null,
      dosnAnalisisId: null,
      pmsAnalisisId: null,
      purezaAnalisisId: null,
      germinacionAnalisisId: null,
      purezaPNotatumAnalisisId: null,
      sanitarioAnalisisId: null,
      tetrazolioAnalisisId: null,
      especieId: this.selectedEspecieId,
      ficha: this.ficha || null,
      fechaRecibo: DateService.ajustarFecha(this.fechaRecibo),
      remitente: this.remite || null,
      origen: this.origen || null,
      cultivarId: this.selectedCultivarId ?? null,
      loteId: Number(this.lote2) || null,
      kgLimpios: Number(this.kilos) || null,
      analisisSolicitados: null,
      articulo: this.articulo,
      activo: true
    };

    this.reciboService.crearRecibo(payload).subscribe({
        next: (reciboCreado: ReciboDto) => {
            console.log('Recibo creado (DTO):', reciboCreado);

            const reciboId = reciboCreado?.id ? Number(reciboCreado.id) : 0;
            if (!reciboId || reciboId <= 0) {
                console.error('No se pudo obtener un ID válido del recibo creado');
                return;
            }

            this.verificarAsociacionReciboLote(Number(this.lote2), reciboId);
            this.guardarHumedades(reciboId);
            this.reciboId = reciboId;
            this.isEditing = true;


            this.logService.crearLog(Number(reciboCreado.loteId) ,reciboId, 'Recibo', 'creado').subscribe();
            console.log('Navegando a lote-analisis con loteId:', this.lote2, 'reciboId:', reciboId);
            this.router.navigate([`/${this.lote2}/${reciboId}/lote-analisis`]);
        },
        error: (err: any) => {
            console.error('Error creando recibo', err);
        }
    });
  }

  onCancel() {
    const lote = this.route.snapshot.params['loteId'];
    const recibo = this.route.snapshot.params['reciboId'] || 0;
    this.router.navigate([`/${lote}/${recibo}/lote-analisis`]);
  }

  editarRecibo() {
    if (!this.reciboId || this.reciboId <= 0) {
      console.error('Error: ID de recibo inválido para edición');
      return;
    }

    // Construir payload a partir del recibo original si está disponible
    const base: ReciboDto = this.originalRecibo ? { ...this.originalRecibo } : { id: this.reciboId } as ReciboDto;

    const payload: ReciboDto = {
      ...base,
      id: this.reciboId,
      nroAnalisis: Number(this.nLab) || base.nroAnalisis || null,
      depositoId: Number(this.selectedDepositoId) ?? base.depositoId ?? null,
      estado: this.selectedEstado ?? base.estado ?? null,
      dosnAnalisisId: (this.dosnAnalisisId ?? base.dosnAnalisisId) ?? null,
      pmsAnalisisId: (this.pmsAnalisisId ?? base.pmsAnalisisId) ?? null,
      purezaAnalisisId: (this.purezaAnalisisId ?? base.purezaAnalisisId) ?? null,
      germinacionAnalisisId: (this.germinacionAnalisisId ?? base.germinacionAnalisisId) ?? null,
      purezaPNotatumAnalisisId: (this.purezaPNotatumAnalisisId ?? base.purezaPNotatumAnalisisId) ?? null,
      sanitarioAnalisisId: (this.sanitarioAnalisisId ?? base.sanitarioAnalisisId) ?? null,
      tetrazolioAnalisisId: (this.tetrazolioAnalisisId ?? base.tetrazolioAnalisisId) ?? null,
      especieId: this.selectedEspecieId ?? base.especieId ?? null,
      ficha: this.ficha || base.ficha || null,
      fechaRecibo: DateService.ajustarFecha(this.fechaRecibo) || (base.fechaRecibo ?? new Date().toISOString()),
      remitente: this.remite || base.remitente || null,
      origen: this.origen || base.origen || null,
      cultivarId: this.selectedCultivarId ?? base.cultivarId ?? null,
      loteId: Number(this.lote2) || base.loteId || null,
      kgLimpios: Number(this.kilos) || base.kgLimpios || null,
      analisisSolicitados: base.analisisSolicitados || null,
      articulo: this.articulo ?? base.articulo ?? null,
      activo: base.activo ?? true
    };

    console.log('Payload para editar recibo:', payload);

    // Normalizar arrays: muchos endpoints esperan [] en lugar de null
    const normalizeArrays = (p: ReciboDto) => {
      p.dosnAnalisisId = p.dosnAnalisisId ?? [];
      p.pmsAnalisisId = p.pmsAnalisisId ?? [];
      p.purezaAnalisisId = p.purezaAnalisisId ?? [];
      p.germinacionAnalisisId = p.germinacionAnalisisId ?? [];
      p.purezaPNotatumAnalisisId = p.purezaPNotatumAnalisisId ?? [];
      p.sanitarioAnalisisId = p.sanitarioAnalisisId ?? [];
      p.tetrazolioAnalisisId = p.tetrazolioAnalisisId ?? [];
      return p;
    };

    const finalPayload = normalizeArrays({ ...payload });
    console.log('Final payload (after normalization):', finalPayload);

    this.reciboService.editarRecibo(finalPayload).subscribe({
      next: (msg) => {
        console.log('Recibo editado exitosamente:', msg);
        // Guardar las humedades actualizadas
        this.guardarHumedades(this.reciboId);

        this.logService.crearLog(Number(finalPayload.loteId), this.reciboId, 'Recibo', 'editado').subscribe();

        // Navegar de vuelta a lote-analisis
        console.log('Navegando a lote-analisis con loteId:', this.lote2, 'reciboId:', this.reciboId);
        this.router.navigate([`/${this.lote2}/${this.reciboId}/lote-analisis`]);
      },
      error: (err: any) => {
        console.error('Error editando recibo:', err);
        console.error('Payload enviado:', payload);
      }
    });
  }

  guardarRecibo() {
    if (this.isEditing) {
      this.editarRecibo();
    } else {
      this.crearRecibo();
    }
  }

  guardarHumedades(reciboId: number) {
    // Filtrar humedades válidas (que tengan al menos lugar o número)
    const humedadesValidas = this.humedades.filter(h =>
      h.numero !== null || h.lugar !== null
    );

    console.log('Todas las humedades a enviar:', humedadesValidas);

    // Preparar DTOs para el backend: conservar id si existe (para edición/eliminación)
    const humedadesDtos: HumedadReciboDto[] = humedadesValidas.map(h => ({
      id: h.id ?? null,
      reciboId: reciboId,
      numero: h.numero ?? null,
      lugar: h.lugar ?? null,
    } as HumedadReciboDto));

    // Enviar todas las humedades al método único del servicio
    this.humedadReciboService.HumedadesRecibo(reciboId, humedadesDtos).subscribe({
      next: (resp: { created: HumedadReciboDto[]; errors: any[] }) => {
        console.log('Respuesta del servicio de humedades:', resp);

        if (resp.created && resp.created.length > 0) {
          console.log('Humedades procesadas correctamente:', resp.created.length);
        }

        if (resp.errors && resp.errors.length > 0) {
          console.warn('Algunos elementos tuvieron errores:', resp.errors);
        }
      },
      error: (error: any) => {
        console.error('Error guardando humedades:', error);
      }
    });
  }

  // Métodos para manejo de tabla de humedades
  agregarHumedad() {
    this.humedades.push({
      id: null,
      reciboId: null,
      numero: null,
      lugar: null
    } as HumedadReciboDto);
    console.log('Humedad agregada. Total humedades:', this.humedades.length);
  }



  /**
   * Verifica que el recibo se haya asociado correctamente al lote
   * @param loteId ID del lote
   * @param reciboId ID del recibo
   */
  verificarAsociacionReciboLote(loteId: number, reciboId: number): void {
    console.log('=== VALIDACIÓN FRONTEND: Verificando asociación recibo-lote ===');
    console.log('LoteId:', loteId, 'ReciboId:', reciboId);

    this.loteService.verificarAsociacionReciboLote(loteId, reciboId).subscribe({
      next: (asociacionCorrecta: boolean) => {
        if (asociacionCorrecta) {
          console.log('✅ VALIDACIÓN EXITOSA: El recibo se asoció correctamente al lote');
        } else {
          console.error('❌ VALIDACIÓN FALLIDA: El recibo NO se asoció correctamente al lote');
        }
      },
      error: (error: any) => {
        console.error('❌ ERROR en la verificación de asociación:', error);
      }
    });
  }

  validarFormulario() {
    this.errores = [];

    if (!this.nLab || this.nLab.trim() === '') {
        this.errores.push('El campo N° Analisis es obligatorio.');
    }

    if (!this.especie || this.especie.trim() === '') {
        this.errores.push('El campo Especie es obligatorio.');
    }

    if (this.articulo != null && this.articulo < 0) {
        this.errores.push('El artículo no puede ser negativo.');
    }

    if (this.isFechaReciboInvalida) {
        this.errores.push('La fecha no puede ser mayor a hoy.');
    }

    if (this.kilos != null && this.kilos < 0) {
        this.errores.push('Los kilos no pueden ser negativos.');
    }

    this.humedades.forEach((humedad, index) => {
        if (humedad.numero != null && humedad.numero < 0) {
            this.errores.push(`El número de humedad en la fila ${index + 1} no puede ser negativo.`);
        }
    });
}
}

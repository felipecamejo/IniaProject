import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReciboService } from '../../../services/ReciboService';
import { ReciboDto } from '../../../models/Recibo.dto';
import { ReciboEstado } from '../../../models/enums';
import { ActivatedRoute } from '@angular/router';
import { DepositoService } from '../../../services/DepositoService';
import { DepositoDto } from '../../../models/Deposito.dto';
import { HumedadLugarDto } from '../../../models/HumedadLugar.dto';
import { HumedadReciboDto } from '../../../models/HumedadRecibo.dto';
import { HumedadReciboService } from '../../../services/HumedadReciboService';
import { AuthService } from '../../../services/AuthService';

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
    ButtonModule
  ]
})
export class ReciboComponent implements OnInit {
  // Dropdown options
  cultivares: Array<{label: string, value: string}> = [
    { label: 'Cultivar A', value: '1' },
    { label: 'Cultivar B', value: '2' },
    { label: 'Cultivar C', value: '3' }
  ];

  // Propiedades enlazadas con ngModel
  selectedCultivar: string = '';
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
  rec: string = '';

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

  // Acumula IDs de humedades eliminadas durante la edición
  deletedHumedadesIds: number[] = [];

  // Opciones para el dropdown de lugares de humedad
  lugaresHumedad = [
    { label: 'Cámara 1', value: HumedadLugarDto.Camara1 },
    { label: 'Cámara 2', value: HumedadLugarDto.Camara2 },
    { label: 'Cámara 3', value: HumedadLugarDto.Camara3 },
    { label: 'Cosecha', value: HumedadLugarDto.Cosecha }
  ];

  constructor(
    private reciboService: ReciboService,
    private depositoService: DepositoService,
    private humedadReciboService: HumedadReciboService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Debug: Verificar estado de autenticación
    const token = this.authService.token;

    if (!token) {
      console.warn('⚠️ No hay token de autenticación. El usuario debe hacer login primero.');
    }

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
    this.selectedCultivar = '';
    this.kilos = 0;
    // Usar fecha local actual sin problemas de zona horaria
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.fechaRecibo = `${year}-${month}-${day}`;
    this.rec = '';
    this.nLab = '';
    this.articulo = null;
    this.especie = '';
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
      this.selectedCultivar = recibo.cultivar || '';
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
      this.rec = recibo.analisisSolicitados || '';
      this.especie = recibo.especie || '';
      this.ficha = recibo.ficha || '';
      this.lote = recibo.lote || null;
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
        if (humedades && humedades.length > 0) {
          // Usar HumedadReciboDto[] directamente
          this.humedades = humedades.map(h => ({
            id: h.id ?? null,
            reciboId: h.reciboId ?? null,
            numero: h.numero ?? null,
            lugar: (h.lugar as HumedadLugarDto) ?? null,
            activo: h.activo ?? true
          } as HumedadReciboDto));
        } else {
          // Si no hay humedades, inicializar sin filas por defecto
          this.humedades = [];
        }
      },
      error: (error: any) => {
        console.error('Error cargando humedades:', error);
        // Sin filas por defecto en caso de error
        this.humedades = [];
      }
    });
  }

  crearRecibo() {
    const payload: ReciboDto = {
      id: null,
      nroAnalisis: Number(this.nLab) || null,
      depositoId: Number(this.selectedDepositoId) || null,
      // Si la opción por defecto está seleccionada, enviar null como estado
      estado: this.selectedEstado ?? null,
      // Análisis inicializados como null para recibos nuevos
      dosnAnalisisId: null,
      pmsAnalisisId: null,
      purezaAnalisisId: null,
      germinacionAnalisisId: null,
      purezaPNotatumAnalisisId: null,
      sanitarioAnalisisId: null,
      tetrazolioAnalisisId: null,
      especie: this.especie || null,
      ficha: this.ficha || null,
      fechaRecibo: this.fechaRecibo ? new Date(this.fechaRecibo).toISOString() : new Date().toISOString(),
      remitente: this.remite || null,
      origen: this.origen || null,
      cultivar: this.selectedCultivar || null,
      lote: Number(this.lote) || null,
      kgLimpios: Number(this.kilos) || null,
      analisisSolicitados: this.rec || null,
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

        // Guardar las humedades con el ID del recibo
        this.guardarHumedades(reciboId);

        // Actualizar el estado del componente
        this.reciboId = reciboId;
        this.isEditing = true;
      },
      error: (err: any) => console.error('Error creando recibo', err)
    });
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
      // Si la opción por defecto está seleccionada, enviar null como estado
      estado: this.selectedEstado ?? base.estado ?? null,
      // Mantener arrays existentes si no se reemplazan (usar null por defecto si ninguno existe)
      dosnAnalisisId: (this.dosnAnalisisId ?? base.dosnAnalisisId) ?? null,
      pmsAnalisisId: (this.pmsAnalisisId ?? base.pmsAnalisisId) ?? null,
      purezaAnalisisId: (this.purezaAnalisisId ?? base.purezaAnalisisId) ?? null,
      germinacionAnalisisId: (this.germinacionAnalisisId ?? base.germinacionAnalisisId) ?? null,
      purezaPNotatumAnalisisId: (this.purezaPNotatumAnalisisId ?? base.purezaPNotatumAnalisisId) ?? null,
      sanitarioAnalisisId: (this.sanitarioAnalisisId ?? base.sanitarioAnalisisId) ?? null,
      tetrazolioAnalisisId: (this.tetrazolioAnalisisId ?? base.tetrazolioAnalisisId) ?? null,
      especie: this.especie || base.especie || null,
      ficha: this.ficha || base.ficha || null,
      fechaRecibo: this.fechaRecibo ? new Date(this.fechaRecibo).toISOString() : (base.fechaRecibo ?? new Date().toISOString()),
      remitente: this.remite || base.remitente || null,
      origen: this.origen || base.origen || null,
      cultivar: this.selectedCultivar || base.cultivar || null,
      lote: Number(this.lote) || base.lote || null,
      kgLimpios: Number(this.kilos) || base.kgLimpios || null,
      analisisSolicitados: this.rec || base.analisisSolicitados || null,
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
        // Si hay humedades marcadas para borrar, enviarlas en una sola llamada
        (() => {
          if (this.deletedHumedadesIds && this.deletedHumedadesIds.length > 0) {
            const ids = [...this.deletedHumedadesIds];
            this.humedadReciboService.eliminarHumedadesRecibo(ids).subscribe({
              next: (r) => {
                console.log('Eliminación múltiple de humedades OK:', r);
                // limpiar lista local
                this.deletedHumedadesIds = [];
              },
              error: (err) => {
                console.error('Error en eliminación múltiple de humedades:', err);
                // no limpiar para reintento manual si se desea
              }
            });
          }
        })();
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

    if (humedadesValidas.length === 0) {
      console.log('No hay humedades para guardar');
      return;
    }

    // Preparar DTOs para el backend: conservar id si existe (para edición)
    const humedadesDtos: HumedadReciboDto[] = humedadesValidas.map(h => ({
      id: h.id ?? null,
      reciboId: reciboId,
      numero: h.numero ?? null,
      lugar: h.lugar ?? null,
      activo: h.activo ?? true
    } as HumedadReciboDto));

    // Enviar al backend: crear o editar en función de si estamos en modo edición
    console.log('Humedades a guardar (preparadas):', humedadesDtos);

    if (this.isEditing) {
      // Llamar al endpoint editar-multiple
      this.humedadReciboService.editarHumedadesRecibo(humedadesDtos).subscribe({
        next: (resp: string) => {
          console.log('Respuesta editar-multiple:', resp);
          // No siempre se devuelve la lista de ids en la edición; si el backend lo hace,
          // podríamos parsearla aquí. Por ahora solo loggeamos la respuesta.
        },
        error: (error: any) => {
          console.error('Error editando humedades en lote:', error);
        }
      });
    } else {
      // Crear múltiples (ya implementado)
      this.humedadReciboService.crearHumedadesRecibo(humedadesDtos).subscribe({
        next: (resp) => {
          // Backend devuelve { created: [...], errors: [...] }
          console.log('Respuesta crear-multiple:', resp);
          const creadas = resp.created || [];
          const errores = resp.errors || [];

          if (creadas.length > 0) {
            this.humedadesId = creadas.map(h => (h.id ? Number(h.id) : null)).filter(Boolean) as number[];
            console.log('Humedades creadas correctamente. IDs:', this.humedadesId);
          }

          if (errores.length > 0) {
            console.warn('Algunos elementos no fueron creados:', errores);
          }
        },
        error: (error: any) => {
          console.error('Error creando humedades en lote:', error);
        }
      });
    }
  }

  // Métodos para manejo de tabla de humedades
  agregarHumedad() {
    this.humedades.push({ 
      id: null, 
      reciboId: null, 
      numero: null, 
      lugar: null,
      activo: true
    } as HumedadReciboDto);
    console.log('Humedad agregada. Total humedades:', this.humedades.length);
  }

  eliminarHumedad(index: number) {
    if (this.humedades.length > 0) { // Permitir eliminar hasta la última
      const h = this.humedades[index];
      if (this.isEditing && h && h.id) {
        this.deletedHumedadesIds.push(h.id);
        console.log('Registrada humedad para eliminación al actualizar:', h.id);
      }
      this.humedades.splice(index, 1);
      console.log('Humedad eliminada. Total humedades:', this.humedades.length);
    }
  }
}

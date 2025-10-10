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

  // Nuevas propiedades para depósitos
  depositos: DepositoDto[] = [];
  selectedDepositoId: number | null = null;

  // Propiedades para tabla de humedades (ahora conservamos el id para edición)
  humedades: Array<{id: number | null, numero: number | null, lugar: HumedadLugarDto | null}> = [
    { id: null, numero: null, lugar: null }
  ];

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
    
    // Inicializar análisis como null para recibos nuevos
    this.dosnAnalisisId = null;
    this.pmsAnalisisId = null;
    this.purezaAnalisisId = null;
    this.germinacionAnalisisId = null;
    this.purezaPNotatumAnalisisId = null;
    this.sanitarioAnalisisId = null;
    this.tetrazolioAnalisisId = null;
    this.humedadesId = null;

  // Inicializar tabla de humedades con una fila vacía
  this.humedades = [{ id: null, numero: null, lugar: null }];
  }

  cargarRecibo(id: number) {
    this.reciboService.obtenerRecibo(id).subscribe((recibo: ReciboDto) => {
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
          // Mapear al formato usado en el componente y conservar el id
          this.humedades = humedades.map(h => ({
            id: h.id ?? null,
            numero: h.numero ?? null,
            lugar: (h.lugar as HumedadLugarDto) ?? null
          }));
        } else {
          // Si no hay humedades, inicializar con una fila vacía
          this.humedades = [{ id: null, numero: null, lugar: null }];
        }
      },
      error: (error: any) => {
        console.error('Error cargando humedades:', error);
  // Mantener al menos una fila vacía para el UI
  this.humedades = [{ id: null, numero: null, lugar: null }];
      }
    });
  }

  crearRecibo() {
    const payload: ReciboDto = {
      id: null,
      nroAnalisis: Number(this.nLab) || null,
      depositoId: Number(this.selectedDepositoId) || null,
      estado: ReciboEstado.S,
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

    const payload: ReciboDto = {
      id: this.reciboId,
      nroAnalisis: Number(this.nLab) || null,
      depositoId: Number(this.selectedDepositoId) || null,
      estado: ReciboEstado.S,
      // Análisis mantienen sus valores existentes al editar
      dosnAnalisisId: this.dosnAnalisisId,
      pmsAnalisisId: this.pmsAnalisisId,
      purezaAnalisisId: this.purezaAnalisisId,
      germinacionAnalisisId: this.germinacionAnalisisId,
      purezaPNotatumAnalisisId: this.purezaPNotatumAnalisisId,
      sanitarioAnalisisId: this.sanitarioAnalisisId,
      tetrazolioAnalisisId: this.tetrazolioAnalisisId,
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

    console.log('Payload para editar recibo:', payload);

    this.reciboService.editarRecibo(payload).subscribe({
      next: (msg) => {
        console.log('Recibo editado exitosamente:', msg);
        // Guardar las humedades actualizadas
        this.guardarHumedades(this.reciboId);
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
      id: (h as any).id ?? null,
      reciboId: reciboId,
      numero: h.numero ?? null,
      lugar: h.lugar ?? null,
      activo: true
    }));

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
    this.humedades.push({ id: null, numero: null, lugar: null });
  }

  eliminarHumedad(index: number) {
    if (this.humedades.length > 1) {
      this.humedades.splice(index, 1);
    }
  }
}

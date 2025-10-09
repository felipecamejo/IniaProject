import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReciboService } from '../../../services/ReciboService';
import { ReciboDto } from '../../../models/Recibo.dto';
import { ActivatedRoute } from '@angular/router';
import { DepositoService } from '../../../services/DepositoService';
import { DepositoDto } from '../../../models/Deposito.dto';
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
  especie: string = '';
  ficha: string = '';
  lote: string = '';
  observaciones: string = '';
  remite: string = '';
  ingresaFrio: string = '';
  saleFrio: string = '';
  observacion: string = '';

  reciboId: number = 0;
  isEditing: boolean = false;

  // Nuevas propiedades para depósitos
  depositos: DepositoDto[] = [];
  selectedDepositoId: number | null = null;

  constructor(
    private reciboService: ReciboService,
    private depositoService: DepositoService,
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
        // Ensure we always have an array, even if the API returns null or undefined
        
        this.depositos = Array.isArray(depositos) ? depositos : [];
        console.log('Depósitos cargados:', this.depositos);
      },
      error: (error) => {
        console.error('Error loading depositos:', error);
        this.depositos = []; // Fallback to empty array
      }
    });

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('reciboId');
      this.reciboId = idParam ? Number(idParam) : 0;
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
    this.fechaRecibo = '';
    this.rec = '';
    this.nLab = '';
    this.especie = '';
    this.ficha = '';
    this.lote = '';
    this.observaciones = '';
    this.remite = '';
    this.ingresaFrio = '';
    this.saleFrio = '';
    this.observacion = '';
    this.selectedDepositoId = null;
  }

  cargarRecibo(id: number) {
    this.reciboService.obtenerRecibo(id).subscribe((recibo: ReciboDto) => {
      this.nLab = recibo.nroAnalisis?.toString() || '';
      this.selectedCultivar = recibo.cultivar || '';
      this.kilos = recibo.kgLimpios || 0;
      this.fechaRecibo = recibo.fechaRecibo || '';
      this.rec = recibo.analisisSolicitados || '';
      this.especie = recibo.especie || '';
      this.ficha = recibo.ficha || '';
      this.lote = recibo.lote?.toString() || '';
      this.observaciones = ''; // This property doesn't exist in ReciboDto
      this.remite = recibo.remitente || '';
      this.ingresaFrio = ''; // This property doesn't exist in ReciboDto
      this.saleFrio = ''; // This property doesn't exist in ReciboDto
      this.observacion = ''; // This property doesn't exist in ReciboDto
      this.selectedDepositoId = recibo.depositoId || null;
    });
  }

  crearRecibo() {
    const payload: ReciboDto = {
      id: null,
      nroAnalisis: Number(this.nLab) || 0,
      depositoId: this.selectedDepositoId ?? 0,
      estado: 'PENDIENTE',
      HumedadesId: [],
      especie: this.especie,
      ficha: this.ficha,
      fechaRecibo: this.fechaRecibo || new Date().toISOString(),
      remitente: this.remite,
      origen: '',
      cultivar: this.selectedCultivar,
      lote: Number(this.lote) || 0,
      kgLimpios: Number(this.kilos) || 0,
      analisisSolicitados: this.rec,
      articulo: 0,
      activo: true
    };

    this.reciboService.crearRecibo(payload).subscribe({
      next: (msg) => console.log(msg),
      error: (err) => console.error('Error creando recibo', err)
    });
  }

  editarRecibo() {
    const payload: ReciboDto = {
      id: this.reciboId,
      nroAnalisis: Number(this.nLab) || 0,
      depositoId: this.selectedDepositoId ?? 0,
      estado: 'PENDIENTE',
      HumedadesId: [],
      especie: this.especie,
      ficha: this.ficha,
      fechaRecibo: this.fechaRecibo || new Date().toISOString(),
      remitente: this.remite,
      origen: '',
      cultivar: this.selectedCultivar,
      lote: Number(this.lote) || 0,
      kgLimpios: Number(this.kilos) || 0,
      analisisSolicitados: this.rec,
      articulo: 0,
      activo: true
    };

    this.reciboService.editarRecibo(payload).subscribe({
      next: (msg) => console.log(msg),
      error: (err) => console.error('Error editando recibo', err)
    });
  }

  guardarRecibo() {
    if (this.isEditing) {
      this.editarRecibo();
    } else {
      this.crearRecibo();
    }
  }
}

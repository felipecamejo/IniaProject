import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';

export interface RepeticionGerminacion {
  numero: number;
  normales: number[]; // 5 valores
  anormales: number;
  duras: number;
  frescas: number;
  muertas: number;
}

@Component({
  selector: 'app-germinacion.component',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    MultiSelectModule
  ],
  templateUrl: './germinacion.component.html',
  styleUrl: './germinacion.component.scss'
})
export class GerminacionComponent implements OnInit {
  // Variables para manejar navegación
  isEditing: boolean = false;
  editingId: number | null = null;

  comentarios: string = '';
  numSemillas: string = '';
  metodo: string = '';
  temperatura: string = '';
  preFrio: string = '';
  preTratamiento: string = '';
  diasPreFrio: string[] = Array.from({length: 13}, (_, i) => `${i+3} dias`); // 3 a 15 días
  productoDosis: string = '';
  tratamientoSemillas: string = '';
  fechas = {
    inicio: '',
    primerConteo: '',
    segundoConteo: '',
    tercerConteo: '',
    cuartoConteo: '',
    quintoConteo: '',
    get totalDias() {
      const fechasConteo = [this.primerConteo, this.segundoConteo, this.tercerConteo, this.cuartoConteo, this.quintoConteo].filter(f => !!f);
      if (!this.inicio || fechasConteo.length === 0) return '';
      const inicio = new Date(this.inicio);
      const ultima = new Date(fechasConteo[fechasConteo.length - 1]);
      if (isNaN(inicio.getTime()) || isNaN(ultima.getTime())) return '';
      const diff = Math.ceil((ultima.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0 ? diff : '';
    }
  };
  inia = { pNormales: 0, pAnormales: 0, duras: 0, frescas: 0, muertas: 0, germinacion: 0 };
  inase = { pNormales: 0, pAnormales: 0, duras: 0, frescas: 0, muertas: 0, germinacion: 0 };
  repeticiones: RepeticionGerminacion[] = [];

  // Datos de prueba (deberían venir de un servicio)
  private itemsData: any[] = [
    {
      id: 1,
      comentarios: 'Control de calidad mensual - Muestra estándar',
      numSemillas: '50',
      metodo: 'A',
      temperatura: '20°C',
      preFrio: 'No',
      preTratamiento: 'No',
      productoDosis: 'Producto X',
      tratamientoSemillas: 'sin curar',
      fechas: {
        inicio: '2023-01-15',
        primerConteo: '2023-01-16',
        segundoConteo: '2023-01-17',
        tercerConteo: '',
        cuartoConteo: '',
        quintoConteo: ''
      },
      inia: { pNormales: 80, pAnormales: 0, duras: 2, frescas: 1, muertas: 0, germinacion: 96 },
      inase: { pNormales: 85, pAnormales: 0, duras: 1, frescas: 2, muertas: 0, germinacion: 98 },
      repeticiones: [
        { numero: 1, normales: [10,12,0,0,0], anormales: 0, duras: 2, frescas: 1, muertas: 0 }
      ]
    }
    // ...otros datos de prueba
  ];

  constructor(private route: ActivatedRoute, private router: Router) {
    // Inicializar con 1 repetición por defecto
    this.repeticiones.push(this.nuevaRepeticion(1));
  }

  ngOnInit() {
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

  cargarDatosParaEdicion(id: number) {
    const item = this.itemsData.find(germ => germ.id === id);
    if (item) {
      this.comentarios = item.comentarios || '';
      this.numSemillas = item.numSemillas || '';
      this.metodo = item.metodo || '';
      this.temperatura = item.temperatura || '';
      this.preFrio = item.preFrio || '';
      this.preTratamiento = item.preTratamiento || '';
      this.productoDosis = item.productoDosis || '';
      this.tratamientoSemillas = item.tratamientoSemillas || '';
      this.fechas = item.fechas || this.fechas;
      this.inia = item.inia || this.inia;
      this.inase = item.inase || this.inase;
      this.repeticiones = item.repeticiones || [this.nuevaRepeticion(1)];
    }
  }

  cargarDatos() {
    // Limpiar campos para creación
    this.comentarios = '';
    this.numSemillas = '';
    this.metodo = '';
    this.temperatura = '';
    this.preFrio = '';
    this.preTratamiento = '';
    this.productoDosis = '';
    this.tratamientoSemillas = '';
    this.fechas = {
      inicio: '',
      primerConteo: '',
      segundoConteo: '',
      tercerConteo: '',
      cuartoConteo: '',
      quintoConteo: '',
      get totalDias() {
        const fechasConteo = [this.primerConteo, this.segundoConteo, this.tercerConteo, this.cuartoConteo, this.quintoConteo].filter(f => !!f);
        if (!this.inicio || fechasConteo.length === 0) return '';
        const inicio = new Date(this.inicio);
        const ultima = new Date(fechasConteo[fechasConteo.length - 1]);
        if (isNaN(inicio.getTime()) || isNaN(ultima.getTime())) return '';
        const diff = Math.ceil((ultima.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
        return diff >= 0 ? diff : '';
      }
    };
    this.inia = { pNormales: 0, pAnormales: 0, duras: 0, frescas: 0, muertas: 0, germinacion: 0 };
    this.inase = { pNormales: 0, pAnormales: 0, duras: 0, frescas: 0, muertas: 0, germinacion: 0 };
    this.repeticiones = [this.nuevaRepeticion(1)];
  }

  getPromedioNormales(idx: number): number {
    if (this.repeticiones.length === 0) return 0;
    const suma = this.repeticiones.reduce((acc, rep) => acc + (Number(rep.normales[idx]) || 0), 0);
    return suma / this.repeticiones.length;
  }
  getPromedioAnormales(): number {
    if (this.repeticiones.length === 0) return 0;
    const suma = this.repeticiones.reduce((acc, rep) => acc + (Number(rep.anormales) || 0), 0);
    return suma / this.repeticiones.length;
  }
  getPromedioDuras(): number {
    if (this.repeticiones.length === 0) return 0;
    const suma = this.repeticiones.reduce((acc, rep) => acc + (Number(rep.duras) || 0), 0);
    return suma / this.repeticiones.length;
  }
  getPromedioFrescas(): number {
    if (this.repeticiones.length === 0) return 0;
    const suma = this.repeticiones.reduce((acc, rep) => acc + (Number(rep.frescas) || 0), 0);
    return suma / this.repeticiones.length;
  }
  getPromedioMuertas(): number {
    if (this.repeticiones.length === 0) return 0;
    const suma = this.repeticiones.reduce((acc, rep) => acc + (Number(rep.muertas) || 0), 0);
    return suma / this.repeticiones.length;
  }
  getPromedioTotal(): number {
    if (this.repeticiones.length === 0) return 0;
    const suma = this.repeticiones.reduce((acc, rep) => acc + this.getTotal(rep), 0);
    return suma / this.repeticiones.length;
  }

  nuevaRepeticion(numero: number): RepeticionGerminacion {
    return {
      numero,
      normales: [0, 0, 0, 0, 0],
      anormales: 0,
      duras: 0,
      frescas: 0,
      muertas: 0
    };
  }
  agregarRepeticion() {
    const nuevoNum = this.repeticiones.length + 1;
    this.repeticiones.push(this.nuevaRepeticion(nuevoNum));
  }
  eliminarRepeticion(idx: number) {
    if (this.repeticiones.length > 1) {
      this.repeticiones.splice(idx, 1);
      this.repeticiones.forEach((r, i) => r.numero = i + 1);
    }
  }
  getTotal(rep: RepeticionGerminacion): number {
    const sumaNormales = rep.normales.reduce((a, b) => a + (Number(b) || 0), 0);
    return sumaNormales + (Number(rep.anormales) || 0) + (Number(rep.duras) || 0) + (Number(rep.frescas) || 0) + (Number(rep.muertas) || 0);
  }

  onSubmit() {
    const germinacionData: any = {
      comentarios: this.comentarios,
      numSemillas: this.numSemillas,
      metodo: this.metodo,
      temperatura: this.temperatura,
      preFrio: this.preFrio,
      preTratamiento: this.preTratamiento,
      productoDosis: this.productoDosis,
      tratamientoSemillas: this.tratamientoSemillas,
      fechas: this.fechas,
      inia: this.inia,
      inase: this.inase,
      repeticiones: this.repeticiones
    };
    if (this.isEditing && this.editingId) {
      // Actualizar Germinación existente
      console.log('Actualizando Germinación ID:', this.editingId, 'con datos:', germinacionData);
    } else {
      // Crear nueva Germinación
      console.log('Creando nueva Germinación:', germinacionData);
    }
    // Navegar de vuelta al listado
    this.router.navigate(['/listado-germinacion']);
  }

  onCancel() {
    // Navegar de vuelta al listado
    this.router.navigate(['/listado-germinacion']);
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';

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
  MultiSelectModule,
  TableModule
  ],
  templateUrl: './germinacion.component.html',
  styleUrl: './germinacion.component.scss'
})
export class GerminacionComponent implements OnInit {
  inia = { pNormales: 0, pAnormales: 0, duras: 0, frescas: 0, muertas: 0, germinacion: 0 };
  inase = { pNormales: 0, pAnormales: 0, duras: 0, frescas: 0, muertas: 0, germinacion: 0 };
  repeticiones: RepeticionGerminacion[] = [];
  private tratamientoSemillasAnterior: string = 'sin curar';
  onTratamientoChange(): void {
    // Guardar datos del tratamiento anterior
    if (this.tratamientoSemillasAnterior && this.tratamientoSemillasAnterior !== '') {
      this.tratamientosData[this.tratamientoSemillasAnterior] = {
        comentarios: this.comentarios,
        numSemillas: this.numSemillas,
        metodo: this.metodo,
        temperatura: this.temperatura,
        preFrio: this.preFrio,
        preTratamiento: this.preTratamiento,
        productoDosis: this.productoDosis,
        fechas: {
          inicio: this.fechas.inicio,
          conteos: [...this.fechas.conteos],
          get totalDias() {
            const fechasConteo = this.conteos.filter((f: string) => !!f);
            if (!this.inicio || fechasConteo.length === 0) return '';
            const inicio = new Date(this.inicio);
            const ultima = new Date(fechasConteo[fechasConteo.length - 1]);
            if (isNaN(inicio.getTime()) || isNaN(ultima.getTime())) return '';
            const diff = Math.ceil((ultima.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
            return diff >= 0 ? diff : '';
          }
        },
        inia: {...this.inia},
        inase: {...this.inase},
        repeticiones: JSON.parse(JSON.stringify(this.repeticiones)),
      };
    }
    // Cargar datos del tratamiento seleccionado
    const data = this.tratamientosData[this.tratamientoSemillas];
    if (data) {
      this.comentarios = data.comentarios;
      this.numSemillas = data.numSemillas;
      this.metodo = data.metodo;
      this.temperatura = data.temperatura;
      this.preFrio = data.preFrio;
      this.preTratamiento = data.preTratamiento;
      this.productoDosis = data.productoDosis;
      this.fechas = {
        inicio: data.fechas.inicio,
        conteos: [...data.fechas.conteos],
        get totalDias() {
          const fechasConteo = this.conteos.filter((f: string) => !!f);
          if (!this.inicio || fechasConteo.length === 0) return '';
          const inicio = new Date(this.inicio);
          const ultima = new Date(fechasConteo[fechasConteo.length - 1]);
          if (isNaN(inicio.getTime()) || isNaN(ultima.getTime())) return '';
          const diff = Math.ceil((ultima.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
          return diff >= 0 ? diff : '';
        }
      };
      this.inia = {...data.inia};
      this.inase = {...data.inase};
      this.repeticiones = JSON.parse(JSON.stringify(data.repeticiones));
    } else {
      // Si no hay datos, inicializar
      this.comentarios = '';
      this.numSemillas = '';
      this.metodo = '';
      this.temperatura = '';
      this.preFrio = '';
      this.preTratamiento = '';
      this.productoDosis = '';
      this.fechas = {
        inicio: '',
        conteos: [''],
        get totalDias() {
          const fechasConteo = this.conteos.filter((f: string) => !!f);
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
    this.syncNormalesConConteos();
    // Actualizar el valor anterior
    this.tratamientoSemillasAnterior = this.tratamientoSemillas;
  }
  // Promedio global de normales (sin redondeo)
  getPromedioNormalesGlobal(): number {
    let total = 0;
    let count = 0;
    this.repeticiones.forEach(rep => {
      rep.normales.forEach(val => {
        total += val;
        count++;
      });
    });
    return count > 0 ? total / count : 0;
  }
  // Promedios manuales
  promedioManualNormales: number[] = [];
  promedioManualAnormales: number = 0;
  promedioManualDuras: number = 0;
  promedioManualFrescas: number = 0;
  promedioManualMuertas: number = 0;
  promedioManualTotal: number = 0;

  // Métodos para promedios redondeados
  getPromedioNormalesRedondeado(n: number): number {
    return Math.round(this.getPromedioNormales(n));
  }
  getPromedioAnormalesRedondeado(): number {
    return Math.round(this.getPromedioAnormales());
  }
  getPromedioDurasRedondeado(): number {
    return Math.round(this.getPromedioDuras());
  }
  getPromedioFrescasRedondeado(): number {
    return Math.round(this.getPromedioFrescas());
  }
  getPromedioMuertasRedondeado(): number {
    return Math.round(this.getPromedioMuertas());
  }
  getPromedioTotalRedondeado(): number {
    return Math.round(this.getPromedioTotal());
  }
  // Sincroniza el tamaño del array normales en cada repetición con la cantidad de conteos
  syncNormalesConConteos() {
    // Sincronizar array de promedios manuales
    while (this.promedioManualNormales.length < this.fechas.conteos.length) {
      this.promedioManualNormales.push(0);
    }
    while (this.promedioManualNormales.length > this.fechas.conteos.length) {
      this.promedioManualNormales.pop();
    }
    const conteosLength = this.fechas.conteos.length;
    this.repeticiones.forEach(rep => {
      while (rep.normales.length < conteosLength) {
        rep.normales.push(0);
      }
      while (rep.normales.length > conteosLength) {
        rep.normales.pop();
      }
    });
  }

  // Variables para manejar navegación
  isEditing: boolean = false;
  editingId: number | null = null;

  diasPreFrio: string[] = Array.from({length: 13}, (_, i) => `${i+3} dias`); // 3 a 15 días
  tratamientoSemillas: string = 'sin curar';

  // Estructura para almacenar los datos por tratamiento
  tratamientosData: {[key: string]: {
    comentarios: string;
    numSemillas: string;
    metodo: string;
    temperatura: string;
    preFrio: string;
    preTratamiento: string;
    productoDosis: string;
    fechas: any;
    inia: any;
    inase: any;
    repeticiones: RepeticionGerminacion[];
  }} = {};

  // Variables actuales (se actualizan según el tratamiento seleccionado)
  comentarios: string = '';
  numSemillas: string = '';
  metodo: string = '';
  temperatura: string = '';
  preFrio: string = '';
  preTratamiento: string = '';
  productoDosis: string = '';
  fechas = {
    inicio: '',
    conteos: [''],
    get totalDias() {
      const fechasConteo = this.conteos.filter(f => !!f);
      if (!this.inicio || fechasConteo.length === 0) return '';
      const inicio = new Date(this.inicio);
      const ultima = new Date(fechasConteo[fechasConteo.length - 1]);
      if (isNaN(inicio.getTime()) || isNaN(ultima.getTime())) return '';
      const diff = Math.ceil((ultima.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0 ? diff : '';
    }
  };
  // Las variables actuales ya están declaradas arriba, eliminamos duplicados
    // Fecha de salida de pre-frío calculada
    get fechaSalidaPreFrio(): string {
      if (!this.fechas.inicio || this.preFrio === 'No') return '';
      const diasMatch = this.preFrio.match(/(\d+)/);
      const dias = diasMatch ? parseInt(diasMatch[1], 10) : 0;
      if (dias === 0) return '';
      const fechaInicio = new Date(this.fechas.inicio);
      if (isNaN(fechaInicio.getTime())) return '';
      fechaInicio.setDate(fechaInicio.getDate() + dias + 1);
      const dd = String(fechaInicio.getDate()).padStart(2, '0');
      const mm = String(fechaInicio.getMonth() + 1).padStart(2, '0');
      const yyyy = fechaInicio.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    }

      // N° de Dias: suma de totalDias y días de pre-frío
      get numeroDias(): number {
        const totalDias = Number(this.fechas.totalDias) || 0;
        if (!this.preFrio || this.preFrio === 'No') return totalDias;
        const diasMatch = this.preFrio.match(/(\d+)/);
        const diasPreFrio = diasMatch ? parseInt(diasMatch[1], 10) : 0;
        return totalDias + diasPreFrio;
      }

  addConteo() {
  this.fechas.conteos.push('');
  this.syncNormalesConConteos();
  }

  removeConteo(index: number) {
    if (this.fechas.conteos.length > 1) {
      this.fechas.conteos.splice(index, 1);
      this.syncNormalesConConteos();
    }
  }

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
    conteos: ['2023-01-16', '2023-01-17']
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
    // Inicializar datos para el tratamiento inicial
    this.onTratamientoChange();
  }

  ngOnInit() {
    this.syncNormalesConConteos();
    this.onTratamientoChange();
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
  this.syncNormalesConConteos();
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
  this.syncNormalesConConteos();
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
      conteos: [''],
      get totalDias() {
        const fechasConteo = this.conteos.filter(f => !!f);
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

import { Component } from '@angular/core';
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
export class GerminacionComponent {

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
      // Buscar la última fecha de conteo ingresada
      const fechasConteo = [this.primerConteo, this.segundoConteo, this.tercerConteo, this.cuartoConteo, this.quintoConteo]
        .filter(f => !!f);
      if (!this.inicio || fechasConteo.length === 0) return '';
      const inicio = new Date(this.inicio);
      const ultima = new Date(fechasConteo[fechasConteo.length - 1]);
      if (isNaN(inicio.getTime()) || isNaN(ultima.getTime())) return '';
      const diff = Math.ceil((ultima.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0 ? diff : '';
    }
  };

  inia = {
    pNormales: 0,
    pAnormales: 0,
    duras: 0,
    frescas: 0,
    muertas: 0,
    germinacion: 0
  };

  inase = {
    pNormales: 0,
    pAnormales: 0,
    duras: 0,
    frescas: 0,
    muertas: 0,
    germinacion: 0
  };

  // Promedios de cada columna
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

  repeticiones: RepeticionGerminacion[] = [];

  constructor() {
    // Inicializar con 1 repetición por defecto
    this.repeticiones.push(this.nuevaRepeticion(1));
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
      // Re-enumerar
      this.repeticiones.forEach((r, i) => r.numero = i + 1);
    }
  }

  getTotal(rep: RepeticionGerminacion): number {
    const sumaNormales = rep.normales.reduce((a, b) => a + (Number(b) || 0), 0);
    return sumaNormales + (Number(rep.anormales) || 0) + (Number(rep.duras) || 0) + (Number(rep.frescas) || 0) + (Number(rep.muertas) || 0);
  }

}

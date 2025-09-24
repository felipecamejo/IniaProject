import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-pureza-p-notatum',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    MultiSelectModule
  ],
  templateUrl: './pureza-p-notatum.component.html',
  styleUrl: './pureza-p-notatum.component.scss'
})
export class PurezaPNotatumComponent {
  fecha: string = '';
  pesoInicialGr: number = 0;
  pesoInicialPct: number = 0;
  semillaPuraGr: number = 0;
  semillaPuraPct: number = 0;
  semillaCultivosGr: number = 0;
  semillaCultivosPct: number = 0;
  semillaMalezasGr: number = 0;
  semillaMalezasPct: number = 0;
  materiaInerteGr: number = 0;
  materiaInertePct: number = 0;
  pesoFinalGr: number = 0;
  pesoFinalPct: number = 0;

  // Tabla de examen de semillas pura por corte
  repeticiones: Array<{
    numero: number;
    semillasPuras: number;
    pesoSemillasPuras: number;
    semillasSanasCantidad: number;
    semillasSanasPeso: number;
    semillasContaminadasCantidad: number;
    semillasContaminadasPeso: number;
    controlPesos: number;
  }> = [
    {
      numero: 1,
      semillasPuras: 0,
      pesoSemillasPuras: 0,
      semillasSanasCantidad: 0,
      semillasSanasPeso: 0,
      semillasContaminadasCantidad: 0,
      semillasContaminadasPeso: 0,
      controlPesos: 0
    }
  ];

  agregarRepeticion() {
    const nextNum = this.repeticiones.length + 1;
    this.repeticiones.push({
      numero: nextNum,
      semillasPuras: 0,
      pesoSemillasPuras: 0,
      semillasSanasCantidad: 0,
      semillasSanasPeso: 0,
      semillasContaminadasCantidad: 0,
      semillasContaminadasPeso: 0,
      controlPesos: 0
    });
  }

  eliminarRepeticion(idx: number) {
    if (this.repeticiones.length > 1) {
      this.repeticiones.splice(idx, 1);
      // Renumerar
      this.repeticiones.forEach((r, i) => r.numero = i + 1);
    }
  }
}

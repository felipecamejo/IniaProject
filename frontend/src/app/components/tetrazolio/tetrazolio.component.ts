// Estructura para la nueva tabla de detalle
interface DetalleCategoria {
  total: number;
  mecanico: number;
  ambiente: number;
  chinches: number;
  fracturas: number;
  otros: number;
  duras: number;
}

interface DetalleSemillas {
  viablesSinDefectos: DetalleCategoria;
  viablesLeves: DetalleCategoria;
  viablesModerados: DetalleCategoria;
  viablesSeveros: DetalleCategoria;
  noViables: DetalleCategoria;
}
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';

export interface RepeticionTetrazolio {
  numero: number;
  viables: number;
  noViables: number;
  duras: number;
}

@Component({
  selector: 'app-tetrazolio.component',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    MultiSelectModule
  ],
  templateUrl: './tetrazolio.component.html',
  styleUrl: './tetrazolio.component.scss'
})
export class TetrazolioComponent {
  repeticiones: RepeticionTetrazolio[] = [
    { numero: 1, viables: 0, noViables: 0, duras: 0 }
  ];

  detalle: DetalleSemillas = {
    viablesSinDefectos: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
    viablesLeves: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
    viablesModerados: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
    viablesSeveros: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 },
    noViables: { total: 0, mecanico: 0, ambiente: 0, chinches: 0, fracturas: 0, otros: 0, duras: 0 }
  };

  // Suma de N° de semillas (todas las filas)
  getSumaTotal(): number {
    return this.detalle.viablesSinDefectos.total + this.detalle.viablesLeves.total +
      this.detalle.viablesModerados.total + this.detalle.viablesSeveros.total +
      this.detalle.noViables.total;
  }

  // Semillas viables: suma de todas las filas menos no viables
  getSemillasViablesTotal(): number {
    return this.detalle.viablesSinDefectos.total + this.detalle.viablesLeves.total +
      this.detalle.viablesModerados.total + this.detalle.viablesSeveros.total;
  }

  // Semillas viables por columna de daño
  getSemillasViables(col: keyof DetalleCategoria): number {
    return (this.detalle.viablesSinDefectos[col] || 0) +
      (this.detalle.viablesLeves[col] || 0) +
      (this.detalle.viablesModerados[col] || 0) +
      (this.detalle.viablesSeveros[col] || 0);
  }

  agregarRepeticion() {
    this.repeticiones.push({
      numero: this.repeticiones.length + 1,
      viables: 0,
      noViables: 0,
      duras: 0
    });
  }

  eliminarRepeticion(index: number) {
    if (this.repeticiones.length > 1) {
      this.repeticiones.splice(index, 1);
      // Re-enumerar
      this.repeticiones.forEach((r, i) => r.numero = i + 1);
    }
  }

  getTotalViables(): number {
    return this.repeticiones.reduce((acc, rep) => acc + (Number(rep.viables) || 0), 0);
  }
  getTotalNoViables(): number {
    return this.repeticiones.reduce((acc, rep) => acc + (Number(rep.noViables) || 0), 0);
  }
  getTotalDuras(): number {
    return this.repeticiones.reduce((acc, rep) => acc + (Number(rep.duras) || 0), 0);
  }

  getPromedioViables(redondear: boolean): number {
    const prom = this.getTotalViables() / this.repeticiones.length;
    return redondear ? Math.round(prom) : Number(prom.toFixed(2));
  }
  getPromedioNoViables(redondear: boolean): number {
    const prom = this.getTotalNoViables() / this.repeticiones.length;
    return redondear ? Math.round(prom) : Number(prom.toFixed(2));
  }
  getPromedioDuras(redondear: boolean): number {
    const prom = this.getTotalDuras() / this.repeticiones.length;
    return redondear ? Math.round(prom) : Number(prom.toFixed(2));
  }
}

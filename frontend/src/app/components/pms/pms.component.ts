import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-pms',
  imports: [
      CommonModule,
      FormsModule,
      CardModule,
      InputTextModule,
      InputNumberModule,
      ButtonModule
  ],
  templateUrl: './pms.component.html',
  styleUrls: ['./pms.component.scss']
})

export class PmsComponent {
    metodos = [
      { label: 'Metodo A', id: 1 },
      { label: 'Metodo B', id: 2 },
      { label: 'Metodo C', id: 3 }
    ];

    selectedMetodo: string = '';

    // Campos de texto simples
    nLab: number = 0;
    especie: number = 0;
    ficha: string = '';
    fechaMedicion: string = '';
    observaciones: string = '';
}

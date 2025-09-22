import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
export class ReciboComponent {
  // Dropdown options
  cultivares = [
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
}
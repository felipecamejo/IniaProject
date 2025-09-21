import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
    { label: 'Cultivar A', value: 'A' },
    { label: 'Cultivar B', value: 'B' },
    { label: 'Cultivar C', value: 'C' }
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
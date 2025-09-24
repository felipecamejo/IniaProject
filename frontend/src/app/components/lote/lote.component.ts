import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoteDto } from '../../../models/Lote.dto';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-lote',
  imports: [
      CommonModule,
      FormsModule,
      CardModule,
      InputTextModule,
      InputNumberModule,
      ButtonModule
  ],
  templateUrl: './lote.component.html',
  styleUrls: ['./lote.component.scss']
})

export class LoteComponent {
    metodos = [
      { label: 'Metodo A', id: 1 },
      { label: 'Metodo B', id: 2 },
      { label: 'Metodo C', id: 3 }
    ];

    selectedMetodo: string = '';

    nombre: string = '';
    descripcion: string = '';
    

    createLote() {

      const lote: LoteDto = {
        id: null,
        nombre: this.nombre,
        descripcion: this.descripcion,
        fechaCreacion: new Date(),
        fechaFinalizacion: null,
        usuarios: [],
        recibos: [],
        activo: true
      };

      console.log('Crear nuevo lote', lote);
    }
  }

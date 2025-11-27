import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoteDto } from '../../../models/Lote.dto';
import { LoteService } from '../../../services/LoteService';
import { loteCategoria } from '../../../models/Lote.dto';

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
  categoriaOpciones: loteCategoria[] = [
    loteCategoria.P,
    loteCategoria.FT,
    loteCategoria.M,
    loteCategoria.B,
    loteCategoria.PB,
    loteCategoria.C1,
    loteCategoria.C2,
    loteCategoria.CO
  ];


    nombre: string = '';
    descripcion: string = '';
    selectedCategoria: loteCategoria | null = null;


    constructor(
      private loteService: LoteService,
      private router: Router,
    ) {}

    createLote() {

      const lote: LoteDto = {
        id: null,
        nombre: this.nombre,
        descripcion: this.descripcion,
        fechaCreacion: new Date().toISOString(),
        fechaFinalizacion: null,
        usuariosId: [],
        activo: true,
        categoria: this.selectedCategoria || null
      };

      this.loteService.crearLote(lote).subscribe({
        next: (response) => {
          console.log('Respuesta del backend:', response);
          
          // Extraer el ID del mensaje del backend
          // El backend retorna: "Lote creado correctamente ID:123"
          let loteId: number | null = null;
          if (response) {
            const match = response.match(/ID:(\d+)/);
            if (match && match[1]) {
              loteId = parseInt(match[1], 10);
            }
          }
          
          if (loteId) {
            console.log('Lote ID extraído:', loteId);
            // Navegar a lote-analisis sin reciboId (se creará uno nuevo)
            this.router.navigate([`/${loteId}/lote-analisis`]);
          } else {
            console.error('No se pudo extraer el ID del lote de la respuesta:', response);
            alert('Error: No se pudo obtener el ID del lote creado. Por favor, verifica el listado de lotes.');
            this.router.navigate(['/listado-lotes']);
          }
        },
        error: (err) => {
          console.error('Error creando lote', err);
          alert('Error al crear el lote. Por favor, intenta nuevamente.');
        }
      });
    }
  }

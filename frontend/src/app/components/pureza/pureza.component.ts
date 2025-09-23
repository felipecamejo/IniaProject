import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-pureza.component',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    MultiSelectModule],
  templateUrl: './pureza.component.html',
  styleUrl: './pureza.component.scss'
})
export class PurezaComponent {
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

  // Campos para formulario de pureza
  fecha: string = '';
  pesoInicialGr: number = 0;
  pesoInicialPct: number = 0;
  semillaPuraGr: number = 0;
  semillaPuraPct: number = 0;
  materiaInerteGr: number = 0;
  materiaInertePct: number = 0;
  otrosCultivosGr: number = 0;
  otrosCultivosPct: number = 0;
  malezasGr: number = 0;
  malezasPct: number = 0;
  malezasToleradasGr: number = 0;
  malezasToleradasPct: number = 0;
  pesoTotalGr: number = 0;
  pesoTotalPct: number = 0;
  fechaEstandar: string = '';
  estandar: boolean = false;

  // Listados (select múltiple)
  malezasCero: string[] = [];
  malezasComunes: string[] = [];
  malezasTol: string[] = [];
  otrosCultivosListado: string[] = [];

  // Variables auxiliares para selects dinámicos
  malezaCeroSeleccionada: { id: string, label: string } | null = null;
  malezaComunSeleccionada: { id: string, label: string } | null = null;
  malezaTolSeleccionada: { id: string, label: string } | null = null;
  cultivoSeleccionado: { id: string, label: string } | null = null;

  agregarMalezaCero() {
    if (this.malezaCeroSeleccionada && !this.malezasCero.includes(this.malezaCeroSeleccionada.id)) {
      this.malezasCero.push(this.malezaCeroSeleccionada.id);
      this.malezaCeroSeleccionada = null;
    }
  }
  eliminarMalezaCero(idx: number) {
    this.malezasCero.splice(idx, 1);
  }

  agregarMalezaComun() {
    if (this.malezaComunSeleccionada && !this.malezasComunes.includes(this.malezaComunSeleccionada.id)) {
      this.malezasComunes.push(this.malezaComunSeleccionada.id);
      this.malezaComunSeleccionada = null;
    }
  }
  eliminarMalezaComun(idx: number) {
    this.malezasComunes.splice(idx, 1);
  }

  agregarMalezaTol() {
    if (this.malezaTolSeleccionada && !this.malezasTol.includes(this.malezaTolSeleccionada.id)) {
      this.malezasTol.push(this.malezaTolSeleccionada.id);
      this.malezaTolSeleccionada = null;
    }
  }
  eliminarMalezaTol(idx: number) {
    this.malezasTol.splice(idx, 1);
  }

  agregarCultivo() {
    if (this.cultivoSeleccionado && !this.otrosCultivosListado.includes(this.cultivoSeleccionado.id)) {
      this.otrosCultivosListado.push(this.cultivoSeleccionado.id);
      this.cultivoSeleccionado = null;
    }
  }
  eliminarCultivo(idx: number) {
    this.otrosCultivosListado.splice(idx, 1);
  }

  obtenerLabel(id: string, lista: { id: string, label: string }[]): string {
    const found = lista.find(x => x.id === id);
    return found ? found.label : id;
  }

  // Opciones para los listados
  malezasCeroList = [
    { id: 'm1', label: 'Amaranthus retroflexus' },
    { id: 'm2', label: 'Sorghum halepense' },
    { id: 'm3', label: 'Cuscuta spp.' },
    { id: 'm4', label: 'Orobanche spp.' }
  ];
  malezasComunesList = [
    { id: 'mc1', label: 'Chenopodium album' },
    { id: 'mc2', label: 'Echinochloa crus-galli' },
    { id: 'mc3', label: 'Polygonum aviculare' }
  ];
  malezasTolList = [
    { id: 'mt1', label: 'Lolium perenne' },
    { id: 'mt2', label: 'Poa annua' },
    { id: 'mt3', label: 'Setaria viridis' }
  ];
  otrosCultivosList = [
    { id: 'oc1', label: 'Trigo' },
    { id: 'oc2', label: 'Cebada' },
    { id: 'oc3', label: 'Avena' },
    { id: 'oc4', label: 'Maíz' }
  ];

}
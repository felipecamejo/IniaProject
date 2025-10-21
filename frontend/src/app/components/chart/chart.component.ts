import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [
    CommonModule,
    CardModule
  ],
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {
  
  constructor() { }

  ngOnInit(): void {
    // Inicialización del componente
  }
}

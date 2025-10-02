

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil.component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent {
  nombre: string = 'Renzo';
  apellido: string = 'Gomez';
  mail: string = 'renzo@inia.com';
  telefono: string = '123456789';
  rol: string = 'Analista';
  imagenPreview: string | ArrayBuffer | null = null;
  modalAbierto: boolean = false;

  abrirModal() {
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  cambiarImagen(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenPreview = e.target && (e.target.result as string | ArrayBuffer | null);
      };
      reader.readAsDataURL(file);
    }
  }

  guardarCambios() {
    // Aquí iría la lógica para guardar los datos modificados
    this.cerrarModal();
  }
}

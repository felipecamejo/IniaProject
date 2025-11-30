import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PMSService } from '../../../services/PMSService';
import { GramosPmsService } from '../../../services/GramosPmsService';
import { GramosPmsDto } from '../../../models/GramosPms.dto';
import { PMSDto } from '../../../models/PMS.dto';
import { DateService } from '../../../services/DateService';
import { LogService } from '../../../services/LogService';
import { AuthService } from '../../../services/AuthService';

// PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';

// Interface para manejar las repeticiones en PMS
export interface RepeticionPMS {
  numero: number;
  gramos: number;
}

@Component({
  selector: 'app-pms',
  imports: [
      CommonModule,
      FormsModule,
      CardModule,
      InputTextModule,
      ButtonModule,
      InputNumberModule,
      TableModule,
  ],
  templateUrl: './pms.component.html',
  styleUrls: ['./pms.component.scss']
})

export class PmsComponent implements OnInit {
    isEditing: boolean = false;
    isViewing: boolean = false;
    editingId: number | null = null;

    
    loteId: string | null = '';
    reciboId: string | null = '';

    // Tabla de repeticiones PMS
    repeticiones: RepeticionPMS[] = [];
    
    // Constantes para repeticiones
    readonly REPETICIONES_INICIALES = 8;
    readonly REPETICIONES_EXTENDIDAS = 16;
    readonly CV_UMBRAL = 4.0; // Valor umbral del coeficiente de variación
    
    // Control de alerta CV
    mostrarAlertaCV: boolean = false;

    // Mantener ids de GramosPms (si existen) para edición
    gramosEntries: GramosPmsDto[] = [];
    // IDs de gramos marcados para eliminación en edición
    deletedGramosIds: number[] = [];

    // Campos del nuevo DTO
    gramosPorRepeticiones: number[] = [];
    pesoPromedioCienSemillas: number | null = null;
    pesoMilSemillas: number | null = null;
    pesoPromedioMilSemillas: number | null = null;
    desvioEstandar: number | null = null;
    coeficienteVariacion: number | null = null;
    comentarios: string = '';
    activo: boolean = true;
    repetido: boolean = false;
    estandar: boolean = false;
    fechaCreacion: string | null = null;


    // Variables para controlar si ya está marcado (no se puede cambiar)
    estandarOriginal: boolean = false;
    repetidoOriginal: boolean = false;

    // Getters para deshabilitar checkboxes si ya están marcados
    get estandarDeshabilitado(): boolean {
      return this.estandarOriginal;
    }

    get repetidoDeshabilitado(): boolean {
      return this.repetidoOriginal;
    }

    // Getter para verificar si el usuario es admin
    get isAdmin(): boolean {
      return this.authService.isAdmin();
    }

    // Métodos para hacer checkboxes mutuamente excluyentes con confirmación
    onEstandarChange() {
      // Si ya estaba marcado como estándar, no permitir cambiar
      if (this.estandarOriginal) {
        this.estandar = true; // Revertir
        return;
      }

      // Si está intentando marcar como estándar y ya está marcado como repetido
      if (this.estandar && this.repetido) {
        this.repetido = false;
        this.repetidoOriginal = false;
      }

      // Si está intentando marcar como estándar, mostrar confirmación con alert
      if (this.estandar) {
        const confirmar = confirm('¿Estás seguro de que deseas marcar este análisis como estándar? Una vez marcado, no podrás cambiarlo.');
        if (!confirmar) {
          // Revertir el cambio si no se confirma
          this.estandar = false;
          return;
        }
        // Confirmar el cambio
        this.repetido = false;
        this.estandarOriginal = true; // Marcar como original para que no se pueda cambiar
        this.repetidoOriginal = false;
      }
    }

    onRepetidoChange() {
      // Si ya estaba marcado como repetido, no permitir cambiar
      if (this.repetidoOriginal) {
        this.repetido = true; // Revertir
        return;
      }

      // Si está intentando marcar como repetido y ya está marcado como estándar
      if (this.repetido && this.estandar) {
        this.estandar = false;
        this.estandarOriginal = false;
      }

      // Si está intentando marcar como repetido, mostrar confirmación con alert
      if (this.repetido) {
        const confirmar = confirm('¿Estás seguro de que deseas marcar este análisis como repetido? Una vez marcado, no podrás cambiarlo.');
        if (!confirmar) {
          // Revertir el cambio si no se confirma
          this.repetido = false;
          return;
        }
        // Confirmar el cambio
        this.estandar = false;
        this.repetidoOriginal = true; // Marcar como original para que no se pueda cambiar
        this.estandarOriginal = false;
      }
    }
    fechaRepeticion: string | null = null;

    fechaMedicion: string = '';
    selectedMetodo: string = '';

    // Agregar propiedades para manejar errores
    errores: string[] = [];

    isSaving: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pmsService: PMSService,
    private gramosPmsService: GramosPmsService,
    private logService: LogService,
    private authService: AuthService
  ) {}

    ngOnInit() {

        this.route.params.subscribe(params => {
            if (params['id']) {
                this.editingId = parseInt(params['id']);
                // Verificar si es modo visualización por query parameter
                this.route.queryParams.subscribe(queryParams => {
                    this.isViewing = queryParams['view'] === 'true';
                    this.isEditing = !this.isViewing;
                });
        // Cargar los datos reales desde el servicio
        if (this.editingId) {
          this.pmsService.obtener(this.editingId).subscribe({
            next: (data: PMSDto) => {
              console.log('PMS obtenido para editar:', data);
              // Mapear los campos del DTO al formulario local (campos en PMSDto)
              this.pesoMilSemillas = data.pesoMilSemillas;
              this.pesoPromedioMilSemillas = data.pesoPromedioMilSemillas;
              this.comentarios = data.comentarios || '';
              this.activo = data.activo ?? true;
              this.repetido = data.repetido ?? false;
              this.estandar = data.estandar ?? false;
              // Guardar valores originales para deshabilitar checkboxes si ya están marcados
              this.estandarOriginal = data.estandar ?? false;
              this.repetidoOriginal = data.repetido ?? false;
              this.fechaMedicion = data.fechaMedicion ? data.fechaMedicion.split('T')[0] : '';
              this.reciboId = this.route.snapshot.params['reciboId'];
              this.fechaCreacion = data.fechaCreacion || null;
              this.fechaRepeticion = data.fechaRepeticion || null;
              // Cargar los gramos asociados a este PMS (entidad separada)
              this.gramosPmsService.listarGramosPorPms(this.editingId!).subscribe({
                next: (grams: GramosPmsDto[]) => {
                  console.log('Gramos cargados para edición:', grams);
                  if (grams && grams.length > 0) {
                    this.gramosEntries = grams.map((g, index) => ({ 
                      id: g.id ?? null, 
                      pmsId: g.pmsId ?? null,
                      gramos: g.gramos ?? 0, 
                      activo: g.activo ?? true
                    } as GramosPmsDto));
                    this.repeticiones = this.gramosEntries.map((g, index) => ({ numero: index + 1, gramos: g.gramos! }));
                    console.log('Gramos del backend:', grams);
                    console.log('GramosEntries mapeados:', this.gramosEntries);
                    console.log('Repeticiones mapeadas:', this.repeticiones);
                    
                    // Calcular automáticamente el desvío estándar y el coeficiente de variación
                    this.desvioEstandar = this.calcularDesvioEstandar();
                    this.coeficienteVariacion = this.calcularCoeficienteVariacion();
                    
                    // Verificar y ajustar repeticiones según el coeficiente de variación
                    this.verificarCoeficienteVariacion();
                  } else {
                    // fallback a lo local si no hay registros - inicializar con 8 repeticiones
                    this.inicializarRepeticiones(this.REPETICIONES_INICIALES);
                  }
                },
                error: (err) => {
                  console.error('Error cargando gramos PMS:', err);
                  // Inicializar con 8 repeticiones en caso de error
                  this.inicializarRepeticiones(this.REPETICIONES_INICIALES);
                }
              });
            },
            error: (err) => {
              console.error('Error obteniendo PMS:', err);
              // Podrías navegar al listado o mostrar mensaje
            }
          });
        }
            } else {
                this.isEditing = false;
                this.isViewing = false;
                this.editingId = null;
                this.limpiarCampos();
                // Inicializar con 8 repeticiones para nuevo PMS
                this.inicializarRepeticiones(this.REPETICIONES_INICIALES);
            }
        });
    }

    // Getter para determinar si está en modo readonly
    get isReadonly(): boolean {
        return this.isViewing;
    }

    // Inicializar repeticiones con cantidad especificada
    inicializarRepeticiones(cantidad: number) {
        this.repeticiones = [];
        this.gramosEntries = [];
        for (let i = 0; i < cantidad; i++) {
            this.repeticiones.push({
                numero: i + 1,
                gramos: 0
            });
            this.gramosEntries.push({ 
                id: null, 
                pmsId: null, 
                gramos: 0, 
                activo: true
            } as GramosPmsDto);
        }
        console.log(`Inicializadas ${cantidad} repeticiones`);
    }

    // Métodos para manejar las repeticiones
    agregarRepeticion() {
        const nuevoNumero = this.repeticiones.length + 1;
        this.repeticiones.push({
            numero: nuevoNumero,
            gramos: 0
        });
        this.gramosEntries.push({ 
            id: null, 
            pmsId: null, 
            gramos: 0, 
            activo: true
        } as GramosPmsDto);
        console.log('Repetición agregada. Total repeticiones:', this.repeticiones.length);
    }

    // Método para sincronizar cambios de gramos desde el input
    onGramosChange(index: number, value: any) {
        const numericValue = parseFloat(value) || 0;
        console.log(`Cambiando gramos en índice ${index} a valor ${numericValue}`);
        
        // Actualizar tanto repeticiones como gramosEntries
        if (this.repeticiones[index]) {
            this.repeticiones[index].gramos = numericValue;
        }
        if (this.gramosEntries[index]) {
            this.gramosEntries[index].gramos = numericValue;
            // Los gramosEntries se mantienen sincronizados por índice
        }
        console.log('Repeticiones actualizadas:', this.repeticiones);
        console.log('GramosEntries actualizados (GramosPmsDto[]):', this.gramosEntries);
        
        // Calcular automáticamente el desvío estándar y el coeficiente de variación
        this.desvioEstandar = this.calcularDesvioEstandar();
        this.coeficienteVariacion = this.calcularCoeficienteVariacion();
        
        // Verificar y ajustar repeticiones según el coeficiente de variación
        this.verificarCoeficienteVariacion();
    }
    
    // Método para verificar el coeficiente de variación
    verificarCoeficienteVariacion(): boolean {
        // Calcular CV solo de las primeras 8 repeticiones
        const primeras8 = this.repeticiones.slice(0, this.REPETICIONES_INICIALES);
        
        // Verificar que tengamos al menos 8 repeticiones
        if (primeras8.length === this.REPETICIONES_INICIALES) {
            // Contar cuántas repeticiones tienen valores válidos (> 0)
            const conValores = primeras8.filter(r => r.gramos != null && r.gramos > 0);
            
            // Solo calcular si todas las 8 primeras tienen valores válidos
            if (conValores.length === this.REPETICIONES_INICIALES) {
                // Calcular promedio de las primeras 8
                const sumaPrimeras8 = primeras8.reduce((sum, r) => sum + r.gramos, 0);
                const promedio = sumaPrimeras8 / this.REPETICIONES_INICIALES;
                
                console.log(`Promedio de las primeras 8 repeticiones: ${promedio}`);
                
                if (promedio > 0) {
                    // Calcular desviación estándar de las primeras 8
                    const sumaCuadrados = primeras8.reduce((sum, r) => 
                        sum + Math.pow(r.gramos - promedio, 2), 0);
                    const desviacion = Math.sqrt(sumaCuadrados / (this.REPETICIONES_INICIALES - 1));
                    
                    // Calcular coeficiente de variación
                    const cv = (desviacion / promedio) * 100;
                    
                    console.log(`CV calculado (primeras 8): ${cv}%`);
                    console.log(`CV umbral: ${this.CV_UMBRAL}%`);
                    console.log(`¿CV > umbral?: ${cv > this.CV_UMBRAL}`);
                    
                    // Si el CV es mayor al umbral
                    if (cv > this.CV_UMBRAL) {
                        this.mostrarAlertaCV = true;
                        console.log('✅ Alerta CV activada');
                        
                        // Si aún no tenemos 16 repeticiones, expandir automáticamente
                        if (this.repeticiones.length === this.REPETICIONES_INICIALES) {
                            for (let i = this.REPETICIONES_INICIALES; i < this.REPETICIONES_EXTENDIDAS; i++) {
                                this.repeticiones.push({
                                    numero: i + 1,
                                    gramos: 0
                                });
                                this.gramosEntries.push({ 
                                    id: null, 
                                    pmsId: null, 
                                    gramos: 0, 
                                    activo: true
                                } as GramosPmsDto);
                            }
                            console.log(`🔧 Expandidas automáticamente a ${this.REPETICIONES_EXTENDIDAS} repeticiones debido a CV=${cv}%`);
                        }
                        return true;
                    } else {
                        // CV <= umbral
                        this.mostrarAlertaCV = false;
                        console.log('❌ Alerta CV desactivada');
                        
                        // Si tenemos más de 8 repeticiones, reducir a 8
                        if (this.repeticiones.length > this.REPETICIONES_INICIALES) {
                            // Marcar para eliminación los gramos de las repeticiones extra que tienen ID
                            for (let i = this.REPETICIONES_INICIALES; i < this.gramosEntries.length; i++) {
                                if (this.gramosEntries[i].id !== null) {
                                    this.deletedGramosIds.push(this.gramosEntries[i].id!);
                                }
                            }
                            
                            // Eliminar las repeticiones extra (de la 9 en adelante)
                            this.repeticiones = this.repeticiones.slice(0, this.REPETICIONES_INICIALES);
                            this.gramosEntries = this.gramosEntries.slice(0, this.REPETICIONES_INICIALES);
                            console.log(`🔧 Reducidas a ${this.REPETICIONES_INICIALES} repeticiones debido a CV=${cv}% <= ${this.CV_UMBRAL}%`);
                            console.log(`IDs marcados para eliminación:`, this.deletedGramosIds);
                        }
                        return false;
                    }
                }
            } else {
                console.log(`⏳ Esperando valores válidos: ${conValores.length}/8 repeticiones completadas`);
                
                // Si no se han completado todas las 8 primeras repeticiones pero tenemos más de 8
                // resetear el estado y reducir a 8 (evita que queden repeticiones extra)
                if (this.repeticiones.length > this.REPETICIONES_INICIALES) {
                    this.mostrarAlertaCV = false;
                    
                    // Marcar para eliminación los gramos de las repeticiones extra que tienen ID
                    for (let i = this.REPETICIONES_INICIALES; i < this.gramosEntries.length; i++) {
                        if (this.gramosEntries[i].id !== null) {
                            this.deletedGramosIds.push(this.gramosEntries[i].id!);
                        }
                    }
                    
                    this.repeticiones = this.repeticiones.slice(0, this.REPETICIONES_INICIALES);
                    this.gramosEntries = this.gramosEntries.slice(0, this.REPETICIONES_INICIALES);
                    console.log(`🔧 Reducidas a ${this.REPETICIONES_INICIALES} repeticiones porque las 8 primeras no están completas`);
                }
            }
        }
        
        // Si no se cumplen las condiciones, mantener estado actual
        return this.mostrarAlertaCV;
    }
    
    // Getter para usar en el template
    get debeAlertarCV(): boolean {
        return this.mostrarAlertaCV;
    }

    limpiarCampos() {
      this.repeticiones = [];
      this.gramosPorRepeticiones = [];
      this.gramosEntries = [];
      this.deletedGramosIds = [];
      this.pesoPromedioCienSemillas = null;
      this.pesoMilSemillas = null;
      this.pesoPromedioMilSemillas = null;
      this.desvioEstandar = null;
      this.coeficienteVariacion = null;
      this.comentarios = '';
      this.activo = true;
      this.repetido = false;
      this.estandar = false;
      this.estandarOriginal = false;
      this.repetidoOriginal = false;
      this.reciboId = null;
      this.fechaCreacion = null;
      this.fechaRepeticion = null;
    }

    onSubmit() {
      if (this.isSaving) return;

      // Verificar si hay errores antes de continuar
      if (this.manejarProblemas()) {
        console.error('Errores detectados:', this.errores);
        this.isSaving = false;
        return;
      }

      this.isSaving = true;

      // Convertir repeticiones a array de gramos
      this.gramosPorRepeticiones = this.repeticiones.map(rep => rep.gramos);

      const pmsData: PMSDto = {
        id: this.editingId ?? null,
        gramosPorRepeticiones: this.gramosPorRepeticiones,
        pesoMilSemillas: this.pesoMilSemillas,
        pesoPromedioMilSemillas: this.pesoPromedioMilSemillas,
        comentarios: this.comentarios,
        activo: this.activo,
        repetido: this.repetido,
        reciboId: this.route.snapshot.params['reciboId'] ? Number(this.route.snapshot.params['reciboId']) : null,
        fechaMedicion: this.fechaMedicion ? this.fechaMedicion.split('T')[0] : null,
        fechaCreacion: this.fechaCreacion ? this.fechaCreacion.split('T')[0] : null,
        fechaRepeticion: this.fechaRepeticion ? this.fechaRepeticion.split('T')[0] : null,
        estandar: this.estandar
      };

      console.log("fechaMedicion antes de ajustar:", pmsData.fechaMedicion);
      console.log("fechaCreacion antes de ajustar:", pmsData.fechaCreacion);
      console.log("fechaRepeticion antes de ajustar:", pmsData.fechaRepeticion);

      console.log('📋 PMS DTO:', pmsData);

      if (this.isEditing && this.editingId) {
        this.actualizarPms(pmsData);
      } else {
        this.crearNuevoPms(pmsData);
      }
    }

    private crearNuevoPms(pmsData: PMSDto) {
      pmsData.fechaCreacion = DateService.ajustarFecha(new Date().toISOString().split('T')[0]);
      console.log('Creando nuevo PMS:', pmsData);
      this.pmsService.crear(pmsData).subscribe({
        next: (res) => {
          console.log('PMS creado correctamente:', res);
          // Guardar gramos asociados al PMS
          this.guardarGramos(res);

          if (res != null) {
            const loteId = this.route.snapshot.paramMap.get('loteId');
            this.logService.crearLog(loteId ? parseInt(loteId) : 0, Number(res), 'PMS', 'creado').subscribe();
          }

          this.onCancel();
        },
        error: (err) => {
          console.error('Error creando PMS:', err);
        },
        complete: () => {
          this.isSaving = false;
        }
      });
    }


    private actualizarPms(pmsData: PMSDto) {

      console.log('Actualizando PMS ID:', this.editingId, 'con datos:', pmsData);
      this.pmsService.editar(pmsData).subscribe({
        next: (res) => {
          console.log('PMS actualizado correctamente:', res);
          // Guardar gramos asociados al PMS
          this.guardarGramos(this.editingId!);
          
          const loteId = this.route.snapshot.paramMap.get('loteId');
          this.logService.crearLog(loteId ? parseInt(loteId) : 0, this.editingId!, 'PMS', 'actualizado').subscribe();
          
          this.onCancel();
        },
        error: (err) => {
          console.error('Error actualizando PMS:', err);
        },
        complete: () => {
          this.isSaving = false;
        }
      });
    }

    obtenerRolMasAlto(roles: string[] | string | undefined): string {
      // Si no hay roles, retornar 'Desconocido'
      if (!roles) return 'Desconocido';
        
      // Si es un string, convertir a array
      const rolesArray = Array.isArray(roles) ? roles : [roles];
        
      // Definir jerarquía de roles (de mayor a menor)
      if (rolesArray.includes('ADMIN')) return 'Administrador';
      if (rolesArray.includes('ANALISTA')) return 'Analista';
      if (rolesArray.includes('OBSERVADOR')) return 'Observador';
        
      return 'Desconocido';
    }

    private guardarGramos(pmsId: number) {
      // Preparar el payload solo con los gramos actuales
      // Los gramos eliminados (que están en deletedGramosIds) simplemente no se incluyen
      const gramosPayload = this.gramosEntries.map(entry => ({
        id: entry.id,
        pmsId: pmsId,
        gramos: entry.gramos,
        activo: entry.activo
      }));

      if (this.deletedGramosIds.length > 0) {
        console.log('Gramos eliminados (no se incluyen en el payload):', this.deletedGramosIds);
        // Limpiar la lista después de procesarla
        this.deletedGramosIds = [];
      }

      // Crear o recrear todos los gramos asociados al PMS
      this.gramosPmsService.crearMultiplesGramos(gramosPayload).subscribe({
        next: () => console.log('Gramos guardados correctamente para el PMS:', pmsId),
        error: (error: any) => console.error('Error guardando gramos para el PMS:', error)
      });
    }

    manejarProblemas(): boolean {
      this.errores = []; // Reiniciar errores

      const hoy = new Date();
      const fecha = this.fechaMedicion ? new Date(this.fechaMedicion) : null;

      if (this.pesoMilSemillas != null && this.pesoMilSemillas < 0) {
        this.errores.push('El peso de mil semillas no puede ser un número negativo.');
      }

      if (this.pesoPromedioMilSemillas != null && this.pesoPromedioMilSemillas < 0) {
        this.errores.push('El peso promedio de mil semillas no puede ser un número negativo.');
      }

      if (this.desvioEstandar != null && this.desvioEstandar < 0) {
        this.errores.push('El desvío estándar no puede ser un número negativo.');
      }

      if (this.gramosEntries.some(h => h.gramos != null && h.gramos < 0)) {

        this.errores.push('Algunos hongos tienen un número de gramos negativo.');
      }

      if (fecha != null && fecha > hoy) {
        this.errores.push('La fecha no puede ser mayor a la fecha actual.');
      }

      return this.errores.length > 0;
    }

    onCancel() {
      const loteId = this.route.snapshot.params['loteId'] || this.loteId || 'default-lote-id';
      const reciboId = this.route.snapshot.params['reciboId'] || this.reciboId || 'default-recibo-id';
      console.log('Navigating to listado-pms with:', loteId, reciboId);
      this.router.navigate([loteId, reciboId, 'listado-pms']);
    }

    validarFecha(fecha: string): boolean {
        if (!fecha) return false;
        const selectedDate = new Date(fecha);
        const today = new Date();
        return selectedDate >= today;
    }

    promedioCienSemillas(): number | null {
      const cant = this.repeticiones.length;
      if (cant === 0) return null;
      const gramosTotales = this.repeticiones.reduce((sum, r) => sum + (r.gramos ?? 0), 0);
      return gramosTotales / cant;
    }

    // Calcular el desvío estándar a partir de las repeticiones y el promedio
    calcularDesvioEstandar(): number | null {
      const promedio = this.promedioCienSemillas();
      if (promedio === null || this.repeticiones.length === 0) return null;
      
      // Calcular la suma de las diferencias al cuadrado
      const sumaCuadrados = this.repeticiones.reduce((sum, r) => 
        sum + Math.pow((r.gramos ?? 0) - promedio, 2), 0);
      
      // Desvío estándar (desviación estándar muestral)
      const desvio = Math.sqrt(sumaCuadrados / (this.repeticiones.length - 1));
      
      return desvio;
    }

    // Calcular el coeficiente de variación a partir del desvío estándar y el promedio
    calcularCoeficienteVariacion(): number | null {
      const promedio = this.promedioCienSemillas();
      const desvio = this.calcularDesvioEstandar();
      
      if (promedio === null || desvio === null || promedio === 0) return null;
      
      // Coeficiente de variación: (desvío / promedio) * 100
      const cv = (desvio / promedio) * 100;
      
      return cv;
    }
}

package ti.proyectoinia.api.controllers;

import io.swagger.v3.oas.annotations.Operation;
import lombok.Generated;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.*;
import ti.proyectoinia.business.entities.*;
import ti.proyectoinia.business.repositories.*;
import ti.proyectoinia.services.AutocompletadoService;
import ti.proyectoinia.dtos.AutocompletadoDto;

import java.util.List;

@RestController
@RequestMapping({"api/v1/debug"})
public class DebugController {

    @Generated
    private final DepositoRepository depositoRepository;
    private final CultivoRepository cultivoRepository;
    private final MalezaRepository malezaRepository;
    private final HongoRepository hongoRepository;
    private final MetodoRepository metodoRepository;
    private final AutocompletadoService autocompletadoService;

    public DebugController(DepositoRepository depositoRepository, 
                          CultivoRepository cultivoRepository,
                          MalezaRepository malezaRepository,
                          HongoRepository hongoRepository,
                          MetodoRepository metodoRepository,
                          AutocompletadoService autocompletadoService) {
        this.depositoRepository = depositoRepository;
        this.cultivoRepository = cultivoRepository;
        this.malezaRepository = malezaRepository;
        this.hongoRepository = hongoRepository;
        this.metodoRepository = metodoRepository;
        this.autocompletadoService = autocompletadoService;
    }

    @PostMapping({"/crear-datos-prueba"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Endpoint de debug que crea 5 datos de prueba para cada tipo: Depósitos, Cultivos, Malezas, Hongos y Métodos"
    )
    public ResponseEntity<String> crearDatosPrueba() {
        try {
            StringBuilder resultado = new StringBuilder();
            resultado.append("=== CREANDO DATOS DE PRUEBA ===\n\n");

            // Crear 5 Depósitos
            resultado.append("1. CREANDO DEPÓSITOS:\n");
            for (int i = 1; i <= 5; i++) {
                Deposito deposito = new Deposito();
                deposito.setNombre("Depósito de Prueba " + i);
                deposito.setActivo(true);
                Deposito guardado = depositoRepository.save(deposito);
                resultado.append("   - Depósito creado: ID=").append(guardado.getId())
                        .append(", Nombre=").append(guardado.getNombre()).append("\n");
            }

            // Crear 5 Cultivos
            resultado.append("\n2. CREANDO CULTIVOS:\n");
            for (int i = 1; i <= 5; i++) {
                Cultivo cultivo = new Cultivo();
                cultivo.setNombre("Cultivo de Prueba " + i);
                cultivo.setDescripcion("Descripción del cultivo de prueba " + i);
                cultivo.setActivo(true);
                Cultivo guardado = cultivoRepository.save(cultivo);
                resultado.append("   - Cultivo creado: ID=").append(guardado.getId())
                        .append(", Nombre=").append(guardado.getNombre()).append("\n");
            }

            // Crear 5 Malezas
            resultado.append("\n3. CREANDO MALEZAS:\n");
            for (int i = 1; i <= 5; i++) {
                Maleza maleza = new Maleza();
                maleza.setNombre("Maleza de Prueba " + i);
                maleza.setDescripcion("Descripción de la maleza de prueba " + i);
                maleza.setActivo(true);
                Maleza guardado = malezaRepository.save(maleza);
                resultado.append("   - Maleza creada: ID=").append(guardado.getId())
                        .append(", Nombre=").append(guardado.getNombre()).append("\n");
            }

            // Crear 5 Hongos
            resultado.append("\n4. CREANDO HONGOS:\n");
            for (int i = 1; i <= 5; i++) {
                Hongo hongo = new Hongo();
                hongo.setNombre("Hongo de Prueba " + i);
                hongo.setDescripcion("Descripción del hongo de prueba " + i);
                hongo.setActivo(true);
                Hongo guardado = hongoRepository.save(hongo);
                resultado.append("   - Hongo creado: ID=").append(guardado.getId())
                        .append(", Nombre=").append(guardado.getNombre()).append("\n");
            }

            // Crear 5 Métodos
            resultado.append("\n5. CREANDO MÉTODOS:\n");
            for (int i = 1; i <= 5; i++) {
                Metodo metodo = new Metodo();
                metodo.setNombre("Método de Prueba " + i);
                metodo.setAutor("Autor de Prueba " + i);
                metodo.setDescripcion("Descripción del método de prueba " + i);
                metodo.setActivo(true);
                Metodo guardado = metodoRepository.save(metodo);
                resultado.append("   - Método creado: ID=").append(guardado.getId())
                        .append(", Nombre=").append(guardado.getNombre()).append("\n");
            }

            resultado.append("\n=== DATOS DE PRUEBA CREADOS EXITOSAMENTE ===");
            resultado.append("\nTotal creado: 25 registros (5 de cada tipo)");

            return new ResponseEntity<>(resultado.toString(), HttpStatus.CREATED);

        } catch (Exception e) {
            return new ResponseEntity<>("Error al crear datos de prueba: " + e.getMessage(), 
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping({"/estadisticas"})
    @Secured({"ADMIN", "ANALISTA", "OBSERVADOR"})
    @Operation(
            description = "Endpoint de debug que muestra estadísticas de los datos existentes"
    )
    public ResponseEntity<String> obtenerEstadisticas() {
        try {
            StringBuilder estadisticas = new StringBuilder();
            estadisticas.append("=== ESTADÍSTICAS DE DATOS ===\n\n");

            long totalDepositos = depositoRepository.count();
            long depositosActivos = depositoRepository.findByActivoTrue().size();
            
            long totalCultivos = cultivoRepository.count();
            long cultivosActivos = cultivoRepository.findByActivoTrue().size();
            
            long totalMalezas = malezaRepository.count();
            long malezasActivas = malezaRepository.findByActivoTrue().size();
            
            long totalHongos = hongoRepository.count();
            long hongosActivos = hongoRepository.findByActivoTrue().size();
            
            long totalMetodos = metodoRepository.count();
            long metodosActivos = metodoRepository.findByActivoTrue().size();

            estadisticas.append("DEPÓSITOS:\n");
            estadisticas.append("  - Total: ").append(totalDepositos).append("\n");
            estadisticas.append("  - Activos: ").append(depositosActivos).append("\n\n");

            estadisticas.append("CULTIVOS:\n");
            estadisticas.append("  - Total: ").append(totalCultivos).append("\n");
            estadisticas.append("  - Activos: ").append(cultivosActivos).append("\n\n");

            estadisticas.append("MALEZAS:\n");
            estadisticas.append("  - Total: ").append(totalMalezas).append("\n");
            estadisticas.append("  - Activas: ").append(malezasActivas).append("\n\n");

            estadisticas.append("HONGOS:\n");
            estadisticas.append("  - Total: ").append(totalHongos).append("\n");
            estadisticas.append("  - Activos: ").append(hongosActivos).append("\n\n");

            estadisticas.append("MÉTODOS:\n");
            estadisticas.append("  - Total: ").append(totalMetodos).append("\n");
            estadisticas.append("  - Activos: ").append(metodosActivos).append("\n\n");

            long totalGeneral = totalDepositos + totalCultivos + totalMalezas + totalHongos + totalMetodos;
            long totalActivos = depositosActivos + cultivosActivos + malezasActivas + hongosActivos + metodosActivos;

            estadisticas.append("TOTAL GENERAL:\n");
            estadisticas.append("  - Total registros: ").append(totalGeneral).append("\n");
            estadisticas.append("  - Total activos: ").append(totalActivos).append("\n");

            return new ResponseEntity<>(estadisticas.toString(), HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>("Error al obtener estadísticas: " + e.getMessage(), 
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping({"/limpiar-datos-prueba"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Endpoint de debug que elimina todos los datos de prueba (marca como inactivos)"
    )
    public ResponseEntity<String> limpiarDatosPrueba() {
        try {
            StringBuilder resultado = new StringBuilder();
            resultado.append("=== LIMPIANDO DATOS DE PRUEBA ===\n\n");

            // Marcar como inactivos los depósitos de prueba
            List<Deposito> depositos = depositoRepository.findAll();
            int depositosLimpiados = 0;
            for (Deposito deposito : depositos) {
                if (deposito.getNombre().contains("Depósito de Prueba")) {
                    deposito.setActivo(false);
                    depositoRepository.save(deposito);
                    depositosLimpiados++;
                }
            }

            // Marcar como inactivos los cultivos de prueba
            List<Cultivo> cultivos = cultivoRepository.findAll();
            int cultivosLimpiados = 0;
            for (Cultivo cultivo : cultivos) {
                if (cultivo.getNombre().contains("Cultivo de Prueba")) {
                    cultivo.setActivo(false);
                    cultivoRepository.save(cultivo);
                    cultivosLimpiados++;
                }
            }

            // Marcar como inactivos las malezas de prueba
            List<Maleza> malezas = malezaRepository.findAll();
            int malezasLimpiadas = 0;
            for (Maleza maleza : malezas) {
                if (maleza.getNombre().contains("Maleza de Prueba")) {
                    maleza.setActivo(false);
                    malezaRepository.save(maleza);
                    malezasLimpiadas++;
                }
            }

            // Marcar como inactivos los hongos de prueba
            List<Hongo> hongos = hongoRepository.findAll();
            int hongosLimpiados = 0;
            for (Hongo hongo : hongos) {
                if (hongo.getNombre().contains("Hongo de Prueba")) {
                    hongo.setActivo(false);
                    hongoRepository.save(hongo);
                    hongosLimpiados++;
                }
            }

            // Marcar como inactivos los métodos de prueba
            List<Metodo> metodos = metodoRepository.findAll();
            int metodosLimpiados = 0;
            for (Metodo metodo : metodos) {
                if (metodo.getNombre().contains("Método de Prueba")) {
                    metodo.setActivo(false);
                    metodoRepository.save(metodo);
                    metodosLimpiados++;
                }
            }

            resultado.append("DATOS LIMPIADOS:\n");
            resultado.append("  - Depósitos: ").append(depositosLimpiados).append("\n");
            resultado.append("  - Cultivos: ").append(cultivosLimpiados).append("\n");
            resultado.append("  - Malezas: ").append(malezasLimpiadas).append("\n");
            resultado.append("  - Hongos: ").append(hongosLimpiados).append("\n");
            resultado.append("  - Métodos: ").append(metodosLimpiados).append("\n\n");

            int totalLimpiado = depositosLimpiados + cultivosLimpiados + malezasLimpiadas + hongosLimpiados + metodosLimpiados;
            resultado.append("Total de registros marcados como inactivos: ").append(totalLimpiado);

            return new ResponseEntity<>(resultado.toString(), HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>("Error al limpiar datos de prueba: " + e.getMessage(), 
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping({"/crear-autocompletados-analisis"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Endpoint de debug que crea varios autocompletados para campos de análisis comunes"
    )
    public ResponseEntity<String> crearAutocompletadosAnalisis() {
        try {
            StringBuilder resultado = new StringBuilder();
            resultado.append("=== CREANDO AUTOCOMPLETADOS PARA CAMPOS DE ANÁLISIS ===\n\n");

            // Definir campos de análisis y sus valores de ejemplo
            String[][] camposAnalisis = {
                // Campos del Recibo
                {"especie", "Trifolium repens", "Lolium perenne", "Festuca arundinacea", "Dactylis glomerata", "Poa pratensis"},
                {"nLab", "LAB-2024-001", "LAB-2024-002", "LAB-2024-003", "LAB-2024-004", "LAB-2024-005"},
                {"origen", "Montevideo", "Canelones", "Maldonado", "Colonia", "San José"},
                {"remite", "INIA La Estanzuela", "INIA Tacuarembó", "INIA Salto Grande", "INIA Treinta y Tres", "INIA Paysandú"},
                {"observaciones", "Muestra en buen estado", "Requiere análisis adicional", "Muestra fresca", "Alta calidad", "Cumple estándares"},
                {"ficha", "FICHA-001", "FICHA-002", "FICHA-003", "FICHA-004", "FICHA-005"},
                
                // Campos de Análisis de Pureza
                {"materiaInerteTipo", "Piedras", "Tierra", "Restos vegetales", "Cáscaras", "Polvo"},
                {"materiaInerteTipoInase", "Piedras", "Tierra", "Restos vegetales", "Cáscaras", "Polvo"},
                
                // Campos de Análisis de Germinación
                {"productoDosis", "Thiram 0.2%", "Captan 0.3%", "Mancozeb 0.25%", "Carbendazim 0.15%", "Sin tratamiento"},
                {"comentarios", "Condiciones óptimas", "Germinación lenta", "Requiere pretratamiento", "Alta viabilidad", "Semillas frescas"},
                
                // Campos de Análisis Sanitario
                {"metodo", "Papel filtro", "Agar", "Blotter test", "Sandwich method", "Deep freeze"},
                {"estado", "Apto", "No apto", "Condicional", "Requiere análisis adicional", "Cumple estándares"},
                
                // Campos de Análisis de Tetrazolio
                {"pretratamientoCustom", "Escarificación", "Remojo 24h", "Estratificación", "Sin pretratamiento", "Remojo en agua"},
                
                // Campos de Certificado (solo editables)
                {"responsableMuestreo", "Ing. Juan Pérez", "Ing. María González", "Téc. Carlos Rodríguez", "Dr. Ana Martínez", "Téc. Luis Fernández"},
                
                // Observaciones específicas por análisis (plantillas para explicar resultados)
                {"observacionesPureza", "El análisis de pureza muestra materia inerte dentro de los límites permitidos según normativa vigente.", "Se detectó presencia de otras semillas que fueron identificadas y cuantificadas según protocolo establecido.", "La muestra presenta alta pureza con porcentajes que cumplen con los estándares de calidad requeridos.", "Se recomienda limpieza adicional debido a la presencia de material inerte que supera los límites normativos.", "Los resultados del análisis de pureza cumplen con todos los parámetros establecidos en la normativa aplicable."},
                {"observacionesGerminacion", "El análisis de germinación se realizó bajo condiciones controladas obteniendo resultados dentro de los parámetros normativos.", "Se observó germinación lenta en las primeras evaluaciones, requiriendo extensión del período de prueba según protocolo.", "Las semillas requirieron pretratamiento específico para superar la dormancia y permitir la evaluación correcta de la viabilidad.", "La muestra presenta alta viabilidad con porcentajes de germinación que superan los estándares mínimos requeridos.", "Las condiciones de prueba fueron óptimas y los resultados reflejan la calidad de las semillas analizadas."},
                {"observacionesSanitario", "El análisis sanitario no detectó presencia de hongos patógenos en la muestra analizada.", "Se identificó presencia de Fusarium spp. en bajos porcentajes, dentro de los límites tolerables según normativa.", "La muestra requiere tratamiento fungicida debido a la presencia de hongos que pueden afectar la calidad de las semillas.", "El estado sanitario de la muestra es óptimo, sin presencia de patógenos que comprometan la calidad.", "Se detectaron hongos controlables mediante tratamientos estándar recomendados para este tipo de semillas."},
                {"observacionesTetrazolio", "El análisis de tetrazolio muestra alta viabilidad de las semillas con tinción uniforme y sin daños significativos.", "Se observaron daños mecánicos leves que no comprometen la viabilidad general de la muestra analizada.", "Las semillas presentan viabilidad adecuada según los criterios de evaluación establecidos para esta prueba.", "Se recomienda análisis complementario debido a resultados intermedios que requieren validación adicional.", "La viabilidad determinada mediante tetrazolio se encuentra dentro de los parámetros esperados para este tipo de semillas."},
                {"observacionesDOSN", "El análisis DOSN no detectó presencia de semillas de otras especies en la muestra analizada.", "Se identificaron semillas de otras especies en cantidades que cumplen con los límites establecidos por la normativa.", "La muestra presenta presencia de malezas de tolerancia cero que requiere atención según protocolo establecido.", "Los resultados del análisis DOSN cumplen con todos los parámetros normativos aplicables a este tipo de análisis.", "Se detectó presencia de Brassica spp. que fue identificada y cuantificada según los procedimientos establecidos."},
                {"observacionesPMS", "El análisis de peso de mil semillas muestra valores consistentes entre repeticiones, cumpliendo con los criterios de variabilidad aceptables.", "El coeficiente de variación superó el umbral establecido, requiriendo expansión a 16 repeticiones según protocolo ISTA.", "Los resultados del PMS se encuentran dentro de los rangos esperados para esta especie y variedad.", "La muestra presenta peso de mil semillas que cumple con los estándares de calidad requeridos para comercialización.", "El análisis se realizó siguiendo protocolos ISTA estándar, obteniendo resultados reproducibles y confiables."}
            };

            int totalCreados = 0;

            for (String[] campo : camposAnalisis) {
                String parametro = campo[0];
                resultado.append("Campo: ").append(parametro).append("\n");

                // Crear 5 autocompletados para cada campo
                for (int i = 1; i < campo.length; i++) {
                    AutocompletadoDto dto = new AutocompletadoDto();
                    dto.setId(null);
                    dto.setParametro(parametro);
                    dto.setValor(campo[i]);
                    dto.setTipoDato("texto");
                    dto.setActivo(true);

                    String response = autocompletadoService.crearAutocompletado(dto);
                    resultado.append("   - ").append(response).append("\n");
                    totalCreados++;
                }
                resultado.append("\n");
            }

            resultado.append("=== AUTOCOMPLETADOS CREADOS EXITOSAMENTE ===\n");
            resultado.append("Total creado: ").append(totalCreados).append(" autocompletados para ")
                    .append(camposAnalisis.length).append(" campos de análisis");

            return new ResponseEntity<>(resultado.toString(), HttpStatus.CREATED);

        } catch (Exception e) {
            return new ResponseEntity<>("Error al crear autocompletados: " + e.getMessage(), 
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

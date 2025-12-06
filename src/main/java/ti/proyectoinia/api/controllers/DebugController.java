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
import java.util.ArrayList;
import java.util.Date;
import java.util.Calendar;

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
    private final LoteRepository loteRepository;
    private final UsuarioRepository usuarioRepository;
    private final ReciboRepository reciboRepository;
    private final EspecieRepository especieRepository;
    private final DOSNRepository dosnRepository;
    private final PMSRepository pmsRepository;
    private final PurezaRepository purezaRepository;
    private final GerminacionRepository germinacionRepository;
    private final SanitarioRepository sanitarioRepository;
    private final SanitarioHongoRepository sanitarioHongoRepository;
    private final TetrazolioRepository tetrazolioRepository;
    private final PurezaPNotatumRepository purezaPNotatumRepository;

    public DebugController(DepositoRepository depositoRepository, 
                          CultivoRepository cultivoRepository,
                          MalezaRepository malezaRepository,
                          HongoRepository hongoRepository,
                          MetodoRepository metodoRepository,
                          AutocompletadoService autocompletadoService,
                          LoteRepository loteRepository,
                          UsuarioRepository usuarioRepository,
                          ReciboRepository reciboRepository,
                          EspecieRepository especieRepository,
                          DOSNRepository dosnRepository,
                          PMSRepository pmsRepository,
                          PurezaRepository purezaRepository,
                          GerminacionRepository germinacionRepository,
                          SanitarioRepository sanitarioRepository,
                          SanitarioHongoRepository sanitarioHongoRepository,
                          TetrazolioRepository tetrazolioRepository,
                          PurezaPNotatumRepository purezaPNotatumRepository) {
        this.depositoRepository = depositoRepository;
        this.cultivoRepository = cultivoRepository;
        this.malezaRepository = malezaRepository;
        this.hongoRepository = hongoRepository;
        this.metodoRepository = metodoRepository;
        this.autocompletadoService = autocompletadoService;
        this.loteRepository = loteRepository;
        this.usuarioRepository = usuarioRepository;
        this.reciboRepository = reciboRepository;
        this.especieRepository = especieRepository;
        this.dosnRepository = dosnRepository;
        this.pmsRepository = pmsRepository;
        this.purezaRepository = purezaRepository;
        this.germinacionRepository = germinacionRepository;
        this.sanitarioRepository = sanitarioRepository;
        this.sanitarioHongoRepository = sanitarioHongoRepository;
        this.tetrazolioRepository = tetrazolioRepository;
        this.purezaPNotatumRepository = purezaPNotatumRepository;
    }

    @PostMapping({"/crear-datos-prueba"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Endpoint de debug que crea datos reales para cada tipo: Depósitos, Especies, Cultivos, Malezas, Hongos y Métodos"
    )
    public ResponseEntity<String> crearDatosPrueba() {
        try {
            StringBuilder resultado = new StringBuilder();
            resultado.append("=== CREANDO DATOS REALES ===\n\n");

            // Crear 5 Depósitos (sedes INIA)
            resultado.append("1. CREANDO DEPÓSITOS:\n");
            String[] depositos = {
                "INIA La Estanzuela",
                "INIA Tacuarembó",
                "INIA Salto Grande",
                "INIA Treinta y Tres",
                "INIA Paysandú"
            };
            for (String nombreDeposito : depositos) {
                Deposito deposito = new Deposito();
                deposito.setNombre(nombreDeposito);
                deposito.setActivo(true);
                Deposito guardado = depositoRepository.save(deposito);
                resultado.append("   - Depósito creado: ID=").append(guardado.getId())
                        .append(", Nombre=").append(guardado.getNombre()).append("\n");
            }

            // Crear 5 Especies (especies forrajeras comunes en Uruguay)
            resultado.append("\n2. CREANDO ESPECIES:\n");
            String[][] especies = {
                {"Trifolium repens", "Trébol blanco, especie forrajera perenne de la familia Fabaceae"},
                {"Lolium perenne", "Rye grass perenne, gramínea forrajera de la familia Poaceae"},
                {"Festuca arundinacea", "Festuca alta, gramínea perenne de la familia Poaceae"},
                {"Dactylis glomerata", "Dactilis o pasto ovillo, gramínea perenne de la familia Poaceae"},
                {"Poa pratensis", "Poa de los prados, gramínea perenne de la familia Poaceae"}
            };
            for (String[] especieData : especies) {
                Especie especie = new Especie();
                especie.setNombre(especieData[0]);
                especie.setDescripcion(especieData[1]);
                especie.setActivo(true);
                Especie guardada = especieRepository.save(especie);
                resultado.append("   - Especie creada: ID=").append(guardada.getId())
                        .append(", Nombre=").append(guardada.getNombre()).append("\n");
            }

            // Crear 5 Cultivos (especies forrajeras comunes en Uruguay)
            resultado.append("\n3. CREANDO CULTIVOS:\n");
            String[][] cultivos = {
                {"Trifolium repens", "Trébol blanco, especie forrajera perenne de alta calidad nutritiva"},
                {"Lolium perenne", "Rye grass perenne, gramínea forrajera de crecimiento rápido"},
                {"Festuca arundinacea", "Festuca alta, gramínea perenne tolerante a sequía"},
                {"Dactylis glomerata", "Dactilis o pasto ovillo, gramínea perenne de alta producción"},
                {"Poa pratensis", "Poa de los prados, gramínea perenne de uso extensivo"}
            };
            for (String[] cultivoData : cultivos) {
                Cultivo cultivo = new Cultivo();
                cultivo.setNombre(cultivoData[0]);
                cultivo.setDescripcion(cultivoData[1]);
                cultivo.setActivo(true);
                Cultivo guardado = cultivoRepository.save(cultivo);
                resultado.append("   - Cultivo creado: ID=").append(guardado.getId())
                        .append(", Nombre=").append(guardado.getNombre()).append("\n");
            }

            // Crear 5 Malezas (malezas comunes en cultivos forrajeros)
            resultado.append("\n4. CREANDO MALEZAS:\n");
            String[][] malezas = {
                {"Amaranthus retroflexus", "Amaranto rojo, maleza anual de hoja ancha, tolerancia cero"},
                {"Sorghum halepense", "Sorgo de Alepo, gramínea perenne muy agresiva, tolerancia cero"},
                {"Chenopodium album", "Cenizo, maleza anual de hoja ancha común en cultivos"},
                {"Echinochloa crus-galli", "Pasto del arroz, gramínea anual problemática en cultivos"},
                {"Cuscuta spp.", "Cuscuta o cabello de ángel, parásita obligada, tolerancia cero"}
            };
            for (String[] malezaData : malezas) {
                Maleza maleza = new Maleza();
                maleza.setNombre(malezaData[0]);
                maleza.setDescripcion(malezaData[1]);
                maleza.setActivo(true);
                Maleza guardado = malezaRepository.save(maleza);
                resultado.append("   - Maleza creada: ID=").append(guardado.getId())
                        .append(", Nombre=").append(guardado.getNombre()).append("\n");
            }

            // Crear 5 Hongos (hongos patógenos comunes en semillas)
            resultado.append("\n5. CREANDO HONGOS:\n");
            String[][] hongos = {
                {"Fusarium spp.", "Género de hongos patógenos que causan enfermedades en semillas y plantas"},
                {"Aspergillus spp.", "Hongos que pueden producir micotoxinas y afectar la calidad de semillas"},
                {"Penicillium spp.", "Hongos comunes en almacenamiento que pueden deteriorar semillas"},
                {"Alternaria spp.", "Hongos patógenos que causan manchas foliares y afectan semillas"},
                {"Rhizoctonia spp.", "Hongos del suelo que causan enfermedades en plántulas y raíces"}
            };
            for (String[] hongoData : hongos) {
                Hongo hongo = new Hongo();
                hongo.setNombre(hongoData[0]);
                hongo.setDescripcion(hongoData[1]);
                hongo.setActivo(true);
                Hongo guardado = hongoRepository.save(hongo);
                resultado.append("   - Hongo creado: ID=").append(guardado.getId())
                        .append(", Nombre=").append(guardado.getNombre()).append("\n");
            }

            // Crear 5 Métodos (métodos de análisis según normativas ISTA)
            resultado.append("\n6. CREANDO MÉTODOS:\n");
            String[][] metodos = {
                {"ISTA 5.1 - Pureza", "ISTA", "Método estándar para determinación de pureza física de semillas según Reglas ISTA"},
                {"ISTA 5.3 - Germinación", "ISTA", "Método estándar para prueba de germinación de semillas en condiciones controladas"},
                {"ISTA 5.5 - Análisis Sanitario", "ISTA", "Método para detección e identificación de hongos patógenos en semillas"},
                {"ISTA 6.1 - Tetrazolio", "ISTA", "Método rápido para determinación de viabilidad de semillas mediante tinción"},
                {"ISTA 9.1 - Peso de Mil Semillas", "ISTA", "Método para determinación del peso de mil semillas (PMS) como indicador de calidad"}
            };
            for (String[] metodoData : metodos) {
                Metodo metodo = new Metodo();
                metodo.setNombre(metodoData[0]);
                metodo.setAutor(metodoData[1]);
                metodo.setDescripcion(metodoData[2]);
                metodo.setActivo(true);
                Metodo guardado = metodoRepository.save(metodo);
                resultado.append("   - Método creado: ID=").append(guardado.getId())
                        .append(", Nombre=").append(guardado.getNombre()).append("\n");
            }

            resultado.append("\n=== DATOS REALES CREADOS EXITOSAMENTE ===");
            resultado.append("\nTotal creado: 30 registros (5 de cada tipo: Depósitos, Especies, Cultivos, Malezas, Hongos y Métodos)");

            return new ResponseEntity<>(resultado.toString(), HttpStatus.CREATED);

        } catch (Exception e) {
            return new ResponseEntity<>("Error al crear datos: " + e.getMessage(), 
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
            
            long totalEspecies = especieRepository.count();
            long especiesActivas = especieRepository.findByActivoTrue().size();
            
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

            estadisticas.append("ESPECIES:\n");
            estadisticas.append("  - Total: ").append(totalEspecies).append("\n");
            estadisticas.append("  - Activas: ").append(especiesActivas).append("\n\n");

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

            long totalGeneral = totalDepositos + totalEspecies + totalCultivos + totalMalezas + totalHongos + totalMetodos;
            long totalActivos = depositosActivos + especiesActivas + cultivosActivos + malezasActivas + hongosActivos + metodosActivos;

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
            description = "Endpoint de debug que elimina todos los datos creados por crear-datos-prueba (marca como inactivos)"
    )
    public ResponseEntity<String> limpiarDatosPrueba() {
        try {
            StringBuilder resultado = new StringBuilder();
            resultado.append("=== LIMPIANDO DATOS CREADOS POR DEBUG ===\n\n");

            // Nombres de depósitos INIA creados por el endpoint
            String[] depositosINIA = {
                "INIA La Estanzuela", "INIA Tacuarembó", "INIA Salto Grande", 
                "INIA Treinta y Tres", "INIA Paysandú"
            };

            // Marcar como inactivos los depósitos creados por debug (antiguos y nuevos)
            List<Deposito> depositos = depositoRepository.findAll();
            int depositosLimpiados = 0;
            for (Deposito deposito : depositos) {
                boolean esDepositoDebug = deposito.getNombre().contains("Depósito de Prueba");
                for (String nombreINIA : depositosINIA) {
                    if (deposito.getNombre().equals(nombreINIA)) {
                        esDepositoDebug = true;
                        break;
                    }
                }
                if (esDepositoDebug) {
                    deposito.setActivo(false);
                    depositoRepository.save(deposito);
                    depositosLimpiados++;
                }
            }

            // Nombres de especies creadas por el endpoint
            String[] especiesReales = {
                "Trifolium repens", "Lolium perenne", "Festuca arundinacea",
                "Dactylis glomerata", "Poa pratensis"
            };

            // Marcar como inactivas las especies creadas por debug
            List<Especie> especies = especieRepository.findAll();
            int especiesLimpiadas = 0;
            for (Especie especie : especies) {
                boolean esEspecieDebug = especie.getNombre().contains("Especie de Prueba");
                for (String nombreEspecie : especiesReales) {
                    if (especie.getNombre().equals(nombreEspecie)) {
                        esEspecieDebug = true;
                        break;
                    }
                }
                if (esEspecieDebug) {
                    especie.setActivo(false);
                    especieRepository.save(especie);
                    especiesLimpiadas++;
                }
            }

            // Nombres de cultivos creados por el endpoint
            String[] cultivosReales = {
                "Trifolium repens", "Lolium perenne", "Festuca arundinacea",
                "Dactylis glomerata", "Poa pratensis"
            };

            // Marcar como inactivos los cultivos creados por debug
            List<Cultivo> cultivos = cultivoRepository.findAll();
            int cultivosLimpiados = 0;
            for (Cultivo cultivo : cultivos) {
                boolean esCultivoDebug = cultivo.getNombre().contains("Cultivo de Prueba");
                for (String nombreCultivo : cultivosReales) {
                    if (cultivo.getNombre().equals(nombreCultivo)) {
                        esCultivoDebug = true;
                        break;
                    }
                }
                if (esCultivoDebug) {
                    cultivo.setActivo(false);
                    cultivoRepository.save(cultivo);
                    cultivosLimpiados++;
                }
            }

            // Nombres de malezas creadas por el endpoint
            String[] malezasReales = {
                "Amaranthus retroflexus", "Sorghum halepense", "Chenopodium album",
                "Echinochloa crus-galli", "Cuscuta spp."
            };

            // Marcar como inactivas las malezas creadas por debug
            List<Maleza> malezas = malezaRepository.findAll();
            int malezasLimpiadas = 0;
            for (Maleza maleza : malezas) {
                boolean esMalezaDebug = maleza.getNombre().contains("Maleza de Prueba");
                for (String nombreMaleza : malezasReales) {
                    if (maleza.getNombre().equals(nombreMaleza)) {
                        esMalezaDebug = true;
                        break;
                    }
                }
                if (esMalezaDebug) {
                    maleza.setActivo(false);
                    malezaRepository.save(maleza);
                    malezasLimpiadas++;
                }
            }

            // Nombres de hongos creados por el endpoint
            String[] hongosReales = {
                "Fusarium spp.", "Aspergillus spp.", "Penicillium spp.",
                "Alternaria spp.", "Rhizoctonia spp."
            };

            // Marcar como inactivos los hongos creados por debug
            List<Hongo> hongos = hongoRepository.findAll();
            int hongosLimpiados = 0;
            for (Hongo hongo : hongos) {
                boolean esHongoDebug = hongo.getNombre().contains("Hongo de Prueba");
                for (String nombreHongo : hongosReales) {
                    if (hongo.getNombre().equals(nombreHongo)) {
                        esHongoDebug = true;
                        break;
                    }
                }
                if (esHongoDebug) {
                    hongo.setActivo(false);
                    hongoRepository.save(hongo);
                    hongosLimpiados++;
                }
            }

            // Nombres de métodos creados por el endpoint
            String[] metodosReales = {
                "ISTA 5.1 - Pureza", "ISTA 5.3 - Germinación", "ISTA 5.5 - Análisis Sanitario",
                "ISTA 6.1 - Tetrazolio", "ISTA 9.1 - Peso de Mil Semillas"
            };

            // Marcar como inactivos los métodos creados por debug
            List<Metodo> metodos = metodoRepository.findAll();
            int metodosLimpiados = 0;
            for (Metodo metodo : metodos) {
                boolean esMetodoDebug = metodo.getNombre().contains("Método de Prueba");
                for (String nombreMetodo : metodosReales) {
                    if (metodo.getNombre().equals(nombreMetodo)) {
                        esMetodoDebug = true;
                        break;
                    }
                }
                if (esMetodoDebug) {
                    metodo.setActivo(false);
                    metodoRepository.save(metodo);
                    metodosLimpiados++;
                }
            }

            resultado.append("DATOS LIMPIADOS:\n");
            resultado.append("  - Depósitos: ").append(depositosLimpiados).append("\n");
            resultado.append("  - Especies: ").append(especiesLimpiadas).append("\n");
            resultado.append("  - Cultivos: ").append(cultivosLimpiados).append("\n");
            resultado.append("  - Malezas: ").append(malezasLimpiadas).append("\n");
            resultado.append("  - Hongos: ").append(hongosLimpiados).append("\n");
            resultado.append("  - Métodos: ").append(metodosLimpiados).append("\n\n");

            int totalLimpiado = depositosLimpiados + especiesLimpiadas + cultivosLimpiados + malezasLimpiadas + hongosLimpiados + metodosLimpiados;
            resultado.append("Total de registros marcados como inactivos: ").append(totalLimpiado);

            return new ResponseEntity<>(resultado.toString(), HttpStatus.OK);

        } catch (Exception e) {
            return new ResponseEntity<>("Error al limpiar datos: " + e.getMessage(), 
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

    @PostMapping({"/crear-lotes-usuario"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Endpoint de debug que crea una serie de lotes y los asigna a un usuario existente en el sistema"
    )
    public ResponseEntity<String> crearLotesParaUsuario(
            @RequestParam Long usuarioId,
            @RequestParam(defaultValue = "5") int cantidad) {
        try {
            StringBuilder resultado = new StringBuilder();
            resultado.append("=== CREANDO LOTES PARA USUARIO ===\n\n");

            // Validar cantidad
            if (cantidad <= 0 || cantidad > 50) {
                return new ResponseEntity<>("La cantidad debe estar entre 1 y 50", HttpStatus.BAD_REQUEST);
            }

            // Verificar que el usuario existe y está activo
            Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
            if (usuario == null) {
                return new ResponseEntity<>("Usuario no encontrado con ID: " + usuarioId, HttpStatus.NOT_FOUND);
            }
            if (!usuario.isActivo()) {
                return new ResponseEntity<>("El usuario con ID " + usuarioId + " no está activo", HttpStatus.BAD_REQUEST);
            }

            resultado.append("Usuario encontrado: ").append(usuario.getNombre())
                    .append(" (").append(usuario.getEmail()).append(")\n\n");

            // Obtener año actual
            Calendar calendar = Calendar.getInstance();
            int anioActual = calendar.get(Calendar.YEAR);

            // Categorías disponibles
            loteCategoria[] categorias = loteCategoria.values();
            
            // Nombres base para los lotes
            String[] nombresBase = {
                "Lote Análisis Semillas Forrajeras",
                "Lote Control Calidad",
                "Lote Certificación",
                "Lote Evaluación Variedades",
                "Lote Ensayo Productivo",
                "Lote Validación Semillas",
                "Lote Control Sanitario",
                "Lote Análisis Germinación",
                "Lote Prueba Pureza",
                "Lote Certificación INASE"
            };

            int lotesCreados = 0;
            Date fechaActual = new Date();

            for (int i = 0; i < cantidad; i++) {
                Lote lote = new Lote();
                
                // Nombre del lote
                String nombreBase = nombresBase[i % nombresBase.length];
                lote.setNombre(nombreBase + " " + anioActual + "-" + String.format("%02d", (i + 1)));
                
                // Descripción
                lote.setDescripcion("Lote creado automáticamente para análisis de semillas. " +
                        "Asignado a: " + usuario.getNombre() + " (" + usuario.getEmail() + ")");
                
                // Fecha de creación (distribuir en los últimos meses)
                Calendar fechaCreacion = Calendar.getInstance();
                fechaCreacion.setTime(fechaActual);
                fechaCreacion.add(Calendar.MONTH, -(cantidad - i - 1)); // Distribuir en meses pasados
                lote.setFechaCreacion(fechaCreacion.getTime());
                
                // Fecha de finalización (algunos lotes finalizados)
                if (i < cantidad / 2) {
                    Calendar fechaFinalizacion = Calendar.getInstance();
                    fechaFinalizacion.setTime(fechaCreacion.getTime());
                    fechaFinalizacion.add(Calendar.DAY_OF_MONTH, 30 + (i * 5)); // Entre 30 y varios días después
                    lote.setFechaFinalizacion(fechaFinalizacion.getTime());
                    lote.setEstado(Estado.FINALIZADO);
                } else {
                    lote.setFechaFinalizacion(null);
                    lote.setEstado(Estado.PENDIENTE);
                }
                
                // Categoría (rotar entre las disponibles)
                lote.setCategoria(categorias[i % categorias.length]);
                
                // Activo
                lote.setActivo(true);
                
                // Asignar usuario al lote
                List<Usuario> usuarios = new ArrayList<>();
                usuarios.add(usuario);
                lote.setUsuarios(usuarios);
                
                // Guardar lote
                Lote guardado = loteRepository.save(lote);
                
                // Actualizar la relación desde el usuario también
                if (usuario.getLotes() == null) {
                    usuario.setLotes(new ArrayList<>());
                }
                usuario.getLotes().add(guardado);
                usuarioRepository.save(usuario);
                
                resultado.append("   - Lote creado: ID=").append(guardado.getId())
                        .append(", Nombre=").append(guardado.getNombre())
                        .append(", Estado=").append(guardado.getEstado())
                        .append(", Categoría=").append(guardado.getCategoria())
                        .append("\n");
                
                lotesCreados++;
            }

            resultado.append("\n=== LOTES CREADOS EXITOSAMENTE ===\n");
            resultado.append("Total creado: ").append(lotesCreados).append(" lotes asignados a ")
                    .append(usuario.getNombre()).append(" (ID: ").append(usuarioId).append(")");

            return new ResponseEntity<>(resultado.toString(), HttpStatus.CREATED);

        } catch (Exception e) {
            return new ResponseEntity<>("Error al crear lotes: " + e.getMessage(), 
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping({"/crear-recibos-lotes"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Endpoint de debug que crea recibos y los asigna a lotes existentes en el sistema"
    )
    public ResponseEntity<String> crearRecibosParaLotes(
            @RequestParam(required = false) Long loteId,
            @RequestParam(defaultValue = "5") int cantidadPorLote) {
        try {
            StringBuilder resultado = new StringBuilder();
            resultado.append("=== CREANDO RECIBOS PARA LOTES ===\n\n");

            // Validar cantidad
            if (cantidadPorLote <= 0 || cantidadPorLote > 20) {
                return new ResponseEntity<>("La cantidad debe estar entre 1 y 20 por lote", HttpStatus.BAD_REQUEST);
            }

            // Obtener lotes activos
            List<Lote> lotes;
            if (loteId != null) {
                Lote lote = loteRepository.findById(loteId).orElse(null);
                if (lote == null || !lote.isActivo()) {
                    return new ResponseEntity<>("Lote no encontrado o inactivo con ID: " + loteId, HttpStatus.NOT_FOUND);
                }
                lotes = new ArrayList<>();
                lotes.add(lote);
            } else {
                lotes = loteRepository.findByActivoTrue();
                if (lotes.isEmpty()) {
                    return new ResponseEntity<>("No hay lotes activos en el sistema", HttpStatus.NOT_FOUND);
                }
            }

            resultado.append("Lotes encontrados: ").append(lotes.size()).append("\n\n");

            // Obtener datos necesarios para crear recibos realistas
            List<Cultivo> cultivos = cultivoRepository.findByActivoTrue();
            List<Especie> especies = especieRepository.findByActivoTrue();
            List<Deposito> depositos = depositoRepository.findByActivoTrue();

            if (cultivos.isEmpty()) {
                return new ResponseEntity<>("No hay cultivos activos en el sistema. Ejecute primero /crear-datos-prueba", HttpStatus.BAD_REQUEST);
            }
            if (especies.isEmpty()) {
                return new ResponseEntity<>("No hay especies activas en el sistema", HttpStatus.BAD_REQUEST);
            }
            if (depositos.isEmpty()) {
                return new ResponseEntity<>("No hay depósitos activos en el sistema. Ejecute primero /crear-datos-prueba", HttpStatus.BAD_REQUEST);
            }

            // Datos para recibos realistas
            String[] origenes = {"Montevideo", "Canelones", "Maldonado", "Colonia", "San José", "Tacuarembó", "Paysandú", "Salto"};
            String[] remitentes = {"INIA La Estanzuela", "INIA Tacuarembó", "INIA Salto Grande", "INIA Treinta y Tres", "INIA Paysandú", 
                                   "Productor Privado", "Cooperativa Agraria", "Empresa Semillera"};
            // Variable no utilizada - Campo analisisSolicitados no existe en la entidad Recibo
            // String[] analisisSolicitados = {"Pureza, Germinación", "Pureza, Germinación, Sanitario", 
            //                                 "Pureza, Germinación, Tetrazolio", "Pureza, Germinación, DOSN, PMS",
            //                                 "Completo: Pureza, Germinación, Sanitario, Tetrazolio, DOSN, PMS"};
            ReciboEstado[] estados = ReciboEstado.values();

            int recibosCreados = 0;
            int nroAnalisisBase = 1000;
            Calendar calendar = Calendar.getInstance();
            int anioActual = calendar.get(Calendar.YEAR);

            // Crear recibos para cada lote
            for (Lote lote : lotes) {
                resultado.append("Creando recibos para lote: ").append(lote.getNombre())
                        .append(" (ID: ").append(lote.getId()).append(")\n");

                for (int i = 0; i < cantidadPorLote; i++) {
                    Recibo recibo = new Recibo();

                    // Número de análisis (secuencial)
                    recibo.setNroAnalisis(nroAnalisisBase + recibosCreados);

                    // Especie (rotar entre las disponibles)
                    Especie especie = especies.get(recibosCreados % especies.size());
                    recibo.setEspecie(especie);

                    // Cultivar (rotar entre los disponibles)
                    Cultivo cultivar = cultivos.get(recibosCreados % cultivos.size());
                    recibo.setCultivar(cultivar);

                    // Ficha
                    recibo.setFicha("FICHA-" + anioActual + "-" + String.format("%04d", nroAnalisisBase + recibosCreados));

                    // Fecha de recibo (distribuir en los últimos meses)
                    Calendar fechaRecibo = Calendar.getInstance();
                    fechaRecibo.setTime(new Date());
                    fechaRecibo.add(Calendar.DAY_OF_MONTH, -(recibosCreados * 3)); // Distribuir en días pasados
                    recibo.setFechaRecibo(fechaRecibo.getTime());

                    // Remitente
                    recibo.setRemitente(remitentes[recibosCreados % remitentes.length]);

                    // Origen
                    recibo.setOrigen(origenes[recibosCreados % origenes.length]);

                    // Depósito (rotar entre los disponibles)
                    Deposito deposito = depositos.get(recibosCreados % depositos.size());
                    recibo.setDepositoId(deposito.getId());

                    // Estado
                    recibo.setEstado(estados[recibosCreados % estados.length]);

                    // Lote ID
                    recibo.setLoteId(lote.getId());

                    // Kg limpios (valores realistas entre 0.5 y 50 kg)
                    recibo.setKgLimpios(0.5f + (float)(Math.random() * 49.5f));

                    // Análisis solicitados - Campo no existe en la entidad Recibo
                    // recibo.setAnalisisSolicitados(analisisSolicitados[recibosCreados % analisisSolicitados.length]);

                    // Artículo (opcional, algunos recibos lo tienen)
                    if (recibosCreados % 3 == 0) {
                        recibo.setArticulo(100 + (recibosCreados % 50));
                    } else {
                        recibo.setArticulo(null);
                    }

                    // Activo
                    recibo.setActivo(true);

                    // Guardar recibo
                    Recibo guardado = reciboRepository.save(recibo);

                    resultado.append("   - Recibo creado: ID=").append(guardado.getId())
                            .append(", Nro. Análisis=").append(guardado.getNroAnalisis())
                            .append(", Especie=").append(especie.getNombre())
                            .append(", Lote ID=").append(lote.getId())
                            .append("\n");

                    recibosCreados++;
                }
                resultado.append("\n");
            }

            resultado.append("=== RECIBOS CREADOS EXITOSAMENTE ===\n");
            resultado.append("Total creado: ").append(recibosCreados).append(" recibos en ")
                    .append(lotes.size()).append(" lote(s)");

            return new ResponseEntity<>(resultado.toString(), HttpStatus.CREATED);

        } catch (Exception e) {
            return new ResponseEntity<>("Error al crear recibos: " + e.getMessage(), 
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping({"/crear-analisis-recibos"})
    @Secured({"ADMIN"})
    @Operation(
            description = "Endpoint de debug que crea análisis para recibos existentes. Verifica que existan Usuario, Lote y Recibo, y crea listados si no existen. Al menos un recibo tendrá todos los tipos de análisis."
    )
    public ResponseEntity<String> crearAnalisisParaRecibos(
            @RequestParam(defaultValue = "5") int cantidadRecibos) {
        try {
            StringBuilder resultado = new StringBuilder();
            resultado.append("=== CREANDO ANÁLISIS PARA RECIBOS ===\n\n");

            // Validar cantidad
            if (cantidadRecibos <= 0 || cantidadRecibos > 20) {
                return new ResponseEntity<>("La cantidad debe estar entre 1 y 20", HttpStatus.BAD_REQUEST);
            }

            // 1. Verificar que existan Usuario, Lote y Recibo
            List<Usuario> usuarios = usuarioRepository.findByActivoTrue();
            if (usuarios.isEmpty()) {
                return new ResponseEntity<>("No hay usuarios activos. Ejecute primero /crear-lotes-usuario", HttpStatus.BAD_REQUEST);
            }

            List<Lote> lotes = loteRepository.findByActivoTrue();
            if (lotes.isEmpty()) {
                return new ResponseEntity<>("No hay lotes activos. Ejecute primero /crear-lotes-usuario", HttpStatus.BAD_REQUEST);
            }

            List<Recibo> recibos = reciboRepository.findByActivoTrue();
            if (recibos.isEmpty()) {
                return new ResponseEntity<>("No hay recibos activos. Ejecute primero /crear-recibos-lotes", HttpStatus.BAD_REQUEST);
            }

            resultado.append("Verificación de datos base:\n");
            resultado.append("  - Usuarios activos: ").append(usuarios.size()).append("\n");
            resultado.append("  - Lotes activos: ").append(lotes.size()).append("\n");
            resultado.append("  - Recibos activos: ").append(recibos.size()).append("\n\n");

            // 2. Verificar y crear listados si no existen
            resultado.append("2. VERIFICANDO LISTADOS:\n");
            
            List<Cultivo> cultivos = cultivoRepository.findByActivoTrue();
            if (cultivos.isEmpty()) {
                resultado.append("  - Creando cultivo...\n");
                Cultivo cultivo = new Cultivo();
                cultivo.setNombre("Trifolium repens");
                cultivo.setDescripcion("Trébol blanco, especie forrajera perenne");
                cultivo.setActivo(true);
                cultivos.add(cultivoRepository.save(cultivo));
            }
            resultado.append("  - Cultivos disponibles: ").append(cultivos.size()).append("\n");

            List<Maleza> malezas = malezaRepository.findByActivoTrue();
            if (malezas.isEmpty()) {
                resultado.append("  - Creando maleza...\n");
                Maleza maleza = new Maleza();
                maleza.setNombre("Amaranthus retroflexus");
                maleza.setDescripcion("Amaranto rojo, maleza anual");
                maleza.setActivo(true);
                malezas.add(malezaRepository.save(maleza));
            }
            resultado.append("  - Malezas disponibles: ").append(malezas.size()).append("\n");

            List<Hongo> hongos = hongoRepository.findByActivoTrue();
            if (hongos.isEmpty()) {
                resultado.append("  - Creando hongo...\n");
                Hongo hongo = new Hongo();
                hongo.setNombre("Fusarium spp.");
                hongo.setDescripcion("Hongos patógenos comunes en semillas");
                hongo.setActivo(true);
                hongos.add(hongoRepository.save(hongo));
            }
            resultado.append("  - Hongos disponibles: ").append(hongos.size()).append("\n");

            List<Metodo> metodos = metodoRepository.findByActivoTrue();
            if (metodos.isEmpty()) {
                resultado.append("  - Creando método...\n");
                Metodo metodo = new Metodo();
                metodo.setNombre("ISTA 5.3 - Germinación");
                metodo.setAutor("ISTA");
                metodo.setDescripcion("Método estándar para prueba de germinación");
                metodo.setActivo(true);
                metodos.add(metodoRepository.save(metodo));
            }
            resultado.append("  - Métodos disponibles: ").append(metodos.size()).append("\n\n");

            // 3. Seleccionar recibos para crear análisis
            int recibosAProcesar = Math.min(cantidadRecibos, recibos.size());
            List<Recibo> recibosSeleccionados = recibos.subList(0, recibosAProcesar);
            
            resultado.append("3. CREANDO ANÁLISIS:\n");
            resultado.append("  Procesando ").append(recibosAProcesar).append(" recibo(s)\n\n");

            int analisisCreados = 0;
            Date fechaActual = new Date();
            Calendar calendar = Calendar.getInstance();

            // El primer recibo tendrá todos los tipos de análisis
            boolean primerRecibo = true;

            for (Recibo recibo : recibosSeleccionados) {
                resultado.append("Recibo ID: ").append(recibo.getId())
                        .append(" (Nro. Análisis: ").append(recibo.getNroAnalisis()).append(")\n");

                // Crear Pureza
                if (primerRecibo || (analisisCreados % 2 == 0)) {
                    Pureza pureza = new Pureza();
                    pureza.setRecibo(recibo);
                    pureza.setFechaInia(fechaActual);
                    pureza.setFechaInase(fechaActual);
                    calendar.setTime(fechaActual);
                    calendar.add(Calendar.DAY_OF_MONTH, -5);
                    pureza.setFechaCreacion(calendar.getTime());
                    pureza.setPesoInicial(25.0f);
                    pureza.setPesoInicialInase(25.0f);
                    pureza.setSemillaPura(95.5f);
                    pureza.setSemillaPuraInase(95.5f);
                    pureza.setMaterialInerte(2.0f);
                    pureza.setMaterialInerteInase(2.0f);
                    pureza.setOtrosCultivos(1.5f);
                    pureza.setOtrosCultivosInase(1.5f);
                    pureza.setMalezas(1.0f);
                    pureza.setMalezasInase(1.0f);
                    pureza.setMalezasToleradas(0.5f);
                    pureza.setMalezasToleradasInase(0.5f);
                    pureza.setMalezasToleranciaCero(0.0f);
                    pureza.setMalezasToleranciaCeroInase(0.0f);
                    pureza.setEstandar(true);
                    pureza.setActivo(true);
                    pureza.setRepetido(false);
                    if (!malezas.isEmpty()) {
                        pureza.setMalezasNormales(new ArrayList<>());
                        pureza.getMalezasNormales().add(malezas.get(0));
                    }
                    purezaRepository.save(pureza);
                    resultado.append("  - Pureza creada\n");
                    analisisCreados++;
                }

                // Crear Germinación
                if (primerRecibo || (analisisCreados % 3 != 0)) {
                    Germinacion germinacion = new Germinacion();
                    germinacion.setRecibo(recibo);
                    calendar.setTime(fechaActual);
                    calendar.add(Calendar.DAY_OF_MONTH, -10);
                    germinacion.setFechaInicio(calendar.getTime());
                    germinacion.setTotalDias(14);
                    germinacion.setTratamiento(Tratamiento.SIN_CURAR);
                    germinacion.setNroSemillaPorRepeticion(100);
                    if (!metodos.isEmpty()) {
                        germinacion.setMetodo(metodos.get(0));
                    }
                    germinacion.setTemperatura(20.0f);
                    germinacion.setPreFrio(PreFrio.SIN_PREFRIO);
                    germinacion.setPreTratamiento(PreTratamiento.NINGUNO);
                    germinacion.setNroDias(14);
                    calendar.add(Calendar.DAY_OF_MONTH, 14);
                    // fechaFinal - Campo no existe en la entidad Germinacion
                    // germinacion.setFechaFinal(calendar.getTime());
                    germinacion.setPRedondeo(85);
                    germinacion.setPNormalINIA(85);
                    germinacion.setPNormalINASE(85);
                    germinacion.setPAnormalINIA(5);
                    germinacion.setPAnormalINASE(5);
                    germinacion.setPMuertasINIA(5);
                    germinacion.setPMuertasINASE(5);
                    germinacion.setPFrescasINIA(3);
                    germinacion.setPFrescasINASE(3);
                    germinacion.setSemillasDurasINIA(2);
                    germinacion.setSemillasDurasINASE(2);
                    germinacion.setGerminacionINIA(85);
                    germinacion.setGerminacionINASE(85);
                    germinacion.setComentarios("Condiciones óptimas de germinación");
                    germinacion.setActivo(true);
                    germinacion.setRepetido(false);
                    germinacion.setEstandar(true);
                    germinacion.setFechaCreacion(fechaActual);
                    germinacionRepository.save(germinacion);
                    resultado.append("  - Germinación creada\n");
                    analisisCreados++;
                }

                // Crear Sanitario
                if (primerRecibo || (analisisCreados % 4 == 0)) {
                    Sanitario sanitario = new Sanitario();
                    sanitario.setRecibo(recibo);
                    calendar.setTime(fechaActual);
                    calendar.add(Calendar.DAY_OF_MONTH, -7);
                    sanitario.setFechaSiembra(calendar.getTime());
                    sanitario.setFecha(fechaActual);
                    sanitario.setMetodo("Papel filtro");
                    sanitario.setTemperatura(20);
                    sanitario.setHorasLuz(12);
                    sanitario.setHorasOscuridad(12);
                    sanitario.setNroDias(7);
                    sanitario.setEstado("Apto");
                    sanitario.setObservaciones("Sin presencia de hongos patógenos");
                    sanitario.setNroSemillasRepeticion(400);
                    sanitario.setActivo(true);
                    sanitario.setEstandar(true);
                    sanitario.setRepetido(false);
                    sanitario.setFechaCreacion(fechaActual);
                    sanitario.setSanitarioHongos(new ArrayList<>());
                    sanitarioRepository.save(sanitario);
                    
                    // Crear relaciones SanitarioHongo si hay hongos disponibles
                    if (!hongos.isEmpty()) {
                        int numRepeticiones = 4; // Número típico de repeticiones en análisis sanitario
                        TipoSanitarioHongo[] tipos = TipoSanitarioHongo.values();
                        
                        // Crear 1-2 relaciones de hongos por análisis sanitario
                        int numHongos = Math.min(2, hongos.size());
                        for (int i = 0; i < numHongos; i++) {
                            for (int rep = 1; rep <= numRepeticiones; rep++) {
                                SanitarioHongo sanitarioHongo = new SanitarioHongo();
                                sanitarioHongo.setSanitario(sanitario);
                                sanitarioHongo.setHongo(hongos.get(i % hongos.size()));
                                sanitarioHongo.setRepeticion(rep);
                                // Valor aleatorio entre 0 y 10 para simular presencia de hongo
                                sanitarioHongo.setValor((int)(Math.random() * 11));
                                // Rotar entre los tipos disponibles
                                sanitarioHongo.setTipo(tipos[i % tipos.length]);
                                sanitarioHongoRepository.save(sanitarioHongo);
                                sanitario.getSanitarioHongos().add(sanitarioHongo);
                            }
                        }
                        resultado.append("  - Sanitario creado con ").append(numHongos * numRepeticiones)
                                .append(" relaciones de hongos\n");
                    } else {
                        resultado.append("  - Sanitario creado\n");
                    }
                    analisisCreados++;
                }

                // Crear Tetrazolio
                if (primerRecibo || (analisisCreados % 5 == 0)) {
                    Tetrazolio tetrazolio = new Tetrazolio();
                    tetrazolio.setRecibo(recibo);
                    tetrazolio.setRepeticion(4);
                    tetrazolio.setNroSemillasPorRepeticion(100);
                    tetrazolio.setPretratamiento(PreTratamiento.NINGUNO);
                    tetrazolio.setConcentracion(1.0f);
                    tetrazolio.setTincionHoras(24.0f);
                    tetrazolio.setTincionGrados(30.0f);
                    tetrazolio.setFecha(fechaActual);
                    tetrazolio.setNroSemillasPorRepeticion2(100);
                    tetrazolio.setPretratamiento2(PreTratamiento.NINGUNO);
                    tetrazolio.setConcentracion2(1.0f);
                    tetrazolio.setTincionHoras2(24.0f);
                    tetrazolio.setTincionGrados2(30.0f);
                    tetrazolio.setFecha2(fechaActual);
                    tetrazolio.setViables(85.0f);
                    tetrazolio.setNoViables(10.0f);
                    tetrazolio.setDuras(5.0f);
                    tetrazolio.setTotal(100.0f);
                    tetrazolio.setPromedio(85.0f);
                    tetrazolio.setPorcentaje(85);
                    tetrazolio.setViabilidadPorTetrazolio(ViabilidadPorTz.VIABLE_SIN_DEFECTOS);
                    tetrazolio.setNroSemillas(400);
                    tetrazolio.setDaniosNroSemillas(10);
                    tetrazolio.setDaniosMecanicos(5);
                    tetrazolio.setDanioAmbiente(3);
                    tetrazolio.setDaniosChinches(1);
                    tetrazolio.setDaniosFracturas(1);
                    tetrazolio.setDaniosOtros(0);
                    tetrazolio.setDaniosDuras(5);
                    tetrazolio.setViabilidadVigorTz(ViabilidadVigorTZ.VIGOR_ALTO);
                    tetrazolio.setPorcentajeFinal(85);
                    tetrazolio.setDaniosPorPorcentajes(2);
                    tetrazolio.setActivo(true);
                    tetrazolio.setRepetido(false);
                    tetrazolio.setEstandar(true);
                    tetrazolio.setFechaCreacion(fechaActual);
                    tetrazolioRepository.save(tetrazolio);
                    resultado.append("  - Tetrazolio creado\n");
                    analisisCreados++;
                }

                // Crear PMS
                if (primerRecibo || (analisisCreados % 6 == 0)) {
                    PMS pms = new PMS();
                    pms.setRecibo(recibo);
                    pms.setPesoMilSemillas(2.5f);
                    pms.setComentarios("Peso dentro de los parámetros normales");
                    pms.setActivo(true);
                    pms.setRepetido(false);
                    pms.setFechaMedicion(fechaActual);
                    pms.setFechaCreacion(fechaActual);
                    pms.setEstandar(true);
                    pmsRepository.save(pms);
                    resultado.append("  - PMS creado\n");
                    analisisCreados++;
                }

                // Crear DOSN
                if (primerRecibo || (analisisCreados % 7 == 0)) {
                    DOSN dosn = new DOSN();
                    dosn.setRecibo(recibo);
                    dosn.setFechaINIA(fechaActual);
                    dosn.setFechaINASE(fechaActual);
                    dosn.setFechaEstandar(fechaActual);
                    dosn.setGramosAnalizadosINIA(50.0f);
                    dosn.setGramosAnalizadosINASE(50.0f);
                    dosn.setTiposDeanalisisINIA(tipoAnalisisDOSN.COMPLETO);
                    dosn.setTiposDeanalisisINASE(tipoAnalisisDOSN.COMPLETO);
                    dosn.setDeterminacionBrassica(false);
                    dosn.setDeterminacionCuscuta(false);
                    dosn.setDeterminacionCuscutaGramos(0.0f);
                    dosn.setDeterminacionBrassicaGramos(0.0f);
                    dosn.setEstandar(true);
                    dosn.setActivo(true);
                    dosn.setRepetido(false);
                    dosn.setFechaCreacion(fechaActual);
                    dosnRepository.save(dosn);
                    resultado.append("  - DOSN creado\n");
                    analisisCreados++;
                }

                // Crear PurezaPNotatum
                if (primerRecibo) {
                    PurezaPNotatum purezaPN = new PurezaPNotatum();
                    purezaPN.setRecibo(recibo);
                    purezaPN.setGramosSemillaPura(95.0f);
                    purezaPN.setGramosSemillasCultivos(2.0f);
                    purezaPN.setGramosSemillasMalezas(1.5f);
                    purezaPN.setGramosMateriaInerte(1.5f);
                    purezaPN.setActivo(true);
                    purezaPN.setRepetido(false);
                    purezaPN.setEstandar(true);
                    purezaPN.setFechaCreacion(fechaActual);
                    purezaPN.setObservaciones("Análisis completo de pureza P. notatum");
                    purezaPNotatumRepository.save(purezaPN);
                    resultado.append("  - Pureza P. notatum creada\n");
                    analisisCreados++;
                }

                resultado.append("\n");
                primerRecibo = false;
            }

            resultado.append("=== ANÁLISIS CREADOS EXITOSAMENTE ===\n");
            resultado.append("Total de análisis creados: ").append(analisisCreados).append("\n");
            resultado.append("Recibos procesados: ").append(recibosAProcesar).append("\n");
            resultado.append("El primer recibo tiene todos los tipos de análisis.");

            return new ResponseEntity<>(resultado.toString(), HttpStatus.CREATED);

        } catch (Exception e) {
            return new ResponseEntity<>("Error al crear análisis: " + e.getMessage() + "\n" + 
                    e.getClass().getName(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

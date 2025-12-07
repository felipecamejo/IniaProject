package ti.proyectoinia.services;

import org.springframework.stereotype.Service;
import ti.proyectoinia.business.entities.ConteoGerminacion;
import ti.proyectoinia.business.entities.GerminacionCuradaLaboratorio;
import ti.proyectoinia.business.entities.GerminacionCuradaPlanta;
import ti.proyectoinia.business.entities.GerminacionSinCurar;
import ti.proyectoinia.business.entities.NormalPorConteo;
import ti.proyectoinia.business.repositories.*;
import ti.proyectoinia.dtos.ConteoGerminacionDto;
import ti.proyectoinia.dtos.NormalPorConteoDto;
import ti.proyectoinia.dtos.RepeticionFinalDto;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class GerminacionMatrizService {

    private final GerminacionRepository germinacionRepository;
    private final ConteoGerminacionRepository conteoGerminacionRepository;
    private final GerminacionSinCurarRepository sinCurarRepository;
    private final GerminacionCuradaPlantaRepository curadaPlantaRepository;
    private final GerminacionCuradaLaboratorioRepository curadaLaboratorioRepository;
    private final MapsDtoEntityService maps;
    private final NormalPorConteoRepository normalPorConteoRepository;

    public GerminacionMatrizService(
            GerminacionRepository germinacionRepository,
            ConteoGerminacionRepository conteoGerminacionRepository,
            GerminacionSinCurarRepository sinCurarRepository,
            GerminacionCuradaPlantaRepository curadaPlantaRepository,
        GerminacionCuradaLaboratorioRepository curadaLaboratorioRepository,
        MapsDtoEntityService maps,
        NormalPorConteoRepository normalPorConteoRepository
    ) {
        this.germinacionRepository = germinacionRepository;
        this.conteoGerminacionRepository = conteoGerminacionRepository;
        this.sinCurarRepository = sinCurarRepository;
        this.curadaPlantaRepository = curadaPlantaRepository;
        this.curadaLaboratorioRepository = curadaLaboratorioRepository;
        this.maps = maps;
        this.normalPorConteoRepository = normalPorConteoRepository;
    }

    /**
     * Crea un nuevo conteo para una germinación dada.
     * Contract (skeleton): valida existencia de Germinacion activa, persiste ConteoGerminacion y retorna DTO.
     */
    public ConteoGerminacionDto addConteo(Long germinacionId, ConteoGerminacionDto dto) {
        if (germinacionId == null) throw new IllegalArgumentException("germinacionId es requerido");
        // 1) Validar germinación activa
        germinacionRepository.findByIdAndActivoTrue(germinacionId)
                .orElseThrow(() -> new IllegalArgumentException("Germinación no encontrada o inactiva: " + germinacionId));

        // 2) Determinar numeroConteo si no viene
        Integer numeroConteo = dto != null ? dto.getNumeroConteo() : null;
        // Si no se indica o es <= 0, asignar el siguiente correlativo automáticamente
        if (numeroConteo == null || numeroConteo <= 0) {
            var existentes = conteoGerminacionRepository.findByGerminacionIdOrderByNumeroConteoAsc(germinacionId);
            int next = existentes.isEmpty() ? 1 : (existentes.get(existentes.size() - 1).getNumeroConteo() + 1);
            numeroConteo = next;
        }

        // 3) Validar unicidad (germinacionId, numeroConteo)
        if (conteoGerminacionRepository.existsByGerminacionIdAndNumeroConteo(germinacionId, numeroConteo)) {
            throw new IllegalStateException("Ya existe un conteo con numero " + numeroConteo + " para la germinación " + germinacionId);
        }

        // 4) Construir entidad y persistir
        ConteoGerminacion entity = maps.mapToEntityConteoGerminacion(dto != null ? dto : new ConteoGerminacionDto());
        entity.setId(null); // asegurar create
        entity.setGerminacionId(germinacionId);
        entity.setNumeroConteo(numeroConteo);
        if (entity.getFechaConteo() == null) {
            entity.setFechaConteo(new Date());
        }
        entity.setActivo(true);

        ConteoGerminacion saved = conteoGerminacionRepository.save(entity);

        // 5) Prefill: crear celdas en blanco para todas las repeticiones existentes en cada tabla
        prefillRepeticionesForNewConteo(germinacionId, saved.getId());

        return maps.mapToDtoConteoGerminacion(saved);
    }

    /**
     * Lista los conteos de una germinación, ordenados por numeroConteo asc.
     */
    public List<ConteoGerminacionDto> listConteos(Long germinacionId) {
        if (germinacionId == null) return Collections.emptyList();
        return conteoGerminacionRepository.findByGerminacionIdOrderByNumeroConteoAsc(germinacionId)
                .stream()
                .map(maps::mapToDtoConteoGerminacion)
                .collect(Collectors.toList());
    }

    /**
     * Actualiza la fecha de un conteo existente.
     */
    public void updateConteoFecha(Long conteoId, String fechaConteo) {
        if (conteoId == null) throw new IllegalArgumentException("conteoId es requerido");
        ConteoGerminacion conteo = conteoGerminacionRepository.findById(conteoId)
                .orElseThrow(() -> new IllegalArgumentException("Conteo no encontrado: " + conteoId));
        conteo.setFechaConteo(maps.parseDate(fechaConteo));
        conteoGerminacionRepository.save(conteo);
    }

    // Nuevos upserts
    public NormalPorConteoDto upsertNormal(String tabla, NormalPorConteoDto dto) {
        System.out.println("[upsertNormal] Recibido DTO: germinacionId=" + dto.getGerminacionId() 
            + ", numeroRepeticion=" + dto.getNumeroRepeticion() 
            + ", conteoId=" + dto.getConteoId() 
            + ", normal=" + dto.getNormal() 
            + ", promedioNormal=" + dto.getPromedioNormal()
            + ", tabla=" + tabla);
        
        if (dto.getConteoId() == null) throw new IllegalArgumentException("conteoId es requerido");
        if (dto.getNumeroRepeticion() == null) throw new IllegalArgumentException("numeroRepeticion es requerido");
        String key = tabla == null ? "" : tabla.trim().toUpperCase();
        dto.setTabla(key);

        // Validar conteo y completar germinacionId
        ConteoGerminacion conteo = conteoGerminacionRepository.findById(dto.getConteoId())
                .orElseThrow(() -> new IllegalArgumentException("Conteo no encontrado: " + dto.getConteoId()));
        if (dto.getGerminacionId() == null) dto.setGerminacionId(conteo.getGerminacionId());

        System.out.println("[upsertNormal] Después de completar: germinacionId=" + dto.getGerminacionId());

        // Verificar que exista la repetición final (opcional, podemos crearlo lazy)
        ensureRepeticionExists(dto.getGerminacionId(), key, dto.getNumeroRepeticion());

        System.out.println("[upsertNormal] Buscando existente con: germinacionId=" + dto.getGerminacionId() 
            + ", tabla=" + key 
            + ", numeroRepeticion=" + dto.getNumeroRepeticion() 
            + ", conteoId=" + dto.getConteoId());
        
        var existente = normalPorConteoRepository.findByGerminacionIdAndTablaAndNumeroRepeticionAndConteoId(
                dto.getGerminacionId(), key, dto.getNumeroRepeticion(), dto.getConteoId());
        
        if (existente.isPresent()) {
            System.out.println("[upsertNormal] Encontrado existente ID=" + existente.get().getId() 
                + ", valores actuales: germinacionId=" + existente.get().getGerminacionId() 
                + ", numeroRepeticion=" + existente.get().getNumeroRepeticion() 
                + ", normal=" + existente.get().getNormal());
        } else {
            System.out.println("[upsertNormal] No se encontró existente, creando nuevo");
        }
        
        NormalPorConteo entity = existente.orElseGet(NormalPorConteo::new);
        entity.setId(existente.map(NormalPorConteo::getId).orElse(null));
        entity.setActivo(true);
        entity.setGerminacionId(dto.getGerminacionId());
        entity.setTabla(key);
        entity.setNumeroRepeticion(dto.getNumeroRepeticion());
        entity.setConteoId(dto.getConteoId());
        entity.setNormal(dto.getNormal());
        entity.setPromedioNormal(dto.getPromedioNormal());
        
        System.out.println("[upsertNormal] Entity antes de guardar: germinacionId=" + entity.getGerminacionId() 
            + ", numeroRepeticion=" + entity.getNumeroRepeticion() 
            + ", conteoId=" + entity.getConteoId() 
            + ", normal=" + entity.getNormal());
        
        NormalPorConteo saved = normalPorConteoRepository.save(entity);
        
        System.out.println("[upsertNormal] Entity guardada con ID=" + saved.getId());
        
        return maps.mapToDtoNormalPorConteo(saved);
    }

    public RepeticionFinalDto upsertRepeticionFinal(String tabla, RepeticionFinalDto dto) {
        if (dto == null) throw new IllegalArgumentException("dto es requerido");
        if (dto.getNumeroRepeticion() == null) throw new IllegalArgumentException("numeroRepeticion es requerido");
        if (dto.getGerminacionId() == null) throw new IllegalArgumentException("germinacionId es requerido");
        String key = tabla == null ? "" : tabla.trim().toUpperCase();

        switch (key) {
            case "SIN_CURAR": {
                var existente = sinCurarRepository.findByGerminacionIdAndNumeroRepeticion(dto.getGerminacionId(), dto.getNumeroRepeticion());
                GerminacionSinCurar e = maps.mapToEntityRepeticionSinCurar(dto);
                e.setId(existente.map(GerminacionSinCurar::getId).orElse(dto.getId()));
                normalizeRepeticionFinal(e);
                GerminacionSinCurar saved = sinCurarRepository.save(e);
                return maps.mapToDtoRepeticionSinCurar(saved);
            }
            case "CURADA_PLANTA": {
                var existente = curadaPlantaRepository.findByGerminacionIdAndNumeroRepeticion(dto.getGerminacionId(), dto.getNumeroRepeticion());
                GerminacionCuradaPlanta e = maps.mapToEntityRepeticionCuradaPlanta(dto);
                e.setId(existente.map(GerminacionCuradaPlanta::getId).orElse(dto.getId()));
                normalizeRepeticionFinal(e);
                GerminacionCuradaPlanta saved = curadaPlantaRepository.save(e);
                return maps.mapToDtoRepeticionCuradaPlanta(saved);
            }
            case "CURADA_LABORATORIO": {
                var existente = curadaLaboratorioRepository.findByGerminacionIdAndNumeroRepeticion(dto.getGerminacionId(), dto.getNumeroRepeticion());
                GerminacionCuradaLaboratorio e = maps.mapToEntityRepeticionCuradaLaboratorio(dto);
                e.setId(existente.map(GerminacionCuradaLaboratorio::getId).orElse(dto.getId()));
                normalizeRepeticionFinal(e);
                GerminacionCuradaLaboratorio saved = curadaLaboratorioRepository.save(e);
                return maps.mapToDtoRepeticionCuradaLaboratorio(saved);
            }
            default:
                throw new IllegalArgumentException("tabla inválida. Use: SIN_CURAR | CURADA_PLANTA | CURADA_LABORATORIO");
        }
    }

    // Helpers de normalización solo para entidades finales (sin campo 'normal')
    private void normalizeRepeticionFinal(GerminacionSinCurar e) {
        int a = safeInt(e.getAnormal());
        int d = safeInt(e.getDuras());
        int f = safeInt(e.getFrescas());
        int m = safeInt(e.getMuertas());
        e.setTotales(a + d + f + m);
    }
    private void normalizeRepeticionFinal(GerminacionCuradaPlanta e) {
        int a = safeInt(e.getAnormal());
        int d = safeInt(e.getDuras());
        int f = safeInt(e.getFrescas());
        int m = safeInt(e.getMuertas());
        e.setTotales(a + d + f + m);
    }
    private void normalizeRepeticionFinal(GerminacionCuradaLaboratorio e) {
        int a = safeInt(e.getAnormal());
        int d = safeInt(e.getDuras());
        int f = safeInt(e.getFrescas());
        int m = safeInt(e.getMuertas());
        e.setTotales(a + d + f + m);
    }

    private int safeInt(Integer v) { return v == null ? 0 : v; }

    /**
     * Al crear un nuevo conteo, genera celdas "en blanco" para todas las repeticiones existentes
     * en cada tabla (SIN_CURAR, CURADA_PLANTA, CURADA_LABORATORIO) para esa germinación.
     */
    private void prefillRepeticionesForNewConteo(Long germinacionId, Long newConteoId) {
        if (germinacionId == null || newConteoId == null) return;

    // Para cada tabla, obtener el conjunto de números de repetición existentes en la germinación
        Set<Integer> repsSinCurar = new HashSet<>();
        Set<Integer> repsCuradaPlanta = new HashSet<>();
        Set<Integer> repsCuradaLaboratorio = new HashSet<>();
    sinCurarRepository.findByGerminacionIdOrderByNumeroRepeticionAsc(germinacionId)
        .forEach(e -> repsSinCurar.add(e.getNumeroRepeticion()));
    curadaPlantaRepository.findByGerminacionIdOrderByNumeroRepeticionAsc(germinacionId)
        .forEach(e -> repsCuradaPlanta.add(e.getNumeroRepeticion()));
    curadaLaboratorioRepository.findByGerminacionIdOrderByNumeroRepeticionAsc(germinacionId)
        .forEach(e -> repsCuradaLaboratorio.add(e.getNumeroRepeticion()));

        // Crear filas faltantes para el nuevo conteo, por cada repetición detectada
        for (Integer rep : repsSinCurar) {
            if (rep == null) continue;
            // Crear NormalPorConteo para SIN_CURAR si no existe
            if (normalPorConteoRepository.findByGerminacionIdAndTablaAndNumeroRepeticionAndConteoId(germinacionId, "SIN_CURAR", rep, newConteoId).isEmpty()) {
                NormalPorConteo npc = new NormalPorConteo();
                npc.setId(null);
                npc.setActivo(true);
                npc.setGerminacionId(germinacionId);
                npc.setTabla("SIN_CURAR");
                npc.setNumeroRepeticion(rep);
                npc.setConteoId(newConteoId);
                npc.setNormal(null);
                normalPorConteoRepository.save(npc);
            }
        }

        for (Integer rep : repsCuradaPlanta) {
            if (rep == null) continue;
            if (normalPorConteoRepository.findByGerminacionIdAndTablaAndNumeroRepeticionAndConteoId(germinacionId, "CURADA_PLANTA", rep, newConteoId).isEmpty()) {
                NormalPorConteo npc = new NormalPorConteo();
                npc.setId(null);
                npc.setActivo(true);
                npc.setGerminacionId(germinacionId);
                npc.setTabla("CURADA_PLANTA");
                npc.setNumeroRepeticion(rep);
                npc.setConteoId(newConteoId);
                npc.setNormal(null);
                normalPorConteoRepository.save(npc);
            }
        }

        for (Integer rep : repsCuradaLaboratorio) {
            if (rep == null) continue;
            if (normalPorConteoRepository.findByGerminacionIdAndTablaAndNumeroRepeticionAndConteoId(germinacionId, "CURADA_LABORATORIO", rep, newConteoId).isEmpty()) {
                NormalPorConteo npc = new NormalPorConteo();
                npc.setId(null);
                npc.setActivo(true);
                npc.setGerminacionId(germinacionId);
                npc.setTabla("CURADA_LABORATORIO");
                npc.setNumeroRepeticion(rep);
                npc.setConteoId(newConteoId);
                npc.setNormal(null);
                normalPorConteoRepository.save(npc);
            }
        }
    }

    /**
     * Devuelve la matriz para una germinación con el nuevo modelo:
     * - conteos
     * - normales por tabla agrupadas por conteoId
     * - finales por tabla como lista por número de repetición
     */
    public Map<String, Object> listMatriz(Long germinacionId) {
        if (germinacionId == null) return Collections.emptyMap();

        List<ConteoGerminacionDto> conteos = listConteos(germinacionId);
        List<Long> conteoIds = conteos.stream().map(ConteoGerminacionDto::getId).filter(Objects::nonNull).collect(Collectors.toList());

        // Normales agrupadas por conteoId para cada tabla
        Map<Long, List<NormalPorConteoDto>> normalesSinCurar = new HashMap<>();
        Map<Long, List<NormalPorConteoDto>> normalesCuradaPlanta = new HashMap<>();
        Map<Long, List<NormalPorConteoDto>> normalesCuradaLaboratorio = new HashMap<>();

        for (Long conteoId : conteoIds) {
            var sc = normalPorConteoRepository
                    .findByGerminacionIdAndTablaAndConteoIdOrderByNumeroRepeticionAsc(germinacionId, "SIN_CURAR", conteoId)
                    .stream().map(maps::mapToDtoNormalPorConteo).collect(Collectors.toList());
            var cp = normalPorConteoRepository
                    .findByGerminacionIdAndTablaAndConteoIdOrderByNumeroRepeticionAsc(germinacionId, "CURADA_PLANTA", conteoId)
                    .stream().map(maps::mapToDtoNormalPorConteo).collect(Collectors.toList());
            var cl = normalPorConteoRepository
                    .findByGerminacionIdAndTablaAndConteoIdOrderByNumeroRepeticionAsc(germinacionId, "CURADA_LABORATORIO", conteoId)
                    .stream().map(maps::mapToDtoNormalPorConteo).collect(Collectors.toList());
            normalesSinCurar.put(conteoId, sc);
            normalesCuradaPlanta.put(conteoId, cp);
            normalesCuradaLaboratorio.put(conteoId, cl);
        }

        // Finales por tabla
        var finalesSinCurar = sinCurarRepository.findByGerminacionIdOrderByNumeroRepeticionAsc(germinacionId)
                .stream().map(maps::mapToDtoRepeticionSinCurar).collect(Collectors.toList());
        var finalesCuradaPlanta = curadaPlantaRepository.findByGerminacionIdOrderByNumeroRepeticionAsc(germinacionId)
                .stream().map(maps::mapToDtoRepeticionCuradaPlanta).collect(Collectors.toList());
        var finalesCuradaLaboratorio = curadaLaboratorioRepository.findByGerminacionIdOrderByNumeroRepeticionAsc(germinacionId)
                .stream().map(maps::mapToDtoRepeticionCuradaLaboratorio).collect(Collectors.toList());

        Map<String, Object> res = new HashMap<>();
        res.put("conteos", conteos);
        res.put("normalesSinCurar", normalesSinCurar);
        res.put("normalesCuradaPlanta", normalesCuradaPlanta);
        res.put("normalesCuradaLaboratorio", normalesCuradaLaboratorio);
        res.put("finalesSinCurar", finalesSinCurar);
        res.put("finalesCuradaPlanta", finalesCuradaPlanta);
        res.put("finalesCuradaLaboratorio", finalesCuradaLaboratorio);
        return res;
    }

    /**
     * Agrega (si no existe) una repetición con el numero especificado para TODOS los conteos
     * de la germinación indicada, en la tabla dada. Si la germinación aún no tiene conteos,
     * se crea automáticamente el Conteo 1.
     *
     * Param 'tabla' admite: "SIN_CURAR", "CURADA_PLANTA", "CURADA_LABORATORIO".
     * Devuelve un resumen con la lista de celdas (una por conteo) para esa repetición.
     */
    public Map<String, Object> addRepeticionAcrossConteos(Long germinacionId, String tabla, Integer numeroRepeticion) {
        if (germinacionId == null) throw new IllegalArgumentException("germinacionId es requerido");

        // 1) Validar germinación activa
        germinacionRepository.findByIdAndActivoTrue(germinacionId)
                .orElseThrow(() -> new IllegalArgumentException("Germinación no encontrada o inactiva: " + germinacionId));

        // 2) Obtener conteos o crear Conteo 1 si aún no hay
        List<ConteoGerminacion> conteos = conteoGerminacionRepository.findByGerminacionIdOrderByNumeroConteoAsc(germinacionId);
        if (conteos.isEmpty()) {
            addConteo(germinacionId, new ConteoGerminacionDto());
            // recargar
            conteos = conteoGerminacionRepository.findByGerminacionIdOrderByNumeroConteoAsc(germinacionId);
        }

        String key = tabla == null ? "" : tabla.trim().toUpperCase();

        // Si no se indica numeroRepeticion (o es <= 0), asignar el siguiente correlativo para esa tabla
        if (numeroRepeticion == null || numeroRepeticion <= 0) {
            numeroRepeticion = computeNextNumeroRepeticion(germinacionId, key);
        }

        // 3) Asegurar la existencia de la fila final (una por repetición)
        boolean finalCreado = ensureRepeticionExists(germinacionId, key, numeroRepeticion);

        // 4) Asegurar Normales por cada conteo para esa repetición
        List<NormalPorConteoDto> normalesCreadas = new ArrayList<>();
        int createdNormals = 0;
        for (ConteoGerminacion conteo : conteos) {
            var existente = normalPorConteoRepository.findByGerminacionIdAndTablaAndNumeroRepeticionAndConteoId(
                    germinacionId, key, numeroRepeticion, conteo.getId());
            if (existente.isEmpty()) {
                NormalPorConteo npc = new NormalPorConteo();
                npc.setId(null);
                npc.setActivo(true);
                npc.setGerminacionId(germinacionId);
                npc.setTabla(key);
                npc.setNumeroRepeticion(numeroRepeticion);
                npc.setConteoId(conteo.getId());
                npc.setNormal(null);
                NormalPorConteo saved = normalPorConteoRepository.save(npc);
                normalesCreadas.add(maps.mapToDtoNormalPorConteo(saved));
                createdNormals++;
            }
        }

        Map<String, Object> res = new HashMap<>();
        res.put("germinacionId", germinacionId);
        res.put("tabla", key);
        res.put("numeroRepeticion", numeroRepeticion);
        res.put("conteos", conteos.stream().map(ConteoGerminacion::getNumeroConteo).collect(Collectors.toList()));
        res.put("createdNormals", createdNormals);
        res.put("finalCreated", finalCreado);
        res.put("normalesCreadas", normalesCreadas);
        return res;
    }

    // Calcula el siguiente numero de repetición (correlativo) para una tabla específica
    private Integer computeNextNumeroRepeticion(Long germinacionId, String key) {
        switch (key) {
            case "SIN_CURAR": {
                var list = sinCurarRepository.findByGerminacionIdOrderByNumeroRepeticionAsc(germinacionId);
                if (list.isEmpty()) return 1;
                Integer last = list.get(list.size() - 1).getNumeroRepeticion();
                return (last == null ? 1 : last + 1);
            }
            case "CURADA_PLANTA": {
                var list = curadaPlantaRepository.findByGerminacionIdOrderByNumeroRepeticionAsc(germinacionId);
                if (list.isEmpty()) return 1;
                Integer last = list.get(list.size() - 1).getNumeroRepeticion();
                return (last == null ? 1 : last + 1);
            }
            case "CURADA_LABORATORIO": {
                var list = curadaLaboratorioRepository.findByGerminacionIdOrderByNumeroRepeticionAsc(germinacionId);
                if (list.isEmpty()) return 1;
                Integer last = list.get(list.size() - 1).getNumeroRepeticion();
                return (last == null ? 1 : last + 1);
            }
            default:
                throw new IllegalArgumentException("tabla inválida. Use: SIN_CURAR | CURADA_PLANTA | CURADA_LABORATORIO");
        }
    }

    // Garantiza que exista la fila de finales por (germinacionId, tabla, numeroRepeticion)
    // Devuelve true si se creó, false si ya existía
    private boolean ensureRepeticionExists(Long germinacionId, String key, Integer numeroRepeticion) {
        switch (key) {
            case "SIN_CURAR": {
                var ex = sinCurarRepository.findByGerminacionIdAndNumeroRepeticion(germinacionId, numeroRepeticion);
                if (ex.isPresent()) return false;
                GerminacionSinCurar e = new GerminacionSinCurar();
                e.setId(null);
                e.setActivo(true);
                e.setGerminacionId(germinacionId);
                e.setNumeroRepeticion(numeroRepeticion);
                e.setAnormal(null);
                e.setDuras(null);
                e.setFrescas(null);
                e.setMuertas(null);
                e.setPromedioAnormal(null);
                e.setPromedioDuras(null);
                e.setPromedioFrescas(null);
                e.setPromedioMuertas(null);
                e.setPromedioTotal(null);
                normalizeRepeticionFinal(e);
                sinCurarRepository.save(e);
                return true;
            }
            case "CURADA_PLANTA": {
                var ex = curadaPlantaRepository.findByGerminacionIdAndNumeroRepeticion(germinacionId, numeroRepeticion);
                if (ex.isPresent()) return false;
                GerminacionCuradaPlanta e = new GerminacionCuradaPlanta();
                e.setId(null);
                e.setActivo(true);
                e.setGerminacionId(germinacionId);
                e.setNumeroRepeticion(numeroRepeticion);
                e.setAnormal(null);
                e.setDuras(null);
                e.setFrescas(null);
                e.setMuertas(null);
                e.setPromedioAnormal(null);
                e.setPromedioDuras(null);
                e.setPromedioFrescas(null);
                e.setPromedioMuertas(null);
                e.setPromedioTotal(null);
                normalizeRepeticionFinal(e);
                curadaPlantaRepository.save(e);
                return true;
            }
            case "CURADA_LABORATORIO": {
                var ex = curadaLaboratorioRepository.findByGerminacionIdAndNumeroRepeticion(germinacionId, numeroRepeticion);
                if (ex.isPresent()) return false;
                GerminacionCuradaLaboratorio e = new GerminacionCuradaLaboratorio();
                e.setId(null);
                e.setActivo(true);
                e.setGerminacionId(germinacionId);
                e.setNumeroRepeticion(numeroRepeticion);
                e.setAnormal(null);
                e.setDuras(null);
                e.setFrescas(null);
                e.setMuertas(null);
                e.setPromedioAnormal(null);
                e.setPromedioDuras(null);
                e.setPromedioFrescas(null);
                e.setPromedioMuertas(null);
                e.setPromedioTotal(null);
                normalizeRepeticionFinal(e);
                curadaLaboratorioRepository.save(e);
                return true;
            }
            default:
                throw new IllegalArgumentException("tabla inválida. Use: SIN_CURAR | CURADA_PLANTA | CURADA_LABORATORIO");
        }
    }

    /**
     * Inicializa las 3 tablas de tratamiento (SIN_CURAR, CURADA_PLANTA, CURADA_LABORATORIO)
     * para una germinación recién creada, creando la repetición 1 "vacía" en cada una y
     * asegurando una celda NormalPorConteo para el Conteo 1. Si no existe Conteo 1, se crea.
     */
    public void initializeTablasForGerminacion(Long germinacionId) {
        if (germinacionId == null) return;

        // Asegurar germinación activa
        germinacionRepository.findByIdAndActivoTrue(germinacionId)
                .orElseThrow(() -> new IllegalArgumentException("Germinación no encontrada o inactiva: " + germinacionId));

        // Asegurar al menos un conteo (Conteo 1)
        List<ConteoGerminacion> conteos = conteoGerminacionRepository.findByGerminacionIdOrderByNumeroConteoAsc(germinacionId);
        if (conteos.isEmpty()) {
            addConteo(germinacionId, new ConteoGerminacionDto());
            conteos = conteoGerminacionRepository.findByGerminacionIdOrderByNumeroConteoAsc(germinacionId);
        }
        if (conteos.isEmpty()) return; // fallback de seguridad

        Long conteo1Id = conteos.get(0).getId();

        // Crear repetición 1 en cada tabla si no existe
        ensureRepeticionExists(germinacionId, "SIN_CURAR", 1);
        ensureRepeticionExists(germinacionId, "CURADA_PLANTA", 1);
        ensureRepeticionExists(germinacionId, "CURADA_LABORATORIO", 1);

        // Crear NormalPorConteo para la repetición 1 en el Conteo 1 para cada tabla, si no existe
        createNormalIfMissing(germinacionId, "SIN_CURAR", 1, conteo1Id);
        createNormalIfMissing(germinacionId, "CURADA_PLANTA", 1, conteo1Id);
        createNormalIfMissing(germinacionId, "CURADA_LABORATORIO", 1, conteo1Id);
    }

    private void createNormalIfMissing(Long germinacionId, String tabla, Integer numeroRepeticion, Long conteoId) {
        if (germinacionId == null || conteoId == null) return;
        var existente = normalPorConteoRepository.findByGerminacionIdAndTablaAndNumeroRepeticionAndConteoId(
                germinacionId, tabla, numeroRepeticion, conteoId);
        if (existente.isEmpty()) {
            NormalPorConteo npc = new NormalPorConteo();
            npc.setId(null);
            npc.setActivo(true);
            npc.setGerminacionId(germinacionId);
            npc.setTabla(tabla);
            npc.setNumeroRepeticion(numeroRepeticion);
            npc.setConteoId(conteoId);
            npc.setNormal(null);
            normalPorConteoRepository.save(npc);
        }
    }
}

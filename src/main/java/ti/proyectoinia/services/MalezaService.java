package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadoMalezas;
import ti.proyectoinia.business.entities.Maleza;
import ti.proyectoinia.business.repositories.MalezaRepository;
import ti.proyectoinia.dtos.MalezaDto;

@Service
public class MalezaService {
    
        private final MalezaRepository malezaRepository;
        private final MapsDtoEntityService mapsDtoEntityService;

        public MalezaService(MalezaRepository malezaRerpository, MapsDtoEntityService mapsDtoEntityService) {
            this.mapsDtoEntityService = mapsDtoEntityService;
            this.malezaRepository = malezaRerpository;
        }

        public String crearMaleza(MalezaDto malezaDto) {
            this.malezaRepository.save(mapsDtoEntityService.mapToEntityMaleza(malezaDto));
            return "Maleza creada correctamente";
        }

        public ResponseEntity<ResponseListadoMalezas> listadoMalezas() {
            // Obtener entidades activas
            var malezasActivas = this.malezaRepository.findByActivoTrue();
            // Mapear a DTOs
            var malezasDto = malezasActivas.stream()
                    .map(mapsDtoEntityService::mapToDtoMaleza)
                    .toList();
            // Crear response
            ResponseListadoMalezas responseListadoMalezas = new ResponseListadoMalezas(malezasDto);
            return ResponseEntity.ok(responseListadoMalezas);
        }

        public MalezaDto obtenerMalezaPorId(Long id) {
            Maleza maleza = this.malezaRepository.findById(id).orElse(null);
            if (maleza == null || !maleza.isActivo()) {
                return null;
            }
            return mapsDtoEntityService.mapToDtoMaleza(maleza);
        }

        public String editarMaleza(MalezaDto malezaDto) {
            this.malezaRepository.save(mapsDtoEntityService.mapToEntityMaleza(malezaDto));
            return "maleza actualizada correctamente";
        }

        public String eliminarMaleza(Long id) {
            this.malezaRepository.deleteById(id);
            return "maleza eliminada correctamente";
        }



}

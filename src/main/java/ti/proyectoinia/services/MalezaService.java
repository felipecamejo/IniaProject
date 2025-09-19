package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadoHongos;
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
            var malezasActivas = this.malezaRepository.findByActivoTrue();
            var malezasDto = malezasActivas.stream()
                    .map(mapsDtoEntityService::mapToDtoMaleza)
                    .toList();
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
            if (id != null) {
                this.malezaRepository.findById(id).ifPresent(maleza -> {
                    maleza.setActivo(false);
                    this.malezaRepository.save(maleza);
                });
            }
            return "maleza eliminada correctamente";
        }



}

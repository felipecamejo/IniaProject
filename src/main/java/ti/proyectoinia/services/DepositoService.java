package ti.proyectoinia.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import ti.proyectoinia.api.responses.ResponseListadoDepositos;
import ti.proyectoinia.api.responses.ResponseListadoHongos;
import ti.proyectoinia.api.responses.ResponseListadoMalezas;
import ti.proyectoinia.api.responses.ResponseListadoUsuarios;
import ti.proyectoinia.business.entities.Deposito;
import ti.proyectoinia.business.entities.Hongo;
import ti.proyectoinia.business.repositories.DepositoRepository;
import ti.proyectoinia.business.repositories.HongoRepository;
import ti.proyectoinia.dtos.DepositoDto;
import ti.proyectoinia.dtos.HongoDto;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepositoService {

    private final DepositoRepository depositoRepository;
    private final MapsDtoEntityService mapsDtoEntityService;

    public DepositoService(DepositoRepository depositoRepository, MapsDtoEntityService mapsDtoEntityService) {
        this.mapsDtoEntityService = mapsDtoEntityService;
        this.depositoRepository = depositoRepository;
    }

    public String crearDeposito(DepositoDto depositoDto) {

        this.depositoRepository.save(mapsDtoEntityService.mapToEntityDeposito(depositoDto));
        return "Deposito creado correctamente ID:" + depositoDto.getId();
    }

    public DepositoDto obtenerDepositoPorId(Long id) {
        Deposito deposito = this.depositoRepository.findById(id).orElse(null);
        if (deposito == null || !deposito.isActivo()) {
            return null;
        }
        return mapsDtoEntityService.mapToDtoDeposito(deposito);
    }

    public String eliminarDeposito(Long id) {
        if (id != null) {
            this.depositoRepository.findById(id).ifPresent(deposito -> {
                deposito.setActivo(false);
                this.depositoRepository.save(deposito);
            });
        }
        return "Hongo eliminado correctamente ID:" + id;
    }

    public String editarDeposito(DepositoDto depositoDto) {
        this.depositoRepository.save(mapsDtoEntityService.mapToEntityDeposito(depositoDto));
        return "Hongo actualizado correctamente ID:" + depositoDto.getId();
    }

    public ResponseEntity<ResponseListadoDepositos> listadoDepositos() {
        var depositosActivos = this.depositoRepository.findByActivoTrue();
        var depostioDto = depositosActivos.stream()
                .map(mapsDtoEntityService::mapToDtoDeposito)
                .toList();
        ResponseListadoDepositos responseListadoDepositos = new ResponseListadoDepositos(depostioDto);
        return ResponseEntity.ok(responseListadoDepositos);
    }
}

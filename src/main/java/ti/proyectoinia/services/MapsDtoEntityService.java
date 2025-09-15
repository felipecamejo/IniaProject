package ti.proyectoinia.services;

import ti.proyectoinia.business.entities.Hongo;
import ti.proyectoinia.dtos.HongoDto;

public class MapsDtoEntityService {

    public HongoDto mapToDtoHongo(Hongo hongo) {
        if (hongo == null) {
            return null;
        }
        HongoDto hongoDto = new HongoDto();
        hongoDto.setId(hongo.getId());
        hongoDto.setNombre(hongo.getNombre());

        return hongoDto;
    }

    public Hongo mapToEntityHongo(HongoDto hongoDto) {
        if (hongoDto == null) {
            return null;
        }
        Hongo hongo = new Hongo();
        hongo.setId(hongoDto.getId());
        hongo.setNombre(hongoDto.getNombre());

        return hongo;
    }
}

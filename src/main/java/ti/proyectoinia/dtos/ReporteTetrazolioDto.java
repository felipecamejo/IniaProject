package ti.proyectoinia.dtos;

import lombok.Data;

@Data
public class ReporteTetrazolioDto {
    
    private ReporteFilaDto vigorAlto;
    private ReporteFilaDto vigorMedio;
    private ReporteFilaDto vigorBajo;
    private ReporteFilaDto limiteCritico;
    private ReporteFilaDto noViables;
    private ReporteFilaDto viabilidad;
    private ReporteFilaDto vigorAcumulado;
}


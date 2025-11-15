package ti.proyectoinia.business.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "AUTOCOMPLETADO")
public class Autocompletado {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "AUTOCOMPLETADO_ID")
    private Long id;

    @Column(name = "AUTOCOMPLETADO_TIPO_DATO")
    private String tipoDato;

    @Column(name = "AUTOCOMPLETADO_PARAMETRO")
    private String parametro;

    @Column(name = "AUTOCOMPLETADO_VALOR")
    private String valor;

    @Column(name = "AUTOCOMPLETADO_ACTIVO")
    private boolean activo;
}


package ti.proyectoinia.api.responses;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

/**
 * Clase de respuesta estándar para los endpoints del middleware Python.
 * 
 * Esta clase representa la estructura de respuesta JSON que retorna el servidor HTTP de Python.
 * 
 * @author Sistema INIA
 * @version 1.0
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class MiddlewareResponse {
    
    @JsonProperty("exitoso")
    private Boolean exitoso;
    
    @JsonProperty("mensaje")
    private String mensaje;
    
    @JsonProperty("codigo")
    private Integer codigo;
    
    @JsonProperty("detalles")
    private String detalles;
    
    @JsonProperty("datos")
    private Map<String, Object> datos;
    
    public MiddlewareResponse() {
    }
    
    public MiddlewareResponse(Boolean exitoso, String mensaje, Integer codigo) {
        this.exitoso = exitoso;
        this.mensaje = mensaje;
        this.codigo = codigo;
    }
    
    public Boolean getExitoso() {
        return exitoso;
    }
    
    public void setExitoso(Boolean exitoso) {
        this.exitoso = exitoso;
    }
    
    public String getMensaje() {
        return mensaje;
    }
    
    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
    
    public Integer getCodigo() {
        return codigo;
    }
    
    public void setCodigo(Integer codigo) {
        this.codigo = codigo;
    }
    
    public String getDetalles() {
        return detalles;
    }
    
    public void setDetalles(String detalles) {
        this.detalles = detalles;
    }
    
    public Map<String, Object> getDatos() {
        return datos;
    }
    
    public void setDatos(Map<String, Object> datos) {
        this.datos = datos;
    }
    
    /**
     * Verifica si la respuesta indica éxito.
     * 
     * @return true si exitoso es true, false en caso contrario
     */
    public boolean esExitoso() {
        return exitoso != null && exitoso;
    }
    
    /**
     * Obtiene un mensaje completo que incluye mensaje y detalles si están disponibles.
     * 
     * @return Mensaje completo
     */
    public String getMensajeCompleto() {
        if (detalles != null && !detalles.isEmpty()) {
            return mensaje + ": " + detalles;
        }
        return mensaje != null ? mensaje : "Sin mensaje";
    }
}


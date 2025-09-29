package ti.proyectoinia.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
public class PythonMiddlewareHttpService {

    private final RestTemplate restTemplate;

    @Value("${python.middleware.base-url:http://localhost:9099}")
    private String baseUrl;

    public PythonMiddlewareHttpService() {
        this.restTemplate = new RestTemplate();
    }

    public String triggerInsertar() {
        String url = baseUrl + "/insertar";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>("{}", headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            return response.getBody();
        } catch (RestClientException ex) {
            return "Error llamando a Python /insertar: " + ex.getMessage();
        }
    }

    public byte[] descargarExportZip(String tablasCsv, String formato) {
        String url = baseUrl + "/exportar?formato=" + (formato == null ? "xlsx" : formato);
        if (tablasCsv != null && !tablasCsv.isBlank()) {
            url += "&tablas=" + tablasCsv;
        }
        try {
            ResponseEntity<byte[]> response = restTemplate.exchange(url, HttpMethod.GET, null, byte[].class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
            return null;
        } catch (RestClientException ex) {
            return null;
        }
    }
}



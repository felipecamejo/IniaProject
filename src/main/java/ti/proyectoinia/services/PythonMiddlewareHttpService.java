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
import org.springframework.core.io.ByteArrayResource;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

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
            ResponseEntity<byte[]> response = restTemplate.exchange(url, HttpMethod.POST, null, byte[].class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return response.getBody();
            }
            // Log del error para debugging
            System.err.println("Error en exportación: Status=" + response.getStatusCode() + 
                             ", Body null=" + (response.getBody() == null));
            return null;
        } catch (RestClientException ex) {
            // Log del error para debugging
            System.err.println("Error llamando a Python /exportar: " + ex.getMessage());
            return null;
        }
    }

    public String importarTabla(String table, boolean upsert, boolean keepIds, String filename, byte[] fileBytes) {
        String url = baseUrl + "/importar";
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("table", table);
            body.add("upsert", String.valueOf(upsert));
            body.add("keep_ids", String.valueOf(keepIds));

            ByteArrayResource fileResource = new ByteArrayResource(fileBytes) {
                @Override
                public String getFilename() {
                    if (filename != null && !filename.isBlank()) {
                        return filename;
                    }
                    return "data.xlsx";
                }
            };
            body.add("file", fileResource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            return response.getBody();
        } catch (RestClientException ex) {
            return "Error llamando a Python /importar: " + ex.getMessage();
        }
    }
}



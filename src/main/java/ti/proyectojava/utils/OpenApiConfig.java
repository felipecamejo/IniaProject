package ti.proyectojava.utils;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public GroupedOpenApi publicApi(){
        return GroupedOpenApi.builder()
                .group("KioscoBYF")
                .pathsToMatch("/api/**")
                .build();
    }
    @Bean
    public GroupedOpenApi publicApi2(){
        return GroupedOpenApi.builder()
                .group("tallerjava2")
                .pathsToMatch("/api/v1/socios")
                .build();
    }

    @Bean
    public OpenAPI customizeOpenAPI(){
        final String securitySchemeName = "TIAuth";
        return  new OpenAPI()

                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(
                        new Components()
                                .addSecuritySchemes(securitySchemeName,
                                        new SecurityScheme()
                                                .name(securitySchemeName)
                                                .type(SecurityScheme.Type.HTTP)
                                                .scheme("bearer")
                                                .bearerFormat("JWT")
                                )
                )
                .info(
                new Info().version("v100").description("api test para taller java")
                        .title("api test")
                        .summary("ti san jose y paysandú")

        );
    }
}

/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package ti.proyectoinia.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import static org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher;

@EnableMethodSecurity(prePostEnabled = true)
@EnableWebSecurity
@Configuration
@Profile("!test")
public class WebSecurityConfig {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .addFilterBefore(new FiltroJWTAutorizacion(jwtSecret), UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        // Rutas públicas (no requieren autenticación ni token)
                        .requestMatchers(antMatcher("/actuator/**")).permitAll() // Health checks y métricas
                        .requestMatchers(antMatcher("/api/seguridad/**")).permitAll()
                        .requestMatchers(antMatcher("/v3/api-docs/**")).permitAll() // Documentación Swagger
                        .requestMatchers(antMatcher("/swagger-ui/**")).permitAll() // UI de Swagger
                        .requestMatchers(antMatcher("/swagger-resources/**")).permitAll()
                        .requestMatchers(antMatcher("/configuration/**")).permitAll()
                        .requestMatchers(antMatcher("/webjars/**")).permitAll() // Recursos de Swagger
                        .requestMatchers(antMatcher("/error")).permitAll() // Páginas de error


                        // Excepción: los usuarios pueden acceder a su propio perfil (debe declararse antes que /usuario/**)
                        .requestMatchers(antMatcher("/api/v1/usuario/perfil/**")).hasAnyAuthority("ADMIN", "ANALISTA", "OBSERVADOR")
                        // Gestión de usuarios: solo ADMIN puede acceder
                        .requestMatchers(antMatcher("/api/v1/usuario/**")).hasAuthority("ADMIN")
                        
                        // Endpoints del middleware: solo ADMIN puede acceder
                        .requestMatchers(antMatcher("/api/pandmiddleware/**")).hasAuthority("ADMIN")
                        
                        // Endpoints de gestión de datos:
                        // - Los listados ya están protegidos a nivel de método con @Secured para permitir
                        //   ADMIN, ANALISTA y OBSERVADOR.
                        // - Operaciones de creación/edición/eliminación siguen restringidas por @Secured a ADMIN.
                        // Por eso, a nivel de filtro web permitimos ADMIN, ANALISTA y OBSERVADOR en estos recursos.
                        .requestMatchers(antMatcher("/api/v1/pms/**")).hasAnyAuthority("ADMIN", "ANALISTA", "OBSERVADOR")
                        .requestMatchers(antMatcher("/api/v1/hongo/**")).hasAnyAuthority("ADMIN", "ANALISTA", "OBSERVADOR")
                        .requestMatchers(antMatcher("/api/v1/germinacion/**")).hasAnyAuthority("ADMIN", "ANALISTA", "OBSERVADOR")
                        .requestMatchers(antMatcher("/api/v1/DOSN/**")).hasAnyAuthority("ADMIN", "ANALISTA", "OBSERVADOR")
                        .requestMatchers(antMatcher("/api/v1/pureza/**")).hasAnyAuthority("ADMIN", "ANALISTA", "OBSERVADOR")
                        .requestMatchers(antMatcher("/api/v1/maleza/**")).hasAnyAuthority("ADMIN", "ANALISTA", "OBSERVADOR")
                        .requestMatchers(antMatcher("/api/v1/PurezaPNotatum/**")).hasAnyAuthority("ADMIN", "ANALISTA", "OBSERVADOR")
                        .requestMatchers(antMatcher("/api/v1/Tetrazolio/**")).hasAnyAuthority("ADMIN", "ANALISTA", "OBSERVADOR")
                        .requestMatchers(antMatcher("/api/v1/Sanitario/**")).hasAnyAuthority("ADMIN", "ANALISTA", "OBSERVADOR")
                        .requestMatchers(antMatcher("/api/v1/recibo/**")).hasAnyAuthority("ADMIN", "ANALISTA", "OBSERVADOR")
                        .requestMatchers(antMatcher("/api/v1/deposito/**")).hasAnyAuthority("ADMIN", "ANALISTA", "OBSERVADOR")

                        // Endpoints de certificados: solo ADMIN puede acceder (crear, editar y consultar)
                        .requestMatchers(antMatcher("/api/v1/certificado/**")).hasAuthority("ADMIN")
                        
                        // Endpoints de lotes: ADMIN, ANALISTA y OBSERVADOR pueden acceder
                        .requestMatchers(antMatcher("/api/v1/lote/**")).hasAnyAuthority("ADMIN", "ANALISTA", "OBSERVADOR")

                        // Cualquier otra petición requiere autenticación
                        .anyRequest()
                        .authenticated());


        return http.build();
    }

    /*
    @Bean
    public WebMvcConfigurer configurarCorsGlobal(){
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry){
                registry.addMapping("/api/**")
                        // .allowCredentials(true) //solo si usan cookies
                        .allowedMethods("GET","POST", "PUT", "DELETE")
                        .allowedHeaders("*")
                        .allowedOriginPatterns(
                            "http://localhost:*",                         // cualquier puerto en localhost
                            "https://solfuentes-prueba.netlify.app"      // frontend en producción
                );
            }
        };
    }



    */

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOriginPattern("http://localhost:*");
        configuration.addAllowedOrigin("https://localhost:8080");
        configuration.addAllowedOrigin("https://solfuentes-prueba.netlify.app"); // Frontend en producción
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true); // Permitir cookies si es necesario

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }




}

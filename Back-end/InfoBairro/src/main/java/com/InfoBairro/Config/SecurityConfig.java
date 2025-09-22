package com.InfoBairro.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable) // desabilita CSRF se você usa API REST
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // usa a config abaixo
                .authorizeHttpRequests(auth -> auth.requestMatchers("/", "/auth/**", "/oauth2/**").permitAll().anyRequest().authenticated()) // o resto precisa de auth
                .oauth2Login(oauth2 -> oauth2.defaultSuccessUrl("http://127.0.0.1:5500", true));
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://127.0.0.1:5500", "http://127.0.0.1:5050", "http://localhost:5500")); // origem do seu fron//
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*")); // ou listar só os que você precisa
        configuration.setAllowCredentials(true); // se precisar mandar cookies/tokens
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
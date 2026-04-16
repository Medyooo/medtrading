package com.medtrading.backend.support;

import com.medtrading.backend.repository.UserRepository;
import com.medtrading.backend.security.JwtFilter;
import com.medtrading.backend.security.JwtService;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

@TestConfiguration
public class WebMvcSecurityTestConfig {

	@Bean
	JwtService jwtService() {
		return new JwtService();
	}

	@Bean
	JwtFilter jwtFilter(JwtService jwtService, UserRepository userRepository) {
		return new JwtFilter(jwtService, userRepository);
	}
}

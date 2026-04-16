package com.medtrading.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medtrading.backend.dto.AuthDTO;
import com.medtrading.backend.entity.User;
import com.medtrading.backend.exception.GlobalExceptionHandler;
import com.medtrading.backend.repository.UserRepository;
import com.medtrading.backend.security.SecurityConfig;
import com.medtrading.backend.support.WebMvcSecurityTestConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.hamcrest.Matchers.matchesPattern;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc
@Import({SecurityConfig.class, GlobalExceptionHandler.class, WebMvcSecurityTestConfig.class})
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    @Test
    void register_success() throws Exception {
        when(userRepository.existsByEmail("med@test.com")).thenReturn(false);
        when(passwordEncoder.encode("test123")).thenReturn("hashed");

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setUsername("mohamed");
        savedUser.setEmail("med@test.com");
        savedUser.setPassword("hashed");
        savedUser.setRole("USER");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        AuthDTO.RegisterRequest request = new AuthDTO.RegisterRequest(
                "mohamed", "med@test.com", "test123"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value(matchesPattern(".+")))
                .andExpect(jsonPath("$.email").value("med@test.com"));
    }

    @Test
    void login_success() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setUsername("mohamed");
        user.setEmail("med@test.com");
        user.setPassword("hashed");
        user.setRole("USER");

        when(userRepository.findByEmail("med@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("test123", "hashed")).thenReturn(true);

        AuthDTO.LoginRequest request = new AuthDTO.LoginRequest(
                "med@test.com", "test123"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value(matchesPattern(".+")));
    }

    @Test
    void login_userNotFound_returns401() throws Exception {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        AuthDTO.LoginRequest request = new AuthDTO.LoginRequest(
                "unknown@test.com", "test123"
        );

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void register_invalidEmail_returns422() throws Exception {
        AuthDTO.RegisterRequest request = new AuthDTO.RegisterRequest(
                "mohamed", "pas-un-email", "test123"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnprocessableEntity());
    }

}

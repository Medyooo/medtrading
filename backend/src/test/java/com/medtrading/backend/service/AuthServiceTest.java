package com.medtrading.backend.service;

import com.medtrading.backend.entity.User;
import com.medtrading.backend.exception.ApiException;
import com.medtrading.backend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthService authService;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getCurrentUser_success() {
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken("med@test.com", null, new ArrayList<>());
        SecurityContextHolder.getContext().setAuthentication(auth);

        User user = new User();
        user.setId(1L);
        user.setEmail("med@test.com");
        user.setUsername("mohamed");

        when(userRepository.findByEmail("med@test.com")).thenReturn(Optional.of(user));

        User result = authService.getCurrentUser();

        assertNotNull(result);
        assertEquals("med@test.com", result.getEmail());
        assertEquals("mohamed", result.getUsername());
    }

    @Test
    void getCurrentUser_userNotFound_throws401() {
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken("unknown@test.com", null, new ArrayList<>());
        SecurityContextHolder.getContext().setAuthentication(auth);

        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        ApiException exception = assertThrows(ApiException.class, () -> {
            authService.getCurrentUser();
        });

        assertEquals(401, exception.getStatus().value());
    }
}

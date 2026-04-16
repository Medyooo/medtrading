package com.medtrading.backend.service;

import com.medtrading.backend.dto.AuthDTO;
import com.medtrading.backend.entity.User;
import com.medtrading.backend.exception.ApiException;
import com.medtrading.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    public User getCurrentUser(){
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal()
                .toString();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User non authentifie"));
    }
}

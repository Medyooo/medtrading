package com.medtrading.backend.controller;


import com.medtrading.backend.dto.AuthDTO;
import com.medtrading.backend.entity.User;
import com.medtrading.backend.exception.ApiException;
import com.medtrading.backend.repository.UserRepository;
import com.medtrading.backend.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, JwtService jwtService, PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public AuthDTO.AuthResponse register(@Valid @RequestBody AuthDTO.RegisterRequest request){
        if (userRepository.existsByEmail(request.email())){
            throw new ApiException(HttpStatus.CONFLICT, "Cet email existe deja");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole("USER");

        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());

        return new AuthDTO.AuthResponse(token, user.getEmail(), user.getUsername());
    }

    @PostMapping("/login")
    public AuthDTO.AuthResponse login(@Valid @RequestBody AuthDTO.LoginRequest request){
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())){
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect");
        }

        String token = jwtService.generateToken(user.getEmail());

        return new AuthDTO.AuthResponse(token, user.getEmail(), user.getUsername());
    }

}

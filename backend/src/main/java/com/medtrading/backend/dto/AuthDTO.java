package com.medtrading.backend.dto;

import jakarta.validation.constraints.*;

public class AuthDTO {

    public record RegisterRequest(
            @NotBlank(message = "Le username est obligatoire")
            @Size(min = 3, max = 50, message = "Le username doit faire entre 3 et 50 caractères")
            String username,

            @NotBlank(message = "L'email est obligatoire")
            @Email(message = "L'email n'est pas valide")
            String email,

            @NotBlank(message = "Le mot de passe est obligatoire")
            @Size(min = 6, message = "Le mot de passe doit faire au moins 6 caractères")
            String password
    ){}

    public record LoginRequest(
            @NotBlank(message = "L'email est obligatoire")
            @Email(message = "L'email n'est pas valide")
            String email,

            @NotBlank(message = "Le mot de passe est obligatoire")
            String password
    ){}

    public record AuthResponse(
            String token,
            String email,
            String username
    ){}
}

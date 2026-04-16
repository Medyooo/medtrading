package com.medtrading.backend.dto;

public class UserDTO {
    public record CreateUserRequest(
            String username,
            String email,
            String password
    ) {}

    public record UserResponse(
            Long id,
            String username,
            String email
    ) {}
}

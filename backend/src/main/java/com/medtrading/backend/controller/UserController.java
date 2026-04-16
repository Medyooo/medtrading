package com.medtrading.backend.controller;

import com.medtrading.backend.dto.UserDTO;
import com.medtrading.backend.entity.User;
import com.medtrading.backend.exception.ApiException;
import com.medtrading.backend.repository.UserRepository;
import com.medtrading.backend.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final AuthService authService;

    public UserController(UserRepository userRepository, AuthService authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserDTO.UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/me")
    public UserDTO.UserResponse getMyProfile() {
        User user = authService.getCurrentUser();
        return toResponse(user);
    }

    @PutMapping("/me")
    public UserDTO.UserResponse updateUser(@RequestBody UserDTO.CreateUserRequest request){
        User user = authService.getCurrentUser();

        user.setUsername(request.username());
        user.setEmail(request.email());

        User saved = userRepository.save(user);
        return toResponse(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(@PathVariable Long id ){
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus  .NOT_FOUND, "User introuvable avec l'id " + id));

        userRepository.delete(user);
    }

    private UserDTO.UserResponse toResponse(User user) {
        return new UserDTO.UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail()
        );
    }
}
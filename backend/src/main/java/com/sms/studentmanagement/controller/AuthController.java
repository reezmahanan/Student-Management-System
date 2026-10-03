package com.sms.studentmanagement.controller;

import com.sms.studentmanagement.dto.ApiResponse;
import com.sms.studentmanagement.dto.AuthDTOs;
import com.sms.studentmanagement.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthDTOs.JwtResponse>> authenticateUser(
            @Valid @RequestBody AuthDTOs.LoginRequest loginRequest) {
        log.info("Auth request for user: {}", loginRequest.getUsername());
        AuthDTOs.JwtResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthDTOs.JwtResponse>> registerUser(
            @Valid @RequestBody AuthDTOs.RegisterRequest registerRequest) {
        log.info("Register request for user: {}", registerRequest.getUsername());
        AuthDTOs.JwtResponse response = authService.register(registerRequest);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", response));
    }
}

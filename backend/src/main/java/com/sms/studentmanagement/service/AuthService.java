package com.sms.studentmanagement.service;

import com.sms.studentmanagement.dto.AuthDTOs;

public interface AuthService {
    AuthDTOs.JwtResponse login(AuthDTOs.LoginRequest request);
    AuthDTOs.JwtResponse register(AuthDTOs.RegisterRequest request);
    void seedInitialUsersAndDemoData();
}

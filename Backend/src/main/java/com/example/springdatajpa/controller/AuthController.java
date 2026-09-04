package com.example.springdatajpa.controller;

import com.example.springdatajpa.dto.AuthResponse;
import com.example.springdatajpa.dto.LoginRequest;
import com.example.springdatajpa.entity.RefreshToken;
import com.example.springdatajpa.service.JwtService;
import com.example.springdatajpa.service.RefreshTokenService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {
    private final RefreshTokenService refreshTokenService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(RefreshTokenService refreshTokenService, AuthenticationManager authenticationManager,
                          JwtService jwtService) {
        this.refreshTokenService = refreshTokenService;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/refresh")
    public AuthResponse refreshToken(@RequestParam String refreshToken) {

        RefreshToken token =
                refreshTokenService.findByToken(refreshToken);

        refreshTokenService.verifyExpiration(token);

        String username = token.getUser().getUsername();

        String accessToken =
                jwtService.generateToken(username);

        return new AuthResponse(
                accessToken,
                refreshToken
        );
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        String accessToken =
                jwtService.generateToken(request.getUsername());

        RefreshToken refreshToken =
                refreshTokenService.createRefreshToken(
                        request.getUsername()
                );

        return new AuthResponse(
                accessToken,
                refreshToken.getToken()
        );
    }
    @PostMapping("/logout")
    public String logout(@RequestParam String refreshToken) {

        RefreshToken token =
                refreshTokenService.findByToken(refreshToken);

        refreshTokenService.deleteByUserId(
                token.getUser().getId()
        );

        return "Logged out successfully";
    }
}

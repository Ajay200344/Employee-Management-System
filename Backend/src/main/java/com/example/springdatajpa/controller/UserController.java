package com.example.springdatajpa.controller;
import com.example.springdatajpa.dto.RegisterRequest;
import com.example.springdatajpa.entity.User;
import com.example.springdatajpa.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public User register(@Valid @RequestBody RegisterRequest request) {
        return userService.register(request);
    }
}
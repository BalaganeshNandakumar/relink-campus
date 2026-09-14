package com.campus.lostandfound.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.campus.lostandfound.dto.LoginRequest;
import com.campus.lostandfound.dto.LoginResponse;
import com.campus.lostandfound.dto.RegisterRequest;
import com.campus.lostandfound.dto.UserResponse;
import com.campus.lostandfound.exception.EmailAlreadyExistsException;
import com.campus.lostandfound.exception.InvalidCredentialsException;
import com.campus.lostandfound.model.User;
import com.campus.lostandfound.repository.UserRepository;
import com.campus.lostandfound.security.JwtService;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public UserResponse registerUser(RegisterRequest request) {
        // Check whether the email already exists in the database
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email is already registered: " + request.getEmail());
        }

        // Map DTO to User entity and hash the password using BCrypt
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Persist the user with the hashed password to PostgreSQL
        User savedUser = userRepository.save(user);

        // Return a response without the password field
        return new UserResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                "User registered successfully"
        );
    }

    public LoginResponse loginUser(LoginRequest request) {
        // Find the user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        // Verify plain-text password against stored BCrypt hash
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        // Generate stateless JWT token
        String token = jwtService.generateToken(user.getId(), user.getEmail());

        // Return successful login response with JWT token
        return new LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                token,
                "Login successful"
        );
    }
}

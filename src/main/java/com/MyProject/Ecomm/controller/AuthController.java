package com.MyProject.Ecomm.controller;

import com.MyProject.Ecomm.dto.AuthResponse;
import com.MyProject.Ecomm.dto.ForgotPasswordRequest;
import com.MyProject.Ecomm.dto.LoginRequest;
import com.MyProject.Ecomm.dto.MessageResponse;
import com.MyProject.Ecomm.dto.ResetPasswordRequest;
import com.MyProject.Ecomm.dto.SignupRequest;
import com.MyProject.Ecomm.model.User;
import com.MyProject.Ecomm.repo.UserRepository;
import com.MyProject.Ecomm.security.JwtUtil;
import com.MyProject.Ecomm.security.UserPrincipal;
import com.MyProject.Ecomm.service.PasswordResetService;
import com.MyProject.Ecomm.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final String INVALID_CREDENTIALS_MESSAGE = "Invalid credentials";

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final RegistrationService registrationService;
    private final PasswordResetService passwordResetService;

    public AuthController(PasswordEncoder passwordEncoder,
                          UserRepository userRepository,
                          JwtUtil jwtUtil,
                          RegistrationService registrationService,
                          PasswordResetService passwordResetService) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.registrationService = registrationService;
        this.passwordResetService = passwordResetService;
    }

    // ================= REGISTER =================
    @PostMapping({"/signup", "/register"})
    public ResponseEntity<String> register(@Valid @RequestBody SignupRequest request) {
        User user = registrationService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("User registered successfully with id " + user.getId());
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        if (loginRequest == null
                || !StringUtils.hasText(loginRequest.getEmail())
                || !StringUtils.hasText(loginRequest.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and password are required");
        }

        String normalizedEmail = loginRequest.getEmail().trim().toLowerCase(Locale.ROOT);
        Optional<User> optionalUser = userRepository.findByEmail(normalizedEmail);

        if (optionalUser.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, INVALID_CREDENTIALS_MESSAGE);
        }

        User user = optionalUser.get();

        if (!passwordEncoder.matches(
                loginRequest.getPassword(),
                user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, INVALID_CREDENTIALS_MESSAGE);
        }

        String token = jwtUtil.generateToken(UserPrincipal.create(user));

        // Never send password to frontend
        user.setPassword(null);

        AuthResponse response = new AuthResponse(user, token);

        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .body(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.requestPasswordReset(request);
        return ResponseEntity.accepted().body(
                new MessageResponse("If an account exists for that email, a password reset link has been sent.")
        );
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request);
        return ResponseEntity.ok(new MessageResponse("Password has been reset successfully."));
    }
}

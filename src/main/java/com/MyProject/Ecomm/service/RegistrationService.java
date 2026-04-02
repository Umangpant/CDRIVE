package com.MyProject.Ecomm.service;

import com.MyProject.Ecomm.dto.SignupRequest;
import com.MyProject.Ecomm.messaging.EmailEventPublisher;
import com.MyProject.Ecomm.model.Role;
import com.MyProject.Ecomm.model.User;
import com.MyProject.Ecomm.repo.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class RegistrationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailEventPublisher emailEventPublisher;

    public RegistrationService(UserRepository userRepository,
                               PasswordEncoder passwordEncoder,
                               EmailEventPublisher emailEventPublisher) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailEventPublisher = emailEventPublisher;
    }

    @Transactional
    public User registerUser(SignupRequest request) {
        User user = createUser(request, Role.USER);
        emailEventPublisher.publishUserRegistered(user);
        return user;
    }

    @Transactional
    public User registerAdmin(SignupRequest request) {
        User admin = createUser(request, Role.ADMIN);
        emailEventPublisher.publishAdminRegistered(admin);
        return admin;
    }

    private User createUser(SignupRequest request, Role role) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }

        String name = normalize(request.getName());
        String email = normalizeEmail(request.getEmail());
        String password = request.getPassword();

        if (!StringUtils.hasText(name) || !StringUtils.hasText(email) || !StringUtils.hasText(password)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name, email, and password are required");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already registered");
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);

        return userRepository.save(user);
    }

    private String normalize(String value) {
        return value == null ? null : value.trim();
    }

    private String normalizeEmail(String value) {
        return value == null ? null : value.trim().toLowerCase(Locale.ROOT);
    }
}

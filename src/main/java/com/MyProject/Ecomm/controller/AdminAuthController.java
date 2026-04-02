package com.MyProject.Ecomm.controller;

import com.MyProject.Ecomm.dto.SignupRequest;
import com.MyProject.Ecomm.model.User;
import com.MyProject.Ecomm.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminAuthController {

    private final RegistrationService registrationService;

    public AdminAuthController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@Valid @RequestBody SignupRequest request) {
        User admin = registrationService.registerAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Admin registered successfully with id " + admin.getId());
    }
}

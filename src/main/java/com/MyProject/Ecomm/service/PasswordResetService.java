package com.MyProject.Ecomm.service;

import com.MyProject.Ecomm.dto.ForgotPasswordRequest;
import com.MyProject.Ecomm.dto.ResetPasswordRequest;
import com.MyProject.Ecomm.messaging.EmailEventPublisher;
import com.MyProject.Ecomm.model.PasswordResetToken;
import com.MyProject.Ecomm.model.User;
import com.MyProject.Ecomm.repo.PasswordResetTokenRepository;
import com.MyProject.Ecomm.repo.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.Locale;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailEventPublisher emailEventPublisher;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Value("${app.password-reset.expiration-minutes:30}")
    private long expirationMinutes;

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetTokenRepository passwordResetTokenRepository,
                                PasswordEncoder passwordEncoder,
                                EmailEventPublisher emailEventPublisher) {
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailEventPublisher = emailEventPublisher;
    }

    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest request) {
        if (request == null || !StringUtils.hasText(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        String email = normalizeEmail(request.getEmail());
        userRepository.findByEmail(email).ifPresent(this::createAndSendResetToken);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (request == null || !StringUtils.hasText(request.getToken()) || !StringUtils.hasText(request.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset token and password are required");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(hashToken(request.getToken().trim()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset link is invalid or expired"));

        if (resetToken.isUsed() || resetToken.isExpired()) {
            passwordResetTokenRepository.deleteByUser(resetToken.getUser());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset link is invalid or expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        passwordResetTokenRepository.deleteByUser(user);
    }

    private void createAndSendResetToken(User user) {
        passwordResetTokenRepository.deleteByUser(user);

        String rawToken = generateToken();
        long effectiveExpirationMinutes = Math.max(expirationMinutes, 5);
        Instant expiresAt = Instant.now().plus(effectiveExpirationMinutes, ChronoUnit.MINUTES);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setTokenHash(hashToken(rawToken));
        resetToken.setExpiresAt(expiresAt);

        passwordResetTokenRepository.save(resetToken);
        emailEventPublisher.publishPasswordResetRequested(user, buildResetLink(rawToken), effectiveExpirationMinutes);
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private String buildResetLink(String token) {
        String normalizedBaseUrl = frontendBaseUrl == null ? "" : frontendBaseUrl.trim();
        if (normalizedBaseUrl.isBlank()) {
            normalizedBaseUrl = "http://localhost:5173";
        }
        if (normalizedBaseUrl.endsWith("/")) {
            normalizedBaseUrl = normalizedBaseUrl.substring(0, normalizedBaseUrl.length() - 1);
        }

        return normalizedBaseUrl + "/reset-password?token=" +
                URLEncoder.encode(token, StandardCharsets.UTF_8);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not available", ex);
        }
    }

    private String normalizeEmail(String value) {
        return value == null ? null : value.trim().toLowerCase(Locale.ROOT);
    }
}

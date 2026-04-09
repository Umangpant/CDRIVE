package com.MyProject.Ecomm.service;

import com.MyProject.Ecomm.messaging.EmailEventPublisher;
import com.MyProject.Ecomm.model.BookingModel;
import com.MyProject.Ecomm.model.ReservationStatus;
import com.MyProject.Ecomm.model.Role;
import com.MyProject.Ecomm.model.User;
import com.MyProject.Ecomm.repo.BookingRepo;
import com.MyProject.Ecomm.repo.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class NotificationService {

    private final UserRepository userRepository;
    private final BookingRepo bookingRepo;
    private final EmailEventPublisher emailEventPublisher;

    public NotificationService(UserRepository userRepository,
                               BookingRepo bookingRepo,
                               EmailEventPublisher emailEventPublisher) {
        this.userRepository = userRepository;
        this.bookingRepo = bookingRepo;
        this.emailEventPublisher = emailEventPublisher;
    }

    @Transactional(readOnly = true)
    public User resendWelcomeEmailToCurrentUser(String email) {
        User user = userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        publishWelcomeEvent(user);
        return user;
    }

    @Transactional(readOnly = true)
    public User resendWelcomeEmailByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        publishWelcomeEvent(user);
        return user;
    }

    @Transactional(readOnly = true)
    public BookingModel resendReservationApprovedEmail(Integer reservationId, Integer adminId) {
        BookingModel reservation = bookingRepo.findVisibleByIdForAdmin(reservationId, adminId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));

        if (reservation.getStatus() != ReservationStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Reservation must be approved before its approval email can be resent");
        }

        emailEventPublisher.publishReservationApproved(reservation);
        return reservation;
    }

    private void publishWelcomeEvent(User user) {
        Role role = user.getRole() == null ? Role.USER : user.getRole();
        if (role == Role.ADMIN) {
            emailEventPublisher.publishAdminRegistered(user);
            return;
        }
        emailEventPublisher.publishUserRegistered(user);
    }

    private String normalizeEmail(String value) {
        return value == null ? null : value.trim().toLowerCase(Locale.ROOT);
    }
}

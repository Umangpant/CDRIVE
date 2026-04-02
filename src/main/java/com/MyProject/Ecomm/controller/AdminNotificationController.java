package com.MyProject.Ecomm.controller;

import com.MyProject.Ecomm.dto.NotificationDispatchResponse;
import com.MyProject.Ecomm.messaging.MessagingConstants;
import com.MyProject.Ecomm.model.BookingModel;
import com.MyProject.Ecomm.model.Role;
import com.MyProject.Ecomm.model.User;
import com.MyProject.Ecomm.security.AuthenticatedUserFacade;
import com.MyProject.Ecomm.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/notifications")
@CrossOrigin(origins = "*")
public class AdminNotificationController {

    private final NotificationService notificationService;
    private final AuthenticatedUserFacade authenticatedUserFacade;

    public AdminNotificationController(NotificationService notificationService,
                                       AuthenticatedUserFacade authenticatedUserFacade) {
        this.notificationService = notificationService;
        this.authenticatedUserFacade = authenticatedUserFacade;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/users/{userId}/welcome/resend")
    public ResponseEntity<NotificationDispatchResponse> resendWelcomeEmail(@PathVariable Long userId) {
        User user = notificationService.resendWelcomeEmailByUserId(userId);
        String eventType = user.getRole() == Role.ADMIN
                ? MessagingConstants.ADMIN_REGISTERED_EVENT
                : MessagingConstants.USER_REGISTERED_EVENT;

        NotificationDispatchResponse response = new NotificationDispatchResponse(
                "Welcome email queued successfully",
                eventType,
                user.getEmail(),
                "user",
                String.valueOf(user.getId())
        );

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/reservations/{reservationId}/approved/resend")
    public ResponseEntity<NotificationDispatchResponse> resendReservationApprovedEmail(
            @PathVariable Integer reservationId) {
        BookingModel reservation = notificationService.resendReservationApprovedEmail(
                reservationId,
                authenticatedUserFacade.getCurrentUserId()
        );

        NotificationDispatchResponse response = new NotificationDispatchResponse(
                "Reservation approval email queued successfully",
                MessagingConstants.RESERVATION_APPROVED_EVENT,
                reservation.getUserEmail(),
                "reservation",
                String.valueOf(reservation.getId())
        );

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }
}

package com.MyProject.Ecomm.controller;

import com.MyProject.Ecomm.dto.NotificationDispatchResponse;
import com.MyProject.Ecomm.messaging.MessagingConstants;
import com.MyProject.Ecomm.model.Role;
import com.MyProject.Ecomm.model.User;
import com.MyProject.Ecomm.security.AuthenticatedUserFacade;
import com.MyProject.Ecomm.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthenticatedUserFacade authenticatedUserFacade;

    public NotificationController(NotificationService notificationService,
                                  AuthenticatedUserFacade authenticatedUserFacade) {
        this.notificationService = notificationService;
        this.authenticatedUserFacade = authenticatedUserFacade;
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/welcome/resend")
    public ResponseEntity<NotificationDispatchResponse> resendMyWelcomeEmail() {
        User user = notificationService.resendWelcomeEmailToCurrentUser(authenticatedUserFacade.getCurrentUserEmail());
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
}

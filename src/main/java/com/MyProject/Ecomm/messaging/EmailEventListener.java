package com.MyProject.Ecomm.messaging;

import com.MyProject.Ecomm.dto.EmailEvent;
import com.MyProject.Ecomm.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class EmailEventListener {

    private static final Logger log = LoggerFactory.getLogger(EmailEventListener.class);

    private final EmailService emailService;

    public EmailEventListener(EmailService emailService) {
        this.emailService = emailService;
    }

    @RabbitListener(queues = MessagingConstants.USER_WELCOME_QUEUE)
    public void onUserRegistered(EmailEvent event) {
        log.info("Processing user welcome email for {}", event.getTo());
        emailService.sendEmail(event);
    }

    @RabbitListener(queues = MessagingConstants.ADMIN_WELCOME_QUEUE)
    public void onAdminRegistered(EmailEvent event) {
        log.info("Processing admin welcome email for {}", event.getTo());
        emailService.sendEmail(event);
    }

    @RabbitListener(queues = MessagingConstants.RESERVATION_APPROVED_QUEUE)
    public void onReservationApproved(EmailEvent event) {
        log.info("Processing reservation approval email for {}", event.getTo());
        emailService.sendEmail(event);
    }

    @RabbitListener(queues = MessagingConstants.PASSWORD_RESET_QUEUE)
    public void onPasswordResetRequested(EmailEvent event) {
        log.info("Processing password reset email for {}", event.getTo());
        emailService.sendEmail(event);
    }
}

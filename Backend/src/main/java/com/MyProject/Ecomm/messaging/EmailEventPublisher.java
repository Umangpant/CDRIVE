package com.MyProject.Ecomm.messaging;

import com.MyProject.Ecomm.dto.EmailEvent;
import com.MyProject.Ecomm.model.BookingModel;
import com.MyProject.Ecomm.model.Role;
import com.MyProject.Ecomm.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class EmailEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(EmailEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;

    public EmailEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishUserRegistered(User user) {
        publish(
                MessagingConstants.USER_REGISTERED_ROUTING_KEY,
                new EmailEvent(
                        user.getEmail(),
                        "Welcome to CDrive",
                        MessagingConstants.USER_REGISTERED_EVENT,
                        buildRegistrationData(user)
                )
        );
    }

    public void publishAdminRegistered(User admin) {
        publish(
                MessagingConstants.ADMIN_REGISTERED_ROUTING_KEY,
                new EmailEvent(
                        admin.getEmail(),
                        "Welcome to CDrive Admin Portal",
                        MessagingConstants.ADMIN_REGISTERED_EVENT,
                        buildRegistrationData(admin)
                )
        );
    }

    public void publishReservationApproved(BookingModel reservation) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("name", reservation.getUserName());
        data.put("reservationId", reservation.getId());
        data.put("carName", reservation.getCarName());
        data.put("pickupLocation", reservation.getPickupLocation());
        data.put("preferredDate", reservation.getPreferredDate());
        data.put("preferredTime", reservation.getPreferredTime());
        data.put("bookingDate", reservation.getBookingDate());
        data.put("numberOfDays", reservation.getNumberOfDays());
        data.put("totalPrice", reservation.getTotalPrice());
        data.put("status", reservation.getStatus() == null ? null : reservation.getStatus().name());

        publish(
                MessagingConstants.RESERVATION_APPROVED_ROUTING_KEY,
                new EmailEvent(
                        reservation.getUserEmail(),
                        "Your reservation has been approved",
                        MessagingConstants.RESERVATION_APPROVED_EVENT,
                        data
                )
        );
    }

    public void publishPasswordResetRequested(User user, String resetLink, long expiresInMinutes) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("name", user.getName());
        data.put("email", user.getEmail());
        data.put("role", user.getRole() == null ? Role.USER.name() : user.getRole().name());
        data.put("resetLink", resetLink);
        data.put("expiresInMinutes", expiresInMinutes);

        publish(
                MessagingConstants.PASSWORD_RESET_ROUTING_KEY,
                new EmailEvent(
                        user.getEmail(),
                        "Reset your CDrive password",
                        MessagingConstants.PASSWORD_RESET_EVENT,
                        data
                )
        );
    }

    private void publish(String routingKey, EmailEvent event) {
        log.info("Publishing email event type={} to {} with routing key={}",
                event.getType(), event.getTo(), routingKey);
        rabbitTemplate.convertAndSend(MessagingConstants.EXCHANGE_NAME, routingKey, event);
    }

    private Map<String, Object> buildRegistrationData(User user) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("name", user.getName());
        data.put("email", user.getEmail());
        data.put("role", user.getRole() == null ? Role.USER.name() : user.getRole().name());
        return data;
    }
}

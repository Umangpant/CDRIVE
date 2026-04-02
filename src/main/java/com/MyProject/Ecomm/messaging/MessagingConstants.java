package com.MyProject.Ecomm.messaging;

public final class MessagingConstants {

    public static final String EXCHANGE_NAME = "reservation.exchange";
    public static final String DEAD_LETTER_EXCHANGE_NAME = EXCHANGE_NAME + ".dlx";

    public static final String USER_WELCOME_QUEUE = "user.welcome.queue";
    public static final String ADMIN_WELCOME_QUEUE = "admin.welcome.queue";
    public static final String RESERVATION_APPROVED_QUEUE = "reservation.approved.queue";
    public static final String PASSWORD_RESET_QUEUE = "password.reset.queue";

    public static final String USER_REGISTERED_ROUTING_KEY = "user.registered";
    public static final String ADMIN_REGISTERED_ROUTING_KEY = "admin.registered";
    public static final String RESERVATION_APPROVED_ROUTING_KEY = "reservation.approved";
    public static final String PASSWORD_RESET_ROUTING_KEY = "auth.password.reset";

    public static final String USER_REGISTERED_EVENT = "USER_REGISTERED";
    public static final String ADMIN_REGISTERED_EVENT = "ADMIN_REGISTERED";
    public static final String RESERVATION_APPROVED_EVENT = "RESERVATION_APPROVED";
    public static final String PASSWORD_RESET_EVENT = "PASSWORD_RESET_REQUESTED";

    private MessagingConstants() {
    }

    public static String deadLetterQueueName(String queueName) {
        return queueName + ".dlq";
    }

    public static String deadLetterRoutingKey(String routingKey) {
        return routingKey + ".dlq";
    }
}

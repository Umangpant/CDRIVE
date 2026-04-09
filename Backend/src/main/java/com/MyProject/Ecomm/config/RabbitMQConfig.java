package com.MyProject.Ecomm.config;

import com.MyProject.Ecomm.messaging.MessagingConstants;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.rabbit.config.RetryInterceptorBuilder;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.retry.RejectAndDontRequeueRecoverer;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableRabbit
public class RabbitMQConfig {

    // -------------------------------------------------------------------------
    // Exchanges
    // -------------------------------------------------------------------------

    @Bean
    public TopicExchange reservationExchange() {
        return new TopicExchange(MessagingConstants.EXCHANGE_NAME, true, false);
    }

    @Bean
    public TopicExchange deadLetterExchange() {
        return new TopicExchange(MessagingConstants.DEAD_LETTER_EXCHANGE_NAME, true, false);
    }

    // -------------------------------------------------------------------------
    // Primary Queues  (each carries x-dead-letter-exchange + x-dead-letter-routing-key)
    // -------------------------------------------------------------------------

    @Bean
    public Queue userWelcomeQueue() {
        return primaryQueue(
                MessagingConstants.USER_WELCOME_QUEUE,
                MessagingConstants.deadLetterRoutingKey(MessagingConstants.USER_REGISTERED_ROUTING_KEY)
        );
    }

    @Bean
    public Queue adminWelcomeQueue() {
        return primaryQueue(
                MessagingConstants.ADMIN_WELCOME_QUEUE,
                MessagingConstants.deadLetterRoutingKey(MessagingConstants.ADMIN_REGISTERED_ROUTING_KEY)
        );
    }

    @Bean
    public Queue reservationApprovedQueue() {
        return primaryQueue(
                MessagingConstants.RESERVATION_APPROVED_QUEUE,
                MessagingConstants.deadLetterRoutingKey(MessagingConstants.RESERVATION_APPROVED_ROUTING_KEY)
        );
    }

    @Bean
    public Queue passwordResetQueue() {
        return primaryQueue(
                MessagingConstants.PASSWORD_RESET_QUEUE,
                MessagingConstants.deadLetterRoutingKey(MessagingConstants.PASSWORD_RESET_ROUTING_KEY)
        );
    }

    // -------------------------------------------------------------------------
    // Dead-Letter Queues
    // -------------------------------------------------------------------------

    @Bean
    public Queue userWelcomeDeadLetterQueue() {
        return deadLetterQueue(MessagingConstants.USER_WELCOME_QUEUE);
    }

    @Bean
    public Queue adminWelcomeDeadLetterQueue() {
        return deadLetterQueue(MessagingConstants.ADMIN_WELCOME_QUEUE);
    }

    @Bean
    public Queue reservationApprovedDeadLetterQueue() {
        return deadLetterQueue(MessagingConstants.RESERVATION_APPROVED_QUEUE);
    }

    @Bean
    public Queue passwordResetDeadLetterQueue() {
        return deadLetterQueue(MessagingConstants.PASSWORD_RESET_QUEUE);
    }

    // -------------------------------------------------------------------------
    // Bindings — Primary Queues → reservation exchange
    // -------------------------------------------------------------------------

    @Bean
    public Binding userWelcomeBinding(@Qualifier("userWelcomeQueue") Queue userWelcomeQueue,
                                      TopicExchange reservationExchange) {
        return BindingBuilder.bind(userWelcomeQueue)
                .to(reservationExchange)
                .with(MessagingConstants.USER_REGISTERED_ROUTING_KEY);
    }

    @Bean
    public Binding adminWelcomeBinding(@Qualifier("adminWelcomeQueue") Queue adminWelcomeQueue,
                                       TopicExchange reservationExchange) {
        return BindingBuilder.bind(adminWelcomeQueue)
                .to(reservationExchange)
                .with(MessagingConstants.ADMIN_REGISTERED_ROUTING_KEY);
    }

    @Bean
    public Binding reservationApprovedBinding(@Qualifier("reservationApprovedQueue") Queue reservationApprovedQueue,
                                              TopicExchange reservationExchange) {
        return BindingBuilder.bind(reservationApprovedQueue)
                .to(reservationExchange)
                .with(MessagingConstants.RESERVATION_APPROVED_ROUTING_KEY);
    }

    @Bean
    public Binding passwordResetBinding(@Qualifier("passwordResetQueue") Queue passwordResetQueue,
                                        TopicExchange reservationExchange) {
        return BindingBuilder.bind(passwordResetQueue)
                .to(reservationExchange)
                .with(MessagingConstants.PASSWORD_RESET_ROUTING_KEY);
    }

    // -------------------------------------------------------------------------
    // Bindings — Dead-Letter Queues → dead-letter exchange
    // -------------------------------------------------------------------------

    @Bean
    public Binding userWelcomeDeadLetterBinding(@Qualifier("userWelcomeDeadLetterQueue") Queue queue,
                                                TopicExchange deadLetterExchange) {
        return BindingBuilder.bind(queue)
                .to(deadLetterExchange)
                .with(MessagingConstants.deadLetterRoutingKey(MessagingConstants.USER_REGISTERED_ROUTING_KEY));
    }

    @Bean
    public Binding adminWelcomeDeadLetterBinding(@Qualifier("adminWelcomeDeadLetterQueue") Queue queue,
                                                 TopicExchange deadLetterExchange) {
        return BindingBuilder.bind(queue)
                .to(deadLetterExchange)
                .with(MessagingConstants.deadLetterRoutingKey(MessagingConstants.ADMIN_REGISTERED_ROUTING_KEY));
    }

    @Bean
    public Binding reservationApprovedDeadLetterBinding(@Qualifier("reservationApprovedDeadLetterQueue") Queue queue,
                                                        TopicExchange deadLetterExchange) {
        return BindingBuilder.bind(queue)
                .to(deadLetterExchange)
                .with(MessagingConstants.deadLetterRoutingKey(MessagingConstants.RESERVATION_APPROVED_ROUTING_KEY));
    }

    @Bean
    public Binding passwordResetDeadLetterBinding(@Qualifier("passwordResetDeadLetterQueue") Queue queue,
                                                  TopicExchange deadLetterExchange) {
        return BindingBuilder.bind(queue)
                .to(deadLetterExchange)
                .with(MessagingConstants.deadLetterRoutingKey(MessagingConstants.PASSWORD_RESET_ROUTING_KEY));
    }

    // -------------------------------------------------------------------------
    // RabbitAdmin — explicit bean so Spring does NOT silently ignore declaration
    // errors. mismatched-queue exceptions will surface clearly in logs rather
    // than being swallowed, making misconfiguration instantly visible.
    // -------------------------------------------------------------------------

    @Bean
    public RabbitAdmin rabbitAdmin(ConnectionFactory connectionFactory) {
        RabbitAdmin admin = new RabbitAdmin(connectionFactory);
        // Throw on startup if any queue/exchange declaration fails.
        // This converts a silent, confusing retry-loop into a fast-fail with a
        // clear error message — critical for diagnosing the exact error you hit.
        admin.setIgnoreDeclarationExceptions(false);
        return admin;
    }

    // -------------------------------------------------------------------------
    // Messaging infrastructure
    // -------------------------------------------------------------------------

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                         MessageConverter messageConverter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(messageConverter);
        return rabbitTemplate;
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            MessageConverter messageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(messageConverter);
        // Do NOT requeue rejected messages — lets the DLX receive them instead
        factory.setDefaultRequeueRejected(false);
        factory.setAdviceChain(
                RetryInterceptorBuilder.stateless()
                        .maxAttempts(3)
                        .backOffOptions(1000, 2.0, 10000)   // 1s → 2s → 4s (cap 10s)
                        .recoverer(new RejectAndDontRequeueRecoverer())
                        .build()
        );
        return factory;
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Durable, non-exclusive, non-auto-delete queue wired to the dead-letter
     * exchange so that rejected / expired messages are not lost.
     */
    private Queue primaryQueue(String queueName, String deadLetterRoutingKey) {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("x-dead-letter-exchange", MessagingConstants.DEAD_LETTER_EXCHANGE_NAME);
        arguments.put("x-dead-letter-routing-key", deadLetterRoutingKey);
        return new Queue(queueName, true, false, false, arguments);
    }

    /**
     * Plain durable queue for catching dead letters — no further DLX to avoid
     * infinite routing loops.
     */
    private Queue deadLetterQueue(String originalQueueName) {
        return new Queue(MessagingConstants.deadLetterQueueName(originalQueueName), true);
    }
}
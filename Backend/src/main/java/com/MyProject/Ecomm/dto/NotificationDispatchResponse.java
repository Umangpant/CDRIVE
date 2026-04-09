package com.MyProject.Ecomm.dto;

public record NotificationDispatchResponse(
        String message,
        String eventType,
        String recipient,
        String referenceType,
        String referenceId
) {
}

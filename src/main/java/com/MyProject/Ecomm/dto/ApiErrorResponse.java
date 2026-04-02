package com.MyProject.Ecomm.dto;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

public class ApiErrorResponse {

    private final Instant timestamp;
    private final int status;
    private final String error;
    private final String message;
    private final String path;
    private final Map<String, String> errors;

    public ApiErrorResponse(int status,
                            String error,
                            String message,
                            String path,
                            Map<String, String> errors) {
        this.timestamp = Instant.now();
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
        this.errors = errors == null ? Map.of() : new LinkedHashMap<>(errors);
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public int getStatus() {
        return status;
    }

    public String getError() {
        return error;
    }

    public String getMessage() {
        return message;
    }

    public String getPath() {
        return path;
    }

    public Map<String, String> getErrors() {
        return errors;
    }
}

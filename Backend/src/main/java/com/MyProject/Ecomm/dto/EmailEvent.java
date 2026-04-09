package com.MyProject.Ecomm.dto;

import java.util.HashMap;
import java.util.Map;

public class EmailEvent {

    private String to;
    private String subject;
    private String type;
    private Map<String, Object> data = new HashMap<>();

    public EmailEvent() {
    }

    public EmailEvent(String to, String subject, String type, Map<String, Object> data) {
        this.to = to;
        this.subject = subject;
        this.type = type;
        if (data != null) {
            this.data = new HashMap<>(data);
        }
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Map<String, Object> getData() {
        return data;
    }

    public void setData(Map<String, Object> data) {
        this.data = data == null ? new HashMap<>() : new HashMap<>(data);
    }
}

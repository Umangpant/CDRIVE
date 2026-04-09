package com.MyProject.Ecomm.dto;

import com.MyProject.Ecomm.model.User;

public class AuthResponse {

    private User user;
    private String token;
    private String tokenType;

    public AuthResponse() {}

    public AuthResponse(User user, String token) {
        this.user = user;
        this.token = token;
        this.tokenType = "Bearer";
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }
}

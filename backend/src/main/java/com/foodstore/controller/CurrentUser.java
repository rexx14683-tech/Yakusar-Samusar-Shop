package com.foodstore.controller;

import com.foodstore.config.CustomUserDetails;
import org.springframework.security.core.Authentication;

/** Small helper to pull the authenticated user id out of the security context. */
final class CurrentUser {
    private CurrentUser() {
    }

    static Long id(Authentication authentication) {
        return ((CustomUserDetails) authentication.getPrincipal()).getUserId();
    }
}

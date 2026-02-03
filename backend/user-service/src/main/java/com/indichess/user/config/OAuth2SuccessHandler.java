package com.indichess.user.config;

import com.indichess.user.dto.AuthResponse;
import com.indichess.user.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthService authService;

    @Value("${app.oauth2.frontend-redirect-url:http://localhost:5173/oauth/callback}")
    private String frontendRedirectUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        if (email == null || email.isBlank()) {
            email = oauth2User.getAttribute("sub");
        }
        if (email == null || email.isBlank()) {
            response.sendRedirect(UriComponentsBuilder.fromUriString(frontendRedirectUrl)
                    .queryParam("error", "no_email")
                    .build().toUriString());
            return;
        }
        AuthResponse authResponse = authService.loginWithOAuth2(email, name);
        String redirectUrl = UriComponentsBuilder.fromUriString(frontendRedirectUrl)
                .queryParam("token", authResponse.getToken())
                .queryParam("userId", authResponse.getUserId())
                .queryParam("username", authResponse.getUsername())
                .queryParam("email", authResponse.getEmail())
                .build()
                .toUriString();
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}

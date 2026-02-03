package com.indichess.user.service;

import com.indichess.user.dto.AuthResponse;
import com.indichess.user.dto.LoginRequest;
import com.indichess.user.dto.RegisterRequest;
import com.indichess.user.model.User;
import com.indichess.user.model.UserSession;
import com.indichess.user.repo.UserSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserService userService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserSessionRepository sessionRepository;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        User user = userService.createUser(
                request.getUsername(),
                request.getEmail(),
                request.getPassword(),
                request.getCountry()
        );
        
        String token = jwtService.generateToken(user.getUserId(), user.getUsername());
        saveSession(user, token);
        
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUserId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmailId());
        return response;
    }
    
    public AuthResponse login(LoginRequest request) {
        User user = userService.findByUsernameOrEmail(request.getUsernameOrEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        String token = jwtService.generateToken(user.getUserId(), user.getUsername());
        saveSession(user, token);
        
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUserId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmailId());
        return response;
    }

    public AuthResponse loginWithOAuth2(String email, String name) {
        User user = userService.findOrCreateByOAuth2(email, name);
        String token = jwtService.generateToken(user.getUserId(), user.getUsername());
        saveSession(user, token);
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUserId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmailId());
        return response;
    }
    
    @Transactional
    public void logout(String token) {
        String tokenHash = jwtService.hashToken(token);
        sessionRepository.findByTokenHash(tokenHash)
                .ifPresent(sessionRepository::delete);
    }

    private static final long REFRESH_GRACE_SECONDS = 300; // 5 minutes

    @Transactional
    public AuthResponse refresh(String token) {
        io.jsonwebtoken.Claims claims = jwtService.getClaimsForRefresh(token, REFRESH_GRACE_SECONDS);
        Long userId = claims.get("userId", Long.class);
        String username = claims.getSubject();
        if (userId == null || username == null) {
            throw new RuntimeException("Invalid token");
        }
        User user = userService.findById(userId);
        String newToken = jwtService.generateToken(user.getUserId(), user.getUsername());
        saveSession(user, newToken);
        AuthResponse response = new AuthResponse();
        response.setToken(newToken);
        response.setUserId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmailId());
        return response;
    }
    
    public boolean isTokenBlacklisted(String token) {
        String tokenHash = jwtService.hashToken(token);
        return sessionRepository.findByTokenHash(tokenHash).isEmpty(); // If not found, token is blacklisted
    }

    @Transactional
    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userService.saveUser(user);
    }
    
    private void saveSession(User user, String token) {
        String sessionId = UUID.randomUUID().toString();
        String tokenHash = jwtService.hashToken(token);
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(jwtService.extractExpiration(token).getTime() / 1000);
        
        UserSession session = new UserSession();
        session.setSessionId(sessionId);
        session.setUser(user);
        session.setTokenHash(tokenHash);
        session.setExpiresAt(expiresAt);
        
        sessionRepository.save(session);
    }
}

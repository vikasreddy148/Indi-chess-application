package com.indichess.user.service;

import com.indichess.user.dto.UserResponse;
import com.indichess.user.model.Role;
import com.indichess.user.model.User;
import com.indichess.user.model.UserStatus;
import com.indichess.user.repo.RoleRepository;
import com.indichess.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Transactional
    public User createUser(String username, String email, String password, String country) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmailId(email)) {
            throw new RuntimeException("Email already exists");
        }
        
        User user = new User();
        user.setUsername(username);
        user.setEmailId(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setCountry(country);
        user.setRating(1200);
        user.setStatus(UserStatus.ACTIVE);
        
        // Assign default ROLE_USER
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Default role not found"));
        user.setRoles(new HashSet<>(Set.of(userRole)));
        
        return userRepository.save(user);
    }
    
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmailId(email);
    }
    
    public Optional<User> findByUsernameOrEmail(String usernameOrEmail) {
        Optional<User> user = userRepository.findByUsername(usernameOrEmail);
        if (user.isEmpty()) {
            user = userRepository.findByEmailId(usernameOrEmail);
        }
        return user;
    }
    
    public UserResponse getUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setUserId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmailId());
        response.setPfpUrl(user.getPfpUrl());
        response.setCountry(user.getCountry());
        response.setRating(user.getRating());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
    
    public User findById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public UserResponse updateProfile(String username, com.indichess.user.dto.UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (request.getCountry() != null) {
            user.setCountry(request.getCountry());
        }
        if (request.getPfpUrl() != null) {
            user.setPfpUrl(request.getPfpUrl());
        }
        user = userRepository.save(user);
        return getUserResponse(user);
    }
}

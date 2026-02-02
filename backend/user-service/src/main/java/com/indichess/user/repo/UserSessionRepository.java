package com.indichess.user.repo;

import com.indichess.user.model.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, String> {
    Optional<UserSession> findByTokenHash(String tokenHash);
    
    @Modifying
    @Query("DELETE FROM UserSession s WHERE s.expiresAt < ?1")
    void deleteExpiredSessions(LocalDateTime now);
    
    @Modifying
    @Query("DELETE FROM UserSession s WHERE s.user.userId = ?1")
    void deleteByUserId(Long userId);
}

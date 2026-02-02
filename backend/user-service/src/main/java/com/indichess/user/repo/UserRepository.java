package com.indichess.user.repo;

import com.indichess.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmailId(String emailId);
    boolean existsByUsername(String username);
    boolean existsByEmailId(String emailId);
}

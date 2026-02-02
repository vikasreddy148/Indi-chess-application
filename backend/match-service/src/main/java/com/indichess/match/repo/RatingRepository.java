package com.indichess.match.repo;

import com.indichess.match.model.GameType;
import com.indichess.match.model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    Optional<Rating> findByUserIdAndGameType(Long userId, GameType gameType);
}

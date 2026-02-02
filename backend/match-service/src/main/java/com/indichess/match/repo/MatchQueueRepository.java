package com.indichess.match.repo;

import com.indichess.match.model.GameType;
import com.indichess.match.model.MatchQueue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchQueueRepository extends JpaRepository<MatchQueue, Long> {
    Optional<MatchQueue> findByUserId(Long userId);
    List<MatchQueue> findByGameTypeOrderByJoinedAtAsc(GameType gameType);
    void deleteByUserId(Long userId);
}

package com.indichess.match.repo;

import com.indichess.match.model.Match;
import com.indichess.match.model.MatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    List<Match> findByPlayer1IdOrPlayer2Id(Long player1Id, Long player2Id);
    List<Match> findByPlayer1IdOrPlayer2IdAndStatus(Long player1Id, Long player2Id, MatchStatus status);
    List<Match> findByStatus(MatchStatus status);
}

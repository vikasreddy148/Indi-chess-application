package com.indichess.match.repo;

import com.indichess.match.model.Move;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MoveRepository extends JpaRepository<Move, Long> {
    List<Move> findByMatchIdOrderByPlyAsc(Long matchId);
}

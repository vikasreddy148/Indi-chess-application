package com.indichess.match.repo;

import com.indichess.match.model.Move;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface MoveRepository extends JpaRepository<Move, Long> {
    @Query("SELECT m FROM Move m WHERE m.match.id = :matchId ORDER BY m.ply ASC")
    List<Move> findByMatchIdOrderByPlyAsc(@Param("matchId") Long matchId);
}

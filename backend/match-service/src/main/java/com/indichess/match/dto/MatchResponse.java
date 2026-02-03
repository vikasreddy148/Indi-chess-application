package com.indichess.match.dto;

import com.indichess.match.model.GameType;
import com.indichess.match.model.MatchStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchResponse {
    private Long id;
    private Long player1Id;
    private Long player2Id;
    private MatchStatus status;
    private Integer currentPly;
    private String fenCurrent;
    private String lastMoveUci;
    private GameType gameType;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private LocalDateTime createdAt;
    private Long drawOfferedByPlayerId;
    private Integer player1TimeLeftSeconds;
    private Integer player2TimeLeftSeconds;
    private LocalDateTime lastMoveAt;
}

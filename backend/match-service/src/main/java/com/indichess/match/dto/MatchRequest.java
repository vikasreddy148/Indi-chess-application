package com.indichess.match.dto;

import com.indichess.match.model.GameType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchRequest {
    @NotNull(message = "Player 2 ID is required")
    private Long player2Id;
    
    @NotNull(message = "Game type is required")
    private GameType gameType;
}

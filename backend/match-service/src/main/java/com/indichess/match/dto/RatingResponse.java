package com.indichess.match.dto;

import com.indichess.match.model.GameType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RatingResponse {
    private GameType gameType;
    private Integer rating;
}

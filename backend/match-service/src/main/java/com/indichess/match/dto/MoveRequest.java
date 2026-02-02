package com.indichess.match.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MoveRequest {
    @NotNull(message = "Match ID is required")
    private Long matchId;
    
    @NotBlank(message = "Move UCI is required")
    private String moveUci;
    
    @NotBlank(message = "From square is required")
    private String fromSquare;
    
    @NotBlank(message = "To square is required")
    private String toSquare;
}

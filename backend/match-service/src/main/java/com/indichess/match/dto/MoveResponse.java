package com.indichess.match.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MoveResponse {
    private Integer ply;
    private String moveNotation;
    private String fromSquare;
    private String toSquare;
    private String fenAfter;
    private Boolean check;
    private Boolean checkmate;
}

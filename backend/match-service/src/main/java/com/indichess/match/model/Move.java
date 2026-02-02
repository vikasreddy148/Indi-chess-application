package com.indichess.match.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "moves")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Move {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "move_id")
    private Long moveId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;
    
    @Column(name = "ply", nullable = false)
    private Integer ply;
    
    @Column(name = "move_notation", length = 10, nullable = false)
    private String moveNotation;
    
    @Column(name = "from_square", length = 2, nullable = false)
    private String fromSquare;
    
    @Column(name = "to_square", length = 2, nullable = false)
    private String toSquare;
    
    @Column(name = "piece_type", length = 1)
    private String pieceType;
    
    @Column(name = "is_capture")
    private Boolean isCapture = false;
    
    @Column(name = "is_check")
    private Boolean isCheck = false;
    
    @Column(name = "is_checkmate")
    private Boolean isCheckmate = false;
    
    @Column(name = "fen_after", length = 200)
    private String fenAfter;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

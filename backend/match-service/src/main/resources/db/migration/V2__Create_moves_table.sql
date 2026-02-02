CREATE TABLE IF NOT EXISTS moves (
    move_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    match_id BIGINT NOT NULL,
    ply INT NOT NULL,
    move_notation VARCHAR(10) NOT NULL,
    from_square VARCHAR(2) NOT NULL,
    to_square VARCHAR(2) NOT NULL,
    piece_type VARCHAR(1),
    is_capture BOOLEAN DEFAULT FALSE,
    is_check BOOLEAN DEFAULT FALSE,
    is_checkmate BOOLEAN DEFAULT FALSE,
    fen_after VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    INDEX idx_match_ply (match_id, ply),
    INDEX idx_match_id (match_id)
);

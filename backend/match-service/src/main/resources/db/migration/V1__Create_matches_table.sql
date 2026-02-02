CREATE TABLE IF NOT EXISTS matches (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    player1_id BIGINT NOT NULL,
    player2_id BIGINT NOT NULL,
    status ENUM('ONGOING', 'PLAYER1_WON', 'PLAYER2_WON', 'DRAW', 'ABANDONED') DEFAULT 'ONGOING',
    current_ply INT DEFAULT 0,
    fen_current VARCHAR(200) NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    last_move_uci VARCHAR(10),
    game_type ENUM('CLASSICAL', 'RAPID', 'BLITZ', 'BULLET') NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_player1 (player1_id),
    INDEX idx_player2 (player2_id),
    INDEX idx_status (status),
    INDEX idx_game_type (game_type)
);

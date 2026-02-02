CREATE TABLE IF NOT EXISTS ratings (
    rating_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    game_type ENUM('CLASSICAL', 'RAPID', 'BLITZ', 'BULLET') NOT NULL,
    rating INT DEFAULT 1200,
    games_played INT DEFAULT 0,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    draws INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_game_type (user_id, game_type),
    INDEX idx_user_id (user_id),
    INDEX idx_game_type (game_type)
);

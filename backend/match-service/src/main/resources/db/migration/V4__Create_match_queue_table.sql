CREATE TABLE IF NOT EXISTS match_queue (
    queue_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    game_type ENUM('CLASSICAL', 'RAPID', 'BLITZ', 'BULLET') NOT NULL,
    rating INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_game_type_rating (game_type, rating),
    INDEX idx_user_id (user_id)
);

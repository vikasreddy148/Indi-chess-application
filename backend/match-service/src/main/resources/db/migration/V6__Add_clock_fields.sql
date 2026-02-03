ALTER TABLE matches ADD COLUMN player1_time_left_seconds INT DEFAULT 600;
ALTER TABLE matches ADD COLUMN player2_time_left_seconds INT DEFAULT 600;
ALTER TABLE matches ADD COLUMN last_move_at TIMESTAMP NULL;
UPDATE matches SET last_move_at = started_at WHERE last_move_at IS NULL AND status = 'ONGOING';

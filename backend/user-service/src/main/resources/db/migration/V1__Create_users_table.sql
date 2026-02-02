CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email_id VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(512) NOT NULL,
    pfp_url VARCHAR(512),
    country VARCHAR(100),
    rating INT DEFAULT 1200,
    status ENUM('ACTIVE', 'INACTIVE', 'BANNED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email_id),
    INDEX idx_status (status)
);

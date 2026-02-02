INSERT INTO roles (name, description) VALUES
('ROLE_USER', 'Standard user role'),
('ROLE_ADMIN', 'Administrator role')
ON DUPLICATE KEY UPDATE name=name;

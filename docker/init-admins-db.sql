-- docker\init-admins-db.sql 
-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff') NOT NULL
);

-- Вставка начальных данных
-- Замените значение @admin_password на хешированный пароль для администраторов
INSERT IGNORE INTO users (username, password, role) VALUES
('admin', '$2a$12$MhHggqp0pCzZrzI9spnKsOrOAzJLaXjAWRmLsyHpMx/iF.SSU8bXS', 'admin');

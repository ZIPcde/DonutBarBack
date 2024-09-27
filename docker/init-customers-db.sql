-- docker\init-customers-db.sql

USE customers_db;

CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  orders_ids TEXT, -- Здесь можно хранить id всех заказов клиента
  notes TEXT
);

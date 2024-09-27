-- docker\init-orders-db.sql

USE orders_db;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  delivery_required BOOLEAN NOT NULL,
  delivery_address TEXT,
  items TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  table_number INT,
  order_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  pickup_time DATETIME
);

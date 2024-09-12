// api/index.js

const express = require('express');
const connection = require('./db'); // Убедитесь, что подключение настроено правильно
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 3000;

// Middleware для парсинга JSON
app.use(express.json());

// Создание таблицы products
const createProductsTableQuery = `
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_path VARCHAR(255),
  description TEXT,
  weight VARCHAR(50),
  calories INT,
  fats DECIMAL(5, 2),
  proteins DECIMAL(5, 2),
  carbohydrates DECIMAL(5, 2),
  availability BOOLEAN DEFAULT TRUE
);
`;

connection.query(createProductsTableQuery, (err, results) => {
  if (err) {
    console.error('Error creating products table:', err);
    return;
  }
  console.log('Products table created or already exists');
});

// Создание таблицы clients
const createClientsTableQuery = `
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  orders_ids TEXT,
  notes TEXT
);
`;

connection.query(createClientsTableQuery, (err, results) => {
  if (err) {
    console.error('Error creating clients table:', err);
    return;
  }
  console.log('Clients table created or already exists');
});

// Создание таблицы orders
const createOrdersTableQuery = `
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ready_time TIMESTAMP,
  delivery_required BOOLEAN DEFAULT FALSE,
  delivery_address TEXT,
  products JSON NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  table_number INT
);
`;

connection.query(createOrdersTableQuery, (err, results) => {
  if (err) {
    console.error('Error creating orders table:', err);
    return;
  }
  console.log('Orders table created or already exists');
});

// Создание таблицы users для хранения учетных записей персонала
const createUsersTableQuery = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff') NOT NULL
);
`;

connection.query(createUsersTableQuery, (err, results) => {
  if (err) {
    console.error('Error creating users table:', err);
    return;
  }
  console.log('Users table created or already exists');

  // Добавление начальных данных (администратор и сотрудники)
  const adminPassword = bcrypt.hashSync('adminpassword', 10); // Хеширование пароля администратора
  const staffPassword = bcrypt.hashSync('staffpassword', 10); // Хеширование пароля сотрудника

  const insertUsersQuery = `
    INSERT IGNORE INTO users (username, password, role) VALUES
    ('admin', '${adminPassword}', 'admin'),
    ('staff', '${staffPassword}', 'staff');
  `;

  connection.query(insertUsersQuery, (err, results) => {
    if (err) {
      console.error('Error inserting default users:', err);
      return;
    }
    console.log('Default users inserted or already exist');
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

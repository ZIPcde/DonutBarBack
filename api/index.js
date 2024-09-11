// index.js
const express = require('express');
const connection = require('./db');
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

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

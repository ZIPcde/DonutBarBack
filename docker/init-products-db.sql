-- Создание таблицы products
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT DEFAULT NULL,
  imagePath VARCHAR(255) NOT NULL,
  weight VARCHAR(50) NOT NULL,
  calories INT NOT NULL,
  fats DECIMAL(5,2) NOT NULL,
  proteins DECIMAL(5,2) NOT NULL,
  carbohydrates DECIMAL(5,2) NOT NULL
);

-- Вставка примера данных
INSERT INTO products (category, name, price, description, imagePath, weight, calories, fats, proteins, carbohydrates)
VALUES 
('Десерты', 'Шоколадный торт', 150.00, 'Шоколадный торт (порция)', '../images/chocolate_cake.jpg', '120', 400, 22.00, 5.00, 50.00);

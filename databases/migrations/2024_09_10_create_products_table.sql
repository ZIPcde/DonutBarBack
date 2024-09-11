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
    carbohydrates DECIMAL(5, 2)
);

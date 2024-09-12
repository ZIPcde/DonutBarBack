const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST, // имя сервиса mysql_products в docker-compose
  user: 'user', // имя пользователя, указанное в docker-compose.yml
  password: 'user_password', // пароль пользователя
  database: 'products_db' // база данных для товаров
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL products:', err);
    return;
  }
  console.log('Connected to MySQL products');
});

module.exports = connection;

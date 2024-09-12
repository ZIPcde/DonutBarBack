const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'mysql_orders', // имя сервиса mysql_orders в docker-compose
  user: 'user', // имя пользователя, указанное в docker-compose.yml
  password: 'user_password', // пароль пользователя
  database: 'orders_db' // база данных для заказов
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL orders:', err);
    return;
  }
  console.log('Connected to MySQL orders');
});

module.exports = connection;

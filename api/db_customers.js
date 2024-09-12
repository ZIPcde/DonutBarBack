const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST, // имя сервиса mysql_customers в docker-compose
  user: 'user', // имя пользователя, указанный в docker-compose.yml
  password: 'user_password', // пароль пользователя
  database: 'customers_db' // база данных для клиентов
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL customers:', err);
    return;
  }
  console.log('Connected to MySQL customers');
});

module.exports = connection;

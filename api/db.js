// db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'mysql', // используем имя сервиса mysql в docker-compose
  user: 'user', // имя пользователя, указанное в docker-compose.yml
  password: 'user_password', // пароль пользователя
  database: 'donutbar' // база данных, которую создали в docker-compose.yml
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

module.exports = connection;

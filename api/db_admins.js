const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'mysql_admins', // имя сервиса mysql_admins в docker-compose
  user: 'user', // имя пользователя, указанный в docker-compose.yml
  password: 'user_password', // пароль пользователя
  database: 'admins_db' // база данных для администраторов
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL admins:', err);
    return;
  }
  console.log('Connected to MySQL admins');
});

module.exports = connection;

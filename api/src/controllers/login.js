// api\src\controllers\login.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');

// Временно используем простой ключ
const secret = 'your_secret_key'; 

// Настройка соединения с базой данных
const db = mysql.createConnection({
  host: process.env.MYSQL_ADMINS_HOST || 'mysql_admins',
  user: process.env.MYSQL_ADMINS_USER,
  password: process.env.MYSQL_ADMINS_PASSWORD,
  database: process.env.MYSQL_ADMINS_DATABASE
});

// Пример функции авторизации
function login(req, res) {
  const { username, password } = req.body;

  // Проверка пользователя в базе данных
  const query = 'SELECT * FROM admins WHERE username = ?'; // Предположим, что есть таблица admins
  db.query(query, [username], (err, results) => {
    if (err || results.length === 0) {
      return res.sendStatus(403); // Пользователь не найден
    }

    const user = results[0];

    // Сравниваем хеш пароля
    bcrypt.compare(password, user.passwordHash, (err, result) => {
      if (result) {
        // Генерируем токен
        const token = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: '1h' });
        res.json({ token });
      } else {
        res.sendStatus(403);
      }
    });
  });
}

module.exports = login;

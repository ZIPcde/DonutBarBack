// api\src\controllers\login.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');

// Используем секретный ключ из переменных окружения, если он есть
const secret = process.env.ACCESS_TOKEN_SECRET || 'your_secret_key'; 

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

  // Логируем запрос для отладки
  console.log('Запрос на логин:', username, password);
  // Проверка пользователя в базе данных
  const query = 'SELECT * FROM users WHERE username = ?'; // Предполагаем, что есть таблица users
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Ошибка базы данных:', err);
      return res.sendStatus(500); // Ошибка сервера
    }

    if (results.length === 0) {
      console.warn('Пользователь не найден:', username);
      return res.sendStatus(403); // Пользователь не найден
    }

    const user = results[0];

    // Сравниваем хеш пароля
    bcrypt.compare(password, user.password, (err, result) => { // Исправлено на user.password
      if (err) {
        console.error('Ошибка bcrypt:', err);
        return res.sendStatus(500); // Ошибка сервера
      }

      if (result) {
        // Генерируем токен
        const token = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: '1h' });
        console.log('Пользователь успешно вошел:', username);
        res.json({ token });
      } else {
        console.warn('Неверный пароль для пользователя:', username);
        res.sendStatus(403); // Неверный пароль
      }
    });
  });
}

module.exports = login;

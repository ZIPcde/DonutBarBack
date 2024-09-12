// login.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const secret = 'your_secret_key'; // Ваш секретный ключ

// Пример функции авторизации
function login(req, res) {
  const { username, password } = req.body;

  // Проверка пользователя в базе данных
  // Допустим, вы нашли пользователя с ролью в базе
  const user = { id: 1, username, role: 'client' }; // роль может быть 'client' или 'staff'

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
}

module.exports = login;

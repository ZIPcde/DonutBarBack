// api\src\middleware\auth.js
const jwt = require('jsonwebtoken');

// Используем секретный ключ из переменных окружения
const secret = process.env.ACCESS_TOKEN_SECRET || 'your_secret_key'; 

// Middleware для проверки токена
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Извлекаем токен из заголовка

  if (token == null) {
    console.warn('Нет токена в запросе');
    return res.sendStatus(403); // Нет токена
  }

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      console.error('Ошибка проверки токена:', err);
      return res.sendStatus(403); // Неверный токен
    }
    req.user = user;
    next();
  });
}

// Middleware для проверки ролей
function authorizeRole(roles) {
  return (req, res, next) => {
    if (!Array.isArray(roles)) {
      roles = [roles]; // Преобразуем в массив, если передана одна роль
    }

    if (!roles.includes(req.user.role)) {
      console.warn('Недостаточно прав:', req.user.role);
      return res.sendStatus(403); // Доступ запрещен
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRole
};

// api\src\middleware\auth.js
const jwt = require('jsonwebtoken');
const secret = 'your_secret_key'; // Временно используем простой ключ

// Middleware для проверки токена
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(403);

  jwt.verify(token.split(' ')[1], secret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Middleware для проверки ролей
function authorizeRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) return res.sendStatus(403);
    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRole
};

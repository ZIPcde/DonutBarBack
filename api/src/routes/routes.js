// routes.js
const express = require('express');
const router = express.Router();
const loginController = require('../controllers/login');  // Подключаем login.js
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Маршрут для логина (доступно всем)
router.post('/login', loginController);

// Маршрут для получения списка товаров (доступно всем)
router.get('/products', (req, res) => {
  // Логика для возврата списка товаров
  res.json({ message: 'Список товаров' });
});

// Маршрут для создания заказа (доступно только клиентам)
router.post('/orders', authenticateToken, authorizeRole('client'), (req, res) => {
  // Логика для добавления заказа
  res.json({ message: 'Заказ добавлен' });
});

// Маршрут для сотрудников — полный доступ к заказам (доступно только персоналу)
router.get('/orders', authenticateToken, authorizeRole('staff'), (req, res) => {
  // Логика для возврата списка всех заказов
  res.json({ message: 'Список заказов' });
});

// Маршрут для работы с клиентами (доступно только персоналу)
router.get('/customers', authenticateToken, authorizeRole('staff'), (req, res) => {
  // Логика для возврата списка клиентов
  res.json({ message: 'Список клиентов' });
});

module.exports = router;

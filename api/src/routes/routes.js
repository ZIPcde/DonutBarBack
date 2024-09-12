// api\src\routes\routes.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Настройка соединений с базами данных
const dbOrders = mysql.createConnection({
  host: 'mysql_orders',
  user: 'user',
  password: 'spore23',
  database: 'orders_db'
});

const dbProducts = mysql.createConnection({
  host: 'mysql_products',
  user: 'user',
  password: 'spore23',
  database: 'products_db'
});

const dbCustomers = mysql.createConnection({
  host: 'mysql_customers',
  user: 'user',
  password: 'spore23',
  database: 'customers_db'
});

const dbAdmins = mysql.createConnection({
  host: 'mysql_admins',
  user: 'user',
  password: 'spore23',
  database: 'admins_db'
});

const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Маршрут для логина (доступно всем)
router.post('/login', require('../controllers/login'));

// Маршрут для получения списка товаров (доступно всем)
router.get('/products', (req, res) => {
  const query = 'SELECT * FROM products';
  dbProducts.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ error: 'Error fetching products' });
    }
    res.json(results);
  });
});

// Маршрут для создания заказа (доступно только клиентам)
router.post('/orders', authenticateToken, authorizeRole('client'), (req, res) => {
  const { orderDetails } = req.body;
  const query = 'INSERT INTO orders SET ?';
  dbOrders.query(query, orderDetails, (err, results) => {
    if (err) {
      console.error('Error creating order:', err);
      return res.status(500).json({ error: 'Error creating order' });
    }
    res.json({ message: 'Order added', orderId: results.insertId });
  });
});

// Маршрут для сотрудников — полный доступ к заказам (доступно только персоналу)
router.get('/orders', authenticateToken, authorizeRole('staff'), (req, res) => {
  const query = 'SELECT * FROM orders';
  dbOrders.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).json({ error: 'Error fetching orders' });
    }
    res.json(results);
  });
});

// Маршрут для работы с клиентами (доступно только персоналу)
router.get('/customers', authenticateToken, authorizeRole('staff'), (req, res) => {
  const query = 'SELECT * FROM customers';
  dbCustomers.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching customers:', err);
      return res.status(500).json({ error: 'Error fetching customers' });
    }
    res.json(results);
  });
});

module.exports = router;

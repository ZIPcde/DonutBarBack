// api\src\routes\routes.js


require('dotenv').config();
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Настройка соединений с базами данных
const dbOrders = mysql.createConnection({
  host: process.env.MYSQL_ORDERS_HOST  || 'mysql_orders',
  user: process.env.MYSQL_ORDERS_USER,
  password: process.env.MYSQL_ORDERS_PASSWORD,
  database: process.env.MYSQL_ORDERS_DATABASE
});

const dbProducts = mysql.createConnection({
  host: process.env.MYSQL_PRODUCTS_HOST  || 'mysql_products',
  user: process.env.MYSQL_PRODUCTS_USER,
  password: process.env.MYSQL_PRODUCTS_PASSWORD,
  database: process.env.MYSQL_PRODUCTS_DATABASE
});

const dbCustomers = mysql.createConnection({
  host: process.env.MYSQL_CUSTOMERS_HOST  || 'mysql_customers',
  user: process.env.MYSQL_CUSTOMERS_USER,
  password: process.env.MYSQL_CUSTOMERS_PASSWORD,
  database: process.env.MYSQL_CUSTOMERS_DATABASE
});

const dbAdmins = mysql.createConnection({
  host: process.env.MYSQL_ADMINS_HOST || 'mysql_admins',
  user: process.env.MYSQL_ADMINS_USER,
  password: process.env.MYSQL_ADMINS_PASSWORD,
  database: process.env.MYSQL_ADMINS_DATABASE
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

router.post('/products', authenticateToken, authorizeRole('staff'), (req, res) => {
  const { productDetails } = req.body;
  const query = 'INSERT INTO products SET ?';
  dbProducts.query(query, productDetails, (err, results) => {
    if (err) {
      console.error('Error adding product:', err);
      return res.status(500).json({ error: 'Error adding product' });
    }
    res.json({ message: 'Product added', productId: results.insertId });
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

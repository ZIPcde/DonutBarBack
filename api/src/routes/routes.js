// api\src\routes\routes.js


require('dotenv').config();
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Настройка соединений с базами данных
const dbOrders = mysql.createConnection({
  host: process.env.MYSQL_ORDERS_HOST || 'mysql_orders',
  user: process.env.MYSQL_ORDERS_USER,
  password: process.env.MYSQL_ORDERS_PASSWORD,
  database: process.env.MYSQL_ORDERS_DATABASE
});

const dbProducts = mysql.createConnection({
  host: process.env.MYSQL_PRODUCTS_HOST || 'mysql_products',
  user: process.env.MYSQL_PRODUCTS_USER,
  password: process.env.MYSQL_PRODUCTS_PASSWORD,
  database: process.env.MYSQL_PRODUCTS_DATABASE
});

const dbCustomers = mysql.createConnection({
  host: process.env.MYSQL_CUSTOMERS_HOST || 'mysql_customers',
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

router.post('/products', authenticateToken, authorizeRole(['staff', 'admin']), (req, res) => {
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

router.put('/products/:id', authenticateToken, authorizeRole(['staff', 'admin']), (req, res) => {
  const { id } = req.params;
  const updatedProduct = req.body; // Получаем обновленные данные
  const query = 'UPDATE products SET ? WHERE id = ?';
  dbProducts.query(query, [updatedProduct, id], (err, results) => {
    if (err) {
      console.error('Error updating product:', err);
      return res.status(500).json({ error: 'Error updating product' });
    }
    res.json({ message: 'Product updated' });
  });
});

router.delete('/products/:id', authenticateToken, authorizeRole(['staff', 'admin']), (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM products WHERE id = ?';
  dbProducts.query(query, id, (err, results) => {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).json({ error: 'Error deleting product' });
    }
    res.json({ message: 'Product deleted' });
  });
});

// Маршрут для создания заказа (не требует проверки токена и роли)
router.post('/orders', (req, res) => {
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

// Маршрут для получения списка заказов (только для ролей admin и staff)
router.get('/orders', authenticateToken, authorizeRole(['staff', 'admin']), (req, res) => {
  const query = 'SELECT * FROM orders';
  dbOrders.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).json({ error: 'Error fetching orders' });
    }
    res.json(results);
  });
});

// Маршрут для обновления заказа (только для ролей admin и staff)
router.put('/orders/:id', authenticateToken, authorizeRole(['staff', 'admin']), (req, res) => {
  const { id } = req.params;
  const updatedOrder = req.body;
  const query = 'UPDATE orders SET ? WHERE id = ?';
  dbOrders.query(query, [updatedOrder, id], (err, results) => {
    if (err) {
      console.error('Error updating order:', err);
      return res.status(500).json({ error: 'Error updating order' });
    }
    res.json({ message: 'Order updated' });
  });
});

// Маршрут для удаления заказа (только для ролей admin и staff)
router.delete('/orders/:id', authenticateToken, authorizeRole(['staff', 'admin']), (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM orders WHERE id = ?';
  dbOrders.query(query, id, (err, results) => {
    if (err) {
      console.error('Error deleting order:', err);
      return res.status(500).json({ error: 'Error deleting order' });
    }
    res.json({ message: 'Order deleted' });
  });
});

// Маршрут для работы с клиентами (доступно только персоналу)
router.get('/customers', authenticateToken, authorizeRole(['staff', 'admin']), (req, res) => {
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

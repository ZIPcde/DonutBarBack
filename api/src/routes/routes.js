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

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

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
  const orderDetails = {
    customer_name: req.body.customer_name,
    customer_phone: req.body.customer_phone,
    delivery_required: req.body.delivery_required,
    delivery_address: req.body.delivery_address || null,
    items: req.body.items,  // Предполагается, что это JSON-строка
    total_amount: req.body.total_amount,
    pickup_time: req.body.pickup_time || null,
    table_number: req.body.table_number || null
  };

  // Сначала создаем запись о заказе
  const orderQuery = 'INSERT INTO orders SET ?';
  dbOrders.query(orderQuery, orderDetails, (err, orderResult) => {
    if (err) {
      console.error('Error creating order:', err);
      return res.status(500).json({ error: 'Error creating order' });
    }

    const newOrderId = orderResult.insertId;

    // Проверяем наличие клиента по номеру телефона
    const checkCustomerQuery = 'SELECT * FROM customers WHERE phone = ?';
    dbCustomers.query(checkCustomerQuery, [orderDetails.customer_phone], (err, customerResult) => {
      if (err) {
        console.error('Error checking customer:', err);
        return res.status(500).json({ error: 'Error checking customer' });
      }

      if (customerResult.length > 0) {
        // Если клиент найден, добавляем новый идентификатор заказа к его заказам
        const existingCustomer = customerResult[0];
        let updatedOrderIds = existingCustomer.orders_ids ? `${existingCustomer.orders_ids},${newOrderId}` : `${newOrderId}`;

        const updateCustomerOrdersQuery = 'UPDATE customers SET orders_ids = ? WHERE id = ?';
        dbCustomers.query(updateCustomerOrdersQuery, [updatedOrderIds, existingCustomer.id], (err) => {
          if (err) {
            console.error('Error updating customer orders:', err);
            return res.status(500).json({ error: 'Error updating customer orders' });
          }
          res.json({ message: 'Order created and added to existing customer', orderId: newOrderId });
        });
      } else {
        // Если клиент новый, создаем запись о нем с текущим заказом
        const newCustomerQuery = 'INSERT INTO customers (name, phone, orders_ids) VALUES (?, ?, ?)';
        dbCustomers.query(newCustomerQuery, [orderDetails.customer_name, orderDetails.customer_phone, newOrderId.toString()], (err) => {
          if (err) {
            console.error('Error creating new customer:', err);
            return res.status(500).json({ error: 'Error creating new customer' });
          }
          res.json({ message: 'Order created and new customer added', orderId: newOrderId });
        });
      }
    });
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
  const updatedOrder = {
    ...req.body,
    order_time: formatDateTime(req.body.order_time),
    pickup_time: req.body.pickup_time ? formatDateTime(req.body.pickup_time) : null
  };

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

router.put('/customers/:id', authenticateToken, authorizeRole(['staff', 'admin']), (req, res) => {
  const { id } = req.params;
  const updatedCustomer = req.body;

  // Преобразование даты в формат 'YYYY-MM-DD HH:MM:SS'
  if (updatedCustomer.account_creation_date) {
    const date = new Date(updatedCustomer.account_creation_date);
    const formattedDate = date.toISOString().slice(0, 19).replace('T', ' '); // Конвертируем в формат MySQL
    updatedCustomer.account_creation_date = formattedDate;
  }

  const query = 'UPDATE customers SET ? WHERE id = ?';
  dbCustomers.query(query, [updatedCustomer, id], (err, results) => {
    if (err) {
      console.error('Error updating customer:', err);
      return res.status(500).json({ error: 'Error updating customer' });
    }
    res.json({ message: 'Customer updated' });
  });
});


router.delete('/customers/:id', authenticateToken, authorizeRole(['staff', 'admin']), (req, res) => {
  const { id } = req.params; // Идентификатор клиента

  const query = 'DELETE FROM customers WHERE id = ?';
  dbCustomers.query(query, id, (err, results) => {
    if (err) {
      console.error('Error deleting customer:', err);
      return res.status(500).json({ error: 'Error deleting customer' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  });
});


module.exports = router;

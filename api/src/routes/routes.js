// api/src/routes/routes.js

require('dotenv').config();
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const uploadDir = path.join(__dirname, '../../uploads');
console.log(`Upload directory path: ${uploadDir}`); // Проверяем, корректно ли формируется путь

// Экспонирование статической директории для изображений
router.use('/static/images', express.static(path.join(__dirname, '../../uploads')));

// Настройка хранилища для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  // filename: (req, file, cb) => {
  //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  //   cb(null, `${uniqueSuffix}-${file.originalname}`);
  // }  вариант с добавлением префикса для уникальности имён файлов картинок
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Сохраняется только оригинальное имя
  }
});

const upload = multer({ storage });


// Добавление изображения
router.post('/images', authenticateToken, authorizeRole(['staff', 'admin']), upload.single('image'), (req, res) => {
  const uploadDir = path.join(__dirname, '../../uploads');
  console.log(uploadDir); // Проверяем, какой путь используется для сохранения
  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required' });
  }
  res.json({ message: 'Image uploaded successfully', filePath: `/uploads/${req.file.filename}` });
});

// Замена изображения
router.put('/images/:filename', authenticateToken, authorizeRole(['staff', 'admin']), upload.single('image'), (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../../uploads', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Image not found' });
  }

  // Удаляем старый файл
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting old image:', err);
      return res.status(500).json({ error: 'Error deleting old image' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'New image file is required' });
    }

    res.json({ message: 'Image replaced successfully', filePath: `/uploads/${req.file.filename}` });
  });
});

// Удаление изображения
router.delete('/images/:filename', authenticateToken, authorizeRole(['staff', 'admin']), (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../../uploads', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Image not found' });
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting image:', err);
      return res.status(500).json({ error: 'Error deleting image' });
    }

    res.json({ message: 'Image deleted successfully' });
  });
});

// Получение изображения
router.get('/images/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../../uploads', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Image not found' });
  }

  res.sendFile(filePath);
});


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


// Функция для форматирования datetime
const formatDateTime = (isoString) => {
  // Преобразуем ISO-строку в формат 'YYYY-MM-DD HH:MM:SS'
  return isoString.replace('T', ' ').substring(0, 19);
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

// Добавление продукта (доступно для staff и admin)
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

// Обновление продукта (доступно для staff и admin)
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

// Удаление продукта (доступно для staff и admin)
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

  // Обработка pickup_time
  if (orderDetails.pickup_time) {
    let pickupDateTime;
    if (orderDetails.pickup_time.includes('T')) {
      // Если pickup_time это ISO-строка с датой и временем
      pickupDateTime = new Date(orderDetails.pickup_time);
    } else {
      // Если pickup_time это только время (например, '22:56'), добавляем текущую дату
      const now = new Date();
      const [hours, minutes] = orderDetails.pickup_time.split(':');
      pickupDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours), parseInt(minutes));
    }

    if (isNaN(pickupDateTime.getTime())) {
      return res.status(400).json({ error: 'Invalid pickup_time format' });
    }

    orderDetails.pickup_time = formatDateTime(pickupDateTime.toISOString());
  } else {
    orderDetails.pickup_time = null;
  }

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
    order_time: req.body.order_time ? formatDateTime(req.body.order_time) : undefined,
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

// Маршрут для обновления клиента (PUT /customers/:id)
router.put('/customers/:id', authenticateToken, authorizeRole(['staff', 'admin']), (req, res) => {
  const { id } = req.params;
  const updatedCustomer = {
    name: req.body.name,
    phone: req.body.phone,
    orders_ids: req.body.orders_ids,
    notes: req.body.notes,
    account_creation_date: req.body.account_creation_date ? formatDateTime(req.body.account_creation_date) : undefined
  };

  // Удаляем undefined поля
  Object.keys(updatedCustomer).forEach(key => {
    if (updatedCustomer[key] === undefined) {
      delete updatedCustomer[key];
    }
  });

  const query = 'UPDATE customers SET ? WHERE id = ?';
  dbCustomers.query(query, [updatedCustomer, id], (err, results) => {
    if (err) {
      console.error('Error updating customer:', err);
      return res.status(500).json({ error: 'Error updating customer' });
    }
    res.json({ message: 'Customer updated successfully' });
  });
});

// Маршрут для удаления клиента (DELETE /customers/:id)
router.delete('/customers/:id', authenticateToken, authorizeRole(['staff', 'admin']), (req, res) => {
  const { id } = req.params;

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

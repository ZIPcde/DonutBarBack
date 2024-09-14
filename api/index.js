// api/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;
const router = require('./src/routes/routes');  // Подключаем маршруты

// Middleware для парсинга JSON
app.use(express.json());

// Настройка CORS
app.use(cors({
  origin: 'http://localhost:8081',
  methods: ['GET', 'POST'],
  credentials: true
}));

// Подключаем маршруты
app.use('/api', router);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// api\src\config\server.js

require('dotenv').config(); // Загрузка переменных окружения

const express = require('express');
const router = require('../routes/routes');  // Подключаем маршруты

const app = express();

// Middleware для парсинга JSON
app.use(express.json());

// Подключаем маршруты
app.use('/api', router);

module.exports = app; // Экспортируем приложение

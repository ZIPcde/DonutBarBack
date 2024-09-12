// server.js
const express = require('express');
const app = express();
const router = require('../routes/routes');  // Подключаем маршруты

app.use(express.json());

// Подключаем маршруты
app.use('/api', router);

// Запуск сервера
app.listen(3000, () => {
  console.log('API server is running on port 3000');
});

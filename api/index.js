// api/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws'); // Импортируем ws
const http = require('http'); // Импортируем http для WebSocket

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

// Создаем HTTP сервер
const server = http.createServer(app);

// Создаем WebSocket сервер и привязываем его к HTTP серверу
const wss = new WebSocket.Server({ server });

// Обработка подключений WebSocket
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established.');

  // Обработка получения сообщений от клиента
  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    // Отправляем ответ клиенту (опционально)
    ws.send(`Server received: ${message}`);
  });

  // Обработка закрытия соединения WebSocket
  ws.on('close', () => {
    console.log('WebSocket connection closed.');
  });
});

// Задержка перед запуском сервера
const delay = 5000; // Задержка в миллисекундах (5000ms = 5 секунд)

setTimeout(() => {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}, delay);

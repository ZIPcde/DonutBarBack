// db_orders.js
const mysql = require('mysql')
const connection = mysql.createConnection({
  host: process.env.MYSQL_ORDERS_HOST,
  user: process.env.MYSQL_ORDERS_USER,
  password: process.env.MYSQL_ORDERS_PASSWORD,
  database: process.env.MYSQL_ORDERS_DATABASE,
})

connection.connect((err) => {
  if (err) throw err
  console.log(`Connected to ${process.env.MYSQL_ORDERS_DATABASE}`)
})
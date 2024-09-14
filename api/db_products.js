// db_products.js
const mysql = require('mysql')
const connection = mysql.createConnection({
  host: process.env.MYSQL_PRODUCTS_HOST || 'mysql_products',
  user: process.env.MYSQL_PRODUCTS_USER,
  password: process.env.MYSQL_PRODUCTS_PASSWORD,
  database: process.env.MYSQL_PRODUCTS_DATABASE,
})

connection.connect((err) => {
  if (err) throw err
  console.log(`Connected to ${process.env.MYSQL_PRODUCTS_DATABASE}`)
})
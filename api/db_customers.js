// db_customers.js
const mysql = require('mysql')
const connection = mysql.createConnection({
  host: process.env.MYSQL_CUSTOMERS_HOST,
  user: process.env.MYSQL_CUSTOMERS_USER,
  password: process.env.MYSQL_CUSTOMERS_PASSWORD,
  database: process.env.MYSQL_CUSTOMERS_DATABASE,
})

connection.connect((err) => {
  if (err) throw err
  console.log(`Connected to ${process.env.MYSQL_CUSTOMERS_DATABASE}`)
})
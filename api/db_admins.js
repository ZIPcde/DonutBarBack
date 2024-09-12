// db_admins.js
const mysql = require('mysql')
const connection = mysql.createConnection({
  host: process.env.MYSQL_ADMINS_HOST,
  user: process.env.MYSQL_ADMINS_USER,
  password: process.env.MYSQL_ADMINS_PASSWORD,
  database: process.env.MYSQL_ADMINS_DATABASE,
})

connection.connect((err) => {
  if (err) throw err
  console.log(`Connected to ${process.env.MYSQL_ADMINS_DATABASE}`)
})
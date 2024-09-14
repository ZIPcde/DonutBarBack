// db_admins.js
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: process.env.MYSQL_ADMINS_HOST || 'mysql_admins',
  user: process.env.MYSQL_ADMINS_USER,
  password: process.env.MYSQL_ADMINS_PASSWORD,
  database: process.env.MYSQL_ADMINS_DATABASE,
});

try {
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return;
    }
    
    console.log('Successfully connected to admins_db');
  });
} catch (e) {
  console.error('An error occurred while trying to connect to the database:', e);
}
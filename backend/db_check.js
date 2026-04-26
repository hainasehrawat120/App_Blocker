const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Dadiismyworld@12",
  // No database specified to test general connection first
});

db.connect(err => {
  if (err) {
    console.error("Connection error:", err.message);
    process.exit(1);
  }
  console.log("MySQL connected successfully.");
  db.query("CREATE DATABASE IF NOT EXISTS appblocker", (err) => {
    if (err) console.error("Create DB error:", err.message);
    else console.log("Database 'appblocker' verified/created.");
    
    db.changeUser({ database: "appblocker" }, (err) => {
      if (err) {
        console.error("Use DB error:", err.message);
        process.exit(1);
      }
      
      const createUsers = `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      )`;
      
      db.query(createUsers, (err) => {
        if (err) console.error("Create users table error:", err.message);
        else console.log("Users table verified/created.");
        process.exit(0);
      });
    });
  });
});

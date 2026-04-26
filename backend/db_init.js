const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Dadiismyworld@12",
  database: process.env.DB_NAME || "appblocker",
  multipleStatements: true,
});

db.connect(err => {
  if (err) {
    console.error("Connection error:", err.message);
    process.exit(1);
  }
  console.log("MySQL connected to 'appblocker'.");

  const createTables = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      subject_name VARCHAR(255),
      time VARCHAR(50) NOT NULL,
      day VARCHAR(50) NOT NULL,
      color VARCHAR(50) NOT NULL,
      icon VARCHAR(50) NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS topics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      topic_name VARCHAR(255),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      date VARCHAR(50) NOT NULL,
      hours INT NOT NULL,
      note VARCHAR(255),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS goals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      text VARCHAR(255) NOT NULL,
      done BOOLEAN DEFAULT false,
      date VARCHAR(50) NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;

  db.query(createTables, (err) => {
    if (err) {
      console.error("Create tables error:", err.message);
      process.exit(1);
    }
    console.log("All tables successfully verified/created in 'appblocker'.");
    process.exit(0);
  });
});

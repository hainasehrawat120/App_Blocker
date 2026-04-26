const mysql = require("mysql2");
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Dadiismyworld@12",
  database: "appblocker",
  multipleStatements: true
});

const query = `
  ALTER TABLE topics 
  ADD COLUMN user_id INT, 
  ADD COLUMN name VARCHAR(255);
`;

db.query(query, (err) => {
  if (err && err.code !== 'ER_DUP_FIELDNAME') {
    console.error(err);
  } else {
    console.log("Topics table updated.");
  }
  process.exit(0);
});

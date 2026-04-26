const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const port = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Dadiismyworld@12",
  database: process.env.DB_NAME || "appblocker",
  multipleStatements: true,
});

function dbQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(results);
    });
  });
}

async function initializeDatabase() {
  await dbQuery(`
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
      subject_name VARCHAR(255) NULL,
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
      topic_name VARCHAR(255) NULL,
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
  `);

  // Backward-compatible migrations for older schema names.
  await ensureColumn("subjects", "name", "VARCHAR(255) NULL");
  await ensureColumn("subjects", "subject_name", "VARCHAR(255) NULL");
  await ensureColumn("topics", "name", "VARCHAR(255) NULL");
  await ensureColumn("topics", "topic_name", "VARCHAR(255) NULL");

  await dbQuery(`
    UPDATE subjects
    SET name = COALESCE(name, subject_name)
    WHERE (name IS NULL OR name = '') AND subject_name IS NOT NULL;

    UPDATE subjects
    SET subject_name = COALESCE(subject_name, name)
    WHERE (subject_name IS NULL OR subject_name = '') AND name IS NOT NULL;

    UPDATE topics
    SET name = COALESCE(name, topic_name)
    WHERE (name IS NULL OR name = '') AND topic_name IS NOT NULL;

    UPDATE topics
    SET topic_name = COALESCE(topic_name, name)
    WHERE (topic_name IS NULL OR topic_name = '') AND name IS NOT NULL;
  `);
}

async function ensureColumn(table, column, definitionSql) {
  const columns = await dbQuery(`SHOW COLUMNS FROM \`${table}\` LIKE ?`, [column]);
  if (columns.length === 0) {
    await dbQuery(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definitionSql}`);
  }
}

// Middleware for JWT verification.
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Missing auth token" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired auth token" });
    }
    req.user = user;
    next();
  });
};

app.get("/health", (_, res) => {
  res.json({ ok: true, service: "appblocker-backend", port });
});

// ================= AUTH ROUTES =================
app.post("/register", async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "").trim();

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  try {
    const result = await dbQuery(
      "INSERT INTO users(name,email,password) VALUES(?,?,?)",
      [name, email, password]
    );
    const token = jwt.sign({ id: result.insertId, email }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({
      message: "User added",
      token,
      user: { id: result.insertId, name, email },
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email is already registered" });
    }
    return res.status(500).json({ message: "Registration failed", detail: err.message });
  }
});

app.post("/login", async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "").trim();

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const result = await dbQuery(
      "SELECT id, name, email FROM users WHERE email = ? AND password = ? LIMIT 1",
      [email, password]
    );

    if (result.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token, user });
  } catch (err) {
    return res.status(500).json({ message: "Login failed", detail: err.message });
  }
});

// ================= SCHEDULE ROUTES =================
app.get("/subjects", authenticateToken, async (req, res) => {
  try {
    const results = await dbQuery(
      "SELECT id, user_id, COALESCE(name, subject_name) AS name, time, day, color, icon FROM subjects WHERE user_id = ? ORDER BY id DESC",
      [req.user.id]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch subjects", detail: err.message });
  }
});

app.post("/subjects", authenticateToken, async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const time = String(req.body?.time || "").trim();
  const day = String(req.body?.day || "").trim();
  const color = String(req.body?.color || "").trim();
  const icon = String(req.body?.icon || "").trim();

  if (!name || !time || !day || !color || !icon) {
    return res.status(400).json({ message: "All subject fields are required" });
  }

  try {
    const result = await dbQuery(
      "INSERT INTO subjects(user_id, name, subject_name, time, day, color, icon) VALUES(?,?,?,?,?,?,?)",
      [req.user.id, name, name, time, day, color, icon]
    );
    res.json({ id: result.insertId, name, time, day, color, icon });
  } catch (err) {
    res.status(500).json({ message: "Failed to add subject", detail: err.message });
  }
});

app.delete("/subjects/:id", authenticateToken, async (req, res) => {
  try {
    await dbQuery("DELETE FROM subjects WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete subject", detail: err.message });
  }
});

app.get("/topics", authenticateToken, async (req, res) => {
  try {
    const results = await dbQuery(
      "SELECT id, user_id, COALESCE(name, topic_name) AS name FROM topics WHERE user_id = ? ORDER BY id DESC",
      [req.user.id]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch topics", detail: err.message });
  }
});

app.post("/topics", authenticateToken, async (req, res) => {
  const name = String(req.body?.name || "").trim();
  if (!name) {
    return res.status(400).json({ message: "Topic name is required" });
  }

  try {
    const result = await dbQuery(
      "INSERT INTO topics(user_id, name, topic_name) VALUES(?,?,?)",
      [req.user.id, name, name]
    );
    res.json({ id: result.insertId, name });
  } catch (err) {
    res.status(500).json({ message: "Failed to add topic", detail: err.message });
  }
});

app.delete("/topics/:id", authenticateToken, async (req, res) => {
  try {
    await dbQuery("DELETE FROM topics WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete topic", detail: err.message });
  }
});

app.get("/sessions", authenticateToken, async (req, res) => {
  try {
    const results = await dbQuery(
      "SELECT id, user_id, date, hours, note FROM sessions WHERE user_id = ? ORDER BY id DESC",
      [req.user.id]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sessions", detail: err.message });
  }
});

app.post("/sessions", authenticateToken, async (req, res) => {
  const date = String(req.body?.date || "").trim();
  const hoursRaw = Number(req.body?.hours);
  const hours = Number.isFinite(hoursRaw) ? Math.max(0, Math.round(hoursRaw)) : NaN;
  const note = String(req.body?.note || "").trim();

  if (!date || Number.isNaN(hours)) {
    return res.status(400).json({ message: "Session date and numeric hours are required" });
  }

  try {
    const result = await dbQuery(
      "INSERT INTO sessions(user_id, date, hours, note) VALUES(?,?,?,?)",
      [req.user.id, date, hours, note]
    );
    res.json({ id: result.insertId, date, hours, note });
  } catch (err) {
    res.status(500).json({ message: "Failed to add session", detail: err.message });
  }
});

app.get("/goals", authenticateToken, async (req, res) => {
  const date = String(req.query?.date || "").trim();
  let query = "SELECT id, user_id, text, done, date FROM goals WHERE user_id = ?";
  const params = [req.user.id];

  if (date) {
    query += " AND date = ?";
    params.push(date);
  }

  query += " ORDER BY id DESC";

  try {
    const results = await dbQuery(query, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch goals", detail: err.message });
  }
});

app.post("/goals", authenticateToken, async (req, res) => {
  const text = String(req.body?.text || "").trim();
  const date = String(req.body?.date || "").trim();

  if (!text || !date) {
    return res.status(400).json({ message: "Goal text and date are required" });
  }

  try {
    const result = await dbQuery(
      "INSERT INTO goals(user_id, text, done, date) VALUES(?,?,?,?)",
      [req.user.id, text, false, date]
    );
    res.json({ id: result.insertId, text, done: false, date });
  } catch (err) {
    res.status(500).json({ message: "Failed to add goal", detail: err.message });
  }
});

app.put("/goals/:id", authenticateToken, async (req, res) => {
  const done = Boolean(req.body?.done);

  try {
    await dbQuery(
      "UPDATE goals SET done = ? WHERE id = ? AND user_id = ?",
      [done, req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to update goal", detail: err.message });
  }
});

app.delete("/goals/:id", authenticateToken, async (req, res) => {
  try {
    await dbQuery("DELETE FROM goals WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete goal", detail: err.message });
  }
});

async function startServer() {
  db.connect(async (err) => {
    if (err) {
      console.error("MySQL connection failed:", err.message);
      process.exit(1);
    }

    try {
      await initializeDatabase();
      console.log("MySQL connected and schema verified.");
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
    } catch (schemaErr) {
      console.error("Database initialization failed:", schemaErr.message);
      process.exit(1);
    }
  });
}

startServer();

import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("eduai.db");

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS user_progress (
    user_id TEXT,
    module_id TEXT,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, module_id)
  );

  CREATE TABLE IF NOT EXISTS user_certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    module_name TEXT,
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/progress/:userId", (req, res) => {
    const { userId } = req.params;
    const progress = db.prepare("SELECT module_id FROM user_progress WHERE user_id = ?").all(userId);
    res.json(progress.map((p: any) => p.module_id));
  });

  app.post("/api/progress", (req, res) => {
    const { userId, moduleId } = req.body;
    try {
      db.prepare("INSERT OR IGNORE INTO user_progress (user_id, module_id) VALUES (?, ?)").run(userId, moduleId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save progress" });
    }
  });

  app.get("/api/certificates/:userId", (req, res) => {
    const { userId } = req.params;
    const certs = db.prepare("SELECT * FROM user_certificates WHERE user_id = ?").all(userId);
    res.json(certs);
  });

  app.post("/api/certificates", (req, res) => {
    const { userId, moduleName } = req.body;
    
    // Check if certificate already exists for this module
    const existingCert = db.prepare("SELECT * FROM user_certificates WHERE user_id = ? AND module_name = ?").get(userId, moduleName);
    
    if (existingCert) {
      return res.json({ success: true, alreadyExists: true });
    }

    try {
      db.prepare("INSERT INTO user_certificates (user_id, module_name) VALUES (?, ?)").run(userId, moduleName);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to issue certificate" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

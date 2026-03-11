import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS user_progress (
    user_id TEXT,
    module_id TEXT,
    PRIMARY KEY (user_id, module_id)
  );

  CREATE TABLE IF NOT EXISTS certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    module_name TEXT,
    issued_at TEXT,
    UNIQUE(user_id, module_name)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/progress/:userId", (req, res) => {
    const { userId } = req.params;
    if (!userId || userId === "undefined" || userId === "null") {
      return res.status(400).json({ error: "Invalid User ID" });
    }
    const rows = db.prepare("SELECT module_id FROM user_progress WHERE user_id = ?").all(userId) as { module_id: string }[];
    res.json(rows.map(r => r.module_id));
  });

  app.post("/api/progress", (req, res) => {
    const { userId, moduleId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID required" });
    try {
      db.prepare("INSERT OR IGNORE INTO user_progress (user_id, module_id) VALUES (?, ?)").run(userId, moduleId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save progress" });
    }
  });

  app.get("/api/certificates/:userId", (req, res) => {
    const { userId } = req.params;
    if (!userId || userId === "undefined" || userId === "null") {
      return res.status(400).json({ error: "Invalid User ID" });
    }
    const rows = db.prepare("SELECT * FROM certificates WHERE user_id = ?").all(userId);
    res.json(rows);
  });

  app.post("/api/certificates", (req, res) => {
    const { userId, moduleName } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID required" });
    try {
      const existing = db.prepare("SELECT * FROM certificates WHERE user_id = ? AND module_name = ?").get(userId, moduleName);
      if (existing) {
        return res.json({ success: true, alreadyExists: true });
      }

      const info = db.prepare("INSERT INTO certificates (user_id, module_name, issued_at) VALUES (?, ?, ?)").run(
        userId,
        moduleName,
        new Date().toISOString()
      );
      res.json({ success: true, id: info.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: "Failed to issue certificate" });
    }
  });

  // ASI One AI Proxy Route
  app.get("/api/ai", (req, res) => {
    res.json({ message: "AI Proxy is active. Use POST to interact." });
  });

  app.post("/api/ai", async (req, res) => {
    const { prompt, isJson } = req.body;
    const apiKey = process.env.ASI_API_KEY;

    console.log(`[AI Proxy] Received request. Prompt length: ${prompt?.length}, isJson: ${isJson}`);

    if (!apiKey || apiKey === "MY_ASI_API_KEY") {
      console.error("[AI Proxy] ASI One API Key is missing or using placeholder.");
      return res.status(500).json({ 
        error: "ASI One API Key is missing on the server.",
        details: "Please ensure ASI_API_KEY is correctly set in your environment variables/secrets."
      });
    }

    try {
      const response = await fetch("https://api.asi1.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "asi-1",
          messages: [{ role: "user", content: prompt }],
          response_format: isJson ? { type: "json_object" } : undefined,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return res.status(response.status).json({ error: "ASI One API Error", details: errorData });
      }

      const data = await response.json();
      res.json({ content: data.choices[0].message.content });
    } catch (error: any) {
      console.error("AI Proxy Error:", error);
      res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
  });

  // API 404 handler - must be before Vite/Static middleware
  app.all("/api/(.*)", (req, res) => {
    res.status(404).json({ error: "API route not found" });
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
    app.get("(.*)", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

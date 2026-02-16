import "express-async-errors";
import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { categoriesRouter } from "./routes/categories.js";
import { templatesRouter } from "./routes/templates.js";
import { entriesRouter } from "./routes/entries.js";
import { tasksRouter } from "./routes/tasks.js";
import { uploadRouter } from "./routes/upload.js";
import { dashboardRouter } from "./routes/dashboard.js";

export function createApp() {
  const app = express();

  const uploadsDir = path.resolve(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  app.use(cors());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use("/uploads", express.static(uploadsDir));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/categories", categoriesRouter);
  app.use("/api/templates", templatesRouter);
  app.use("/api/entries", entriesRouter);
  app.use("/api/tasks", tasksRouter);
  app.use("/api/upload", uploadRouter);

  app.use((err, _req, res, _next) => {
    if (err && err.message?.includes("Unsupported file type")) {
      return res.status(400).json({ error: "UploadError", detail: err.message });
    }
    if (err && err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "UploadError", detail: "File too large. Max 10MB." });
    }
    return res.status(500).json({ error: "ServerError", detail: err?.message || "Unexpected error." });
  });

  return app;
}

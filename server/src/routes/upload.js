import { Router } from "express";
import path from "node:path";
import { upload } from "../middleware/upload.js";
import { requireRoles } from "../middleware/role.js";

export const uploadRouter = Router();

uploadRouter.post("/", requireRoles(["Admin", "Editor"]), upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "UploadError", detail: "No file uploaded." });
  }

  const publicPath = `/uploads/${path.basename(req.file.path)}`;
  return res.status(201).json({
    url: publicPath,
    filename: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size
  });
});

import fs from "node:fs";
import path from "node:path";
import multer from "multer";

const uploadsDir = path.resolve(process.cwd(), "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
    cb(null, `${Date.now()}-${safeName}${ext ? "" : ".bin"}`);
  }
});

const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const DOC_TYPES = new Set(["application/pdf", "application/zip", "application/x-zip-compressed"]);

function fileFilter(_req, file, cb) {
  const mime = file.mimetype.toLowerCase();
  if (IMAGE_TYPES.has(mime) || DOC_TYPES.has(mime)) {
    cb(null, true);
    return;
  }
  cb(new Error("Unsupported file type. Allowed: png, jpg, webp, pdf, zip."));
}

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter
});

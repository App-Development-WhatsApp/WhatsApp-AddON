import multer, { StorageEngine } from "multer";
import { Request } from "express";
import fs from "fs";

// Ensure upload directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Define storage
const storage: StorageEngine = multer.diskStorage({
  destination: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: any, destination: string) => void
  ) {
    cb(null, uploadDir);
  },
  filename: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: any, filename: string) => void
  ) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Allow only .json file uploads
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: (error: any, isAllowed: boolean) => void
) => {
  const allowedTypes = ["application/json", "text/plain"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JSON files are allowed!"), false);
  }
};

// Export upload middleware
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

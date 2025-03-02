import multer, { StorageEngine } from "multer";
import { Request, Response } from "express";
import fs from "fs";
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage: StorageEngine = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb: (error: any, destination: string) => void) {
    cb(null, "uploads/");
  },
  filename: function (req: Request, file: Express.Multer.File, cb: (error: any, destination: string) => void) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File filter to allow only images
const fileFilter = (req: Request, file: Express.Multer.File, cb: (error: any, isAllowed: boolean) => void) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, JPG, and PNG formats are allowed!"), false);
  }
};

// Multer upload configuration
export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: fileFilter,
});

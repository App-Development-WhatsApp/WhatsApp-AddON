import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import userRouter from './routes/user.routes';
import chatRouter from './routes/chat.routes';
import messageRouter from './routes/messages.routes';
import notificationRouter from './routes/notifications.routes';
import path from "path";

const app = express();

// CORS middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*", // Allow all origins (use with caution)
    credentials: true,
  })
);

// Middleware to parse incoming JSON and URL-encoded data
app.use(express.json({ limit: "10mb" }));  // Increase to 50MB
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Serve static files (e.g., PDFs, images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to parse cookies
app.use(cookieParser());

// Routes
app.use("/api/v1/users", userRouter);
// app.use("/api/v1/chats", chatRouter);
// app.use("/api/v1/messages", messageRouter);
// app.use("/api/v1/notifications", notificationRouter);

// Global error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

export { app };

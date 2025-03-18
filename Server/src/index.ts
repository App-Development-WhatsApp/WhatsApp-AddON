import { app } from "./app";
import { connectDB } from "./db/config";
import { env } from "./utils/Env";
import http from "http";
import { Server } from "socket.io";

// Create an HTTP server
const httpServer = http.createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: env.CORS_ORIGIN || "http://localhost:3000", // Replace with your frontend URL
    methods: ["GET", "POST", "UPDATE", "DELETE"],
  },
});

// Connect to the database before starting the server
connectDB()
  .then(() => {
    console.log("MongoDB Connected Successfully!");

    io.on("connection", (socket) => {
      console.log("A user connected");

      // Send a welcome message to the client
      socket.emit("welcome", "Welcome to the Socket.IO server");

      // Handle custom 'message' event
      socket.on("message", (data: string) => {
        console.log("Message from client:", data);
        io.emit("broadcast", `Broadcast message: ${data}`);
      });

      // Handle client disconnect
      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });

    // Start the HTTP server after successful DB connection
    httpServer.listen(env.PORT || 8000, () => {
      console.log(`Server is running on http://localhost:${env.PORT || 8000}`);
    });
  })
  .catch((error: Error) => {
    console.error("MongoDB Connection Failed!!!", error);
  });

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
    origin: "*", // Allow requests from any mobile client
    methods: ["GET", "POST"],
  },
  allowEIO3: true, // Ensures compatibility with React Native clients
});

// Connect to the database before starting the server
connectDB()
  .then(() => {
    console.log("MongoDB Connected Successfully!");

    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);

      // Send a welcome message to the client
      socket.emit("welcome", { message: "Welcome to the Socket.IO server" });

      // Handle incoming messages
      socket.on("message", (data) => {
        console.log("Message from client:", data);
        io.emit("broadcast", { message: `Broadcast message: ${data}` });
      });

      // Handle client disconnect
      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    // Start the HTTP server after successful DB connection
    const PORT = env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB Connection Failed!!!", error);
  });

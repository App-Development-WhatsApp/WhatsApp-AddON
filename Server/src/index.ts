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

    // Handle socket connections
    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);

      // Join a user's personal room
      socket.on("join", (userId: string) => {
        socket.join(userId);
        console.log(`User with ID ${userId} joined room ${userId}`);
      });

      // Handle message sending
      socket.on("sendMessage", (message) => {
        console.log("Received message:", message);

        const { receiverId } = message;

        if (receiverId) {
          // Emit the message to the receiver's room
          io.to(receiverId).emit("receiveMessage", message);
          console.log(`Message sent to room: ${receiverId}`);
        } else {
          console.warn("No receiverId provided in message.");
        }
      });

      // Handle user disconnect
      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    // Start the server
    const PORT = env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB Connection Failed!!!", error);
  });

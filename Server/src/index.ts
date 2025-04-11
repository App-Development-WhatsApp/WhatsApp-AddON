import { app } from "./app";
import { connectDB } from "./db/config";
import { env } from "./utils/Env";
import http from "http";
import { Server, Socket } from "socket.io";

// Create HTTP server
const httpServer = http.createServer(app);

// Define message type
interface Message {
  senderId: string;
  receiverId: string;
  content: string;
  timestamp?: Date;
  [key: string]: any;
}

// Placeholder functions (implement these)
const getPendingMessages = async (userId: string): Promise<Message[]> => {
  // your DB fetch logic
  return [];
};

const markMessagesAsDelivered = async (userId: string): Promise<void> => {
  // your DB update logic
};

const userSocketMap = new Map<string, string>(); // userId -> socketId
const SocketUserMap = new Map<string, string>(); // userId -> socketId

// Initialize Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  allowEIO3: true,
});

// Handle connections
io.on("connection", (socket: Socket) => {
  console.log("User connected:", socket.id);

  // User visits chat page
  socket.on("User_come_to_chat_page", async ({ userId }: { userId: string }) => {
    // socket.join(userId);
    console.log(`User with ID ${userId} joined room ${userId}`);

    const pendingMessages = await getPendingMessages(userId);

    if (pendingMessages?.length) {
      console.log(`Sending ${pendingMessages.length} pending messages to user ${userId}`);

      for (const message of pendingMessages) {
        io.to(userId).emit("receivePendingMessage", message);
        console.log("Pending message sent:", message);
      }

      await markMessagesAsDelivered(userId);
    }
  });

  // Join room
  // socket.on("join", (userId: string) => {
  //   socket.join(userId);
  //   console.log(`User with ID ${userId} joined room ${userId}`);
  // });

  // Send message
  socket.on("sendMessage", (message: Message) => {
    console.log("Received message:", message);

    const { receiverId } = message;

    if (receiverId) {
      io.to(receiverId).emit("receiveMessage", message);
      console.log(`Message sent to room: ${receiverId}`);
    } else {
      console.warn("No receiverId provided in message.");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

connectDB()
  .then(() => {
    console.log("MongoDB Connected Successfully!");
    const PORT = env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB Connection Failed!!!", error);
  });

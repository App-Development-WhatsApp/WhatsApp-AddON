import { app } from "./app";
import { connectDB } from "./db/config";
import { env } from "./utils/Env";
import http from "http";
import { Server, Socket } from "socket.io";

// Message type
interface Message {
  senderId: string;
  receiverId: string;
  content: string;
  timestamp?: Date;
  roomId?: string;
  [key: string]: any;
}

// Placeholder functions (replace with your DB logic)
const getPendingMessages = async (userId: string): Promise<Message[]> => {
  // Fetch undelivered messages from DB
  // console.log("Fetching pending messages for user:", userId);
  return [];
};

const markMessagesAsDelivered = async (messages: Message[]): Promise<void> => {
  // Mark these messages as delivered in DB
  // console.log("Marking messages as delivered:", messages);
};

const saveMessageToDB = async (message: Message): Promise<void> => {
  // Save message to DB
  // console.log("Saving message to DB:", message);
  // Simulate saving to DB
};

// Maps to track online users (userId -> Set of socketIds)
const onlineUsers = new Map<string, Set<string>>();

// Create HTTP server and Socket.IO
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  allowEIO3: true,
});

// Extend Socket with userId
declare module "socket.io" {
  interface Socket {
    userId?: string;
  }
}

io.on("connection", (socket: Socket) => {
  // console.log("New socket connected:", socket.id);

  // On user connected
  socket.on("user-connected", async (userId: string) => {
    socket.userId = userId;
    console.log("User connected:", userId);

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);

    console.log(`${userId} connected with socket ${socket.id}`);

    // Deliver pending messages
    const pendingMessages = await getPendingMessages(userId);
    pendingMessages.forEach((msg) => {
      io.to(socket.id).emit("receiveMessage", msg);
    });

    await markMessagesAsDelivered(pendingMessages);
  });
  // -----------------------------------------Handle incoming message------------------------------------------------
  socket.on("sendMessage", async (message: Message) => {
    // console.log("Received message:", message);
    message.timestamp = new Date();


    const receiverSocketIds = onlineUsers.get(message.receiverId);

    if (receiverSocketIds) {
      // ✅ Receiver is online — send message instantly
      console.log("Receiver is online, sending message:", message, "----", receiverSocketIds);
      receiverSocketIds.forEach((sockId) => {
        io.to(sockId).emit("receiveMessage", message);
      });
    } else {
      await saveMessageToDB(message); // Save with `delivered: false`
    }
  });
  // -----------------------------------------------------------------------------------------------------------------

  // --------------------------------------------calling--------------------------------------------------------------
  socket.on('call-user',async(props:any)=>{
    console.log("Call user event:", props);
    const receiverSocketIds = onlineUsers.get(props.to);
    if(receiverSocketIds){
      // Receiver is online — send call event
      console.log("Receiver socket IDs:", receiverSocketIds,"----", props.to);
      receiverSocketIds.forEach((sockId) => {
        io.to(sockId).emit("incoming-call", props);
      });
    }
  })
  // --------------------------------------------------------------------------------------------------------------------

  socket.on('user-disconnected', (userId: string) => {
    console.log("User disconnected:", userId);
    onlineUsers.delete(userId);
  });

  // On disconnect
  socket.on("disconnect", () => {
    const userId = socket.userId;
    if (userId) {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
        }
      }
    }
    console.log(`Socket ${socket.id} disconnected`);
  });
});

// Connect DB and start server
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



  // socket.on("typing", async ( props:any ) => {
  //   console.log("Typing event:", props);
  //   const receiverSocketIds = onlineUsers.get(props.friendId);
  //   console.log("Receiver socket IDs:", receiverSocketIds);
  //   if (receiverSocketIds) {
  //     // Receiver is online — send typing event
  //     receiverSocketIds.forEach((sockId) => {
  //       io.to(sockId).emit("userTyping",props.userid);
  //     });
  //   }
  // })
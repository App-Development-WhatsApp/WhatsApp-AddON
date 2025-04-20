import { app } from "./app";
import { connectDB } from "./db/config";
import { env } from "./utils/Env";
import http from "http";
import { Server, Socket } from "socket.io";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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
const onlineUsers = new Map();
const onlineSockets = new Map();

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

    onlineUsers.set(userId, socket.id);
    onlineSockets.set(socket.id, userId)
    console.log(`${userId} connected with socket ${socket.id}`);

    // Deliver pending messages
    // const pendingMessages = await getPendingMessages(userId);
    // pendingMessages.forEach((msg) => {
    //   io.to(socket.id).emit("receiveMessage", msg);
    // });

    // await markMessagesAsDelivered(pendingMessages);
  });
  // -----------------------------------------Handle incoming message------------------------------------------------
  socket.on("sendMessage", async (message: Message) => {
    message.timestamp = new Date();
    const receiverSocketId = onlineUsers.get(message.receiverId);
    if (message.files && message.files.length > 0) {
      message.files = message.files.map((file:any) => {
        if (file.base64) {
          const buffer = Buffer.from(file.base64, 'base64');
          const extension = file.mimeType?.split("/")[1] || "bin";
          const uniqueFileName = `${uuidv4()}.${extension}`;
          const savePath = path.join(__dirname, "uploads", uniqueFileName);

          // Save file to local storage
          fs.writeFileSync(savePath, buffer);

          // Replace base64 with server file path or URL
          return {
            ...file,
            localPath: `/uploads/${uniqueFileName}`, // You can serve this with Express later
            base64: null, // Avoid sending base64 back to clients
          };
        }
        return file;
      });
    }
    console.log(message)

    // if (receiverSocketId) {
    //   console.log("Receiver is online, sending message:", message, " ----", receiverSocketId);
    //   io.to(receiverSocketId).emit("receiveMessage", message);
    // } else {
    //   console.log("Receiver is offline, message saved as pending.");
    //   // Store to DB or in-memory queue
    // }
  });
  // -----------------------------------------------------------------------------------------------------------------

  // --------------------------------------------calling--------------------------------------------------------------
  socket.on('call-user', async (props: any) => {
    console.log("Call user event:", props);
    const receiverSocketId = onlineUsers.get(props.to);
    if (receiverSocketId) {
      console.log("Receiver socket IDs:", receiverSocketId, "----", props.to);
      io.to(receiverSocketId).emit("incoming-call", props);
    }
  })

  socket.on('call-cancel', async (props: any) => {
    console.log("Call cancel event:", props);
    const receiverSocketId = onlineUsers.get(props.to);
    if (receiverSocketId) {
      console.log("Receiver socket IDs:", receiverSocketId, "----", props.to);
      io.to(receiverSocketId).emit("cancel-call", props);
    }
  })
  socket.on('call-accepted', async (props: any) => {
    console.log("Call accepted event:", props);
    const receiverSocketId = onlineUsers.get(props.to);
    if (receiverSocketId) {
      console.log("Receiver socket IDs:", receiverSocketId, "----", props.to);
      io.to(receiverSocketId).emit("accepted-call", props);
    }
  })


  // --------------------------------------------------------------------------------------------------------------------


  socket.on('user-disconnected', (userId) => {
    console.log(`❌ user disconnected: ${userId}`);
    const socketId = onlineUsers.get(userId)
    if (socketId) {
      onlineUsers.delete(userId);
      onlineSockets.delete(socket.id);
      console.log(`User disconnected: ${userId}   ${socket.id}`);
    }
  })
  // On disconnect
  socket.on("disconnect", () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
    const userId = onlineSockets.get(socket.id)
    if (userId) {
      onlineUsers.delete(userId);
      onlineSockets.delete(socket.id);
      console.log(`User disconnected: ${userId}   ${socket.id}`);
    }
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
import { saveChatMessage } from "../utils/chatStorage";
import socket from "../utils/socket";

const registerReceiveMessage = (callback) => {
  socket.on("receiveMessage", callback);
};

const unregisterReceiveMessage = (callback) => {
  socket.off("receiveMessage", callback);
};

const sendMessage =async (message) => {
  await saveChatMessage(message.receiverId, message);
  socket.emit("sendMessage", message);
};

const onPendingMessages = (callback) => {
  socket.on("receivePendingMessage", callback);
};

const removeAllListeners = () => {
  socket.removeAllListeners();
};

export default {
  registerReceiveMessage,
  unregisterReceiveMessage,
  sendMessage,
  onPendingMessages,
  removeAllListeners,
};

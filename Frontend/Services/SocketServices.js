// import { saveChatMessage } from "../utils/chatStorage";

// const registerReceiveMessage = (socket, callback) => {
//   socket.on("receiveMessage", callback);
// };

// const unregisterReceiveMessage = (socket, callback) => {
//   socket.off("receiveMessage", callback);
// };

// const sendMessage = async (socket, message) => {
//   // await saveChatMessage(message.receiverId, message);
//   socket.emit("sendMessage", message);
// };

// const onPendingMessages = (socket, callback) => {
//   socket.on("receivePendingMessage", callback);
// };

// const removeAllListeners = (socket) => {
//   socket.removeAllListeners();
// };

// export default {
//   registerReceiveMessage,
//   unregisterReceiveMessage,
//   sendMessage,
//   onPendingMessages,
//   removeAllListeners,
// };

import { io } from "socket.io-client";
import { BACKEND_URL } from "../Services/AuthServices";
const SOCKET_URL = BACKEND_URL; // Replace with your backend URL

let socket = null;

export const getSocket = () => {
  console.log(socket, "socket")
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket"],
    });
  }
  return socket;
};
export default socket;

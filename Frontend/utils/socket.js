import { io } from "socket.io-client";
import { BACKEND_URL } from "../Services/AuthServices";
const SOCKET_URL = BACKEND_URL; // Replace with your backend URL

const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
});

export default socket;

import { io } from "socket.io-client";
import { BACKEND_URL } from "../Services/AuthServices";
const SOCKET_URL = BACKEND_URL; // Replace with your backend URL

const socket = io(SOCKET_URL, {
  transports: ["websocket"], // Ensures compatibility with React Native
  forceNew: true,
  reconnectionAttempts: 5,
  timeout: 10000,
});

export default socket;

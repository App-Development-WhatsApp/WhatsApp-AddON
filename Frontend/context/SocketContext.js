import React, { createContext, useContext, useEffect, useState } from "react";
import { useNetInfo } from "@react-native-community/netinfo";
import { loadUserInfo } from "../utils/chatStorage";
import { initDatabase } from "../db/AllDatabase";
import { io } from "socket.io-client";
import { BACKEND_URL } from "../Services/AuthServices";

export const SocketContext = createContext();
const SOCKET_URL = BACKEND_URL;

export const getSocket = () => {
  return io(SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket"],
  });
};

export const SocketProvider = ({ children }) => {
  const netInfo = useNetInfo();
  const [socket] = useState(getSocket()); // initialized once
  const [userData, setUserData] = useState(null);
  const [incomingCall, setIncomingCall] = useState("");

  // Load database and user info
  useEffect(() => {
    const setup = async () => {
      // await initDatabase();
      const userInfo = await loadUserInfo();
      if (userInfo) {
        setUserData(userInfo);
      }
    };
    setup();
  }, []);

  useEffect(() => {
    if (!netInfo.isConnected || !userData) return;

    if (!socket.connected) {
      console.log("🔌 Connecting socket...");
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      socket.emit("user-connected", userData._id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected", socket.id);
      socket.emit("user-disconnected", userData._id);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [netInfo.isConnected, userData]);

  return (
    <SocketContext.Provider value={{ socket, incomingCall, setIncomingCall }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

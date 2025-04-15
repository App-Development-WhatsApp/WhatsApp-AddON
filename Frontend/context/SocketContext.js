import React, { createContext, useContext, useEffect, useState } from "react";
import { useNetInfo } from "@react-native-community/netinfo";
import { loadUserInfo } from "../utils/chatStorage";
import { getSocket } from "../utils/socket";
export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const netInfo = useNetInfo();
  const [socket] = useState(getSocket()); // ✅ only initialize once

  const [incomingCall, setIncomingCall] = useState("");

  // useEffect(() => {
  //   socket.on('incoming-call', (data) => {
  //   setIncomingCall({
  //     from:data.from,
  //     callerName:,
  //     callerProfilePic: "",
  //   }); // { from, callerName, callerProfilePic }
  //   });

  //   return () => {
  //     socket.off('incoming-call');
  //   };
  // }, []);

  // Load user data when network is connected
  useEffect(() => {
    const checkAuth = async () => {
      const userInfo = await loadUserInfo();
      if (userInfo) {
        setUserData(userInfo);
      }
    };

    if (netInfo.isConnected) {
      checkAuth();
    }
  }, [netInfo.isConnected]);

  // Connect socket once userData is available
  useEffect(() => {
    if (!netInfo.isConnected || !userData) return;

    if (!socket.connected) {
      console.log("connecting socket...");
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);

      // Register this user with the server
      socket.emit("user-connected", userData._id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected",socket.id);
      socket.emit("user-disconnected", userData._id);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("incoming-call");
      socket.off("user-connected");
    };
  }, [netInfo.isConnected, userData]);

  return (
    <SocketContext.Provider value={{ socket, incomingCall, setIncomingCall }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
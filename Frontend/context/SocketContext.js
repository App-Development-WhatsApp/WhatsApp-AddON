import React, { createContext, useContext, useEffect, useState } from "react";
import socket from "../utils/socket";
import { useNetInfo } from "@react-native-community/netinfo";
import { loadUserInfo } from "../utils/chatStorage";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const netInfo = useNetInfo();

  // const [incomingCall, setIncomingCall] = useState("");

  // useEffect(() => {
  //   socket.on('incoming-call', (data) => {
  //   });
  //   console.log("context")
  //   setIncomingCall({
  //     from:"ID2",
  //     callerName:"name",
  //     callerProfilePic: "",
  //   }); // { from, callerName, callerProfilePic }

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
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);

      // Register this user with the server
      socket.emit("user-connected", userData._id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      socket.emit("user-disconnected", userData._id);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("receivePendingMessage");
      socket.disconnect();
    };
  }, [netInfo.isConnected, userData]);

  return (
    <SocketContext.Provider value={{ socket, incomingCall, setIncomingCall }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNetInfo } from "@react-native-community/netinfo";
import { loadUserInfo, saveChatMessage } from "../utils/chatStorage";
import { io } from "socket.io-client";

export const SocketContext = createContext();
const SOCKET_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const getSocket = () => {
  return io(SOCKET_URL, {
    autoConnect: true,
    transports: ["websocket"],
  });
};

export const SocketProvider = ({ children }) => {
  const netInfo = useNetInfo();
  const [socket] = useState(getSocket()); // Initialized once
  const [userData, setUserData] = useState(null);
  const [incomingCall, setIncomingCall] = useState("");

  // Load user info
  useEffect(() => {
    const setup = async () => {
      const userInfo = await loadUserInfo();
      if (userInfo) setUserData(userInfo);
    };
    setup();
  }, [netInfo.isConnected]);

  // Connect and handle socket events
  useEffect(() => {
    if (!netInfo.isConnected || !userData) return;

    if (!socket.connected) {
      console.log(SOCKET_URL,"🔌 Connecting socket...");
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      socket.emit("user-connected", userData.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected", socket.connected);
      socket.emit("user-disconnected", userData.id);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [netInfo.isConnected, userData]);
  useEffect(() => {
    const incomingcall=async (props) => {
      setIncomingCall(props)
      console.log("Incoming call props:", props);
    }
    RegisterIncomingCall(incomingcall);
    // Register incoming call listener
      
    return () => {
      // Cleanup function to unregister incoming call listeners
      UnRegisterIncomingCall();
    }
   
  },[])
  // Custom socket methods
  const callFriend = ({ friendId, callerId }) => {
    socket.emit("call-user", { from: callerId, to: friendId });
  }
  const RegisterIncomingCall=(callback)=>{
    socket.on("incoming-call", callback);
  }
  const UnRegisterIncomingCall=(callback)=>{
    socket.off("incoming-call", callback);
  }

  const cancelCall = ({ friendId, callerId }) => {
    socket.emit("call-cancel", { from: callerId, to: friendId });
  }
  const RegistercalcelCall=(callback)=>{
    socket.on("cancel-call", callback);
  }
  const UnRegistercalcelCall=(callback)=>{
    socket.on("cancel-call", callback);
  }

  const AcceptCall = ({ friendId, callerId }) => {
    socket.emit("call-accepted", { from: callerId, to: friendId });
  }

  const RegisterAcceptCall=(callback)=>{
    socket.on("accepted-call", callback);
  }
  const UnRegisterAcceptCall=(callback)=>{
    socket.on("accepted-call", callback);
  }
  // ---------------------MEssage------------------------
  const registerReceiveMessage = (callback) => {
    socket.on("receiveMessage", callback);
  };
  const unregisterReceiveMessage = (callback) => {
    socket.off("receiveMessage", callback);
  };
  const sendMessage = async (message) => {
    socket.emit("sendMessage", message);
  };
  const onPendingMessages = (callback) => {
    socket.on("receivePendingMessage", callback);
  };
  // ----------------------------------------------------

  const removeAllListeners = () => {
    socket.removeAllListeners();
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        incomingCall,
        setIncomingCall,
        registerReceiveMessage,
        unregisterReceiveMessage,
        sendMessage,
        onPendingMessages,
        removeAllListeners,
        callFriend,
        RegisterIncomingCall,
        UnRegisterIncomingCall,
        RegistercalcelCall,
        UnRegistercalcelCall,
        cancelCall,
        AcceptCall,
        RegisterAcceptCall,
        UnRegisterAcceptCall
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

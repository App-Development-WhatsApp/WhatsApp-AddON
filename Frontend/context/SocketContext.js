import React, { createContext, useEffect, useState } from "react";
import socket from "../utils/socket";
import { useNetInfo } from "@react-native-community/netinfo";
import { loadUserInfo } from "../utils/chatStorage";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);
    const netInfo = useNetInfo();

    // Load user data when network is connected
    useEffect(() => {
        const checkAuth = async () => {
            const userInfo = await loadUserInfo();
            setUserData(userInfo);
        };

        if (netInfo.isConnected) {
            checkAuth();
        }
    }, [netInfo.isConnected]);

    // Connect socket once userData is available
    useEffect(() => {
        if (!netInfo.isConnected || !userData) return;
    
        // console.log("Userdata ->", userData);
    
        if (!socket.connected) {
            socket.connect();
        }
    
        socket.on("connect", () => {
            console.log("✅ Socket connected:", socket.id);
    
            socket.emit("User_come_to_chat_page", { userId: userData?._id });
        });
    
        socket.on("receivePendingMessage", (data) => {
            console.log("📩 Pending message received:", data);
            socket.emit("PendingMessageReceived", { userId: userData?._id });
        });
    
        return () => {
            socket.off("connect"); // cleanup
            socket.off("receivePendingMessage");
            socket.disconnect();
            console.log("❌ Socket disconnected");
        };
    }, [netInfo.isConnected, userData]);
    

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

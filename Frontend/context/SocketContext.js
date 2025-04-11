// SocketContext.js
import React, { createContext, useEffect,useState } from "react";
import socket from "../utils/socket";
import { useNetInfo } from "@react-native-community/netinfo";
import { loadUserInfo } from "../utils/chatStorage";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [userData, setUserData] = useState(null);

    const netInfo = useNetInfo();
    useEffect(() => {
        const checkAuth = async () => {
            const userInfo = await loadUserInfo();
            setUserData(userInfo)
        };

        checkAuth();
    }, [])

    useEffect(() => {
        socket.connect();

        socket.emit("User_come_to_chat_page", { userId: userData?.userId });

        // Listen for pending messages or new ones
        socket.on("receivePendingMessage", (data) => {
            setReceivedMessage(data);
            socket.emit("PendingMessageReceived", { userId: userData?.userId });
        });

        return () => {
            socket.disconnect();
        };
    }, [netInfo.isConnected]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

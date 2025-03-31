import { getAllChattedUsers } from '../Services/AuthServices';
import * as FileSystem from "expo-file-system";

const userFilePath = FileSystem.documentDirectory + "userInfo.json";
const friendsFilePath = FileSystem.documentDirectory + "friendsInfo.json"; // Store friends' details
const chatsFilePath = FileSystem.documentDirectory + "ChatsInfo.json"; // Store chats info

export const getUserChatFilePath = async (userId) => {
    try {
        const userInfo = await loadUserInfo();
        if (!userInfo || !userInfo._id) {
            console.error("User info not found or invalid.");
            return null;
        }

        const fileName = `${userInfo._id}-${userId}.json`;
        const filePath = FileSystem.documentDirectory + fileName;

        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (!fileInfo.exists) {
            console.log("File does not exist, creating new one...");
            await FileSystem.writeAsStringAsync(filePath, JSON.stringify({ messages: [] }));
        }

        return filePath;
    } catch (error) {
        console.error("Error handling user file:", error);
        return null;
    }
};

// Function to read JSON file
export const readJsonFile = async (filePath) => {
    try {
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (fileInfo.exists) {
            const content = await FileSystem.readAsStringAsync(filePath);
            return JSON.parse(content);
        }
    } catch (error) {
        console.error("Error reading JSON file:", error);
    }
    return [];
};

// Function to write JSON file
export const writeJsonFile = async (filePath, data) => {
    try {
        await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error writing JSON file:", error);
    }
};

// Function to add a message
export const addMessage = async (userId, message) => {
    const filePath = await getUserChatFilePath(userId);
    if (!filePath) return null;

    const data = await readJsonFile(filePath);

    const newMessage = {
        id: Date.now().toString(),
        text: message,
        timestamp: new Date().toISOString(),
    };

    data.messages.push(newMessage);
    await writeJsonFile(filePath, data);
    return newMessage;
};

// Function to update a message
export const updateMessage = async (userId, messageId, newText) => {
    const filePath = await getUserChatFilePath(userId);
    if (!filePath) return null;

    const data = await readJsonFile(filePath);

    const messageIndex = data.messages.findIndex((msg) => msg.id === messageId);
    if (messageIndex !== -1) {
        data.messages[messageIndex].text = newText;
        data.messages[messageIndex].timestamp = new Date().toISOString();
        await writeJsonFile(filePath, data);
        return data.messages[messageIndex];
    }
    console.error("Message not found");
    return null;
};

// Function to delete a message
export const deleteMessage = async (userId, messageId) => {
    const filePath = await getUserChatFilePath(userId);
    if (!filePath) return null;

    const data = await readJsonFile(filePath);

    data.messages = data.messages.filter((msg) => msg.id !== messageId);
    await writeJsonFile(filePath, data);
    return { success: true, message: "Message deleted" };
};

export const saveUserInfo = async (user) => {
    try {
        await FileSystem.writeAsStringAsync(userFilePath, JSON.stringify(user));
        console.log("User info saved!");
    } catch (error) {
        console.error("Error saving user info:", error);
    }
};

export const loadUserInfo = async () => {
    try {
        const data = await FileSystem.readAsStringAsync(userFilePath);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("Error loading user info:", error);
        return null;
    }
};

export const fetchAndSaveFriends = async (userId) => {
    try {
        const response = await fetch(`http://10.10.15.92:5000/api/v1/users/friends/${userId}`);
        const data = await response.json();
        const friends = data.friends || [];

        // Save friends data to local JSON file
        await FileSystem.writeAsStringAsync(friendsFilePath, JSON.stringify(friends, null, 2));
        console.log("Friends info saved successfully!");

        return friends;
    } catch (error) {
        console.error("Error fetching or saving friends:", error);
        return [];
    }
};

// Load offline chats
export const loadChatsOffline = async () => {
    console.log("Loading offline chats...");
    try {
        const data = await FileSystem.readAsStringAsync(chatsFilePath);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error loading chats from local storage:", error);
        return [];
    }
};

// Function to add a user to the friends list when a chat starts
export const addUserToFriendsList = async (userId, userName) => {
    try {
        let friends = await readJsonFile(friendsFilePath);
        
        if (!Array.isArray(friends)) {
            friends = [];
        }

        // Check if the user already exists in the friends list
        const exists = friends.some(friend => friend.userId === userId);
        if (!exists) {
            friends.push({ userId, userName });
            await writeJsonFile(friendsFilePath, friends);
            console.log("User added to friends list:", userName);
        }
    } catch (error) {
        console.error("Error adding user to friends list:", error);
    }
};

// Function to get chatting history and add the user to friends list
export const getChattingHistory = async (userId, userName) => {
    try {
        const userInfo = await loadUserInfo();
        if (!userInfo || !userInfo._id) {
            console.error("User info not found.");
            return { messages: [] };
        }

        // Add the user to friends list
        await addUserToFriendsList(userId, userName);

        const chattingFileName = `${userInfo._id}-${userId}.json`;
        const chattingFilePath = FileSystem.documentDirectory + chattingFileName;

        const fileInfo = await FileSystem.getInfoAsync(chattingFilePath);
        if (!fileInfo.exists) {
            console.log("Chat file does not exist, creating new one...");
            await FileSystem.writeAsStringAsync(chattingFilePath, JSON.stringify({ messages: [] }, null, 2));
        }

        const data = await FileSystem.readAsStringAsync(chattingFilePath);
        return data ? JSON.parse(data) : { messages: [] };
    } catch (error) {
        console.error("Error fetching chatting history:", error);
        return { messages: [] };
    }
};

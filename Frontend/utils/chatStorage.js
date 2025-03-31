import { API_URL, getAllChattedUsers } from '../Services/AuthServices';
import * as FileSystem from "expo-file-system";

export const userFilePath = FileSystem.documentDirectory + "userInfo.json";
export const friendsFilePath = FileSystem.documentDirectory + "friendsInfo.json"; // Store friends' details
export const chatsFilePath = FileSystem.documentDirectory + "ChatsInfo.json"; // Store chats info

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
        const response = await fetch(`${API_URL}/friends/${userId}`);
        const data = await response.json();
        let friends = data.friends || [];

        // Function to download an image and return the local file URI
        const downloadImage = async (imageUrl, filename) => {
            const fileUri = `${FileSystem.documentDirectory}${filename}`;
            try {
                const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri);
                return uri;
            } catch (error) {
                console.error("Error downloading image:", error);
                return imageUrl; // Fallback to original URL if download fails
            }
        };

        // Process each friend and download profile picture if needed
        for (let i = 0; i < friends.length; i++) {
            if (friends[i].profilePic.startsWith("https://res.cloudinary.com")) {
                const fileName = `profile_${friends[i]._id}.jpg`;
                friends[i].profilePic = await downloadImage(friends[i].profilePic, fileName);
            }
        }

        // Save friends data with local image paths
        await FileSystem.writeAsStringAsync(friendsFilePath, JSON.stringify(friends, null, 2));
        console.log("Friends info saved successfully!");

        return friends;
    } catch (error) {
        console.error("Error fetching or saving friends:", error);
        return [];
    }
};

export const getSavedFriends = async () => {
    try {
        // Check if the file exists
        const fileInfo = await FileSystem.getInfoAsync(friendsFilePath);
        if (!fileInfo.exists) {
            console.log("No saved friends found.");
            return [];
        }

        // Read the file contents
        const jsonString = await FileSystem.readAsStringAsync(friendsFilePath);
        const friends = JSON.parse(jsonString);

        return friends;
    } catch (error) {
        console.error("Error reading saved friends:", error);
        return [];
    }
};

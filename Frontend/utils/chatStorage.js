import { getAllChattedUsers } from '../Services/AuthServices';

/**
 * Saves user (friend) information locally
 * @param {string} userId - Friend's ID
 * @param {object} userInfo - User details { id, name, profilePic }
 */
import * as FileSystem from "expo-file-system";

const userFilePath = FileSystem.documentDirectory + "userInfo.json";
const friendsFilePath = FileSystem.documentDirectory + "friendsInfo.json"; // Store friends' details
const chatsFilePath = FileSystem.documentDirectory + "ChatsInfo.json"; // Store friends' details

export const getUserChatFilePath = async (userId) => {
    try {
        // Load user info (assuming it returns an object with _id)
        const userInfo = await loadUserInfo(); // Ensure this function is asynchronous if needed
        const fileName = `${userInfo._id}-${userId}.json`;
        const filePath = FileSystem.documentDirectory + fileName;

        // Check if file exists
        const fileInfo = await FileSystem.getInfoAsync(filePath);

        if (fileInfo.exists) {
            console.log("File exists:", filePath);
            return filePath;
        } else {
            console.log("File does not exist, creating new one...");
            await FileSystem.writeAsStringAsync(filePath, JSON.stringify({}));
            return filePath;
        }
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
        } else {
            return { messages: [] }; // Return empty messages array if file doesn't exist
        }
    } catch (error) {
        console.error("Error reading JSON file:", error);
        return { messages: [] };
    }
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
    const filePath = await getUserFilePath(userId);
    const data = await readJsonFile(filePath);

    const newMessage = {
        id: Date.now().toString(), // Unique message ID
        text: message,
        timestamp: new Date().toISOString(),
    };

    data.messages.push(newMessage);
    await writeJsonFile(filePath, data);
    return newMessage;
};

// Function to update a message
export const updateMessage = async (userId, messageId, newText) => {
    const filePath = await getUserFilePath(userId);
    const data = await readJsonFile(filePath);

    const messageIndex = data.messages.findIndex((msg) => msg.id === messageId);
    if (messageIndex !== -1) {
        data.messages[messageIndex].text = newText;
        data.messages[messageIndex].timestamp = new Date().toISOString();
        await writeJsonFile(filePath, data);
        return data.messages[messageIndex];
    } else {
        console.error("Message not found");
        return null;
    }
};

// Function to delete a message
export const deleteMessage = async (userId, messageId) => {
    const filePath = await getUserFilePath(userId);
    const data = await readJsonFile(filePath);

    const filteredMessages = data.messages.filter((msg) => msg.id !== messageId);
    data.messages = filteredMessages;
    await writeJsonFile(filePath, data);
    return { success: true, message: "Message deleted" };
};

// Example Usage
//   const userId = "12345";
//   addMessage(userId, "Hello, this is my first message!")
//     .then((msg) => console.log("Message Added:", msg));

//   updateMessage(userId, "MESSAGE_ID", "Updated message text")
//     .then((msg) => console.log("Message Updated:", msg));

//   deleteMessage(userId, "MESSAGE_ID")
//     .then((res) => console.log(res));


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
        const response = getAllChattedUsers(userId);

        const data = await response.json();
        if (data.friends) {
            await FileSystem.writeAsStringAsync(friendsFilePath, JSON.stringify(data.friends));
        }
    } catch (error) {
        console.error("Error fetching friends:", error);
    }
};

export const loadChatsOffline = async () => {
    console.log("doing well")
    try {
        const data = await FileSystem.readAsStringAsync(chatsFilePath);
        console.log("loda fatatt", data)
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error loading friends from local storage:", error);
        return [];
    }
};



export const getChattingHistory = async (userId) => {
    try {
        const response = await loadUserInfo(); // Ensure async function is awaited
        const chattingfileName = `${userId}-${response._id}.json`;
        const chattingfilepath = FileSystem.documentDirectory + chattingfileName;

        // Check if file exists
        const fileInfo = await FileSystem.getInfoAsync(chattingfilepath);

        if (fileInfo.exists) {
            console.log("File exists:", chattingfilepath);
            const data = await FileSystem.readAsStringAsync(chattingfilepath);
            return data ? JSON.parse(data) : { messages: [] };
        } else {
            console.log("File does not exist, creating new one...");
            const initialData = { messages: [] };
            await FileSystem.writeAsStringAsync(chattingfilepath, JSON.stringify(initialData, null, 2));
            return initialData;
        }
    } catch (error) {
        console.error("Error fetching chatting history:", error);
        return { messages: [] }; // Return empty array on error
    }
};

























import RNFS from 'react-native-fs';
import { getAllChattedUsers } from '../Services/AuthServices';
// Base directory
const BASE_CHAT_DIR = RNFS.DocumentDirectoryPath + "/chats";
const USERS_DIR = `${BASE_CHAT_DIR}/users`;

/**
 * Saves user (friend) information locally
 * @param {string} userId - Friend's ID
 * @param {object} userInfo - User details { id, name, profilePic }
 */
import * as FileSystem from "expo-file-system";

const userFilePath = FileSystem.documentDirectory + "userInfo.json";
const friendsFilePath = FileSystem.documentDirectory + "friendsInfo.json"; // Store friends' details

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

export const fetchAndSaveFriends = async (friendIds) => {
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

  const loadFriendsOffline = async () => {
    try {
      const data = await FileSystem.readAsStringAsync(friendsFilePath);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading friends from local storage:", error);
      return [];
    }
  };
  

























  
const MESSAGES_DIR = `${BASE_CHAT_DIR}/messages`;

/**
 * Saves a chat message
 * @param {string} userId - Sender's ID
 * @param {string} chatId - Receiver's ID
 * @param {object} messageObj - { sender, receiver, text, timestamp }
 */
export const saveChatMessage = async (userId, chatId, messageObj) => {
    try {
        const chatFolder = `${MESSAGES_DIR}/${userId}/${chatId}`;
        await RNFS.mkdir(chatFolder);  // Ensure chat folder exists

        const timestamp = Date.now();
        const filePath = `${chatFolder}/${timestamp}.json`;

        await RNFS.writeFile(filePath, JSON.stringify(messageObj, null, 2), 'utf8');
        console.log(`Message saved: ${filePath}`);
    } catch (error) {
        console.error("Error saving message:", error);
    }
};

const CALLS_DIR = `${BASE_CHAT_DIR}/calls`;

/**
 * Saves call history
 * @param {string} userId - User's ID
 * @param {object} callObj - { type, contact, duration, timestamp }
 */
export const saveCallHistory = async (userId, callObj) => {
    try {
        await RNFS.mkdir(CALLS_DIR);  // Ensure call history folder exists

        const filePath = `${CALLS_DIR}/${userId}.json`;
        let callHistory = [];

        if (await RNFS.exists(filePath)) {
            const existingData = await RNFS.readFile(filePath, 'utf8');
            callHistory = JSON.parse(existingData);
        }

        callHistory.push(callObj);
        await RNFS.writeFile(filePath, JSON.stringify(callHistory, null, 2), 'utf8');

        console.log(`Call history updated: ${filePath}`);
    } catch (error) {
        console.error("Error saving call history:", error);
    }
};

const GROUPS_DIR = `${BASE_CHAT_DIR}/groups`;

/**
 * Saves a group chat message
 * @param {string} groupId - Group ID
 * @param {object} messageObj - { sender, text, timestamp }
 */
export const saveGroupMessage = async (groupId, messageObj) => {
    try {
        const groupFolder = `${GROUPS_DIR}/${groupId}`;
        await RNFS.mkdir(groupFolder);  // Ensure group folder exists

        const timestamp = Date.now();
        const filePath = `${groupFolder}/${timestamp}.json`;

        await RNFS.writeFile(filePath, JSON.stringify(messageObj, null, 2), 'utf8');
        console.log(`Group message saved: ${filePath}`);
    } catch (error) {
        console.error("Error saving group message:", error);
    }
};


/**
 * Fetch all chat messages between two users
 * @param {string} userId - Current User's ID
 * @param {string} chatId - Chatting with User's ID
 * @returns {Promise<Array>} - Array of messages sorted by time
 */
export const getChatMessages = async (userId, chatId) => {
    try {
        const chatFolder = `${MESSAGES_DIR}/${userId}/${chatId}`;
        const exists = await RNFS.exists(chatFolder);

        if (!exists) {
            console.log("No chat history found.");
            return [];
        }

        const files = await RNFS.readDir(chatFolder);
        let messages = [];

        for (const file of files) {
            if (file.isFile() && file.name.endsWith(".json")) {
                const content = await RNFS.readFile(file.path, 'utf8');
                messages.push(JSON.parse(content));
            }
        }

        // Sort messages by timestamp
        messages.sort((a, b) => a.timestamp - b.timestamp);

        return messages;
    } catch (error) {
        console.error("Error fetching chat messages:", error);
        return [];
    }
};

const BASE_STATUS_DIR = RNFS.DocumentDirectoryPath + "/statuses";

/**
 * Save user status (image/video/text)
 * @param {string} userId - ID of the user uploading status
 * @param {string} statusType - "image", "video", or "text"
 * @param {string} statusContent - File path or text content
 */
export const saveUserStatus = async (userId, statusType, statusContent) => {
    try {
        const userStatusDir = `${BASE_STATUS_DIR}/${userId}`;
        const timestamp = Date.now();
        const fileName = `${userStatusDir}/${timestamp}.json`;

        await RNFS.mkdir(userStatusDir, { NSURLIsExcludedFromBackupKey: true });

        const statusData = {
            userId,
            statusType,
            statusContent,
            timestamp,
            expiresAt: timestamp + 24 * 60 * 60 * 1000, // Expires in 24 hours
        };

        await RNFS.writeFile(fileName, JSON.stringify(statusData), 'utf8');

        console.log("Status saved:", statusData);
    } catch (error) {
        console.error("Error saving status:", error);
    }
};


/**
 * Fetch statuses of all friends
 * @param {Array} friendIds - List of friend user IDs
 * @returns {Promise<Array>} - Array of statuses
 */
export const getStatuses = async (friendIds) => {
    try {
        let allStatuses = [];

        for (const friendId of friendIds) {
            const friendStatusDir = `${BASE_STATUS_DIR}/${friendId}`;
            const exists = await RNFS.exists(friendStatusDir);

            if (exists) {
                const files = await RNFS.readDir(friendStatusDir);

                for (const file of files) {
                    if (file.isFile() && file.name.endsWith(".json")) {
                        const content = await RNFS.readFile(file.path, 'utf8');
                        const status = JSON.parse(content);

                        if (Date.now() < status.expiresAt) {
                            allStatuses.push(status);
                        } else {
                            await RNFS.unlink(file.path); // Delete expired status
                        }
                    }
                }
            }
        }

        return allStatuses;
    } catch (error) {
        console.error("Error fetching statuses:", error);
        return [];
    }
};

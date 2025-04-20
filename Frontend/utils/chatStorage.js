import * as FileSystem from "expo-file-system";
import { Platform } from 'react-native';
const API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/users`;
import localStorage from '@react-native-async-storage/async-storage';
import { getUserInfoById } from "../database/curd";

// File paths
export const friendsFilePath = FileSystem.documentDirectory + "friendsInfo.json";



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
  return { messages: [] };
};

export const writeJsonFile = async (filePath, data) => {
  try {
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing JSON file:", error);
  }
};

// --------- Message Handlers ---------- //


export const updateMessage = async (otherUserId, messageId, newText) => {
  const filePath = await getSharedChatFilePath(otherUserId);
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

export const deleteMessage = async (otherUserId, messageId) => {
  const filePath = await getSharedChatFilePath(otherUserId);
  if (!filePath) return null;

  const data = await readJsonFile(filePath);
  data.messages = data.messages.filter((msg) => msg.id !== messageId);
  await writeJsonFile(filePath, data);
  return { success: true, message: "Message deleted" };
};

// --------- User & Friends ---------- //


export const loadUserInfo = async () => {
  try {
    if (Platform.OS === 'web') {
      const data = localStorage.getItem('user');
      return data ? JSON.parse(data) : null;
    } else {
      const userId = await localStorage.getItem('userId')
      const user = await getUserInfoById(userId);
      return user ? user : null;
    }
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

    const downloadImage = async (imageUrl, filename) => {
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      try {
        const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri);
        return uri;
      } catch (error) {
        console.error("Error downloading image:", error);
        return imageUrl;
      }
    };

    for (let i = 0; i < friends.length; i++) {
      if (friends[i].profilePic.startsWith("https://res.cloudinary.com")) {
        const fileName = `profile_${friends[i]._id}.jpg`;
        friends[i].profilePic = await downloadImage(friends[i].profilePic, fileName);
      }
    }

    await FileSystem.writeAsStringAsync(friendsFilePath, JSON.stringify(friends, null, 2));
    console.log("Friends info saved successfully!");
    return friends;
  } catch (error) {
    console.error("Error fetching/saving friends:", error);
    return [];
  }
};

export const getSavedFriends = async () => {
  try {
    if (Platform.OS === 'web') {
      const data = localStorage.getItem('friends');
      return data ? JSON.parse(data) : [];
    } else {
      const fileInfo = await FileSystem.getInfoAsync(friendsFilePath);
      if (!fileInfo.exists) return [];

      const jsonString = await FileSystem.readAsStringAsync(friendsFilePath);
      return JSON.parse(jsonString);
    }
  } catch (error) {
    console.error("Error reading saved friends:", error);
    return [];
  }
};

// --------- Emit Message ---------- //


export const uploadChatToServer = async (otherUserId) => {
  try {
    const currentUser = await loadUserInfo();
    if (!currentUser || !currentUser._id) {
      console.error("User not found");
      return;
    }

    const filePath = await getSharedChatFilePath(otherUserId);
    const fileUri = filePath;

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      console.error("Chat file does not exist");
      return;
    }

    const fileName = fileUri.split("/").pop();
    const mimeType = mime.lookup(fileUri) || "application/json";

    const formData = new FormData();
    formData.append("user1", currentUser._id);
    formData.append("user2", otherUserId);
    formData.append("chatFile", {
      uri: Platform.OS === "android" ? fileUri : fileUri.replace("file://", ""),
      type: mimeType,
      name: fileName,
    });

    const response = await fetch(CHAT_UPLOAD_URL, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const data = await response.json();
    if (response.ok) {
      console.log("Chat uploaded successfully:", data.message);
      return data.data;
    } else {
      console.error("Upload failed:", data.message);
    }
  } catch (error) {
    console.error("Error uploading chat:", error);
  }
};

// --------------------------------------------------------------------------

export const setReceivedMessage = async (data) => {
  try {
    const { message, senderId, timestamp, type } = data;
    const currentUser = await loadUserInfo();

    if (!currentUser || !currentUser._id) {
      console.error("User not found");
      return;
    }

    const fileUri = await getSharedChatFilePath(senderId);

    const dataFromFile = await readJsonFile(fileUri);

    const newMessage = {
      id: Date.now().toString(),
      senderId: senderId,
      receiverId: currentUser._id,
      text: message,
      timestamp: timestamp || new Date().toISOString(),
      type: type
    };

    // Insert in correct timestamp order
    insertMessageInOrder(dataFromFile.messages, newMessage);

    await writeJsonFile(fileUri, dataFromFile);
    await updateFriendsFile(senderId, message, newMessage.timestamp, isCurrentChatOpen);
    console.log("Message saved successfully:", newMessage);

    return newMessage;

  } catch (error) {
    console.error("Error uploading chat:", error);
  }
};

function insertMessageInOrder(messages, newMessage) {
  let left = 0;
  let right = messages.length;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (new Date(messages[mid].timestamp) < new Date(newMessage.timestamp)) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  messages.splice(left, 0, newMessage);
}

const updateFriendsFile = async (senderId, message, timestamp, isCurrentChatOpen) => {

  let friends = [];
  const fileInfo = await FileSystem.getInfoAsync(friendsFilePath);

  if (fileInfo.exists) {
    const data = await FileSystem.readAsStringAsync(friendsFilePath);
    friends = JSON.parse(data);
  }

  const index = friends.findIndex(f => f.userId === senderId);
  const updatedTime = timestamp || new Date().toISOString();

  if (index !== -1) {
    const friend = friends[index];
    friend.lastMessage = message;
    friend.timestamp = updatedTime;

    if (!isCurrentChatOpen) {
      friend.unreadCount = (friend.unreadCount || 0) + 1;
    }

    friends.splice(index, 1); // remove old
    // Will be re-inserted below
  } else {
    friends.push({
      userId: senderId,
      lastMessage: message,
      timestamp: updatedTime,
      unreadCount: isCurrentChatOpen ? 0 : 1
    });
  }

  // Insert sorted by timestamp (descending)
  const newFriendEntry = {
    userId: senderId,
    lastMessage: message,
    timestamp: updatedTime,
    unreadCount: isCurrentChatOpen ? 0 : 1
  };

  let inserted = false;
  for (let i = 0; i < friends.length; i++) {
    if (new Date(friends[i].timestamp) < new Date(updatedTime)) {
      friends.splice(i, 0, newFriendEntry);
      inserted = true;
      break;
    }
  }
  if (!inserted) friends.push(newFriendEntry);

  await FileSystem.writeAsStringAsync(friendsFilePath, JSON.stringify(friends, null, 2));
};
// --------------------------------------------------------------------------

export const loadChatHistory = async (id) => {
  try {
    const chatDirectory = `${FileSystem.documentDirectory}chat/`;

    // Make sure the directory exists
    const dirInfo = await FileSystem.getInfoAsync(chatDirectory);
    if (!dirInfo.exists) {
      console.warn("Chat folder does not exist, creating new one.");
      await FileSystem.makeDirectoryAsync(chatDirectory, { intermediates: true });
    }

    const fileUri = `${chatDirectory}chat_${id}.json`;
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      console.warn("Chat file does not exist, creating new one.");
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify([])); // Initialize as empty array
    }

    const dataFromFile = await readJsonFile(fileUri);
    return dataFromFile || [];
  } catch (error) {
    console.error("Error loading chat history:", error);
    return [];
  }
};

export const saveChatMessage = async (friendId, message) => {
  try {
    const chatDirectory = `${FileSystem.documentDirectory}chat/`;
    const path = `${chatDirectory}chat_${id}.json`;
    let existingChats = [];
    const fileInfo = await FileSystem.getInfoAsync(path);
    if (!fileInfo.exists) {
      await FileSystem.writeAsStringAsync(path, JSON.stringify([])); // Initialize as empty array
    }
    const content = await FileSystem.readAsStringAsync(path);
    existingChats = JSON.parse(content || '[]');
    existingChats.push(message);
    await FileSystem.writeAsStringAsync(path, JSON.stringify(existingChats));
  } catch (error) {
    console.error("Error saving message:", error);
  }
};



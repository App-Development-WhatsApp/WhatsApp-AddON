import * as FileSystem from "expo-file-system";
import io from "socket.io-client";

const API_URL = "http://192.168.30.93:5000/api/v1/users";
const SOCKET_SERVER_URL = "http://192.168.30.93:5000";

// File paths
export const userFilePath = FileSystem.documentDirectory + "userInfo.json";
export const friendsFilePath = FileSystem.documentDirectory + "friendsInfo.json";

// Socket instance
export const socket = io(SOCKET_SERVER_URL, {
  transports: ["websocket"],
  jsonp: false,
});

// Join room once connected
export const initSocketConnection = async () => {
  const user = await loadUserInfo();
  if (user && user._id) {
    socket.emit("join", user._id);
    console.log("Joined room for user:", user._id);
  }
};

// Socket listener
socket.on("receiveMessage", async (message) => {
  const currentUser = await loadUserInfo();
  const otherUserId =
    message.senderId === currentUser._id ? message.receiverId : message.senderId;

  console.log("receiveMessage - currentUser:", currentUser._id);
  console.log("receiveMessage - saving message with otherUserId:", otherUserId);

  await addMessage(otherUserId, message); // ✅ now saves in correct shared file
});


// --------- File Utilities ---------- //

export const getSharedChatFilePath = async (otherUserId) => {
  try {
    const currentUser = await loadUserInfo();
    if (!currentUser || !currentUser._id) {
      console.error("User info not found or invalid.");
      return null;
    }

    const sortedIds = [currentUser._id, otherUserId].sort();
    const fileName = `${sortedIds[0]}-${sortedIds[1]}.json`;
    const filePath = FileSystem.documentDirectory + fileName;

    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify({ messages: [] }));
    }

    return filePath;
  } catch (error) {
    console.error("Error creating chat file path:", error);
    return null;
  }
};

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

export const clearChatFile = async (otherUserId) => {
  try {
    const filePath = await getSharedChatFilePath(otherUserId);
    if (filePath) {
      await writeJsonFile(filePath, { messages: [] });
      console.log("Chat file cleared!");
    }
  } catch (error) {
    console.error("Error clearing chat file:", error);
  }
};


// --------- Message Handlers ---------- //

export const addMessage = async (otherUserId, message) => {
  const filePath = await getSharedChatFilePath(otherUserId);
  if (!filePath) return null;

  const data = await readJsonFile(filePath);

  const newMessage = {
    id: Date.now().toString(),
    senderId: message.senderId,
    receiverId: message.receiverId,
    text: message.text,
    timestamp: message.timestamp || new Date().toISOString(),
  };

  data.messages.push(newMessage);
  await writeJsonFile(filePath, data);
  return newMessage;
};

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
    const fileInfo = await FileSystem.getInfoAsync(friendsFilePath);
    if (!fileInfo.exists) return [];

    const jsonString = await FileSystem.readAsStringAsync(friendsFilePath);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error reading saved friends:", error);
    return [];
  }
};

// --------- Emit Message ---------- //

export const sendMessageSocket = async (receiverId, messageText) => {
  const currentUser = await loadUserInfo();
  if (!currentUser || !currentUser._id) return;

  const message = {
    senderId: currentUser._id,
    receiverId,
    text: messageText,
    timestamp: new Date().toISOString(),
  };

  socket.emit("sendMessage", message); // Send via socket
  await addMessage(receiverId, message); // Also save locally
};


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
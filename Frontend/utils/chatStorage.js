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

 export const loadChatsOffline = async () => {
    console.log("doing well")
    try {
      const data = await FileSystem.readAsStringAsync(chatsFilePath);
      console.log("loda fatatt",data)
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading friends from local storage:", error);
      return [];
    }
  };
  























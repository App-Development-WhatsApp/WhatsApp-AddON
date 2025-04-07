import axios from "axios";
import * as FileSystem from "expo-file-system";
import { saveUserInfo } from "../utils/chatStorage";
import { userFilePath, friendsFilePath } from "../utils/chatStorage";
<<<<<<< HEAD
=======
export const BACKEND_URL="http://192.168.30.25:5000"
export const API_URL = `${BACKEND_URL}/api/v1/users`; // Replace with your backend URL
>>>>>>> 9c5f09fa28009fb38090c4efa25b7fb835508546

export const API_URL = "http://192.168.30.93:5000/api/v1/users"; // Your backend URL

// -------------------- LOGIN --------------------
export const login = async (formData) => {
<<<<<<< HEAD
  try {
    const response = await axios.post(`${API_URL}/login`, formData, {
      headers: { "Content-Type": "application/json" },
    });
=======
    try {
        console.log(formData)
        const response = await axios.post(`${API_URL}/login`, formData, {
            headers: { 'Content-Type': 'application/json' }
        });
>>>>>>> 9c5f09fa28009fb38090c4efa25b7fb835508546

    if (response.data.success && response.data.data?.user) {
      await saveUserInfo(response.data.data.user); // Save user to local storage
      return { success: true, user: response.data.data.user };
    } else {
      return {
        success: false,
        message: response.data.message || "Login failed",
      };
    }
  } catch (error) {
    return handleError(error);
  }
};

// -------------------- GET ALL USERS --------------------
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/getAllUsers`);
    return {
      success: true,
      users: response.data.data || [],
    };
  } catch (error) {
    return handleError(error);
  }
};

// -------------------- OPTIONAL: GET USER PROFILE --------------------
// If you use getProfile somewhere in your app
export const getProfile = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/profile/${userId}`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return handleError(error);
  }
};

// -------------------- LOGOUT --------------------
export const logout = async () => {
  try {
    const response = await axios.post(`${API_URL}/logout`);

    if (response.data.success) {
      // Delete user and friends JSON files locally
      await FileSystem.deleteAsync(userFilePath, { idempotent: true });
      await FileSystem.deleteAsync(friendsFilePath, { idempotent: true });
      console.log("User logged out and local data deleted.");
      return { success: true, message: "Logged out successfully" };
    } else {
      return { success: false, message: "Logout failed from API" };
    }
  } catch (error) {
    return {
      success: false,
      message: "Error logging out",
      error: error.message,
    };
  }
};

// -------------------- ERROR HANDLER --------------------
const handleError = (error) => {
  if (error.response) {
    return {
      success: false,
      message: error.response.data?.message || "Server error occurred.",
      status: error.response.status,
      errors: error.response.data?.errors || [],
    };
  } else if (error.request) {
    return {
      success: false,
      message: "No response from the server. Please check your internet connection.",
      status: null,
    };
  } else {
    return {
      success: false,
      message: `Request error: ${error.message}`,
      status: null,
    };
  }
};

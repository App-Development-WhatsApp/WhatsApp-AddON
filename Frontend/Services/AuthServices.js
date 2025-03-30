import axios from "axios";
import * as FileSystem from "expo-file-system";

const API_URL = "http://10.10.15.92:5000/api/v1/users"; // Replace with your backend URL
const userFilePath = FileSystem.documentDirectory + "userInfo.json"; // Local storage file

// Save user info to local JSON file
const saveUserInfo = async (user) => {
    try {
        await FileSystem.writeAsStringAsync(userFilePath, JSON.stringify(user));
        console.log("User info saved!");
    } catch (error) {
        console.error("Error saving user info:", error);
    }
};

// Load user info from local JSON file
export const getProfile = async () => {
    try {
        const fileInfo = await FileSystem.getInfoAsync(userFilePath);
        if (!fileInfo.exists) return { success: false, message: "Unauthorized: No user found" };

        const data = await FileSystem.readAsStringAsync(userFilePath);
        return { success: true, user: JSON.parse(data) };
    } catch (error) {
        return { success: false, message: "Error reading user data" };
    }
};

// Login function
export const login = async (formData) => {
    try {
        const response = await axios.post(`${API_URL}/login`, formData, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.data.success) {
            // Save user info locally
            await saveUserInfo({ ...response.data.data, token: response.data.token });
            return { success: true, data: response.data.data };
        } else {
            return { success: false, message: response.data.message || "Unexpected error occurred" };
        }
    } catch (error) {
        return handleError(error);
    }
};

// Get all users
export const getAllUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/getAllUsers`);
        return { success: true, users: response.data.data };
    } catch (error) {
        return handleError(error);
    }
};

// Get all chatted users (friends)
export const getAllChattedUsers = async () => {
    try {
        const userProfile = await getProfile();
        if (!userProfile.success || !userProfile.user._id) {
            return { success: false, message: "User not found" };
        }

        const response = await axios.get(`${API_URL}/getAllChattedUsers`, {
            params: { userId: userProfile.user._id }
        });

        return { success: true, users: response.data.data.friends };
    } catch (error) {
        return handleError(error);
    }
};

// Logout function (Deletes local user data)
export const logout = async () => {
    try {
        await FileSystem.deleteAsync(userFilePath);
        console.log("User logged out, local data deleted.");
        return { success: true, message: "Logged out successfully" };
    } catch (error) {
        return { success: false, message: "Error logging out" };
    }
};

// Helper function to handle errors
const handleError = (error) => {
    if (error.response) {
        return {
            success: false,
            message: error.response.data?.message || "Server error occurred.",
            status: error.response.status,
            errors: error.response.data?.errors || []
        };
    } else if (error.request) {
        return {
            success: false,
            message: "No response from the server. Please check your internet connection.",
            status: null
        };
    } else {
        return {
            success: false,
            message: `Request error: ${error.message}`,
            status: null
        };
    }
};

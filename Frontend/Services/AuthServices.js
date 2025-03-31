import axios from "axios";
import * as FileSystem from "expo-file-system";
import { saveUserInfo } from "../utils/chatStorage";
import { userFilePath, friendsFilePath } from "../utils/chatStorage";
export const API_URL = "http://10.10.15.73:5000/api/v1/users"; // Replace with your backend URL



// Login function
export const login = async (formData) => {
    try {
        const response = await axios.post(`${API_URL}/login`, formData, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.data.success) {
            // Save user info locally
            await saveUserInfo(response.data.data.user);
            return { success: true };
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


// Logout function (Deletes local user data)
export const logout = async () => {
    try {
        // Call the logout API first
        const response = await axios.post(`${API_URL}/logout`);

        if (response.data.success) {
            // Delete the local JSON file if logout is successful
            await FileSystem.deleteAsync(userFilePath);
            await FileSystem.deleteAsync(friendsFilePath);
            console.log("User logged out, local data deleted.");
            return { success: true, message: "Logged out successfully" };
        } else {
            return { success: false, message: "Logout failed from API" };
        }
    } catch (error) {
        return { success: false, message: "Error logging out", error: error.message };
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

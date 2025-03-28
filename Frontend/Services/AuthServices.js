import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const API_URL = "http://192.168.137.1:5000/api/v1/users"; // Replace with your backend URL


export const login = async (formData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, formData, {
            headers: { 'Content-Type': 'application/json' }
        });


        if (response.data.success) {
            return { success: true, data: response.data.data };
        } else {
            return { success: false, message: response.data.message || "Unexpected error occurred" };
        }
    } catch (error) {
        // console.error("Login Failed:", error);

        if (error.response) {
            return {
                success: false,
                message: error.response.data?.message || "An error occurred on the server.",
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
    }
};

export const getProfile = async () => {
    try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) return { success: false, message: "Unauthorized: No token found" };
        console.log(token)
        const response = await axios.get(`${API_URL}/current-user`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log(response.data.data)

        return { success: true, user: response.data.data };
    } catch (error) {
        return { success: false, message: "Unauthorized" };
    }
};


export const getAllUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/getAllUsers`);
        // console.log(response.data.data)

        return { success: true, user: response.data.data };
    } catch (error) {
        console.log(error.message)
        return { success: false, message: error.message };
    }
};
export const getAllChattedUsers = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/getAllChattedUsers`,userId);
        console.log(response.data.data)

        return { success: true, users: response.data.data.friends };
    } catch (error) {
        console.log(error.message)
        return { success: false, message: error.message };
    }
};
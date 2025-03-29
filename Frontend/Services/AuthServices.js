import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const API_URL = "http://10.10.49.65:5000/api/v1/users"; // Replace with your backend URL


export const checkAuth = async () => {
    try {
        const response = await axios.get(`${API_URL}/auth-check`, { withCredentials: true });
        return response.data.authenticated;
    } catch (error) {
        return false;
    }
};


export const login = async (formData) => {
    try {
        // console.log("Logging in...");
        const response = await axios.post(`${API_URL}/register`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            headers: { 'Content-Type': 'application/json' }
        });

        console.log("Response:", response.data); // Log response
        return { success: true, token: response.data.token };
        // console.log("Response Data:", response.data.data);

        if (response.data.success) {
            return { success: true, data: response.data.data };
        } else {
            return { success: false, message: response.data.message || "Unexpected error occurred" };
        }
    } catch (error) {
        console.error("Login Error:", error); // Log error details
        Alert.alert("Error", error.response?.data?.message || "Login failed");
        return { success: false, message: error.response?.data?.message || "Login failed" };
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

// Get User Profile
export const getProfile = async () => {
    try {
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get(`${API_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return { success: true, user: response.data.user };
    } catch (error) {
        return { success: false, message: "Unauthorized" };
    }
};

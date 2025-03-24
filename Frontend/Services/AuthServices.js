import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const API_URL = "http://10.10.15.72:5000/api/v1/users"; // Replace with your backend URL


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
        const response = await axios.post(`${API_URL}/register`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        console.log("Response:", response.data); // Log response
        return { success: true, token: response.data.token };
    } catch (error) {
        console.error("Login Error:", error); // Log error details
        Alert.alert("Error", error.response?.data?.message || "Login failed");
        return { success: false, message: error.response?.data?.message || "Login failed" };
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

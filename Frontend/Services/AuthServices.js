import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const API_URL = "http://localhost:5000/api/v1/users"; // Replace with your backend URL


export const checkAuth = async () => {
    try {
        const response = await axios.get(`${API_URL}/auth-check`, { withCredentials: true });
        return response.data.authenticated;
    } catch (error) {
        return false;
    }
};


// Register User
export const register = async (email, password) => {
    try {
        await axios.post(`${API_URL}/register`, { email, password });
        return { success: true, message: "Registered successfully" };
    } catch (error) {
        return { success: false, message: error.response?.data?.message || "Registration failed" };
    }
};

export const login = async (username, fullName, phoneNumber, profilePic) => {
    try {
        // console.log("Sending request to:", `${API_URL}/register`);
        // console.log("Payload:", { username, fullName, phoneNumber, profilePic });

        const response = await axios.post(`${API_URL}/register`, {
            username, fullName, phoneNumber, profilePic
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

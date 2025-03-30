import React, { useState, useEffect } from "react";
import {
    View, TextInput, Button, Text, Alert, Image,
    TouchableOpacity, StyleSheet, BackHandler, ActivityIndicator
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login } from "../../Services/AuthServices";
import { loadUserInfo, saveUserInfo } from "../../utils/chatStorage";

const LoginScreen = ({ navigation }) => {
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [profilePic, setProfilePic] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const userInfo = await loadUserInfo();
            if (userInfo) {
                console.log("User found:", userInfo);
                navigation.replace("Main");
            } else {
                console.log("No user found, redirect to login.");
            }
        };

        checkAuth();

        const backAction = () => {
            BackHandler.exitApp();
            return true;
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, []);

    // Handle Profile Picture Selection
    const pickImage = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "image/*", // Allow only image files
                copyToCacheDirectory: true,
            });

            if (result.type === "cancel") {
                console.log("Image selection was canceled");
                return;
            }

            const imageUri = result.assets[0].uri;
            console.log("Selected Image URI:", imageUri);
            setProfilePic(imageUri);
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Error", "Failed to select image. Please try again.");
        }
    };

    const handleLogin = async () => {
        if (!fullName || !username || !phoneNumber) {
            Alert.alert("Error", "Please fill in all fields and select a profile picture.");
            return;
        }

        setLoading(true); // Show loading indicator

        const formData = new FormData();
        formData.append("fullName", fullName);
        formData.append("username", username);
        formData.append("phoneNumber", phoneNumber);

        if (profilePic) {
            const filename = profilePic.split("/").pop();
            const match = /\.(\w+)$/.exec(filename);
            const fileType = match ? `image/${match[1]}` : "image";

            formData.append("profilePic", {
                uri: profilePic,
                name: filename,
                type: fileType,
            });
        }
        console.log("Logging.. start")
        const result = await login(formData);

        setLoading(false); // Hide loading indicator

        if (result.success && result.data.user) {
            saveUserInfo(result.data.user);
            Alert.alert("Success", "Logged in successfully!");
            navigation.replace("Main");
        } else {
            Alert.alert("Login Failed", result.message || "An error occurred. Please try again.");
        }
    };

    return (
        <View style={styles.container}>
            {/* Profile Picture Selection */}
            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                {profilePic ? (
                    <Image source={{ uri: profilePic }} style={styles.profileImage} />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Text>Select Photo</Text>
                    </View>
                )}
            </TouchableOpacity>

            <TextInput value={fullName} onChangeText={setFullName} placeholder="Full Name" style={styles.input} />
            <TextInput value={username} onChangeText={setUsername} placeholder="Username" style={styles.input} />
            <TextInput value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" placeholder="Phone Number" style={styles.input} />

            {loading ? (
                <ActivityIndicator size="large" color="#007bff" />
            ) : (
                <Button title="Login" onPress={handleLogin} color="#007bff" />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8f9fa",
    },
    imagePicker: {
        alignItems: "center",
        marginBottom: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    placeholderImage: {
        width: 100,
        height: 100,
        backgroundColor: "#ccc",
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    input: {
        width: "100%",
        borderBottomWidth: 1,
        borderColor: "#ccc",
        marginBottom: 15,
        padding: 10,
        borderRadius: 5,
        backgroundColor: "#fff",
    },
});

export default LoginScreen;
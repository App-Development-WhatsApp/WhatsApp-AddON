import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text, Alert, Image, TouchableOpacity, StyleSheet, BackHandler } from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from "../../Services/AuthServices";

const LoginScreen = ({ navigation }) => {
    const [fullName, setFullName] = useState("");
    const [username, setUsername] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [profilePic, setProfilePic] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('accessToken');
            if (token) {
                navigation.replace("Chat");
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
                type: 'image/*', // Allow only image files
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                console.log('Image selection was canceled');
                return;
            }

            setProfilePic(result.assets[0].uri); // Fix: Set the profile picture state correctly
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };

    const handleLogin = async () => {
        // Alert.alert("Working");
        const result = await login({ fullName, username, phoneNumber, profilePic });
        
        // if (result.success) {
        //     await AsyncStorage.setItem('accessToken', result.token);
        //     Alert.alert("Success", "Logged in successfully");
        //     navigation.replace("Chat");
        // } else {
        //     Alert.alert("Error", result.message);
        // }
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

            <Button title="Login" onPress={handleLogin} color="#007bff" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
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
        width: '100%',
        borderBottomWidth: 1,
        borderColor: '#ccc',
        marginBottom: 15,
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
});

export default LoginScreen;
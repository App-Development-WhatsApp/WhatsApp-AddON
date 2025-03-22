import React, { useEffect } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { checkAuth } from "./AuthServices";

const AuthCheckScreen = ({ navigation }) => {
    useEffect(() => {
        const verifyAuth = async () => {
            const isAuthenticated = await checkAuth();
            if (isAuthenticated) {
                navigation.replace("Chat");
            } else {
                navigation.replace("Login");
            }
        };
        verifyAuth();
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" />
        </View>
    );
};

export default AuthCheckScreen;

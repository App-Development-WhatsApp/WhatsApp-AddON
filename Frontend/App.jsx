import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Import Screens
import MyTabs from "./components/Tabs";
import SettingsScreen from "./components/setting/SettingsScreen";
import StatusScreen from "./components/setting/StatusScreen";
import VideoPlayer from "./components/setting/VideoPlayer";
import History from "./components/Calls/History";
import Chatting from "./components/Chats/Chatting";
import AccountScreen from "./components/setting/AccountScreen";
import PrivacyScreen from "./components/setting/PrivacyScreen";
import AvatarScreen from "./components/setting/AvatarScreen";
import ListScreen from "./components/setting/ListScreen";
import ChatScreen from "./components/setting/ChatScreen";
import NotificationScreen from "./components/setting/Notifications";
import StorageAndDataScreen from "./components/setting/StorageAndData";
import AppLanguageScreen from "./components/setting/AppLanguage";
import HelpScreen from "./components/setting/HelpScreen";
import InviteFriendScreen from "./components/setting/InviteFriendScreen";
import AppUpdateScreen from "./components/setting/AppUpdateScreen";
import LoginScreen from "./components/auth/Login";
import StatusViewer from "./components/Updates/StatusViewer";

const Stack = createStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("English");

  useEffect(() => {
    // Load saved language on app start
    const loadLanguage = async () => {
      const storedLang = await AsyncStorage.getItem("appLanguage");
      if (storedLang) {
        setLanguage(storedLang);
      }
      setLoading(false);
    };
    loadLanguage();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // <Stack.Screen name="Login" component={LoginScreen} />
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MyTabs} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Status" component={StatusScreen} />
        <Stack.Screen name="VideoPlayer" component={VideoPlayer} />
        <Stack.Screen name="History" component={History} />
        <Stack.Screen name="Chatting" component={Chatting} />
        <Stack.Screen name="Account" component={AccountScreen} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
        <Stack.Screen name="Avatar" component={AvatarScreen} />
        <Stack.Screen name="List" component={ListScreen} />
        <Stack.Screen name="ChatSetting" component={ChatScreen} />
        <Stack.Screen name="Notification" component={NotificationScreen} />
        <Stack.Screen name="Storage" component={StorageAndDataScreen} />
        <Stack.Screen name="AppLanguage" component={AppLanguageScreen} />
        <Stack.Screen name="help" component={HelpScreen} />
        <Stack.Screen name="Invite" component={InviteFriendScreen} />
        <Stack.Screen name="AppUpdate" component={AppUpdateScreen} />
        <Stack.Screen name="StatusViewer" component={StatusViewer} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

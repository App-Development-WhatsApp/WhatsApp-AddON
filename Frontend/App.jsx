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
import Contacts from "./components/AllContacts/Contacts";
import UploadStatusScreen from "./components/Updates/UploadStatusScreen";
import UploadImageStatus from "./components/Updates/StatusApply.jsx/UploadImageStatus";
import VideoEditing from "./components/setting/VideoEditing";
import { GestureHandlerRootView } from "react-native-gesture-handler";
const Stack = createStackNavigator();
import { SocketProvider } from "./context/SocketContext";
import OneTimeViewer from "./components/Chats/OneTimeView";

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

  return (
    <SocketProvider>
      <NavigationContainer>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={MyTabs} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Status" component={StatusScreen} />
            <Stack.Screen name="VideoPlayer" component={VideoPlayer} />
            <Stack.Screen name="History" component={History} />
            <Stack.Screen name="Chatting" component={Chatting} />
            <Stack.Screen name="Contacts" component={Contacts} />
            <Stack.Screen name="Account" component={AccountScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
            <Stack.Screen name="UploadStatus" component={UploadStatusScreen} />
            {/* <Stack.Screen name="OneTimeViewer" component={OneTimeViewer} /> */}
            <Stack.Screen name="UploadImageStatus" component={UploadImageStatus} options={{ title: "Edit Status" }} />
            <Stack.Screen name="Avatar" component={AvatarScreen} />
            <Stack.Screen name="List" component={ListScreen} />
            <Stack.Screen name="ChatSetting" component={ChatScreen} />
            <Stack.Screen name="Notification" component={NotificationScreen} />
            <Stack.Screen name="Storage" component={StorageAndDataScreen} />
            <Stack.Screen name="AppLanguage" component={AppLanguageScreen} />
            <Stack.Screen name="help" component={HelpScreen} />
            <Stack.Screen name="Invite" component={InviteFriendScreen} />
            <Stack.Screen name="Video" component={VideoEditing} />
            <Stack.Screen name="AppUpdate" component={AppUpdateScreen} />
          </Stack.Navigator>
        </GestureHandlerRootView>
      </NavigationContainer>
    </SocketProvider>
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

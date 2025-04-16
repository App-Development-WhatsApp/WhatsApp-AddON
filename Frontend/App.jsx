import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { enableScreens } from 'react-native-screens';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';

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
import AudioScreen from "./components/Calls/AudioScreen";
import IncomingCallBanner from "./components/banners/NotifyCallingBanner";
import WhatsAppLoading from "./components/WhatsAppLoading";
import { initDatabase } from "./database/AllDatabase";
import CallScreen from "./components/Calls/callScreen";
import CommunityFlow from "./components/Communities/CreateCommunity";
import Communities from "./components/Communities/Communities";
import CommunityScreen from "./components/Communities/CommunityScreen";
import CreateGroupScreen from "./components/AllContacts/CreateGroup";
export default function App() {
  const [loading, setLoading] = useState(false);
  enableScreens();
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        await initDatabase();
      } catch (error) {
        console.error("❌ Failed to initialize DB", error);
      }
    };

    initialize();
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <WhatsAppLoading />
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
            <Stack.Screen
              name="UploadImageStatus"
              component={UploadImageStatus}
              options={{ title: "Edit Status" }}
            />
            <Stack.Screen name="Avatar" component={AvatarScreen} />
            <Stack.Screen name="List" component={ListScreen} />
            <Stack.Screen name="ChatSetting" component={ChatScreen} />
            <Stack.Screen name="Notification" component={NotificationScreen} />
            <Stack.Screen name="Storage" component={StorageAndDataScreen} />
            <Stack.Screen name="AppLanguage" component={AppLanguageScreen} />
            <Stack.Screen name="help" component={HelpScreen} />
            <Stack.Screen name="AudioScreen" component={AudioScreen} />
            <Stack.Screen name="Invite" component={InviteFriendScreen} />
            <Stack.Screen name="Video" component={VideoEditing} />
            <Stack.Screen name="AppUpdate" component={AppUpdateScreen} />
            <Stack.Screen name="CreateCommunity" component={CommunityFlow} />
            <Stack.Screen name="Communities" component={Communities} />
            <Stack.Screen name="CommunityScreen" component={CommunityScreen} />
            <Stack.Screen name="CreateGroup" component={CreateGroupScreen}/>
            <Stack.Screen name="callScreen" component={CallScreen} />
          </Stack.Navigator>
          <IncomingCallBanner />
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

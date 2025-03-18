import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, Text, View } from 'react-native';
import MyTabs from './components/Tabs';
import SettingsScreen from './components/setting/SettingsScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import StatusScreen from './components/setting/StatusScreen';
import VideoPlayer from './components/setting/VideoPlayer';
import History from './components/Calls/History';
import Chatting from './components/Chats/Chatting';

const Stack = createStackNavigator();


export default function App() {
  return (
    <NavigationContainer>
      {/* <MyTabs /> */}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MyTabs} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Status" component={StatusScreen} />
        <Stack.Screen name="VideoPlayer" component={VideoPlayer} />
        <Stack.Screen name="History" component={History} />
        <Stack.Screen name="Chatting" component={Chatting} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

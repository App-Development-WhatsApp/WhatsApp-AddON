import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import Chat from './Chats/Chat';
import Updates from './Updates/Updates';
import Communities from './Communities/Communities';
import Calls from './Calls/Calls';

import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createMaterialTopTabNavigator();

export default function MyTabs() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(true);

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const token = await AsyncStorage.getItem('accessToken'); // Get token from storage
  //     if (!token) {
  //       navigation.replace('Login'); // Redirect if no token
  //     } else {
  //       setAuthenticated(true); // Allow access to tabs
  //     }
  //     setLoading(false);
  //   };

  //   checkAuth();
  // }, []);

  // if (loading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <ActivityIndicator size="large" color="#00ff00" />
  //     </View>
  //   );
  // }

  return authenticated ? (
    <Tab.Navigator
      initialRouteName="Chats"
      tabBarPosition="bottom"
      screenOptions={{
        tabBarLabelStyle: styles.title,
        tabBarStyle: styles.tab,
      }}
    >
      <Tab.Screen
        name="Chats"
        component={Chat}
        options={{ 
            tabBarLabel: 'Chats',
            tabBarIndicator: () => (
                <View style={{left:22, top: 8, height: 33, width: 60, backgroundColor: 'rgba(95, 252, 123,0.2)', borderRadius: 20}} />
            ),
            tabBarIcon: () => (
                <MaterialCommunityIcons name="message-text-outline" size={24} color="white" />
            ),
        }}
      />
      <Tab.Screen
        name="Updates"
        component={Updates}
        options={{ 
            tabBarLabel: 'Updates',
            tabBarIndicator: () => (
                <View style={{left:125, top: 8, height: 33, width: 60, backgroundColor: 'rgba(95, 252, 123,0.2)', borderRadius: 20}} />
            ),
            tabBarIcon: () => (
                <MaterialIcons name="downloading" size={24} color="white" />
            ),
        }}
      />
      <Tab.Screen
        name="Communities"
        component={Communities}
        options={{ 
            tabBarLabel: 'Communities',
            tabBarIndicator: () => (
                <View style={{left:227, top: 8, height: 33, width: 60, backgroundColor: 'rgba(95, 252, 123,0.2)', borderRadius: 20}} />
            ),
            tabBarIcon: () => (
                <MaterialCommunityIcons name="account-group" size={24} color="white" />
            ),
        }}
      />
      <Tab.Screen
        name="Calls"
        component={Calls}
        options={{ 
            tabBarLabel: 'Call',
            tabBarIndicator: () => (
                <View style={{left:328, top: 8, height: 33, width: 60, backgroundColor: 'rgba(95, 252, 123,0.2)', borderRadius: 20}} />
            ),
            tabBarIcon: () => (
                <Ionicons name="call-outline" size={24} color="white" />
            ),
        }}
      />
    </Tab.Navigator>
  ) : null;
}

const styles = {
  tab: {
    backgroundColor: '#011513',
    height: 70,
  },
  title: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
};

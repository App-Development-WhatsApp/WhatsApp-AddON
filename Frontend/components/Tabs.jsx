import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Animated } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import Chat from './Chats/Chat';
import Updates from './Updates/Updates';
import Communities from './Communities/Communities';
import Calls from './Calls/Calls';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { loadUserInfo } from '../utils/chatStorage';

const Tab = createMaterialTopTabNavigator();

export default function MyTabs() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    const checkAuth = async () => {
      const userInfo = await loadUserInfo();
      if (userInfo) {
        setAuthenticated(true);
      } else {
        navigation.replace("Login");
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  return authenticated ? (
    <Tab.Navigator
      initialRouteName="Chats"
      tabBarPosition="bottom"
      screenOptions={({ route }) => ({
        tabBarLabelStyle: styles.title,
        tabBarStyle: styles.tab,
        tabBarIcon: ({ focused }) => {
          let iconName;
          let IconComponent;

          switch (route.name) {
            case 'Chats':
              IconComponent = MaterialCommunityIcons;
              iconName = 'message-text-outline';
              break;
            case 'Updates':
              IconComponent = MaterialIcons;
              iconName = 'downloading';
              break;
            case 'Community':
              IconComponent = MaterialCommunityIcons;
              iconName = 'account-group';
              break;
            case 'Calls':
              IconComponent = Ionicons;
              iconName = 'call-outline';
              break;
          }

          return (
            <View style={{ alignItems: 'center' }}>
              <IconComponent name={iconName} size={24} color={focused ? 'white' : '#888'} />
              {route.name === "Updates" && focused && (
                <View style={styles.greenDot} />
              )}
            </View>
          );
        },
        tabBarIndicatorStyle: {
          position: 'absolute',
          bottom: 48,
          height: 35,
          width: 60,
          left: '5.2%',
          backgroundColor: 'rgba(95, 252, 123, 0.2)',
          borderRadius: 20,
        },        
        tabBarPressOpacity: 1,
      })}
    >
      <Tab.Screen key={'Chats'} name="Chats" component={Chat} />
      <Tab.Screen key={'Updates'} name="Updates" component={Updates} />
      <Tab.Screen key={'Community'} name="Community" component={Communities} />
      <Tab.Screen key={'Calls'} name="Calls" component={Calls} />
    </Tab.Navigator>
  ) : null;
}

const styles = {
  tab: {
    backgroundColor: '#121212',
    height: 90,
    elevation: 0, // Removes shadow on Android
    shadowOpacity: 0, // Removes shadow on iOS
  },
  title: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  greenDot: {
    position: 'absolute',
    top: 0,
    right: -6,
    width: 8,
    height: 8,
    backgroundColor: 'rgb(95, 252, 123)',
    borderRadius: 4,
  },
};

import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import { useNetInfo } from "@react-native-community/netinfo";
import { MaterialCommunityIcons, Feather, Entypo } from '@expo/vector-icons';
import { getProfile } from '../../Services/AuthServices';
<<<<<<< HEAD
import Menu from '../Menu/Menu';

const friendsFilePath = FileSystem.documentDirectory + "friendsInfo.json";
=======
import { fetchAndSaveFriends, friendsFilePath, loadUserInfo } from '../../utils/chatStorage';
>>>>>>> 0758f6893c3e78697e2391bc284ed12ed4555fc8

export default function Chat() {
  const netInfo = useNetInfo();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [friends, setFriends] = useState([]);
  useEffect(() => {
    const loadUserAndFriends = async () => {
      try {
<<<<<<< HEAD
        const fileExists = await FileSystem.getInfoAsync(friendsFilePath);
        if (fileExists.exists) {
          const storedData = await FileSystem.readAsStringAsync(friendsFilePath);
          setFriends(JSON.parse(storedData) || []);
        }
=======
        // Load user info
        const userInfo = await loadUserInfo();
        setUserData(userInfo);

        // Check network status
        const netInfo = await NetInfo.fetch();
>>>>>>> 0758f6893c3e78697e2391bc284ed12ed4555fc8

        if (netInfo.isConnected) {
          // Online: Fetch fresh data and save it
          const updatedFriends = await fetchAndSaveFriends(userInfo?.id);
          setFriends(updatedFriends);
        } else {
          // Offline: Load saved friends from local storage
          const savedFriends = await getSavedFriends();
          setFriends(savedFriends);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserAndFriends();
  }, []); // Runs once when the component mounts

  const handleChatPress = async (id, name, image) => {
    navigation.navigate('Chatting', { userId: id, name, image });

    try {
      let storedFriends = [];
      const fileExists = await FileSystem.getInfoAsync(friendsFilePath);
      if (fileExists.exists) {
        const fileData = await FileSystem.readAsStringAsync(friendsFilePath);
        storedFriends = JSON.parse(fileData) || [];
      }

      if (!storedFriends.some(friend => friend.userId === id)) {
        const newUser = { userId: id, userName: name, image, message: "Say hi!", time: "Now" };
        storedFriends.push(newUser);

        await FileSystem.writeAsStringAsync(friendsFilePath, JSON.stringify(storedFriends, null, 2));
        setFriends(storedFriends);
      }
    } catch (error) {
      console.error("Error updating friends list:", error);
    }
  };

  const Item = ({ userId, userName, image, message, time }) => {
    const validImage = image ? { uri: image } : require('../../assets/images/blank.jpeg');

    return (
      <TouchableOpacity activeOpacity={0.6} onPress={() => handleChatPress(userId, userName, image)}>
        <View style={styles.userCtn}>
          <Image style={styles.image} source={validImage} borderRadius={50} resizeMode='cover' />

          <View style={styles.msgCtn}>
            <View style={styles.userDetail}>
              <Text style={styles.name}>{userName} </Text>
              <Text style={styles.message}>{message}</Text>
            </View>
            <Text style={styles.time}>{time}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#121212" barStyle="light-content" />

      {/* Header Section */}
      <View style={styles.headerCtn}>
        <Text style={styles.logo}>WhatsApp</Text>
        <View style={styles.iconCtn}>
          <Feather name="camera" size={24} color="white" />
          <Menu />
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchCtn}>
        <Feather name="search" size={20} color="#b4c7c5" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInp}
          placeholder='Ask Meta AI or Search'
          placeholderTextColor='#b4c7c5'
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ff00" />
          <Text style={styles.loadingText}>Fetching data...</Text>
        </View>
      ) : (
        <FlatList
          data={friends}
          renderItem={({ item }) => <Item {...item} />}
          keyExtractor={(item) => String(item.userId)}
          ListEmptyComponent={<Text style={styles.emptyText}>No recent chats</Text>}
        />
      )}

      {/* Floating Action Button */}
      <View style={styles.newUpdate}>
        <TouchableOpacity style={styles.msg} onPress={() => navigation.navigate('Contacts')}>
          <MaterialCommunityIcons name="message-plus" size={28} color="#011513" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#121212',
    height: '100%',
  },
  headerCtn: {
    marginTop: StatusBar.currentHeight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    color: 'white',
    fontSize: 30, // Adjusted font size
    fontWeight: 'bold',
  },
  iconCtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  searchCtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202020',
    borderRadius: 40,
    paddingHorizontal: 15,
    paddingVertical: 4,
    marginTop: 10,
    marginBottom: 25,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInp: {
    flex: 1,
    fontSize: 16,
    color: '#b4c7c5',
  },
  userCtn: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
    marginBottom: 25,
  },
  msgCtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  userDetail: {
    gap: 5,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'white',
  },
  message: {
    fontSize: 14,
    color: '#cbd5c0',
  },
  time: {
    fontSize: 12,
    color: '#cbd5c0',
  },
  image: {
    width: 50,
    height: 50,
  },
  newUpdate: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
  },
  msg: {
    borderRadius: 50,
    backgroundColor: 'rgb(95, 252, 123)',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#cbd5c0',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#cbd5c0',
    fontSize: 16,
  },
});

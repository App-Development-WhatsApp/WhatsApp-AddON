import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import NetInfo from "@react-native-community/netinfo";
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import { useNetInfo } from "@react-native-community/netinfo";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Search from './Search';
import Header from './Header';
import { getProfile } from '../../Services/AuthServices';
import { fetchAndSaveFriends, friendsFilePath, loadUserInfo } from '../../utils/chatStorage';

export default function Chat() {
  const netInfo = useNetInfo();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [friends, setFriends] = useState([]);
  useEffect(() => {
    const loadUserAndFriends = async () => {
      try {
        // Load user info
        const userInfo = await loadUserInfo();
        setUserData(userInfo);

        // Check network status
        const netInfo = await NetInfo.fetch();

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

  // Navigate to chat screen and update friends list
  const handleChatPress = async (id, name, image) => {
    navigation.navigate('Chatting', { userId: id, name, image });

    // Ensure user is added to friends list
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
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ff00" />
          <Text style={styles.loadingText}>Fetching data...</Text>
        </View>
      ) : (
        <>
          <Header />
          <FlatList
            data={friends}
            renderItem={({ item }) => <Item {...item} />}
            keyExtractor={(item) => String(item.userId)}
            ListHeaderComponent={Search}
            ListEmptyComponent={<Text style={styles.emptyText}>No recent chats</Text>}
          />
        </>
      )}
      <View style={styles.newUpdate}>
        <View style={styles.pen}>
          <Image style={{ width: 30, height: 30 }} source={require('../../assets/images/ai.png')} />
        </View>
        <View style={styles.msg}>
          <TouchableOpacity onPress={() => navigation.navigate('Contacts')}>
            <MaterialCommunityIcons name="message-plus" size={28} color="#011513" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#011513',
    height: '100%'
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
    fontSize: 20,
    color: 'white',
  },
  message: {
    fontSize: 13,
    color: '#cbd5c0'
  },
  time: {
    fontSize: 13,
    color: '#cbd5c0'
  },
  image: {
    width: 55,
    height: 55,
  },
  newUpdate: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    gap: 20,
    alignItems: 'center',
  },
  pen: {
    borderRadius: 10,
    backgroundColor: '#233040',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msg: {
    borderRadius: 15,
    backgroundColor: 'rgb(95, 252, 123)',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    color: '#cbd5c0',
    fontSize: 16
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#cbd5c0',
    fontSize: 16
  }
});

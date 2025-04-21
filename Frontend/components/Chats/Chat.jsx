import React, { useEffect, useState, useContext,useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import { useNetInfo } from "@react-native-community/netinfo";
import { MaterialCommunityIcons, Feather, Entypo } from '@expo/vector-icons';
import Menu from '../Menu/Menu';
import { friendsFilePath, loadUserInfo, setReceivedMessage } from '../../utils/chatStorage';
import { loadGroups } from '../../utils/groupStorage';
import { deleteChat, deleteFriend, getUserInfoById } from '../../database/curd.js';
import localStorage from '@react-native-async-storage/async-storage';
import { getAllChatsSorted } from '../../database/curd.js';

export default function Chat() {
  const netInfo = useNetInfo();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    console.log(process.env.EXPO_PUBLIC_BACKEND_URL)
    const fetchData = async () => {
      try {
        const user = await loadUserInfo();
        if (user) setUserData(user);

        const sortedChats = await getAllChatsSorted();
        // console.log(sortedChats, "sortedChats")
        setFriends(sortedChats);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [netInfo.isConnected]);
  

  const handleDelete = useCallback((id) => {
    setFriends(prev => prev.filter(friend => friend.id !== id));
  }, []);

  const Item = React.memo(({ id, profilePic, name, unseenCount, lastMessage, lastUpdated, isGroup, onDelete }) => {
    const lastUpdatedDate = new Date(lastUpdated);
    const formattedTime = lastUpdatedDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const validImage = profilePic
      ? { uri: profilePic }
      : require('../../assets/images/blank.jpeg');

    const handlePress = () => {
      console.log(id, "id")
      navigation.navigate('Chatting', { userId:id, name, image: profilePic, isGroup });
    };

    const handleLongPress = () => {
      Alert.alert(
        "Delete Chat",
        `Are you sure you want to delete your chat with "${name}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              const success = await deleteFriend(id);
              if (success) {
                console.log("Deleting")
                onDelete(id);  // Remove from state
              } else {
                Alert.alert("Error", "Failed to delete chat.");
              }
            }
          }
        ],
        { cancelable: true }
      );
    };

    return (
      <TouchableOpacity activeOpacity={0.6} onPress={handlePress} onLongPress={handleLongPress}>
        <View style={styles.userCtn}>
          <Image style={styles.image} source={validImage} borderRadius={50} resizeMode='cover' />
          <View style={styles.msgCtn}>
            <View style={styles.userDetail}>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.message}>{lastMessage}</Text>
            </View>
            <Text style={styles.time}>{formattedTime}</Text>
            {unseenCount > 0 && (
              <View style={styles.unseenCountCtn}>
                <Text style={styles.unseenCount}>{unseenCount}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#121212" barStyle="light-content" />
      <View style={styles.headerCtn}>
        <Text style={styles.logo}>WhatsApp</Text>
        <View style={styles.iconCtn}>
          <Feather name="camera" size={24} color="white" />
          <Menu />
        </View>
      </View>

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
        friends && friends.length > 0 ? (
          <FlatList
            data={friends}
            renderItem={({ item }) => <Item {...item} onDelete={handleDelete} />}
            keyExtractor={(item, index) => `user-${item.id || index}`}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
          />
        ) : (
          <Text style={styles.emptyText}>No friends found.</Text>
        )
      )}

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
    fontSize: 30,
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
  unseenCountCtn: {
    position: 'absolute',
    top: 0,
    right: 10,
    backgroundColor: 'green',
    borderRadius: 50,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 20
  },
  unseenCount: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
});

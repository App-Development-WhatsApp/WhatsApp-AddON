import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import loadFriendsOffline from '../../utils/loadFriendsOffline';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Users } from '../../lib/data';
import Search from './Search';
import Header from './Header';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getProfile } from '../../Services/AuthServices';
import { loadUserInfo } from '../../utils/chatStorage';
import { useNetInfo } from "@react-native-community/netinfo"; // Detect network status


export default function Chat() {
  const netInfo = useNetInfo(); // Check network status
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [friends, setFriends] = useState([]);
  useEffect(() => {

    const loadUserAndFriends = async () => {
      try {
        // Load user info
        const userInfo = await loadUserInfo();
        if (userInfo && userInfo.friends) {
          setUserData(userInfo)
          // if (netInfo.isConnected) {
          //   // Fetch from API if online
          //   const friendsData = await fetchFriendsDetails(userInfo.friends);
          //   setFriends(friendsData);
          // } else {
          // Load from local storage if offline
          const friendsData = await loadFriendsOffline(userInfo._id);
          setFriends(friendsData);
          // }
        } else {
          navigation.replace("Login");
        }
      } catch (error) {
        console.log("Error loading user data:", error);
      }
    };

    loadUserAndFriends();


    const getFriends = async () => {
      const res = await getProfile();
      console.log(res);
    }


  }, [netInfo.isConnected]);

  const Item = ({ id, name, image, message, time }) => (
    <View>
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={() => navigation.navigate('Chatting', { userId: id, name, image })}
      >
        <View style={styles.userCtn}>
          <Image style={styles.image} source={image} borderRadius={50} resizeMode='cover' />
          <View style={styles.msgCtn}>
            <View style={styles.userDetail}>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.message}>{message}</Text>
            </View>
            <Text style={styles.message}>{time}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        // Show Loading Spinner
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ff00" />
          <Text style={styles.loadingText}>Fetching profile...</Text>
        </View>
      ) : (
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <Header />
          <View style={styles.chatCtn}>
            <FlatList
              data={Users}
              renderItem={({ item }) =>
                <Item id={item.id} name={item.name} message={item.message} image={item.image} time={item.time} />
              }
              keyExtractor={item => item.id}
              horizontal={false}
              scrollEnabled={false}
              ListHeaderComponent={Search}
            />
          </View>
        </ScrollView>
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
  chatCtn: {
    marginTop: 20,
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
  }
});

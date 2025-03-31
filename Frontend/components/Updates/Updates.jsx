import React, { use, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import { Feather, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import Status from './Status';
import Channels from './Channel';
import FindChannels from './FindChannels';
import Menu from '../Menu/Menu';
import { loadUserInfo } from '../../utils/chatStorage';

export default function Updates() {
  const [user,setUser]=useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userInfo = await loadUserInfo();
        console.log("User Info:", userInfo);
        setUser(userInfo)
      } catch (error) {
        console.error("Error loading user info:", error);
      }
    }
    if(!user){
      loadUser();
    }
  })
  return (
    <View style={styles.container}>

      {/* Header Section */}
      <View style={styles.headerCtn}>
        <Text style={styles.logo}>Updates</Text>
        <View style={styles.iconCtn}>
          <Feather name="search" size={24} color="white" />
          <Menu />
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Status  user={user}/>
        <Channels />
        <FindChannels />
      </ScrollView>

      {/* Floating Buttons */}
      <View style={styles.newUpdate}>
        <TouchableOpacity style={styles.pen}>
          <FontAwesome name="pencil" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cam}>
          <MaterialIcons name="photo-camera" size={24} color="#011513" />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight + 10,
    backgroundColor: '#121212',
  },
  headerCtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#202020',
  },
  logo: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  iconCtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100, // Prevents last item from being hidden
  },
  newUpdate: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    gap: 12,
    alignItems: 'center',
  },
  pen: {
    borderRadius: 10,
    backgroundColor: '#2E3135',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cam: {
    borderRadius: 20,
    backgroundColor: '#25D366',
    width: 55,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

